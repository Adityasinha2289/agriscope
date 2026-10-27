# AgriScope — Crop Yield Intelligence & Agricultural Analytics Platform

> **B.Tech CSET-371 Big Data Analytics and Business Intelligence Project**  
> An enterprise-grade, distributed Big Data application powered by **Apache Hadoop HDFS**, **Apache Spark (PySpark 4.0.0)**, **Spark MLlib**, **FastAPI**, and **React 18**.

[![Tests](https://img.shields.io/badge/Pytest-12%2F12%20Passing-brightgreen)](#)
[![HDFS](https://img.shields.io/badge/Hadoop%20HDFS-hdfs%3A%2F%2Flocalhost%3A9000-blue)](#)
[![Spark](https://img.shields.io/badge/Apache%20Spark-v4.0.0%20MLlib-orange)](#)
[![Python](https://img.shields.io/badge/Python-3.12-blue)](#)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61dafb)](#)

---

## 🌾 Overview
AgriScope evaluates **455,359 historical agricultural records** spanning 25 years (1997–2022) across 34 Indian states and 737 districts. It demonstrates real, functioning distributed data pipelines, strict target leakage prevention, and academic model comparison across five machine learning algorithms.

---

## ⚡ Quickstart

### 1. Launch All Services
```bash
./scripts/start_all.sh
```
- **Web Dashboard**: [http://localhost:5173](http://localhost:5173) (or [http://localhost:8000](http://localhost:8000))
- **FastAPI Backend**: [http://localhost:8000](http://localhost:8000)
- **Interactive Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **HDFS NameNode UI**: [http://localhost:9870](http://localhost:9870)

### 2. Stop All Services
```bash
./scripts/stop_all.sh
```

### 3. Run Distributed Pipeline Manually
```bash
./scripts/run_pipeline.sh
```

### 4. Run Test Suite
```bash
PYTHONPATH=. venv/bin/pytest tests/
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
| 5 | **K-Means Clustering ($k=5$)** | **Silhouette: 0.4749** | — | — | 5.78s | 5 Agronomic Clusters |

---

## 📁 Repository Structure
```
agriscope/
├── backend/                  # FastAPI Application
│   ├── app/
│   │   ├── api/v1/           # REST endpoints (health, datasets, models, predictions, etc.)
│   │   ├── core/             # Settings, database seeder, config
│   │   ├── models/           # SQLAlchemy database schemas
│   │   ├── repositories/     # Database CRUD repositories
│   │   ├── schemas/          # Pydantic data contracts
│   │   ├── services/         # HDFS and Spark submission services
│   │   └── cached_data/      # Aggregated JSON caches
│   └── requirements.txt
├── frontend/                 # React 18 + Vite Web Application
│   ├── src/
│   │   ├── components/       # Overview, Dataset, Pipeline, Analytics, Models, Predict, Clusters, Docs
│   │   ├── services/         # API client
│   │   ├── App.jsx           # Master application
│   │   └── index.css         # Cyber-agriculture glassmorphism design system
│   └── package.json
├── spark_jobs/               # Distributed PySpark Jobs
│   ├── ingest_data.py        # CSV -> HDFS Parquet staging
│   ├── clean_data.py         # Data audit and quality cleaning
│   ├── build_features.py     # Feature engineering & leakage prevention
│   ├── exploratory_analysis.py # Precomputed BI aggregates
│   ├── train_regression.py   # Trains 4 MLlib regression models
│   ├── train_kmeans.py       # Trains K-Means clustering model (k=5)
│   └── predict_yield.py      # Batch/single inference runner
├── data/                     # Raw agricultural dataset (CSV, 53.6 MB)
├── docs/                     # Complete Academic Documentation Package
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
└── tests/                    # Test Suite (Unit, Integration, E2E)
```

---

## 🎓 Academic Credit & Integrity
- **Target Leakage Strict Protection**: In agricultural forecasting, `Yield = Production / Area`. Including Production in features is mathematically invalid. AgriScope enforces complete isolation of Production.
- **Course**: B.Tech CSET-371 Big Data Analytics & Business Intelligence.
