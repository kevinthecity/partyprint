# PartyPrint - Project Context for Claude Code

This file provides context and guidelines for Claude Code when working on the PartyPrint project.

## Project Overview

PartyPrint is a web-based photo printing system designed for events and parties. Guests can upload photos from their phones, and the photos automatically print to a connected CUPS printer.

### Tech Stack

**Backend:**
- Python 3.11+
- FastAPI (async web framework)
- CUPS (Common Unix Printing System) for printing
- python-dotenv for configuration
- Uvicorn as ASGI server

**Frontend:**
- React 18
- TypeScript
- Vite (build tool and dev server)
- CSS3 (no framework - custom styles)

**Infrastructure:**
- Designed to run on Raspberry Pi
- Network-connected printers via CUPS
- LAN-only deployment (no authentication)

## Architecture

### Request Flow

1. User uploads photo via web interface
2. Frontend sends multipart/form-data to `/upload` endpoint
3. Backend validates file (size, type, extension)
4. File saved to `uploads/` directory with sanitized filename
5. Backend immediately sends file to CUPS printer via `lp` command
6. Response includes file info and print job ID
7. Frontend displays success and refreshes file list

### Key Components

**Backend (`server/main.py`):**
- FastAPI app with CORS middleware
- File upload handling with validation
- CUPS integration via subprocess (`lp`, `lpstat`)
- Static file serving for production builds
- File management endpoints

**Frontend:**
- `App.tsx` - Main component with state management
- `api.ts` - API client for backend communication
- `UploadCard.tsx` - Drag-and-drop file upload
- `FileList.tsx` - Display uploaded photos with thumbnails
- `Header.tsx` - Printer status and health checks
- `QRCode.tsx` - Generate QR code for easy access

## Important Patterns

### API Base URL Configuration

The frontend API base URL is configured in `web/src/api.ts`:

```typescript
const API_BASE = import.meta.env.DEV ? 'http://192.168.4.120:8000' : '';
```

- **Development mode**: Points to specific IP address for multi-device testing
- **Production mode**: Uses relative URLs (served from same backend)

**Why not localhost?**
- Guests access from mobile devices on the network
- `localhost` on a phone refers to the phone, not the server
- Using the server's network IP allows cross-device access

### CORS Configuration

CORS is currently set to allow all origins for development:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Security note:** This should be restricted for production deployments.

### File Handling

Files are:
1. Sanitized with timestamp prefix to prevent conflicts
2. Validated for size (MAX_FILE_MB from .env, default 25MB)
3. Validated for extension (.jpg, .jpeg, .png, .heic)
4. Stored in UPLOAD_DIR (configured in .env)
5. Served via `/files/{filename}` endpoint

### Printer Integration

CUPS commands used:
- `lpstat -p -d` - List printers and get default
- `lp -d PRINTER_NAME -o fit-to-page -o media=4x6 FILE` - Print with options

Print options:
- `fit-to-page` - Scale image to fit paper
- `media=4x6` - 4x6 inch photo paper size

## Environment Configuration

Required `.env` variables:

```env
PRINTER_NAME=Brother_HL_L2380DW_series  # CUPS printer name (required)
UPLOAD_DIR=./uploads                     # Upload storage directory
HOST=0.0.0.0                            # Server bind address
PORT=8000                               # Server port
MAX_FILE_MB=25                          # Max upload size
```

To find printer name: `lpstat -p`

## Development Workflow

### Starting Development Environment

**Terminal 1 - Backend:**
```bash
cd server
source .venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd web
npm run dev
```

Frontend runs on `http://localhost:5173` (or network IP)
Backend runs on `http://localhost:8000`

### Production Build

```bash
# Build frontend
cd web
npm run build

# Copy to server
cp -r dist/* ../server/static/

# Run backend (serves both API and static files)
cd ../server
source .venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000
```

## Common Issues and Solutions

### CORS Errors

**Problem:** "Origin not allowed by Access-Control-Allow-Origin"

**Solution:**
- Check `allow_origins` in `server/main.py`
- Verify frontend `API_BASE` points to correct backend URL
- Ensure backend is running and accessible

### Printer Not Found

**Problem:** "lp: No such file or directory" or printer not detected

**Solution:**
- Verify CUPS is running: `systemctl status cups`
- Check printer exists: `lpstat -p -d`
- Update `PRINTER_NAME` in `.env` to match actual printer name
- Test printing: `echo "test" | lp -d PRINTER_NAME`

### Photos Not Showing on Mobile

**Problem:** Photos visible on computer but not on phone

**Solution:**
- Ensure both devices on same network
- Check `API_BASE` in `web/src/api.ts` uses network IP, not `localhost`
- Verify backend accessible from phone: visit `http://SERVER_IP:8000/health`
- Check that backend is running on `0.0.0.0` not `127.0.0.1`

### Upload Failures

**Problem:** Uploads fail or timeout

**Solution:**
- Check file size < MAX_FILE_MB
- Verify UPLOAD_DIR exists and is writable
- Check disk space: `df -h`
- Review backend logs for detailed error messages

## Code Style Guidelines

### Backend (Python)

- Use async/await for route handlers
- Follow PEP 8 naming conventions
- Add type hints to function signatures
- Use Pydantic models for request/response validation
- Log errors with appropriate log levels
- Add docstrings to public functions

Example:
```python
@app.post("/upload", response_model=UploadResponse)
async def upload_file(image: UploadFile = File(...)):
    """Upload and immediately print an image"""
    # Implementation
```

### Frontend (TypeScript/React)

- Use functional components with hooks
- Define TypeScript interfaces for all data structures
- Use async/await for API calls
- Handle errors with try/catch
- Use CSS custom properties for theming
- Keep components focused and single-purpose

Example:
```typescript
export async function uploadFile(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Upload failed');
  }

  return response.json();
}
```

## Testing

Currently no automated tests. Recommended additions:

**Backend:**
- Unit tests for file validation
- Integration tests for CUPS interaction
- API endpoint tests with pytest

**Frontend:**
- Component tests with React Testing Library
- API client mocking
- E2E tests with Playwright

## Security Considerations

**Current state:**
- No authentication (LAN-only design)
- CORS allows all origins (development)
- File uploads have size/type limits
- Path traversal protection on file serving
- Filename sanitization

**Future improvements:**
- Add basic authentication for production
- Restrict CORS origins
- Implement upload rate limiting
- Add file scanning for malicious content
- Cleanup old uploads automatically

## Performance Notes

- Images stored on disk (no database)
- No image optimization/compression (printed as-is)
- File list loaded fresh on every page load
- Printer status checked every 30 seconds
- No caching strategy currently implemented

## Deployment

Typical deployment on Raspberry Pi:
1. Run as systemd service (see README.md)
2. Auto-start on boot
3. Static IP recommended for consistent QR codes
4. Consider read-only root filesystem for SD card longevity

## Future Enhancement Ideas

- Image filters/cropping before print
- Multiple printer support with selection
- Print queue with pause/cancel
- User sessions with upload history
- Print cost tracking and limits
- Email/SMS notifications
- Cloud backup of photos
- Photo booth mode with camera integration

## When Working on This Project

**Always:**
- Test on multiple devices (desktop + mobile)
- Verify printer integration after changes
- Check CORS configuration for cross-device access
- Consider SD card wear (Raspberry Pi constraint)
- Think about party/event use cases

**Never:**
- Hardcode IP addresses in committed code
- Commit `.env` files with secrets
- Break backward compatibility without migration
- Add dependencies without updating requirements/package.json
- Skip error handling (printer issues are common)

## Helpful Context for Claude

When asked to help with this project, consider:
- This runs on resource-constrained Raspberry Pi
- Network reliability varies (WiFi at parties)
- Users are non-technical party guests
- Printer issues are the most common problem
- The app should "just work" without configuration
- QR code is primary access method
- Photos are sentimental - don't lose uploads!

## Resources

- FastAPI docs: https://fastapi.tiangolo.com/
- React docs: https://react.dev/
- CUPS documentation: https://www.cups.org/doc/overview.html
- Vite docs: https://vitejs.dev/
- Raspberry Pi docs: https://www.raspberrypi.org/documentation/
