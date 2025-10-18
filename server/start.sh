#!/bin/bash

# Load environment variables
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Start the FastAPI server
exec uvicorn main:app --host ${HOST:-0.0.0.0} --port ${PORT:-8000} --log-level info