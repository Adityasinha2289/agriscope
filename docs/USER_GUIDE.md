# NEXGram User Guide & Operational Manual

> **Developed & Architected by Aditya Sinha**  
> **Course**: B.Tech CSET-371 Big Data Analytics & Business Intelligence

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
- **Web Application**: `http://localhost:5173`
- **FastAPI Backend**: `http://localhost:8000`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`
- **HDFS Web Console**: `http://localhost:9870`

---

## 3. Platform Operating Modes

### 3.1 Dual-Audience Selection
NEXGram accommodates both academic evaluators and grassroots agricultural producers:
- **Analyst Mode**: Complete 8-tab intelligence platform with live HDFS metrics, PySpark job monitors, model comparisons, and R² leaderboards.
- **Farmer Mode**: Simplified, high-contrast, bilingual interface focused on crop benchmarks, transparent yield estimates in familiar units (**Quintals per Acre**), and district comparisons.
- **Mode Switching**: Use the header button at any time ("Farmer Mode" / "Analyst Mode") or click the mode switcher card on the Overview tab. Selection is persisted in `localStorage`.

### 3.2 Farmer Mode Features
- **Bilingual Support**: Click the **English / हिंदी** pill in the Farmer navigation bar to switch language instantly.
- **Unit Switching**: Toggle between **Acre / Hectare** and **Quintals / Tonnes** using the unit toggle pill.
- **Navigation Tabs**:
  - **Home**: Welcome dashboard, quick selectors, and authentic agricultural landscape photography.
  - **My Crop**: Historical state and national productivity benchmarks for selected crops.
  - **Yield Estimate**: Input cultivated area and district to receive an honest MLlib yield estimate with plain-language explanations and advisory disclaimers.
  - **Compare**: Side-by-side productivity comparison across Indian states.

### 3.3 Viva Presentation Mode
For university defense or live demonstration:
- Click the **"Presentation Mode"** button in the header, or press the **`P`** key on your keyboard.
- Use **`ArrowRight`** and **`ArrowLeft`** (or Next/Prev buttons) to navigate through the 7-stage presentation sequence.
- Press **`Esc`** or click the close icon to return to the interactive dashboard.

---

## 4. Stopping the Platform
To terminate all background backend and frontend processes cleanly:
```bash
./scripts/stop_all.sh
```

---

## 5. Running the Big Data Pipeline Manually
To execute the complete distributed PySpark ETL, feature engineering, MLlib regression training, and clustering pipeline on HDFS:
```bash
./scripts/run_pipeline.sh
```

---

## 6. Running the Test Suite
To execute all 14 unit, integration, and end-to-end tests:
```bash
PYTHONPATH=. venv/bin/pytest tests/ -v
```

---

## 7. Building Frontend Production Bundle
```bash
cd frontend && npm run build
```

---

## 8. Verifying the Environment
To check Java, Hadoop, HDFS connectivity, Spark, Python, and Node:
```bash
./scripts/verify_environment.sh
```

