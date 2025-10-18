# PartyPrint

A simple web-based photo printing system for Raspberry Pi that lets party guests upload photos from their phones and automatically print them via CUPS.

## Features

- 📱 **Mobile-friendly web interface** - guests can upload photos directly from their phones
- 🖨️ **Automatic printing** - photos print immediately after upload
- 📂 **File management** - view and reprint recent uploads
- 🔄 **Real-time status** - live printer and server status updates
- 📱 **QR code sharing** - easy access via QR code
- 🎨 **Responsive design** - works on all devices
- 🌙 **Dark mode support** - automatic dark/light theme detection

## Architecture

```
partyprint/
├── server/          # Python FastAPI backend
│   ├── main.py     # Main application
│   ├── requirements.txt
│   ├── start.sh    # Startup script
│   ├── Dockerfile  # Optional containerization
│   └── .env.example
└── web/            # React frontend
    ├── src/
    ├── package.json
    ├── vite.config.ts
    └── dist/       # Built static files (after npm run build)
```

## Prerequisites

### Hardware
- Raspberry Pi (3B+ or newer recommended)
- Network-connected printer (WiFi or USB)
- SD card (16GB+ recommended)
- Network connection (WiFi or Ethernet)

### Software
- Raspberry Pi OS (Bullseye or newer)
- Python 3.11+
- Node.js 18+ (for development)
- CUPS printer system

## Installation

### 1. System Setup

Update your Raspberry Pi and install CUPS:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y cups cups-client python3-pip python3-venv nodejs npm git
```

### 2. CUPS Printer Configuration

Add your printer to CUPS. You can use the web interface or command line:

**Option A: Web Interface**
```bash
# Enable CUPS web interface
sudo cupsctl --remote-any
sudo systemctl restart cups

# Open http://YOUR_PI_IP:631 in a browser
# Go to Administration > Add Printer
# Follow the setup wizard
```

**Option B: Command Line** (example for HP printer)
```bash
# List available printers
sudo lpinfo -v

# Add printer (replace with your printer details)
sudo lpadmin -p MyPrinter -E -v "dnssd://HP%20LaserJet..." -m drv:///hp/hpcups.drv/hp-laserjet_pro_m15w.ppd

# Set as default
sudo lpadmin -d MyPrinter

# Test printing
echo "Test print" | lp -d MyPrinter
```

**Verify printer setup:**
```bash
lpstat -p -d
# Should show your printer and default destination
```

### 3. Clone and Setup PartyPrint

```bash
# Clone the repository
git clone https://github.com/your-username/partyprint.git
cd partyprint
```

### 4. Backend Setup

```bash
cd server

# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
nano .env  # Edit configuration (see Configuration section)
```

### 5. Frontend Setup (Development)

```bash
cd ../web

# Install dependencies
npm install

# For development with hot reload
npm run dev

# For production build
npm run build
```

## Configuration

Edit `server/.env` to configure your setup:

```env
# REQUIRED: Your CUPS printer name (get from `lpstat -p`)
PRINTER_NAME=HP_LaserJet_Pro_M15w

# Optional: Storage and server settings
UPLOAD_DIR=./uploads
HOST=0.0.0.0
PORT=8000
MAX_FILE_MB=25
```

**Finding your printer name:**
```bash
lpstat -p
# Output: printer HP_LaserJet_Pro_M15w is idle...
# Use: HP_LaserJet_Pro_M15w
```

## Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd server
source .venv/bin/activate
./start.sh
```

**Terminal 2 - Frontend:**
```bash
cd web
npm run dev
```

Access at: http://localhost:5173

### Production Mode

Build the frontend and serve everything from the backend:

```bash
# Build frontend
cd web
npm run build

# Copy built files to server
cp -r dist/* ../server/static/

# Start server
cd ../server
source .venv/bin/activate
./start.sh
```

Access at: http://YOUR_PI_IP:8000

## Auto-Start on Boot

Create a systemd service for automatic startup:

```bash
sudo nano /etc/systemd/system/partyprint.service
```

```ini
[Unit]
Description=PartyPrint Photo Printing Service
After=network.target cups.service

[Service]
Type=simple
User=pi
Group=pi
WorkingDirectory=/home/pi/partyprint/server
Environment="PATH=/home/pi/partyprint/server/.venv/bin:/usr/local/bin:/usr/bin:/bin"
ExecStart=/home/pi/partyprint/server/.venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

Enable and start the service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable partyprint
sudo systemctl start partyprint

# Check status
sudo systemctl status partyprint
```

## Usage

1. **Start the application** (see Running section above)
2. **Connect devices to the same WiFi network** as your Raspberry Pi
3. **Open the web interface**:
   - Direct: `http://YOUR_PI_IP:8000`
   - Scan the QR code displayed on the page
4. **Upload photos**:
   - Drag & drop images onto the upload area
   - Or click "Choose File" to browse
   - Supported formats: JPG, PNG, HEIC (up to 25MB)
5. **Photos print automatically** after upload
6. **View recent uploads** and reprint if needed

## API Endpoints

The FastAPI backend provides these endpoints:

- `GET /health` - Health check
- `GET /printers` - List available CUPS printers
- `POST /upload` - Upload and print image (multipart/form-data)
- `POST /print` - Print existing file (JSON: `{path: "filename"}`)
- `GET /files` - List uploaded files
- `GET /files/{filename}` - Serve uploaded file
- `GET /docs` - Interactive API documentation

## Troubleshooting

### Printer Issues

**Printer not found:**
```bash
# Check CUPS status
sudo systemctl status cups

# List printers
lpstat -p -d

# Check printer queue
lpq -P YOUR_PRINTER_NAME

# Test print
echo "test" | lp -d YOUR_PRINTER_NAME
```

**Permission errors:**
```bash
# Add user to printer groups
sudo usermod -a -G lpadmin pi
sudo usermod -a -G lp pi

# Restart service
sudo systemctl restart partyprint
```

### Network Issues

**Can't access from other devices:**
```bash
# Check if server is running
curl http://localhost:8000/health

# Check firewall (if enabled)
sudo ufw status
sudo ufw allow 8000

# Find Pi's IP address
hostname -I
ip addr show
```

### File Issues

**Upload directory permissions:**
```bash
cd server
mkdir -p uploads
chmod 755 uploads
```

**Storage space:**
```bash
df -h
# Clean old uploads if needed
find uploads/ -type f -mtime +7 -delete
```

### Service Issues

**Check logs:**
```bash
# Service logs
sudo journalctl -u partyprint -f

# Application logs
cd server
tail -f *.log
```

## Security Notes

⚠️ **Important**: This application is designed for LAN-only use at private events.

- **No authentication** - anyone on the network can upload/print
- **File uploads** are stored permanently (implement cleanup as needed)
- **Network access** - ensure your WiFi network is secure
- **Printer access** - physical access to printer may be needed for maintenance

## Development

### Backend Development

```bash
cd server
source .venv/bin/activate

# Install development dependencies
pip install pytest black flake8

# Run tests (if any)
pytest

# Format code
black main.py

# Lint code
flake8 main.py
```

### Frontend Development

```bash
cd web

# Type checking
npm run build  # Includes TypeScript checking

# Linting
npm run lint

# Preview production build
npm run preview
```

### Adding Features

Popular additions:
- **Image filters/effects** before printing
- **Multiple printer support** with selection
- **Print queue management** with pause/cancel
- **User sessions** with upload history
- **Image gallery** with better thumbnails
- **Print cost tracking** and limits
- **Email/SMS notifications** when prints complete

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For issues and questions:
- Check the [Troubleshooting](#troubleshooting) section
- Review [GitHub Issues](https://github.com/your-username/partyprint/issues)
- Create a new issue with detailed information

---

**Made with ❤️ for memorable parties and events**