#!/bin/bash
# ==============================================================================
# NEXGram — Start All Services (HDFS check, FastAPI backend, Vite frontend)
# Architecture & Implementation: Developed by Aditya Sinha
# B.Tech CSET-371 Big Data Analytics & Business Intelligence
# ==============================================================================

echo "=========================================================="
echo "           Starting NEXGram Platform Services             "
echo "        Developed & Architected by Aditya Sinha           "
echo "=========================================================="

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# 1. Check / start HDFS
if ! hdfs dfs -ls / > /dev/null 2>&1; then
    echo "[HDFS] Hadoop services not detected. Starting DFS..."
    /opt/homebrew/opt/hadoop/sbin/start-dfs.sh
    sleep 3
fi
echo "[HDFS] HDFS is online at hdfs://localhost:9000"

# 2. Start FastAPI Backend in background
echo "[Backend] Starting FastAPI on http://localhost:8000..."
source venv/bin/activate
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
export HADOOP_HOME=/opt/homebrew/opt/hadoop/libexec
export HADOOP_CONF_DIR=$HADOOP_HOME/etc/hadoop

nohup uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload > logs/backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > logs/backend.pid
echo "[Backend] Started with PID $BACKEND_PID (Logs: logs/backend.log)"

# 3. Start Frontend in background
echo "[Frontend] Starting Vite dev server on http://localhost:5173..."
cd "$PROJECT_ROOT/frontend"
nohup npm run dev -- --host 0.0.0.0 --port 5173 > "$PROJECT_ROOT/logs/frontend.log" 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > "$PROJECT_ROOT/logs/frontend.pid"
echo "[Frontend] Started with PID $FRONTEND_PID (Logs: logs/frontend.log)"

echo "=========================================================="
echo "  AgriScope is running!"
echo "  - Web Dashboard: http://localhost:5173"
echo "  - FastAPI Backend: http://localhost:8000"
echo "  - Interactive Swagger Docs: http://localhost:8000/docs"
echo "  - HDFS Web UI: http://localhost:9870"
echo "=========================================================="
