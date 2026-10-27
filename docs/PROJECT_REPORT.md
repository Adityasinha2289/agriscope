# B.Tech Project Report: AgriScope

**Course**: CSET-371 Big Data Analytics & Business Intelligence  
**Degree**: Bachelor of Technology in Computer Science & Engineering  
**Project Title**: AgriScope — Enterprise Crop Yield Intelligence Platform using Apache Hadoop HDFS & Apache Spark  
**Academic Year**: 2026–2027  

---

## 1. Abstract
Agricultural productivity is the cornerstone of India's socioeconomic stability, yet forecasting crop yields is fraught with high spatial-temporal variance, non-linear weather dependencies, and fragmented regional data collection. 

This project develops **AgriScope**, a production-minded Big Data platform designed to ingest, clean, feature-engineer, and model **455,359 historical agricultural records** spanning 25 years (1997–2022) across 34 states and 737 districts.

The platform demonstrates real, functioning usage of:
1. **Apache Hadoop HDFS** for fault-tolerant distributed raw data storage and Snappy-compressed Parquet staging.
2. **Apache Spark / PySpark** for distributed in-memory data processing, Window-based historical baseline generation, and leakage-free feature engineering.
3. **Spark MLlib** evaluating five machine learning algorithms: Linear Regression, Decision Tree Regressor, Random Forest Regressor, Gradient-Boosted Trees Regressor, and K-Means Clustering.
4. **FastAPI & React 18**: High-performance RESTful API and responsive glassmorphism web interface providing real-time yield prediction with 95% confidence intervals and feature contribution explanations.

---

## 2. Problem Statement & Motivation
India encompasses 15 distinct agro-climatic zones with vastly different rainfall, soil chemistry, and farming techniques. Key challenges addressed:
- **Massive Data Scale**: 455,359 records with multiple dimensions cannot be efficiently queried with ad-hoc scripts or traditional RDBMS under concurrent analytical loads.
- **Data Quality & Inconsistencies**: Raw agricultural records contain anomalous negative yields, zero productions on positive land areas, and naming variations.
- **Target Leakage**: Standard naive approaches include Production as a predictive feature for Yield ($Y = P / A$). This introduces catastrophic target leakage. In pre-harvest scenarios, production is strictly unknown.
- **Actionability**: Farmers and policymakers require not only a predicted yield number but also confidence intervals and understanding of which regional and seasonal factors drive the outcome.

---

## 3. Technology Stack & Architectural Decisions

| Layer | Technology | Justification |
|---|---|---|
| **Distributed Storage** | Apache Hadoop HDFS | Block-level replication (128 MB blocks), high sequential read throughput, data locality for Spark executors. |
| **Distributed Processing** | Apache Spark (PySpark 4.0.0) | Resilient Distributed Datasets (RDDs), Catalyst query optimization, 100x faster in-memory operations than traditional MapReduce. |
| **Machine Learning** | Spark MLlib | Native distributed training across partitions, scalable vector assemblers, standard pipeline persistence. |
| **Backend API** | FastAPI + Uvicorn + SQLite | Asynchronous Python framework with auto-generated OpenAPI documentation, sub-50ms inference latency, path traversal security, and SQLite metadata catalog. |
| **Frontend UI** | React 18 + Vite | Apple-inspired minimalist design system (5-color organic green palette), interactive Chart.js visualizations, responsive layout, dual-audience mode switcher, and 7-slide Viva Voce presentation mode. |
| **Farmer-First UX** | Bilingual English / Hindi (हिंदी) | Grounded in authentic agricultural reality: converts academic Tonnes/Ha into Quintals/Acre, local photography, transparent ML disclaimers, no black-box advice. |

---

## 4. Big Data Pipeline & Methodology

### 4.1 Ingestion & Staging
- Raw CSV (`53.6 MB`, 455,359 rows) is uploaded to HDFS at `/agriscope/raw/apy/`.
- Spark ingestion job validates column schemas, computes SHA-256 integrity checksum, and converts to Snappy Parquet at `/agriscope/staging/validated/apy_parquet`.

### 4.2 Data Cleaning & Quality Audit
- Identifies 0 duplicate rows.
- Flags 5,009 invalid production records ($P \le 0$ when Area $> 0$).
- Flags 3,223 invalid yield records ($Y \le 0$ or non-finite).
- Non-destructive audit principle: records are annotated with boolean audit flags rather than silently deleted.

### 4.3 Feature Engineering & Leakage Isolation
- Filtered to 443,078 valid training rows.
- `log_area = log1p(area)`: Logarithmic transformation addresses extreme right-skewed land distribution (from 0.01 Ha to 8.5 million Ha).
- `state_crop_avg_yield` and `crop_avg_yield`: Historical baselines computed using Spark Window functions without lookahead bias.
- Production is strictly excluded from feature vectors.

---

## 5. Experimental Results & Academic Comparison

### 5.1 Supervised Regression Leaderboard
Evaluated on an 80/20 random holdout test set ($N_{\text{train}} = 354,504$, $N_{\text{test}} = 88,574$, seed=42):

| Algorithm | Mean Absolute Error (MAE) | Root Mean Squared Error (RMSE) | Coefficient of Determination ($R^2$) | Training Time |
|---|:---:|:---:|:---:|:---:|
| **Gradient-Boosted Trees (GBT)** | **1.1332** | **5.3413** | **0.8550** | 11.96s |
| **Random Forest Regressor** | 1.1769 | 5.3743 | 0.8532 | 3.46s |
| **Decision Tree Regressor** | 1.1505 | 5.4169 | 0.8508 | 1.73s |
| **Linear Regression (ElasticNet)** | 1.2779 | 6.6974 | 0.7720 | 3.14s |

**Key Academic Takeaway**: Non-linear tree ensembles provide an **8.3 percentage point improvement** in $R^2$ over regularized linear models, proving that crop yields are dictated by complex threshold effects and regional agronomic interactions.

### 5.2 Unsupervised K-Means Clustering ($k=4$)
- **Silhouette Score**: **0.4749**
- Discovered 4 natural cultivation clusters across Indian agriculture:
  1. *Cluster 0 (70,704 records)*: Intensive high-yield cash crops (Rice, Potato, Onion).
  2. *Cluster 1 (265,257 records)*: Extensive rainfed pulses & millets (Maize, Moong, Urad).
  3. *Cluster 2 (9,695 records)*: Commercial mega-plantations (Sugarcane, Banana, Tapioca).
  4. *Cluster 3 (97,422 records)*: Broadacre cereal basins (Wheat, Rice, Gram).

---

## 6. Human-Centered Design & Farmer-First Experience

A university project in Big Data Analytics must not only prove algorithmic competence but also demonstrate real-world socioeconomic utility. AgriScope resolves the disconnect between complex statistical outputs and rural agricultural decision-makers through two dedicated experiences:

1. **Analyst Platform (Viva & Research)**: Full access to PySpark cluster metrics, HDFS storage allocation, Spark DAG logs, regression residual scatter plots, feature importances, and interactive scenario simulations.
2. **Farmer Mode (Grassroots Practice)**:
   - **Bilingual Interface**: Full English and Hindi (हिंदी) translations for agricultural terminology.
   - **Familiar Indian Units**: Converts abstract metric tonnes/hectare into **Quintals per Acre** ($1\text{ Quintal} = 100\text{ kg}$, $1\text{ Hectare} \approx 2.471\text{ Acres}$).
   - **Transparent Forecasts**: Explicitly displays confidence bounds and notes that historical statistics cannot guarantee crop outcomes against unobserved localized monsoon shifts or pest attacks.
   - **Visual Storytelling**: Features authentic, respectful agricultural photography locally stored and optimized.

---

## 7. Verification & Production Quality

- **Pytest Suite**: 14 tests across unit, integration, and security layers passing with 0 warnings.
- **Frontend Production Build**: Vite v8.3.5 bundles in 205ms with 0 errors.
- **Security Protections**: Hardened endpoints against path traversal vulnerabilities on dataset preview and job log queries.
- **Presentation Walkthrough**: Integrated 7-stage interactive modal accessible directly from the dashboard header for examiner viva defense.

---

## 8. Conclusion
AgriScope successfully demonstrates a complete end-to-end Big Data architecture meeting all curriculum requirements for B.Tech CSET-371. By uniting Hadoop HDFS, Apache Spark, MLlib, and modern human-centered web design, the platform provides rigorous, reproducible, and explainable crop yield intelligence that serves both the data scientist and the grassroots farmer.

