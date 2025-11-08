#!/usr/bin/env bash
set -euo pipefail

# run_dev.sh - start backend then frontend (dev)
ROOT_DIR=$(cd "$(dirname "$0")" && pwd)
cd "$ROOT_DIR"

echo "Activating venv if present..."
if [ -f "$ROOT_DIR/.venv/bin/activate" ]; then
  # shellcheck disable=SC1091
  source "$ROOT_DIR/.venv/bin/activate"
fi

# Ensure logs and pid file exist and backend env is loaded if present
mkdir -p "$ROOT_DIR/logs"
PID_FILE="$ROOT_DIR/.dev_pids"
touch "$PID_FILE"

echo "Starting backend using backend/run_groq_server.sh (background)..."
chmod +x "$ROOT_DIR/backend/run_groq_server.sh"
nohup "$ROOT_DIR/backend/run_groq_server.sh" > "$ROOT_DIR/logs/backend_start.log" 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID >> "$PID_FILE"
echo "backend pid=$BACKEND_PID (logs: $ROOT_DIR/logs/backend_start.log)"

echo "Starting frontend dev server (will block)"
cd "$ROOT_DIR/frontend"
# Fix: REACT_APP_API_URL should be the API base, not the full /chat/message endpoint
export REACT_APP_API_URL=${REACT_APP_API_URL:-http://localhost:8008/api/v1}
npm start

# When frontend exits, stop backend
echo "Stopping backend pid=$BACKEND_PID"
kill $BACKEND_PID 2>/dev/null || true
