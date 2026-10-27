# AgriScope REST API Specification

## 1. Overview
The AgriScope REST API is built with **FastAPI** and **Uvicorn**, providing sub-50ms query latency, automated OpenAPI/Swagger documentation, and background Spark job orchestration.

- **Base URL**: `http://localhost:8000/api/v1`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`
- **ReDoc Documentation**: `http://localhost:8000/redoc`

---

## 2. API Endpoints Reference

### 2.1 System Health & Cluster Status
`GET /api/v1/health/`
- **Description**: Returns live status for Hadoop HDFS, Apache Spark, and SQLite metadata catalog.
- **Sample Response**:
```json
{
  "status": "healthy",
  "service": "AgriScope Backend Intelligence Engine",
  "version": "1.0.0",
  "hdfs": {
    "connected": true,
    "hdfs_uri": "hdfs://localhost:9000",
    "dfs_report": {
      "filesystem": "hdfs://localhost:9000",
      "size": "460.43 GB",
      "used": "89.2 MB",
      "available": "342.1 GB"
    }
  },
  "spark": {
    "installed": true,
    "master": "local[*]"
  }
}
```

---

### 2.2 Datasets Management
- `GET /api/v1/datasets/` — List registered datasets and metadata.
- `GET /api/v1/datasets/{id}` — Get details for a specific dataset.
- `GET /api/v1/datasets/{id}/preview?limit=25&view_type=cleaned` — Sample preview of cleaned or raw records.
- `GET /api/v1/datasets/{id}/profile` — Data profiling report (null counts, data types).

---

### 2.3 ML Models & Leaderboard
- `GET /api/v1/models/` — List all registered MLlib models.
- `GET /api/v1/models/comparison` — Side-by-side leaderboard of all 4 regression models (MAE, RMSE, R²).
- `GET /api/v1/models/{id}` — Specific model metadata, hyperparameters, and HDFS artifact paths.

---

### 2.4 Yield Predictions
`POST /api/v1/predictions/`
- **Description**: Real-time yield prediction with 95% confidence intervals and feature contribution waterfall.
- **Request Body**:
```json
{
  "state_name": "Punjab",
  "district_name": "Ludhiana",
  "crop_name": "Wheat",
  "season": "Rabi",
  "year": 2024,
  "area": 120.0,
  "algorithm": "gradient_boosted_trees"
}
```
- **Response**:
```json
{
  "id": "pred-4a8e9f2b",
  "algorithm": "gradient_boosted_trees",
  "predicted_yield": 5.585,
  "yield_unit": "Tonnes/Hectare",
  "estimated_production": 670.2,
  "production_unit": "Tonnes",
  "confidence_interval": {
    "lower_bound_95": 4.84,
    "upper_bound_95": 6.33,
    "margin_of_error": 0.745
  },
  "feature_contributions": {
    "Base Crop Average": 3.12,
    "State Geographic Effect": 1.092,
    "Seasonality Effect": 0.25,
    "Technology Year Trend": 0.599,
    "Land Scale Effect": -0.045
  }
}
```

---

### 2.5 Batch Prediction
`POST /api/v1/predictions/batch`
- **Description**: Evaluates multiple agricultural scenarios simultaneously and provides summary statistics.

---

### 2.6 Analytics & Business Intelligence
- `GET /api/v1/analytics/overview` — High-level dashboard bundle: KPIs, 25-year yield trends, state/crop rankings, and seasonal distribution.
- `GET /api/v1/analytics/trends` — 25-year time series (1997-2022).
- `GET /api/v1/analytics/states` — State-level productivity rankings.
- `GET /api/v1/analytics/crops` — Crop-level productivity rankings.
- `GET /api/v1/analytics/metadata/options` — Form options for states, crops, and seasons.

---

### 2.7 Clustering
- `GET /api/v1/clusters/` — K-Means clustering results, Silhouette score, cluster sizes, and agronomic profiles.

---

### 2.8 Pipeline Job Execution
- `GET /api/v1/jobs/` — List recent Spark job executions.
- `GET /api/v1/jobs/{id}/logs` — Retrieve terminal execution log stream.
- `POST /api/v1/jobs/trigger` — Trigger a PySpark job asynchronously (`ingest`, `clean`, `feature_engineering`, `analytics`, `train`, `cluster`).
