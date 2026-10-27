#!/bin/bash
# ==============================================================================
# NEXGram — Stop All Platform Services
# Architecture & Implementation: Developed by Aditya Sinha
# B.Tech CSET-371 Big Data Analytics & Business Intelligence
# ==============================================================================
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "Stopping NEXGram Services..."

if [ -f logs/backend.pid ]; then
    PID=$(cat logs/backend.pid)
    kill $PID 2>/dev/null || true
    rm -f logs/backend.pid
    echo "[Backend] Stopped PID $PID"
fi

if [ -f logs/frontend.pid ]; then
    PID=$(cat logs/frontend.pid)
    kill $PID 2>/dev/null || true
    rm -f logs/frontend.pid
    echo "[Frontend] Stopped PID $PID"
fi

# Clean up any orphan uvicorn or vite processes on ports 8000/5173
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true

echo "All AgriScope services stopped."
