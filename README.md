# AgriScope — Crop Yield Intelligence & Agricultural Analytics Platform

> **B.Tech CSET-371 Big Data Analytics and Business Intelligence Project**  
> An enterprise-grade, distributed Big Data application powered by **Apache Hadoop HDFS**, **Apache Spark (PySpark 4.0.0)**, **Spark MLlib**, **FastAPI**, and **React 18**.  
> Features a dual-audience experience: an **Apple-inspired Analyst Platform** for research/viva defense, and a **Farmer-First Mode** (bilingual English/Hindi) delivering actionable agronomic insights.

[![Tests](https://img.shields.io/badge/Pytest-14%2F14%20Passing-brightgreen)](#)
[![HDFS](https://img.shields.io/badge/Hadoop%20HDFS-hdfs%3A%2F%2Flocalhost%3A9000-blue)](#)
[![Spark](https://img.shields.io/badge/Apache%20Spark-v4.0.0%20MLlib-orange)](#)
[![Python](https://img.shields.io/badge/Python-3.12-blue)](#)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61dafb)](#)
[![UI](https://img.shields.io/badge/Design-Apple--Inspired%20Minimalism-375534)](#)

---

## 🌾 Overview

AgriScope evaluates **455,359 historical agricultural records** spanning 25 years (1997–2022) across 34 Indian states and 737 districts. Built for university defense and practical impact, it reconciles two critical needs:
1. **Academic & Research Rigor**: Distributed HDFS medallion storage, PySpark distributed ETL, strict target leakage prevention ($Yield = Production / Area$), and multi-algorithm evaluation with MLlib.
2. **Farmer Accessibility**: A dedicated, simplified Farmer Mode in English and Hindi (हिंदी), translating complex statistical output into familiar units (**Quintals per Acre**) without black-box agronomic claims.

---

## ✨ Key Capabilities

- **Dual-Audience Architecture**:
  - **Analyst Mode**: Comprehensive 8-tab intelligence platform (Overview, Crop Analytics, Dataset Explorer, Pipeline Monitor, Model Laboratory, Yield Prediction, Agronomic Clusters, and Academic Report).
  - **Farmer Mode**: Simplified 4-tab workflow (**Home**, **My Crop**, **Yield Estimate**, **Compare**) with bilingual Hindi/English translation, unit switching (Acres vs. Hectares; Quintals vs. Tonnes), and honest agronomic advisory disclaimers.
- **Dedicated Presentation Mode**: Built-in 7-step viva voce walkthrough modal for B.Tech CSET-371 defense covering Problem Statement, Dataset Provenance, HDFS Architecture, PySpark ETL, MLlib Leaderboard, Agricultural Insights, and Farmer Mode Demonstration. Supports keyboard navigation (`ArrowLeft`, `ArrowRight`, `Esc`, `P`).
- **Apple-Inspired Design System**: Curated 5-color natural green palette (Forest `#0F2A1D`, Olive `#375534`, Sage `#6B9071`, Soft Sage `#AEC3B0`, Pale Green `#E3EED4`), generous whitespace, San Francisco typography, and zero neon/cyberpunk aesthetics.
- **Production Hardening**: Timezone-aware UTC timestamps, Pydantic v2 `ConfigDict` schemas, path traversal security barriers on dataset preview and job log endpoints, case-insensitive query sanitization, and robust API error envelopes.
- **Verified Local Agricultural Photography**: Authentic, respectful agricultural imagery locally hosted (`indian_farm_landscape.jpg` and `healthy_crop_harvest.jpg`), documented with fallbacks.

---

## ⚡ Quickstart

### 1. Launch All Services
```bash
./scripts/start_all.sh
```
- **Web Application**: [http://localhost:5173](http://localhost:5173)
- **FastAPI Backend**: [http://localhost:8000](http://localhost:8000)
- **Interactive Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **HDFS NameNode Web UI**: [http://localhost:9870](http://localhost:9870)

### 2. Stop All Services
```bash
./scripts/stop_all.sh
```

### 3. Run Distributed Pipeline Manually
```bash
./scripts/run_pipeline.sh
```

### 4. Run Verification Test Suite
```bash
PYTHONPATH=. venv/bin/pytest tests/ -v
```

### 5. Build Frontend Production Bundle
```bash
cd frontend && npm run build
```

---

## 🏆 ML Model Leaderboard

Evaluated on an 80/20 holdout test set (**$N = 88,574$ records**):

| Rank | Model Algorithm | $R^2$ Score | RMSE (T/Ha) | MAE (T/Ha) | Training Duration | Status |
|:---:|---|:---:|:---:|:---:|:---:|:---:|
| 🥇 | **Gradient-Boosted Trees (GBT)** | **0.8550** | **5.3413** | **1.1332** | 11.96s | **Champion** |
| 🥈 | **Random Forest Regressor** | 0.8532 | 5.3743 | 1.1769 | 3.46s | Evaluated |
| 🥉 | **Decision Tree Regressor** | 0.8508 | 5.4169 | 1.1505 | 1.73s | Evaluated |
| 4 | **Linear Regression (ElasticNet)** | 0.7720 | 6.6974 | 1.2779 | 3.14s | Baseline |
| 5 | **K-Means Clustering ($k=4$)** | **Silhouette: 0.4749** | — | — | 5.78s | 4 Agronomic Clusters |

> **Critical Methodological Note**: In agricultural data, $\text{Yield} = \frac{\text{Production}}{\text{Area}}$. Including `production` as an independent feature creates trivial mathematical identity leakage ($R^2 \approx 0.999$), making the model useless for pre-harvest forecasting. AgriScope strictly isolates `production` from feature assembly.

---

## 📁 Repository Structure

```
agriscope/
├── backend/                  # FastAPI Application (Python 3.12)
│   ├── app/
│   │   ├── api/v1/           # REST endpoints (health, datasets, models, predictions, analytics, jobs)
│   │   ├── core/             # Settings, database seeder, config
│   │   ├── models/           # SQLAlchemy database schemas (timezone-aware UTC)
│   │   ├── repositories/     # Database CRUD repositories
│   │   ├── schemas/          # Pydantic v2 data contracts (from_attributes=True)
│   │   ├── services/         # HDFS and Spark submission services
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

## 🎓 Academic Credit & Integrity

- **Target Leakage Strict Protection**: Enforces pre-harvest predictive validity by strictly excluding `production`.
- **Honest Agronomic Disclaimers**: Clarifies that machine learning estimates are historical approximations subject to unobserved seasonal weather and soil variations, avoiding irresponsible automated advice.
- **Course**: B.Tech CSET-371 Big Data Analytics & Business Intelligence.

