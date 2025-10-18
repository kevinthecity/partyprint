# Contributing to PartyPrint

Thank you for your interest in contributing to PartyPrint! This guide will help you get started with the project.

## Getting Started

### Prerequisites

- Python 3.11 or higher
- Node.js 18 or higher
- Git
- A printer configured with CUPS (for testing)

### Initial Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd partyprint
   ```

2. **Set up the backend**
   ```bash
   cd server
   python3 -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   cp .env.example .env
   ```

3. **Configure your printer**
   - Edit `server/.env` and set `PRINTER_NAME` to your CUPS printer
   - Find your printer name: `lpstat -p`

4. **Set up the frontend**
   ```bash
   cd ../web
   npm install
   ```

5. **Update API configuration**
   - Edit `web/src/api.ts`
   - Set `API_BASE` to your computer's network IP address
   - Find your IP: `ipconfig getifaddr en0` (macOS) or `ip addr` (Linux)

## Development Workflow

### Running the Development Servers

**Terminal 1 - Backend:**
```bash
cd server
source .venv/bin/activate
./start.sh
# Or manually: uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd web
npm run dev
```

Access the application:
- Frontend: http://localhost:5173 or http://YOUR_IP:5173
- Backend API: http://localhost:8000
- API docs: http://localhost:8000/docs

### Making Changes

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the code style guidelines (see below)
   - Test your changes thoroughly
   - Update documentation if needed

3. **Test on multiple devices**
   - Test on desktop browser
   - Test on mobile device (same network)
   - Verify printer functionality if applicable

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "Add feature: brief description"
   ```

5. **Push and create a pull request**
   ```bash
   git push origin feature/your-feature-name
   ```

## Code Style Guidelines

### Python (Backend)

- Follow PEP 8 style guide
- Use type hints for function signatures
- Add docstrings to public functions
- Use async/await for route handlers
- Keep functions focused and single-purpose

**Example:**
```python
async def upload_file(image: UploadFile = File(...)) -> UploadResponse:
    """
    Upload an image and send it to the printer.

    Args:
        image: The uploaded image file

    Returns:
        UploadResponse with file info and job ID

    Raises:
        HTTPException: If validation or printing fails
    """
    # Implementation
```

**Formatting:**
```bash
# Install formatters
pip install black flake8

# Format code
black main.py

# Check style
flake8 main.py
```

### TypeScript/React (Frontend)

- Use functional components with hooks
- Define TypeScript interfaces for all data structures
- Use async/await for API calls
- Handle errors with try/catch
- Keep components small and focused

**Example:**
```typescript
interface FileInfo {
  name: string;
  url: string;
  size: number;
  created: string;
}

export async function getFiles(): Promise<FileInfo[]> {
  const response = await fetch(`${API_BASE}/files`);
  if (!response.ok) {
    throw new Error('Failed to get files');
  }
  return response.json();
}
```

**Formatting:**
```bash
# Check TypeScript
npm run build

# Lint code
npm run lint
```

### CSS

- Use CSS custom properties for colors and spacing
- Follow BEM-like naming for clarity
- Support both light and dark modes
- Keep styles in `src/styles.css`

## Testing

### Backend Testing

Currently, there are no automated tests. When adding tests:

```bash
# Install pytest
pip install pytest pytest-asyncio httpx

# Run tests
pytest
```

**Test structure:**
```python
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
```

### Frontend Testing

When adding tests:

```bash
# Install testing libraries
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest

# Run tests
npm test
```

### Manual Testing Checklist

Before submitting a PR, test:

- [ ] Upload a photo from desktop
- [ ] Upload a photo from mobile
- [ ] View uploaded photos list
- [ ] Download a photo
- [ ] Print a photo (if printer available)
- [ ] Check printer status display
- [ ] Verify error handling (large file, wrong type, etc.)
- [ ] Test on different screen sizes
- [ ] Verify dark mode works correctly

## Project Structure

```
partyprint/
├── .claude/              # Claude Code AI assistant configuration
│   ├── README.md        # Claude Code introduction
│   └── prompts.md       # Project context for AI
├── server/              # Python FastAPI backend
│   ├── main.py         # Main application
│   ├── requirements.txt # Python dependencies
│   ├── .env.example    # Example configuration
│   ├── .gitignore      # Python/server ignore rules
│   ├── Dockerfile      # Container configuration
│   └── start.sh        # Startup script
├── web/                # React frontend
│   ├── src/
│   │   ├── App.tsx    # Main component
│   │   ├── api.ts     # API client
│   │   ├── types.ts   # TypeScript interfaces
│   │   ├── main.tsx   # Entry point
│   │   ├── styles.css # Global styles
│   │   └── components/
│   │       ├── UploadCard.tsx
│   │       ├── FileList.tsx
│   │       ├── Header.tsx
│   │       ├── Footer.tsx
│   │       └── QRCode.tsx
│   ├── public/        # Static assets
│   ├── package.json   # Node dependencies
│   ├── vite.config.ts # Build configuration
│   └── .gitignore     # Frontend ignore rules
├── README.md           # Project overview
├── CONTRIBUTING.md     # This file
└── .gitignore         # Root ignore rules
```

## Common Issues

### "Printer not found" error

- Check CUPS is running: `systemctl status cups`
- Verify printer name in `.env` matches: `lpstat -p`
- Test printing manually: `echo "test" | lp -d YOUR_PRINTER_NAME`

### CORS errors from mobile

- Ensure `API_BASE` in `web/src/api.ts` uses network IP, not `localhost`
- Verify backend is running on `0.0.0.0`, not `127.0.0.1`
- Check both devices are on the same network

### File upload fails

- Check file size is under `MAX_FILE_MB` limit
- Verify `uploads/` directory exists and is writable
- Check available disk space: `df -h`

### Cannot access from other devices

- Verify backend runs on `0.0.0.0` (all interfaces)
- Check firewall settings
- Confirm devices are on same network
- Test backend accessibility: `curl http://YOUR_IP:8000/health`

## Using Claude Code

This project is configured for use with [Claude Code](https://claude.com/claude-code), an AI-powered development assistant.

### Quick Start

```bash
# Install Claude Code globally
npm install -g @anthropic-ai/claude-code

# Or use with npx
npx @anthropic-ai/claude-code
```

### Helpful Prompts

- "Help me implement [feature]"
- "Debug why [issue] is happening"
- "Review this code for improvements"
- "Add error handling to [function]"
- "Write tests for [component]"

See `.claude/README.md` for more details.

## Pull Request Process

1. **Update documentation** if you've changed:
   - API endpoints
   - Configuration options
   - Setup instructions
   - Project dependencies

2. **Describe your changes** in the PR:
   - What problem does this solve?
   - How did you test it?
   - Any breaking changes?
   - Screenshots (for UI changes)

3. **Keep PRs focused**:
   - One feature/fix per PR
   - Small, reviewable changes
   - Clear commit messages

4. **Respond to feedback**:
   - Address review comments
   - Update your branch if needed
   - Ask questions if unclear

## Feature Ideas

Looking for ideas? Here are some features we'd love to see:

**Easy:**
- [ ] Add upload progress indicator
- [ ] Display print queue status
- [ ] Add photo filters before printing
- [ ] Improve error messages
- [ ] Add loading skeletons

**Medium:**
- [ ] Multiple printer support with selection
- [ ] Image cropping/rotation interface
- [ ] Print history with timestamps
- [ ] Automatic old file cleanup
- [ ] Configurable photo paper sizes

**Advanced:**
- [ ] User sessions with upload limits
- [ ] Real-time photo gallery (WebSocket)
- [ ] Cloud backup integration
- [ ] Photo booth mode with camera
- [ ] Print cost tracking

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the code, not the person
- Help others learn and grow
- Have fun building cool stuff!

## Questions?

- Check the main [README.md](README.md) for setup help
- Review [.claude/prompts.md](.claude/prompts.md) for architecture details
- Ask Claude Code for help
- Open an issue for bugs or feature requests

---

**Happy coding!** 🎉
