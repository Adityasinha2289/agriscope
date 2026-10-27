# AgriScope User Guide & Quickstart

## 1. Prerequisites
- **macOS** or **Linux**
- **Java 17 OpenJDK** (`/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home`)
- **Apache Hadoop** installed via Homebrew (`/opt/homebrew/opt/hadoop`)
- **Apache Spark** with `spark-submit` in PATH
- **Python 3.10+** (Python 3.12 configured in `venv`)
- **Node.js v18+** & **npm**

---

## 2. Quickstart: Starting the Platform

Run the all-in-one launch script:
```bash
./scripts/start_all.sh
```

This script automatically:
1. Verifies Hadoop HDFS is running on `hdfs://localhost:9000` (starts NameNode/DataNode if offline).
2. Starts the **FastAPI Backend** on port `8000` (PID saved in `logs/backend.pid`).
3. Starts the **Vite React UI** on port `5173` (PID saved in `logs/frontend.pid`).

### Access URLs:
- **Web Dashboard**: `http://localhost:5173`
- **FastAPI Backend**: `http://localhost:8000`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`
- **HDFS Web Console**: `http://localhost:9870`

---

## 3. Stopping the Platform
To terminate all background backend and frontend processes cleanly:
```bash
./scripts/stop_all.sh
```

---

## 4. Running the Big Data Pipeline Manually
To execute the complete distributed PySpark ETL, feature engineering, MLlib regression training, and clustering pipeline on HDFS:
```bash
./scripts/run_pipeline.sh
```

---

## 5. Running the Test Suite
To execute all 12 unit, integration, and end-to-end tests:
```bash
PYTHONPATH=. venv/bin/pytest tests/
```

---

## 6. Verifying the Environment
To check Java, Hadoop, HDFS connectivity, Spark, Python, and Node:
```bash
./scripts/verify_environment.sh
```
