# Claude Code Configuration

This directory contains configuration for [Claude Code](https://claude.com/claude-code), Anthropic's official CLI for Claude AI assistance.

## What is Claude Code?

Claude Code is an AI-powered development assistant that helps with:
- Writing and refactoring code
- Debugging and fixing issues
- Answering questions about the codebase
- Running tests and builds
- Implementing new features

## Getting Started

If you haven't installed Claude Code yet:

```bash
# Install Claude Code
npm install -g @anthropic-ai/claude-code

# Or use with npx
npx @anthropic-ai/claude-code
```

## Project Overview

PartyPrint is a web-based photo printing system with:
- **Backend**: Python FastAPI server (`/server`) that handles uploads and CUPS printing
- **Frontend**: React + TypeScript + Vite web app (`/web`)

## Common Tasks with Claude

Here are some helpful prompts to get started:

### Development
- "Help me add a feature to [description]"
- "Fix the TypeScript errors in the build"
- "Review this code for potential bugs"
- "Add error handling to the upload endpoint"

### Debugging
- "Why is the printer not being detected?"
- "Debug the CORS errors from the frontend"
- "Check the logs and help me fix [issue]"

### Documentation
- "Explain how the photo upload flow works"
- "Document this function/component"
- "Create API documentation for the endpoints"

### Testing
- "Write unit tests for the backend upload endpoint"
- "Add integration tests for the print workflow"

## Project Structure

```
partyprint/
├── .claude/              # Claude Code configuration (this directory)
│   ├── README.md        # This file
│   └── prompts.md       # Project-specific context and guidelines
├── server/              # Python FastAPI backend
│   ├── main.py         # Main application
│   ├── requirements.txt
│   ├── .env           # Local config (not committed)
│   └── .env.example   # Example config
└── web/                # React frontend
    ├── src/
    │   ├── App.tsx
    │   ├── api.ts      # Backend API client
    │   └── components/
    ├── package.json
    └── vite.config.ts
```

## Configuration Files

- `.claude/prompts.md` - Contains project context, architecture details, and common patterns
- `.gitignore` - Excludes sensitive files and build artifacts

## Tips for Working with Claude Code

1. **Be specific**: Provide clear context about what you're trying to achieve
2. **Reference files**: Mention specific file paths when discussing code
3. **Share errors**: Include full error messages and stack traces
4. **Ask for explanations**: Don't hesitate to ask "why" or "how"
5. **Iterate**: Claude can refine solutions based on your feedback

## Useful Commands

```bash
# Start development servers
cd server && source .venv/bin/activate && ./start.sh
cd web && npm run dev

# Run tests (when implemented)
cd server && pytest
cd web && npm test

# Build for production
cd web && npm run build
```

## Environment Setup

See the main [README.md](../README.md) for full installation instructions.

Quick setup:
```bash
# Backend
cd server
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your printer name

# Frontend
cd web
npm install
npm run dev
```

## Need Help?

- Check the main [README.md](../README.md) for troubleshooting
- Ask Claude Code for help with specific issues
- Refer to `.claude/prompts.md` for project-specific context
