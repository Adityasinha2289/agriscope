# NEXGram — Crop Yield Intelligence & Big Data Agricultural Analytics Platform

> **B.Tech CSET-371 Big Data Analytics and Business Intelligence Project**  
> **Lead Architect & Developer:** **Aditya Sinha**  
> An enterprise-grade, distributed Big Data application powered by **Apache Hadoop HDFS**, **Apache Spark (PySpark 4.0.0)**, **Spark MLlib**, **FastAPI**, and **React 18**.  
> Features a dual-audience experience: an **Apple-inspired Analyst Platform** for academic research and viva defense, and a **Farmer-First Mode** (bilingual in English and Hindi) delivering actionable, transparent agronomic insights.

[![Developer](https://img.shields.io/badge/Developed%20By-Aditya%20Sinha-17251b?style=for-the-badge)](#)
[![Course](https://img.shields.io/badge/Course-B.Tech%20CSET--371-375534?style=for-the-badge)](#)
[![Tests](https://img.shields.io/badge/Pytest-14%2F14%20Passing-brightgreen?style=for-the-badge)](#)
[![HDFS](https://img.shields.io/badge/Hadoop%20HDFS-hdfs%3A%2F%2Flocalhost%3A9000-0284c7?style=for-the-badge)](#)
[![Spark](https://img.shields.io/badge/Apache%20Spark-v4.0.0%20MLlib-ea580c?style=for-the-badge)](#)
[![Design](https://img.shields.io/badge/UI%2FUX-Apple--Inspired%20Minimalism-43766c?style=for-the-badge)](#)

---

## 🌾 1. Executive Summary & Problem Motivation

India is the world's second-largest agricultural producer, supporting over 1.4 billion people and employing 45% of the national workforce. However, crop yields exhibit massive spatial-temporal variance due to fragmented microclimates, monsoon volatility, and disparate regional farming techniques.

Traditional monolithic relational databases fail when executing multi-decade analytical aggregations and machine-learning feature extraction over hundreds of thousands of longitudinal state and district records. 

**NEXGram** bridges this fundamental gap by combining:
1. **Fault-Tolerant Distributed Big Data Storage**: Hadoop HDFS medallion architecture with block replication and data locality.
2. **In-Memory Distributed Processing**: Apache Spark / PySpark 4.0.0 leveraging Catalyst query optimization and DAG execution.
3. **Leakage-Free Predictive Machine Learning**: Comparative evaluation of four MLlib regression pipelines plus unsupervised K-Means clustering.
4. **Dual-Audience Human-Centered Design**:
   - **Academic Analyst Mode**: 8-tab intelligence portal with live cluster metrics, residual plots, feature importances, and interactive viva defense.
   - **Farmer-First Mode**: Bilingual (English / हिंदी) interface translating abstract metric figures into familiar Indian agricultural units (**Quintals per Acre**) with clear, honest agronomic advisory caveats.

---

## 🏗️ 2. Distributed System Architecture & Working

```
                                  +---------------------------------------+
                                  |   Official APY Ministry Dataset       |
                                  |   (455,359 records, 25 years, CSV)    |
                                  +---------------------------------------+
                                                      |
                                                      v  [ingest_data.py]
  ===================================== HADOOP HDFS MEDALLION STORAGE =====================================
  |                                                                                                       |
  |   [BRONZE LAYER]          -->          [SILVER LAYER]          -->          [GOLD LAYER]              |
  |   hdfs://localhost:9000/               hdfs://localhost:9000/               hdfs://localhost:9000/    |
  |   raw/apy/*.csv                        staging/validated/*.parquet          processed/features/       |
  |   • Immutable Landed Data              • Schema Validated                   • Feature Vectors (443k)  |
  |   • Cryptographic Checksum             • Non-destructive Quality Flags      • Isolated Production     |
  |                                                                                                       |
  =========================================================================================================
                                                      |
                                                      v  [PySpark MLlib Pipelines]
  ====================================== DISTRIBUTED COMPUTE & MODELING ===================================
  |                                                                                                       |
  |   • Gradient-Boosted Trees (Champion, R² = 0.8550, RMSE = 5.34 T/Ha)                                  |
  |   • Random Forest Regressor (R² = 0.8532, RMSE = 5.37 T/Ha)                                           |
  |   • Decision Tree Regressor (R² = 0.8508, RMSE = 5.41 T/Ha)                                           |
  |   • Linear Regression with ElasticNet (R² = 0.7720, RMSE = 6.69 T/Ha)                                 |
  |   • K-Means Clustering (k=4, Silhouette Score = 0.4749)                                               |
  |                                                                                                       |
  =========================================================================================================
                                                      |
                                                      v
  ========================================= FASTAPI BACKEND GATEWAY =======================================
  |                                                                                                       |
  |   • Sub-50ms REST API with Uvicorn & Timezone-Aware UTC SQLAlchemy                                    |
  |   • Custom Response Headers: X-Engine: NEXGram, X-Developer: Aditya Sinha                             |
  |   • Path-Traversal Security Barriers on Dataset Previews & Job Logs                                   |
  |   • Farmer Conversion Engine: Tonnes/Ha -> Quintals/Acre + Total Harvest Estimates                    |
  |                                                                                                       |
  =========================================================================================================
                                                      |
                                      +---------------+---------------+
                                      |                               |
                                      v                               v
                       +-----------------------------+ +-----------------------------+
                       |    ANALYST PLATFORM (UI)    | |      FARMER MODE (UI)       |
                       |  • 8 Deep Technical Tabs    | |  • 4 Simplified Tabs        |
                       |  • Live HDFS Cluster Health | |  • Bilingual: English/हिंदी |
                       |  • Spark DAG & Job Monitor  | |  • Quintals / Acre Units    |
                       |  • Viva Presentation Mode   | |  • Realistic Disclaimers    |
                       +-----------------------------+ +-----------------------------+
```

---

## ⚡ 3. Quickstart & Launch Commands

### 1. Launch All Services (HDFS, Backend, Frontend)
```bash
./scripts/start_all.sh
```
- **Web Application**: [http://localhost:5173](http://localhost:5173)
- **FastAPI Backend**: [http://localhost:8000](http://localhost:8000)
- **Interactive Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **HDFS NameNode Web UI**: [http://localhost:9870](http://localhost:9870)

### 2. Stop All Services Cleanly
```bash
./scripts/stop_all.sh
```

### 3. Run Distributed PySpark Pipeline Manually
```bash
./scripts/run_pipeline.sh
```

### 4. Run Pytest Verification Test Suite
```bash
PYTHONPATH=. venv/bin/pytest tests/ -v
```

### 5. Build Frontend Production Bundle
```bash
cd frontend && npm run build
```

---

## 🏆 4. Spark MLlib Model Leaderboard

Evaluated on an 80/20 holdout test set (**$N = 88,574$ records**):

| Rank | Model Algorithm | $R^2$ Score | RMSE (T/Ha) | MAE (T/Ha) | Training Duration | Status |
|:---:|---|:---:|:---:|:---:|:---:|:---:|
| 🥇 | **Gradient-Boosted Trees (GBT)** | **0.8550** | **5.3413** | **1.1332** | 11.96s | **Champion** |
| 🥈 | **Random Forest Regressor** | 0.8532 | 5.3743 | 1.1769 | 3.46s | Evaluated |
| 🥉 | **Decision Tree Regressor** | 0.8508 | 5.4169 | 1.1505 | 1.73s | Evaluated |
| 4 | **Linear Regression (ElasticNet)** | 0.7720 | 6.6974 | 1.2779 | 3.14s | Linear Baseline |
| 5 | **K-Means Clustering ($k=4$)** | **Silhouette: 0.4749** | — | — | 5.78s | 4 Agronomic Clusters |

### Critical Methodological Integrity: Strict Target Leakage Isolation
In agricultural statistics:
$$\text{Yield} = \frac{\text{Production}}{\text{Area}}$$
If `production` is included as an independent feature to predict `yield`, machine learning models trivially learn the algebraic division formula, reaching an artificial $R^2 \approx 0.999$. In real-world pre-harvest forecasting, `production` is completely unknown. 

**NEXGram strictly isolates `production` from feature vectors**, training exclusively on pre-planting and mid-season exogenous variables:
- `log_area = log1p(area)` (handles extreme land skew from 0.01 Ha to 8.5M Ha)
- `state_idx`, `crop_idx`, `season_idx`
- `crop_avg_yield` (historical crop benchmark using Window functions without lookahead bias)
- `state_crop_avg_yield` (state-level historical benchmark)
- `crop_year` (longitudinal technological progress trend)

---

## 🌾 5. Farmer-First Experience & Local Storytelling

Farmer Mode was designed from grassroots agricultural principles rather than technical dashboard paradigms:

1. **Bilingual Hindi / English Localization**:
   - Complete dictionary translation toggled with a single click (`English` / `हिंदी`).
   - Translates all crop names, seasons, state names, units, and advisory statements.
2. **Indian Agricultural Units**:
   - Instant toggle between **Acres** and **Hectares**, and **Quintals** and **Tonnes** ($1\text{ Quintal} = 100\text{ kg}$; $1\text{ T/Ha} \approx 4.047\text{ Quintals/Acre}$).
3. **4 Simplified Workflows**:
   - **Home (मुखपृष्ठ)**: Welcoming overview, local farm landscape photography, and quick farm detail selector.
   - **My Crop (मेरी फसल)**: Historical multi-year state and national productivity benchmarks.
   - **Yield Estimate (उपज अनुमान)**: Inputs state, district, crop, season, and acreage; returns verified MLlib predictions with 95% confidence intervals and total expected quintals.
   - **Compare (तुलना)**: State-by-state productivity comparison charts for crop planning.
4. **Transparent Agronomic Disclaimers**:
   - Explicitly informs farmers: *"Estimates are based on historical district trends and do not guarantee future harvest. Local weather, soil health, irrigation, and field management strongly influence actual results."*

---

## 🎓 6. Dedicated Viva Voce Presentation Mode

Built directly into the platform for university evaluations and presentations:
- Press **`P`** on your keyboard (or click **"Presentation Mode"** in the header) to launch.
- Navigate using **`ArrowRight`** and **`ArrowLeft`** (or Next/Prev buttons).
- Press **`Esc`** to return to the interactive dashboard.
- **7-Slide Walkthrough**:
  1. *Slide 1*: Problem Statement & Agricultural Motivation (455k records, 737 districts)
  2. *Slide 2*: Dataset Provenance & Cryptographic Integrity Verification
  3. *Slide 3*: Hadoop HDFS Storage Architecture (`/agriscope` Medallion structure)
  4. *Slide 4*: Distributed PySpark ETL & Target Leakage Prevention
  5. *Slide 5*: Spark MLlib Model Leaderboard ($R^2 = 0.8550$ GBT Champion)
  6. *Slide 6*: Longitudinal Agricultural Business Intelligence & Crop Clusters
  7. *Slide 7*: Farmer-First Mode & Socioeconomic Grounding

---

## 🔒 7. Production Hardening & Code Watermarking

- **Code Watermarking**: Deeply embedded internal author watermark comments, headers, and docstrings across backend modules, spark jobs, frontend components, and test suites:
  - Custom HTTP Response Headers: `X-Developer: Aditya Sinha`, `X-Engine: NEXGram-BigData-Intelligence`, `X-Platform-Architect: Developed by Aditya Sinha | NEXGram`
  - Meta tags in `index.html` and header in `index.css`
  - Attribution in `Sidebar.jsx`, `FarmerMode.jsx`, and `App.jsx`
- **Pydantic v2 Migration**: Converted all schemas to `model_config = ConfigDict(from_attributes=True)`.
- **Timezone-Aware Datetimes**: Replaced deprecated `utcnow()` with `datetime.datetime.now(datetime.timezone.utc)`.
- **Path Traversal Security**: Strict directory prefix resolution checks on dataset previews (`settings.base_dir`) and job logs (`settings.logs_dir`).
- **Input Sanitization**: Case-insensitive crop and state dictionary resolution.

---

## 📁 8. Repository Structure

```
agriscope/
├── backend/                  # FastAPI Microservice Application (Python 3.12)
│   ├── app/
│   │   ├── api/v1/           # REST endpoints (health, datasets, models, predictions, analytics, jobs)
│   │   ├── core/             # Config, database seeder, security settings
│   │   ├── models/           # SQLAlchemy database schemas (timezone-aware UTC)
│   │   ├── repositories/     # Database CRUD repositories
│   │   ├── schemas/          # Pydantic v2 data contracts
│   │   ├── services/         # HDFS and Spark job submission services
│   │   └── cached_data/      # Aggregated JSON caches (overview, crops, states, clusters)
│   └── requirements.txt
├── frontend/                 # React 18 + Vite Web Application
│   ├── public/
│   │   └── images/           # Authentic agricultural photography assets
│   ├── src/
│   │   ├── components/       # Overview, FarmerMode, PresentationModal, Analytics, Models, Predict, etc.
│   │   ├── services/         # API client with districts, farmer-summary, and health endpoints
│   │   ├── App.jsx           # Root orchestrator with AppMode (Analyst vs Farmer) state
│   │   └── index.css         # Apple-inspired minimalist design system (5-color organic green)
│   └── package.json
├── spark_jobs/               # Distributed PySpark Jobs
│   ├── ingest_data.py        # CSV -> HDFS Parquet staging
│   ├── clean_data.py         # Data audit, deduplication, and quality cleaning
│   ├── build_features.py     # Feature engineering & leakage prevention
│   ├── exploratory_analysis.py # Precomputed BI aggregates
│   ├── train_regression.py   # Trains 4 MLlib regression models
│   ├── train_kmeans.py       # Trains K-Means clustering model (k=4)
│   └── predict_yield.py      # Batch/single inference runner
├── data/                     # Raw agricultural dataset (CSV, 53.6 MB, 455,359 rows)
├── docs/                     # Academic & System Documentation
│   ├── ARCHITECTURE.md       # Distributed system architecture
│   ├── BIG_DATA_PIPELINE.md  # Spark ETL and DAG stages
│   ├── HDFS_SCHEMA.md        # HDFS directory layout & schemas
│   ├── ML_MODELS.md          # Mathematical formulations & results
│   ├── API_DOCUMENTATION.md  # REST API endpoint reference
│   ├── USER_GUIDE.md         # Quickstart and command cheat-sheet
│   └── PROJECT_REPORT.md     # Academic project report for CSET-371
├── scripts/                  # Shell Automation Scripts
│   ├── start_all.sh          # Starts HDFS, FastAPI, and Vite
│   ├── stop_all.sh           # Clean shutdown
│   ├── run_pipeline.sh       # Runs full end-to-end Spark pipeline
│   └── verify_environment.sh # Checks Java, Hadoop, Spark, Python, Node
└── tests/                    # Pytest Suite (Unit, Integration, E2E)
    ├── unit/                 # Model and schema unit tests
    └── integration/          # API, Farmer conversions, and pipeline tests
```

---

## ⚖️ 9. Academic Integrity & Author Attribution

- **Architect & Lead Developer**: **Aditya Sinha**
- **Academic Course**: **B.Tech CSET-371 Big Data Analytics & Business Intelligence**
- **Original Source Data**: Ministry of Agriculture & Farmers Welfare, Government of India (APY Corpus, 1997–2022).
- **All Rights Reserved**: (c) 2026 Aditya Sinha. This software is developed for academic evaluation, reproducible research, and decision-support exploration.
