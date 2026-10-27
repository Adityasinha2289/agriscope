# AgriScope Big Data Processing Pipeline

## 1. Overview
The AgriScope data processing pipeline is implemented in **Apache Spark / PySpark** and orchestrated via spark-submit jobs. It processes **455,359 historical agricultural records** from HDFS into feature-engineered datasets and analytical aggregates.

---

## 2. Pipeline Execution Stages

```
[Raw CSV in HDFS]
       │
       ▼
[Stage 1: Ingest Data] ──▶ Converts CSV to Snappy Parquet, validates 16 columns
       │
       ▼
[Stage 2: Clean Data]  ──▶ Audits nulls & flags 5,009 invalid prod / 3,223 invalid yield records
       │
       ▼
[Stage 3: Features]    ──▶ Filters to 443,078 valid rows, encodes season/crop, computes log_area
       │
       ├───▶ [Stage 4: Exploratory Analytics] ──▶ 25-year trends, state/crop rankings, seasonal BI
       ├───▶ [Stage 5: Train Regression]      ──▶ Trains LR, DT, RF, GBT on 80/20 train/test split
       └───▶ [Stage 6: K-Means Clustering]    ──▶ Clusters 443k rows into 5 agronomic clusters
```

---

## 3. Spark Optimization Techniques
1. **Columnar Parquet Storage**: Reduces storage footprint by ~85% with Snappy compression compared to raw text CSV.
2. **Adaptive Query Execution (AQE)**: `spark.sql.adaptive.enabled = true` dynamically adjusts shuffle partitions and handles data skew.
3. **Partition Coalescing**: Post-aggregation coalescing avoids generating thousands of small files in HDFS.
4. **Broadcast Joins & In-Memory Caching**: Frequently joined reference mappings are broadcast to executor nodes.

---

## 4. Pipeline Jobs Reference

### Stage 1: Ingestion (`spark_jobs/ingest_data.py`)
- Reads raw CSV from `/agriscope/raw/apy/crop-wise-area-production-yield.csv`
- Enforces strict data types: String for categorical, Double for Area/Yield, Double for Production
- Writes Snappy-compressed Parquet to `/agriscope/staging/validated/apy_parquet`
- Saves dataset profile summary JSON to `/agriscope/metadata/apy_profile`

### Stage 2: Data Cleaning (`spark_jobs/clean_data.py`)
- Checks for duplicate records (0 found, 100% unique)
- Flags negative or zero production where area > 0 (5,009 records flagged)
- Flags negative or non-finite yields (3,223 records flagged)
- Non-destructive audit: writes boolean flags `production_valid`, `yield_valid`, `area_valid`

### Stage 3: Feature Engineering (`spark_jobs/build_features.py`)
- Filters to rows where `yield_valid` and `area_valid` are True (443,078 records)
- Log-transformation: `log_area = log1p(area)` to handle positive skewness
- Categorical indexing: encodes seasons (Kharif=1, Rabi=2, Summer=3, etc.) and crop types
- Computes historical benchmark yield ratios using Spark Window functions:
  - `state_crop_avg_yield` (Window partitioned by state_code, crop_code)
  - `crop_avg_yield` (Window partitioned by crop_code)

### Stage 4: Exploratory Analytics (`spark_jobs/exploratory_analysis.py`)
- Generates pre-computed distributed aggregates:
  - `yield_trends` (26 longitudinal years 1997-2022)
  - `state_rankings` (34 states)
  - `crop_rankings` (98 crops)
  - `season_distribution` (7 seasons)
  - `kpis` summary metrics

### Stage 5: Regression Model Training (`spark_jobs/train_regression.py`)
- 80/20 train/test split with fixed random seed (seed=42)
- Trains Linear Regression, Decision Tree, Random Forest, Gradient-Boosted Trees
- Evaluates on 88,574 test records: MAE, RMSE, R²
- Saves serialized models to `/agriscope/models/` and metrics to `/agriscope/results/evaluations/`

### Stage 6: K-Means Clustering (`spark_jobs/train_kmeans.py`)
- Unsupervised clustering along 5 agricultural features: area, log_area, yield, season_index, crop_type_index
- Evaluates silhouette score (0.4749)
- Saves cluster assignments to `/agriscope/results/clusters/assignments` and summary profiles
