"""
AgriScope - K-Means Clustering Job
Clusters agricultural records by yield, area, and production patterns.
Usage: spark-submit train_kmeans.py <hdfs_features_path> <hdfs_model_path> <hdfs_results_path> [n_clusters]
"""
import sys
import json
import time
from pyspark.sql import SparkSession
from pyspark.sql import functions as F
from pyspark.ml.feature import VectorAssembler, StandardScaler
from pyspark.ml.clustering import KMeans
from pyspark.ml.evaluation import ClusteringEvaluator
from pyspark.ml import Pipeline


RANDOM_SEED = 42

# Features for clustering — using agricultural characteristics, NOT identifiers
CLUSTER_FEATURES = [
    "area", "log_area", "yield", "season_index", "crop_type_index",
]


def create_spark_session():
    return (
        SparkSession.builder
        .appName("AgriScope-KMeansClustering")
        .config("spark.sql.adaptive.enabled", "true")
        .getOrCreate()
    )


def describe_clusters(df_with_clusters, feature_cols):
    """Generate descriptive summaries for each cluster."""
    cluster_summaries = []

    cluster_ids = [row["prediction"] for row in df_with_clusters.select("prediction").distinct().collect()]
    cluster_ids.sort()

    for cluster_id in cluster_ids:
        cluster_df = df_with_clusters.filter(F.col("prediction") == cluster_id)
        size = cluster_df.count()

        # Compute stats for each feature
        stats = {}
        for col in feature_cols:
            if col in cluster_df.columns:
                row = cluster_df.select(
                    F.mean(col).alias("mean"),
                    F.stddev(col).alias("stddev"),
                    F.min(col).alias("min"),
                    F.max(col).alias("max"),
                    F.expr(f"percentile_approx({col}, 0.5)").alias("median"),
                ).first()
                stats[col] = {
                    "mean": float(row["mean"]) if row["mean"] is not None else None,
                    "stddev": float(row["stddev"]) if row["stddev"] is not None else None,
                    "min": float(row["min"]) if row["min"] is not None else None,
                    "max": float(row["max"]) if row["max"] is not None else None,
                    "median": float(row["median"]) if row["median"] is not None else None,
                }

        # Top crops and states in this cluster
        top_crops = [
            row["crop_name"] for row in
            cluster_df.groupBy("crop_name").count()
            .orderBy(F.desc("count")).limit(5).collect()
        ] if "crop_name" in cluster_df.columns else []

        top_states = [
            row["state_name"] for row in
            cluster_df.groupBy("state_name").count()
            .orderBy(F.desc("count")).limit(5).collect()
        ] if "state_name" in cluster_df.columns else []

        # Generate descriptive label
        avg_yield = stats.get("yield", {}).get("mean", 0) or 0
        avg_area = stats.get("area", {}).get("mean", 0) or 0

        if avg_yield > 5:
            yield_label = "High Yield"
        elif avg_yield > 2:
            yield_label = "Medium Yield"
        else:
            yield_label = "Low Yield"

        if avg_area > 10000:
            area_label = "Large Area"
        elif avg_area > 1000:
            area_label = "Medium Area"
        else:
            area_label = "Small Area"

        label = f"{yield_label}, {area_label}"

        cluster_summaries.append({
            "cluster_id": int(cluster_id),
            "size": size,
            "label": label,
            "feature_stats": stats,
            "top_crops": top_crops,
            "top_states": top_states,
        })

    return cluster_summaries


def main():
    if len(sys.argv) < 4:
        print("Usage: spark-submit train_kmeans.py <hdfs_features_path> <hdfs_model_path> <hdfs_results_path> [n_clusters]")
        sys.exit(1)

    features_path = sys.argv[1]
    model_path = sys.argv[2]
    results_path = sys.argv[3]
    n_clusters = int(sys.argv[4]) if len(sys.argv) > 4 else 5

    print(f"[AgriScope] Starting K-Means clustering with k={n_clusters}")
    spark = create_spark_session()

    try:
        df = spark.read.parquet(features_path)
        total = df.count()
        print(f"[AgriScope] Loaded {total} rows")

        # Filter valid records
        for col in CLUSTER_FEATURES:
            if col in df.columns:
                df = df.filter(F.col(col).isNotNull())

        filtered = df.count()
        print(f"[AgriScope] After filtering: {filtered} rows")

        # Build pipeline
        assembler = VectorAssembler(
            inputCols=CLUSTER_FEATURES,
            outputCol="features_raw",
            handleInvalid="skip",
        )
        scaler = StandardScaler(
            inputCol="features_raw",
            outputCol="features",
            withStd=True,
            withMean=True,
        )
        kmeans = KMeans(
            k=n_clusters,
            seed=RANDOM_SEED,
            featuresCol="features",
            predictionCol="prediction",
            maxIter=100,
        )

        pipeline = Pipeline(stages=[assembler, scaler, kmeans])

        # Train
        start_time = time.time()
        pipeline_model = pipeline.fit(df)
        train_duration = time.time() - start_time
        print(f"[AgriScope] Training time: {train_duration:.2f}s")

        # Transform
        clustered_df = pipeline_model.transform(df)

        # Evaluate silhouette score
        silhouette = None
        try:
            evaluator = ClusteringEvaluator(
                predictionCol="prediction",
                featuresCol="features",
                metricName="silhouette",
            )
            silhouette = float(evaluator.evaluate(clustered_df))
            print(f"[AgriScope] Silhouette Score: {silhouette:.4f}")
        except Exception as e:
            print(f"[AgriScope] Could not compute silhouette: {e}")

        # Cluster sizes
        sizes = clustered_df.groupBy("prediction").count().orderBy("prediction").collect()
        cluster_sizes = {int(row["prediction"]): row["count"] for row in sizes}
        print(f"[AgriScope] Cluster sizes: {cluster_sizes}")

        # Generate cluster summaries
        print("[AgriScope] Generating cluster descriptions...")
        summaries = describe_clusters(clustered_df, CLUSTER_FEATURES)

        # Save model
        pipeline_model.write().overwrite().save(model_path)
        print(f"[AgriScope] Model saved to: {model_path}")

        # Save cluster assignments
        assign_cols = ["prediction"] + [
            c for c in ["state_name", "district_name", "crop_name", "year", "yield", "area", "production"]
            if c in clustered_df.columns
        ]
        clustered_df.select(*assign_cols).write.mode("overwrite").parquet(f"{results_path}/assignments")
        print(f"[AgriScope] Assignments saved")

        # Save summary as JSON
        result = {
            "status": "success",
            "n_clusters": n_clusters,
            "silhouette_score": silhouette,
            "cluster_sizes": cluster_sizes,
            "cluster_summaries": summaries,
            "features_used": CLUSTER_FEATURES,
            "total_records": filtered,
            "training_duration_seconds": round(train_duration, 2),
            "model_path": model_path,
            "results_path": results_path,
            "random_seed": RANDOM_SEED,
        }

        result_json = json.dumps(result, indent=2, default=str)
        result_rdd = spark.sparkContext.parallelize([result_json])
        result_rdd.coalesce(1).saveAsTextFile(f"{results_path}/summary")

        print(f"\n[AgriScope-Result] {json.dumps(result, default=str)}")

    except Exception as e:
        print(f"[AgriScope-Result] {json.dumps({'status': 'error', 'error': str(e)})}")
        raise
    finally:
        spark.stop()


if __name__ == "__main__":
    main()
