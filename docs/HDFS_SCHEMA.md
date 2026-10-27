# NEXGram HDFS Storage & Schema Design

> **Lead Architect & Developer:** **Aditya Sinha**  
> **Course:** B.Tech CSET-371 Big Data Analytics & Business Intelligence

## 1. Hadoop HDFS Configuration
- **HDFS URI**: `hdfs://localhost:9000`
- **Namenode Web UI**: `http://localhost:9870`
- **Replication Factor**: `1` (Single-node pseudo-distributed) / `3` (Production cluster)
- **Default Block Size**: `128 MB`
- **Hadoop Home**: `/opt/homebrew/opt/hadoop/libexec`

---

## 2. Directory Hierarchy

```
/agriscope
├── raw/
│   └── apy/crop-wise-area-production-yield.csv    [53.6 MB, CSV]
├── staging/
│   └── validated/apy_parquet/                     [Snappy Parquet]
├── processed/
│   ├── cleaned/                                   [10 Parquet parts]
│   └── features/                                  [13 Parquet parts, 443k rows]
├── analytics/
│   └── aggregates/
│       ├── kpis/part-00000                        [JSON metrics]
│       ├── yield_trends/part-00000...             [Parquet]
│       ├── state_rankings/part-00000...           [Parquet]
│       ├── crop_rankings/part-00000...            [Parquet]
│       └── season_distribution/part-00000...      [Parquet]
├── models/
│   ├── linear_regression/                         [MLlib PipelineModel]
│   ├── decision_tree/                             [MLlib PipelineModel]
│   ├── random_forest/                             [MLlib PipelineModel]
│   ├── gradient_boosted_trees/                    [MLlib PipelineModel]
│   └── kmeans/                                    [MLlib PipelineModel]
└── results/
    ├── evaluations/regression_summary             [Evaluation JSON]
    └── clusters/
        ├── assignments/                           [Parquet assignments]
        └── summary/                               [Clustering JSON]
```

---

## 3. Schema Definitions

### Cleaned Parquet Schema (`/agriscope/processed/cleaned`)
| Column | Type | Nullable | Role |
|---|---|---|---|
| `State` | string | false | Administrative level 1 |
| `District` | string | false | Administrative level 2 |
| `Crop` | string | false | Crop commodity name |
| `Year` | string | false | Agricultural season year |
| `Season` | string | false | Seasonal cycle |
| `Area` | double | false | Land area in hectares |
| `Production` | double | true | Harvest in tonnes |
| `Yield` | double | true | Tonnes / Hectare |
| `Crop_Type` | string | true | Category taxonomy |
| `start_year` | integer | false | Normalized starting year |
| `production_valid` | boolean | false | Audit flag for positive production |
| `yield_valid` | boolean | false | Audit flag for positive yield |
| `area_valid` | boolean | false | Audit flag for positive area |

### Feature Dataset Schema (`/agriscope/processed/features`)
| Column | Type | Role in Model |
|---|---|---|
| `yield` | double | **Target Variable ($Y$)** |
| `start_year` | integer | Continuous Feature |
| `state_code` | integer | Categorical Feature |
| `district_code` | integer | Categorical Feature |
| `crop_code` | integer | Categorical Feature |
| `area` | double | Continuous Feature |
| `log_area` | double | Engineered Continuous Feature |
| `season_index` | integer | Encoded Feature |
| `crop_type_index` | integer | Encoded Feature |
| `state_crop_avg_yield` | double | Historical Benchmark Feature |
| `crop_avg_yield` | double | Historical Benchmark Feature |
