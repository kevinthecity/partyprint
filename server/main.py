import os
import subprocess
import logging
from datetime import datetime
from pathlib import Path
from typing import List, Optional
import re

from fastapi import FastAPI, File, UploadFile, HTTPException, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from PIL import Image, ImageOps

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
PRINTER_NAME = os.getenv("PRINTER_NAME")
UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", "./uploads"))
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", 8027))
MAX_FILE_MB = int(os.getenv("MAX_FILE_MB", 25))
MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024

# Allowed file extensions
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".heic"}

# Create upload directory if it doesn't exist
UPLOAD_DIR.mkdir(exist_ok=True)

app = FastAPI(title="PartyPrint API", version="1.0.0")

# CORS middleware for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files for production
if (Path(__file__).parent / "static").exists():
    app.mount("/static", StaticFiles(directory="static"), name="static")

# Pydantic models
class PrintRequest(BaseModel):
    path: str

class PrinterInfo(BaseModel):
    name: str
    isDefault: bool

class FileInfo(BaseModel):
    name: str
    url: str
    size: int
    created: str

class UploadResponse(BaseModel):
    ok: bool
    file: FileInfo
    jobId: Optional[str] = None

def sanitize_filename(filename: str) -> str:
    """Sanitize filename for safe storage"""
    # Remove path components and dangerous characters
    filename = os.path.basename(filename)
    filename = re.sub(r'[^\w\-_\.]', '_', filename)

    # Add timestamp to prevent conflicts
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    name, ext = os.path.splitext(filename)
    return f"{timestamp}_{name}{ext}"

def preprocess_image_for_print(input_path: Path, output_path: Path, fill_mode: bool = True):
    """
    Prepare an image for Canon Selphy CP1500 4x6" postcard printing.
    fill_mode=True crops to fill the 4x6 frame.
    fill_mode=False fits entire image with white borders.
    """
    try:
        with Image.open(input_path) as img:
            img = ImageOps.exif_transpose(img)
            if img.mode != "RGB":
                img = img.convert("RGB")

            # Canon Selphy CP1500 postcard paper dimensions
            target_width = 1755  # px
            target_height = 1170  # px
            target_ratio = target_width / target_height

            src_width, src_height = img.size
            src_ratio = src_width / src_height

            if fill_mode:
                # Crop to fill entire frame (no borders)
                if src_ratio > target_ratio:
                    # Image is wider than 4x6: crop sides
                    new_width = int(src_height * target_ratio)
                    offset = (src_width - new_width) // 2
                    img = img.crop((offset, 0, offset + new_width, src_height))
                else:
                    # Image is taller than 4x6: crop top/bottom
                    new_height = int(src_width / target_ratio)
                    offset = (src_height - new_height) // 2
                    img = img.crop((0, offset, src_width, offset + new_height))
                img = img.resize((target_width, target_height), Image.Resampling.LANCZOS)
            else:
                # Fit image with white borders
                img.thumbnail((target_width, target_height), Image.Resampling.LANCZOS)
                canvas = Image.new("RGB", (target_width, target_height), (255, 255, 255))
                x_offset = (target_width - img.width) // 2
                y_offset = (target_height - img.height) // 2
                canvas.paste(img, (x_offset, y_offset))
                img = canvas

            img.save(output_path, "JPEG", quality=95, subsampling=0)
            logger.info(f"Preprocessed image for print: {input_path.name} ({img.width}x{img.height})")

    except Exception as e:
        logger.error(f"Image preprocessing failed: {e}")
        raise HTTPException(status_code=500, detail=f"Image preprocessing failed: {str(e)}")


def get_printers() -> List[PrinterInfo]:
    """Get list of available CUPS printers"""
    try:
        # Run lpstat to get printer info
        result = subprocess.run(
            ["lpstat", "-p", "-d"],
            capture_output=True,
            text=True,
            check=True
        )

        printers = []
        default_printer = None

        for line in result.stdout.split('\n'):
            line = line.strip()
            if line.startswith('printer '):
                # Extract printer name from "printer PrinterName is ..."
                parts = line.split()
                if len(parts) >= 2:
                    printer_name = parts[1]
                    printers.append(printer_name)
            elif line.startswith('system default destination:'):
                # Extract default printer
                parts = line.split(':')
                if len(parts) >= 2:
                    default_printer = parts[1].strip()

        # Convert to PrinterInfo objects
        printer_infos = []
        for printer in printers:
            printer_infos.append(PrinterInfo(
                name=printer,
                isDefault=(printer == default_printer)
            ))

        return printer_infos

    except subprocess.CalledProcessError as e:
        logger.error(f"Failed to get printers: {e}")
        return []
    except Exception as e:
        logger.error(f"Error getting printers: {e}")
        return []

def print_file(file_path: Path, printer_name: str) -> Optional[str]:
    """
    Print a file using CUPS lp command.
    Optimized for Canon Selphy CP1500 4x6" postcard printing.
    """
    try:
        cmd = [
            "lp",
            "-d", printer_name,
            "-o", "media=Postcard",  # Canon Selphy uses "Postcard" for 4x6"
            "-o", "ColorModel=RGB",  # Ensure RGB color mode for dye-sub
            "-o", "print-quality=5",  # Highest quality
            str(file_path)
        ]

        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            check=True
        )

        # Try to extract job ID from output like "request id is PrinterName-123 (1 file(s))"
        output = result.stdout.strip()
        job_id_match = re.search(r'request id is ([^\s]+)', output)
        job_id = job_id_match.group(1) if job_id_match else None

        logger.info(f"Print job submitted: {output}")
        return job_id

    except subprocess.CalledProcessError as e:
        logger.error(f"Print command failed: {e.stderr}")
        raise HTTPException(status_code=500, detail=f"Print failed: {e.stderr}")
    except Exception as e:
        logger.error(f"Error printing file: {e}")
        raise HTTPException(status_code=500, detail=f"Print error: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok"}

@app.get("/network-info")
async def get_network_info():
    """Get local network IP address for QR code generation"""
    try:
        # Get local IP address (not Tailscale IP)
        result = subprocess.run(
            ["hostname", "-I"],
            capture_output=True,
            text=True,
            check=True
        )
        # hostname -I returns all IPs, first one is usually the local network IP
        ips = result.stdout.strip().split()
        # Filter out Tailscale IPs (100.x.x.x range) and localhost
        local_ip = next((ip for ip in ips if not ip.startswith('100.') and not ip.startswith('127.')), None)

        if local_ip:
            return {"localIP": local_ip, "url": f"http://{local_ip}:{PORT}"}
        else:
            return {"localIP": None, "url": None}
    except Exception as e:
        logger.error(f"Failed to get network info: {e}")
        return {"localIP": None, "url": None}

@app.get("/printers", response_model=List[PrinterInfo])
async def list_printers():
    """Get list of available printers"""
    return get_printers()

@app.post("/upload", response_model=UploadResponse)
async def upload_file(image: UploadFile = File(...)):
    """Upload and immediately print an image"""
    if not PRINTER_NAME:
        raise HTTPException(
            status_code=500,
            detail="No printer configured. Set PRINTER_NAME environment variable."
        )

    # Validate file size
    if image.size and image.size > MAX_FILE_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size is {MAX_FILE_MB}MB."
        )

    # Validate file extension
    if not image.filename:
        raise HTTPException(status_code=400, detail="No filename provided")

    file_ext = Path(image.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    try:
        # Save original file
        safe_filename = sanitize_filename(image.filename)
        original_path = UPLOAD_DIR / safe_filename

        with open(original_path, "wb") as f:
            content = await image.read()

            # Double-check file size
            if len(content) > MAX_FILE_BYTES:
                raise HTTPException(
                    status_code=413,
                    detail=f"File too large. Maximum size is {MAX_FILE_MB}MB."
                )

            f.write(content)

        logger.info(f"File saved: {original_path}")

        # Create print-ready version (4x6" at 300 DPI with letterboxing)
        print_filename = f"print_{safe_filename}"
        print_path = UPLOAD_DIR / print_filename

        preprocess_image_for_print(original_path, print_path)

        # Print the preprocessed file
        job_id = print_file(print_path, PRINTER_NAME)

        file_info = FileInfo(
            name=safe_filename,
            url=f"/files/{safe_filename}",
            size=original_path.stat().st_size,
            created=datetime.fromtimestamp(original_path.stat().st_ctime).isoformat()
        )


        return UploadResponse(
            ok=True,
            file=file_info,
            jobId=job_id
        )

    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Upload failed: {e}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@app.post("/print")
async def print_existing_file(request: PrintRequest):
    """Print an existing file"""
    if not PRINTER_NAME:
        raise HTTPException(
            status_code=500,
            detail="No printer configured. Set PRINTER_NAME environment variable."
        )

    file_path = UPLOAD_DIR / request.path

    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")

    if not file_path.is_file():
        raise HTTPException(status_code=400, detail="Path is not a file")

    # Security check: ensure file is within upload directory
    try:
        file_path.resolve().relative_to(UPLOAD_DIR.resolve())
    except ValueError:
        raise HTTPException(status_code=403, detail="Access denied")

    job_id = print_file(file_path, PRINTER_NAME)

    return {"ok": True, "jobId": job_id}

@app.get("/files", response_model=List[FileInfo])
async def list_files():
    """Get list of uploaded files"""
    files = []

    try:
        for file_path in UPLOAD_DIR.iterdir():
            if file_path.is_file() and file_path.suffix.lower() in ALLOWED_EXTENSIONS:
                stat = file_path.stat()
                files.append(FileInfo(
                    name=file_path.name,
                    url=f"/files/{file_path.name}",
                    size=stat.st_size,
                    created=datetime.fromtimestamp(stat.st_ctime).isoformat()
                ))

        # Sort by creation time, newest first
        files.sort(key=lambda f: f.created, reverse=True)

    except Exception as e:
        logger.error(f"Error listing files: {e}")
        raise HTTPException(status_code=500, detail="Failed to list files")

    return files

@app.get("/files/{filename}")
async def serve_file(filename: str):
    """Serve an uploaded file"""
    # Sanitize filename to prevent directory traversal
    safe_filename = os.path.basename(filename)
    file_path = UPLOAD_DIR / safe_filename

    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")

    if not file_path.is_file():
        raise HTTPException(status_code=400, detail="Path is not a file")

    # Security check: ensure file is within upload directory
    try:
        file_path.resolve().relative_to(UPLOAD_DIR.resolve())
    except ValueError:
        raise HTTPException(status_code=403, detail="Access denied")

    return FileResponse(file_path)

# Serve React app in production
@app.get("/{path:path}")
async def serve_spa(request: Request, path: str):
    """Serve React SPA for all non-API routes"""
    static_dir = Path(__file__).parent / "static"

    if static_dir.exists():
        # Try to serve the requested file
        file_path = static_dir / path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)

        # Fallback to index.html for SPA routing
        index_path = static_dir / "index.html"
        if index_path.exists():
            return FileResponse(index_path)

    # If no static files, return simple API info
    return {"message": "PartyPrint API", "docs": "/docs"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=HOST, port=PORT)