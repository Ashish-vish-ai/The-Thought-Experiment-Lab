#!/bin/bash
# Start FastAPI backend
cd /app/backend
uvicorn server:app --host 0.0.0.0 --port 8001 &

# Start nginx to serve frontend + proxy API
nginx -g "daemon off;"
