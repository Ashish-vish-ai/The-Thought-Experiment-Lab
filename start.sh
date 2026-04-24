#!/bin/bash
set -euo pipefail

PORT="${PORT:-8080}"
export PORT

sed "s/__PORT__/${PORT}/g" /etc/nginx/sites-available/default > /etc/nginx/conf.d/default.conf
rm -f /etc/nginx/sites-enabled/default /etc/nginx/sites-available/default

cd /app/backend
uvicorn server:app --host 0.0.0.0 --port 8001 &
UVICORN_PID=$!

nginx -g "daemon off;" &
NGINX_PID=$!

cleanup() {
  kill "$UVICORN_PID" "$NGINX_PID" 2>/dev/null || true
  wait "$UVICORN_PID" "$NGINX_PID" 2>/dev/null || true
}

trap cleanup EXIT INT TERM
wait -n "$UVICORN_PID" "$NGINX_PID"
