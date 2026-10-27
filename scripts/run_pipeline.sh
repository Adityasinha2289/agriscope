#!/bin/bash
# ==============================================================================
# NEXGram — End-to-End Big Data Pipeline Runner
# Architecture & Implementation: Developed by Aditya Sinha
# B.Tech CSET-371 Big Data Analytics & Business Intelligence
# ==============================================================================
set -e

echo "=========================================================="
echo "     NEXGram — Distributed Big Data Pipeline Runner       "
echo "        Developed & Architected by Aditya Sinha           "
echo "=========================================================="

source venv/bin/activate
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
export HADOOP_HOME=/opt/homebrew/opt/hadoop/libexec
export HADOOP_CONF_DIR=$HADOOP_HOME/etc/hadoop

SPARK_CONF="--master local[*] --conf spark.driver.memory=4g --conf spark.hadoop.fs.defaultFS=hdfs://localhost:9000"

echo "\n[Step 1/6] Ingesting CSV to HDFS Parquet Staging..."
spark-submit $SPARK_CONF spark_jobs/ingest_data.py /agriscope/raw/apy/crop-wise-area-production-yield.csv /agriscope/staging/validated/apy_parquet

echo "\n[Step 2/6] Running Data Cleaning & Quality Audit..."
spark-submit $SPARK_CONF spark_jobs/clean_data.py /agriscope/staging/validated/apy_parquet /agriscope/processed/cleaned

echo "\n[Step 3/6] Running Feature Engineering..."
spark-submit $SPARK_CONF spark_jobs/build_features.py /agriscope/processed/cleaned /agriscope/processed/features

echo "\n[Step 4/6] Computing Exploratory Analytics & Aggregates..."
spark-submit $SPARK_CONF spark_jobs/exploratory_analysis.py /agriscope/processed/cleaned /agriscope/analytics

echo "\n[Step 5/6] Training 4 MLlib Regression Models (LR, DT, RF, GBT)..."
spark-submit $SPARK_CONF spark_jobs/train_regression.py /agriscope/processed/features /agriscope/models /agriscope/results

echo "\n[Step 6/6] Training K-Means Clustering Model (k=5)..."
spark-submit $SPARK_CONF spark_jobs/train_kmeans.py /agriscope/processed/features /agriscope/models/kmeans /agriscope/results/clusters 5

echo "\n[Sync] Syncing HDFS aggregates to backend cache..."
mkdir -p backend/app/cached_data
hdfs dfs -get -f /agriscope/analytics/aggregates backend/app/cached_data/
hdfs dfs -get -f /agriscope/results/evaluations/regression_summary/part-00000 backend/app/cached_data/regression_summary.json
hdfs dfs -get -f /agriscope/results/clusters/summary/part-00000 backend/app/cached_data/cluster_summary.json
hdfs dfs -get -f /agriscope/metadata/apy_profile/part-00000 backend/app/cached_data/apy_profile.json

python -c '
import os, glob, json, pandas as pd
os.makedirs("backend/app/cached_data/json", exist_ok=True)
agg_dir = "backend/app/cached_data/aggregates"
for item in sorted(os.listdir(agg_dir)):
    item_path = os.path.join(agg_dir, item)
    if os.path.isdir(item_path):
        parquets = glob.glob(f"{item_path}/*.parquet")
        if parquets:
            df = pd.read_parquet(parquets[0], engine="fastparquet")
            df.to_json(f"backend/app/cached_data/json/{item}.json", orient="records", indent=2)
        elif os.path.exists(f"{item_path}/part-00000"):
            with open(f"{item_path}/part-00000") as f, open(f"backend/app/cached_data/json/{item}.json", "w") as out:
                out.write(f.read())
print("Synced all aggregates to JSON cache.")
'

echo "\n=========================================================="
echo "    Pipeline completed successfully! All models & HDFS data updated."
echo "=========================================================="
