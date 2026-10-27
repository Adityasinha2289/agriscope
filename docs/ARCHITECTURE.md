# NEXGram Architecture Specification

> **Lead Architect & Developer:** **Aditya Sinha**  
> **Course:** B.Tech CSET-371 Big Data Analytics and Business Intelligence

## 1. Executive Summary
**NEXGram** is an enterprise-quality Big Data analytics and machine learning platform engineered to forecast crop yields and deliver actionable agricultural intelligence across India. 

Designed for **B.Tech CSET-371 Big Data Analytics and Business Intelligence**, the platform processes **455,359 historical agricultural records** spanning 1997–2022 across 34 states and 737 districts.

---

## 2. Distributed Architecture Layers

```
+-----------------------------------------------------------------------------------+
|                           PRESENTATION LAYER (Web UI)                            |
|             React 18 + Vite SPA | Apple-Inspired Minimalist Design System        |
|             Dual-Audience: Academic Analyst Platform & Bilingual Farmer Mode     |
+-----------------------------------------------------------------------------------+
                                       |
                                       | HTTP / REST (Sub-50ms)
                                       v
+-----------------------------------------------------------------------------------+
|                             API & INTELLIGENCE LAYER                              |
|           FastAPI | Uvicorn ASGI Server | Pydantic V2 Data Contracts              |
|        SQLite Metadata Catalog | Background Spark Job Orchestration               |
+-----------------------------------------------------------------------------------+
                                       |
                   +-------------------+-------------------+
                   |                                       |
                   v                                       v
+---------------------------------------+   +---------------------------------------+
|       DISTRIBUTED COMPUTE LAYER       |   |       DISTRIBUTED STORAGE LAYER       |
|    Apache Spark 4.0.0 (PySpark)       |   |          Apache Hadoop HDFS           |
|  - In-Memory Resilient Datasets (RDD) |   |  - URI: hdfs://localhost:9000         |
|  - Adaptive Query Execution (AQE)     |   |  - Default Block Size: 128 MB         |
|  - Spark MLlib Machine Learning       |   |  - Replication Factor: 1 (Dev) / 3    |
|  - Snappy-Compressed Parquet Engine   |   |  - Namespace: /agriscope              |
+---------------------------------------+   +---------------------------------------+
```

---

## 3. Storage Hierarchy on Hadoop HDFS
All data assets reside in the Hadoop Distributed File System under the `/agriscope` root namespace:

| HDFS Directory Path | Purpose & Storage Format | Lifecycle |
|---|---|---|
| `/agriscope/raw/apy/` | Raw CSV source file (`53.6 MB`, 455k rows) | Immutable landing zone |
| `/agriscope/staging/validated/` | Schema-validated Snappy Parquet | Quality verified |
| `/agriscope/processed/cleaned/` | Quality audited records with flags | Production curated |
| `/agriscope/processed/features/` | Feature engineered vectors (`443,078 rows`) | Feature store |
| `/agriscope/analytics/aggregates/` | Pre-computed longitudinal BI aggregates | Dashboard serving |
| `/agriscope/models/` | Serialized Spark MLlib pipeline models | Model registry |
| `/agriscope/results/` | Evaluation metrics, predictions & clusters | Audit trail |

---

## 4. Machine Learning System Architecture
AgriScope evaluates 5 distinct algorithms across both supervised regression and unsupervised clustering:

1. **Linear Regression (Baseline)**: ElasticNet regularized linear formulation ($R^2 = 0.7720$).
2. **Decision Tree Regressor**: Non-linear recursive partitioning ($R^2 = 0.8508$).
3. **Random Forest Regressor**: Ensemble bagging over 25 decision trees ($R^2 = 0.8532$).
4. **Gradient-Boosted Trees (Champion)**: Ensemble boosting with sequential residual minimization ($R^2 = 0.8550$, MAE = 1.13, RMSE = 5.34).
5. **K-Means Clustering**: Unsupervised segmentation into 5 agronomic clusters ($k=5$, Silhouette Score = 0.4749).

---

## 5. Security & Academic Integrity
- **Target Leakage Prohibition**: In crop yield intelligence, `Yield = Production / Area`. Including `Production` in features constitutes catastrophic target leakage. AgriScope mathematically isolates `Production` and trains only on exogenous variables.
- **Data Integrity**: Every landed CSV is validated against its SHA-256 checksum (`4cf3b3b3cbce2361623ff5059bb29c5fa54ea5836a68fbe157dbe31a295844fe`).
