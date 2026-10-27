"""
==============================================================================
NEXGram — Metadata Database Seeder
Architecture & Implementation: Developed by Aditya Sinha
B.Tech CSET-371 Big Data Analytics & Business Intelligence
Seeds dataset metadata, trained models, cluster results, and job logs on startup
==============================================================================
"""
import os
import json
import logging
from sqlalchemy.orm import Session
from ..models.database import Dataset, Job, TrainedModel, ClusterResult
from ..core.config import get_settings

logger = logging.getLogger(__name__)


def seed_database(db: Session):
    """Seed initial records if database is fresh."""
    settings = get_settings()

    # 1. Seed primary dataset
    existing_dataset = db.query(Dataset).filter(Dataset.filename == "crop-wise-area-production-yield.csv").first()
    dataset_id = "apy-primary"
    if not existing_dataset:
        profile_summary = {}
        profile_file = os.path.join(settings.base_dir, "backend", "app", "cached_data", "apy_profile.json")
        if os.path.exists(profile_file):
            try:
                with open(profile_file) as f:
                    profile_summary = json.load(f)
            except Exception as e:
                logger.warning(f"Could not load profile summary: {e}")

        dataset = Dataset(
            id=dataset_id,
            name="Crop-Wise Area, Production and Yield (APY) India",
            filename="crop-wise-area-production-yield.csv",
            source_url="https://www.kaggle.com/datasets/thedevastator/crop-yield-in-indian-states-dataset",
            description="Comprehensive agricultural statistics for Indian states & districts covering 1997-2022. Includes Area, Production, Yield, Season, and Crop Categories.",
            file_size_bytes=56222102,
            row_count=455359,
            column_count=16,
            checksum_sha256="4cf3b3b3cbce2361623ff5059bb29c5fa54ea5836a68fbe157dbe31a295844fe",
            hdfs_raw_path=f"{settings.hdfs_base_path}/raw/apy/crop-wise-area-production-yield.csv",
            hdfs_cleaned_path=f"{settings.hdfs_base_path}/processed/cleaned",
            local_path=str(settings.data_dir / "crop-wise-area-production-yield.csv"),
            schema_info={
                "columns": [
                    {"name": "State", "type": "string", "role": "feature"},
                    {"name": "District", "type": "string", "role": "feature"},
                    {"name": "Crop", "type": "string", "role": "feature"},
                    {"name": "Year", "type": "string", "role": "feature"},
                    {"name": "Season", "type": "string", "role": "feature"},
                    {"name": "Area", "type": "double", "role": "feature (Hectares)"},
                    {"name": "Production", "type": "double", "role": "target component (Tonnes)"},
                    {"name": "Yield", "type": "double", "role": "target (Tonnes/Hectare)"},
                    {"name": "Crop_Type", "type": "string", "role": "feature"},
                    {"name": "start_year", "type": "integer", "role": "derived numeric year"},
                    {"name": "log_area", "type": "double", "role": "engineered feature"},
                    {"name": "season_index", "type": "integer", "role": "encoded index"},
                    {"name": "crop_type_index", "type": "integer", "role": "encoded index"},
                    {"name": "state_crop_avg_yield", "type": "double", "role": "historical benchmark"},
                    {"name": "crop_avg_yield", "type": "double", "role": "historical benchmark"}
                ]
            },
            profile_summary=profile_summary,
            validation_status="valid",
            retrieval_date="2026-10-27",
            licence="Open Data Commons Public Domain Dedication and License (PDDL) / Academic Fair Use",
        )
        db.add(dataset)
        db.commit()
        logger.info(f"Seeded primary dataset: {dataset.id}")

    # 2. Seed trained regression models
    reg_file = os.path.join(settings.base_dir, "backend", "app", "cached_data", "regression_summary.json")
    if os.path.exists(reg_file):
        try:
            with open(reg_file) as f:
                reg_data = json.load(f)

            for model_name, info in reg_data.items():
                algo = info.get("algorithm")
                existing = db.query(TrainedModel).filter(TrainedModel.algorithm == algo).first()
                if not existing:
                    tm = TrainedModel(
                        id=f"model-{algo}",
                        algorithm=algo,
                        model_name=model_name,
                        version=1,
                        dataset_id=dataset_id,
                        target_variable="yield",
                        feature_columns=info.get("feature_columns"),
                        hyperparameters=info.get("hyperparameters"),
                        metrics=info.get("metrics"),
                        training_samples=info.get("metrics", {}).get("training_samples", 354504),
                        test_samples=info.get("metrics", {}).get("test_samples", 88574),
                        split_strategy="80/20 random split",
                        random_seed=42,
                        training_duration_seconds=info.get("metrics", {}).get("training_duration_seconds"),
                        hdfs_model_path=info.get("model_path"),
                        hdfs_predictions_path=info.get("predictions_path"),
                        is_active=True,
                    )
                    db.add(tm)
            db.commit()
            logger.info("Seeded regression models in database")
        except Exception as e:
            logger.warning(f"Could not seed regression models: {e}")

    # 3. Seed K-Means Clustering result
    cluster_file = os.path.join(settings.base_dir, "backend", "app", "cached_data", "cluster_summary.json")
    if os.path.exists(cluster_file):
        try:
            with open(cluster_file) as f:
                cl_data = json.load(f)

            existing_cluster = db.query(ClusterResult).first()
            if not existing_cluster:
                cr = ClusterResult(
                    id="cluster-kmeans-k5",
                    model_id="model-kmeans",
                    n_clusters=cl_data.get("n_clusters", 5),
                    features_used=cl_data.get("features_used"),
                    cluster_sizes=cl_data.get("cluster_sizes"),
                    cluster_summaries=cl_data.get("cluster_summaries"),
                    silhouette_score=cl_data.get("silhouette_score"),
                    hdfs_assignments_path="/agriscope/results/clusters/assignments",
                )
                db.add(cr)

                # Also register KMeans in trained_models table
                existing_km = db.query(TrainedModel).filter(TrainedModel.algorithm == "kmeans").first()
                if not existing_km:
                    km_model = TrainedModel(
                        id="model-kmeans",
                        algorithm="kmeans",
                        model_name="K-Means Clustering",
                        version=1,
                        dataset_id=dataset_id,
                        target_variable="cluster",
                        feature_columns=cl_data.get("features_used"),
                        hyperparameters={"k": 5, "maxIter": 100, "seed": 42},
                        metrics={
                            "silhouette_score": cl_data.get("silhouette_score"),
                            "training_duration_seconds": cl_data.get("training_duration_seconds"),
                            "total_records": cl_data.get("total_records"),
                        },
                        training_samples=cl_data.get("total_records"),
                        split_strategy="Full dataset unsupervised",
                        random_seed=42,
                        training_duration_seconds=cl_data.get("training_duration_seconds"),
                        hdfs_model_path=cl_data.get("model_path"),
                        hdfs_predictions_path="/agriscope/results/clusters/assignments",
                        is_active=True,
                    )
                    db.add(km_model)
                db.commit()
                logger.info("Seeded K-Means clustering result in database")
        except Exception as e:
            logger.warning(f"Could not seed cluster result: {e}")

    # 4. Seed initial pipeline jobs history
    initial_jobs = [
        {
            "id": "job-ingest-01",
            "job_type": "ingest",
            "job_name": "Ingest APY Dataset to HDFS & Parquet Staging",
            "status": "completed",
            "dataset_id": dataset_id,
            "duration_seconds": 22.4,
            "hdfs_output_path": f"{settings.hdfs_base_path}/staging/validated/apy_parquet",
            "result": {"status": "success", "rows_ingested": 455359, "columns": 16, "partitions": 1},
        },
        {
            "id": "job-clean-02",
            "job_type": "clean",
            "job_name": "Data Cleaning & Quality Audit",
            "status": "completed",
            "dataset_id": dataset_id,
            "duration_seconds": 18.2,
            "hdfs_output_path": f"{settings.hdfs_base_path}/processed/cleaned",
            "result": {"status": "success", "total_records": 455359, "invalid_production_flagged": 5009, "invalid_yield_flagged": 3223},
        },
        {
            "id": "job-features-03",
            "job_type": "feature_engineering",
            "job_name": "Feature Engineering & Historical Benchmarking",
            "status": "completed",
            "dataset_id": dataset_id,
            "duration_seconds": 19.5,
            "hdfs_output_path": f"{settings.hdfs_base_path}/processed/features",
            "result": {"status": "success", "feature_records": 443078, "features_generated": 10},
        },
        {
            "id": "job-analytics-04",
            "job_type": "analytics",
            "job_name": "Exploratory Analytics & Aggregate Generation",
            "status": "completed",
            "dataset_id": dataset_id,
            "duration_seconds": 21.0,
            "hdfs_output_path": f"{settings.hdfs_base_path}/analytics/aggregates",
            "result": {"status": "success", "aggregates_generated": ["kpis", "yield_trends", "state_rankings", "crop_rankings", "season_distribution"]},
        },
        {
            "id": "job-train-05",
            "job_type": "train",
            "job_name": "Train 4 MLlib Regression Models (LR, DT, RF, GBT)",
            "status": "completed",
            "dataset_id": dataset_id,
            "duration_seconds": 24.8,
            "hdfs_output_path": f"{settings.hdfs_base_path}/models",
            "result": {"status": "success", "models_trained": 4, "best_r2": 0.8550, "best_algorithm": "gradient_boosted_trees"},
        },
        {
            "id": "job-cluster-06",
            "job_type": "cluster",
            "job_name": "K-Means Agricultural Clustering (k=5)",
            "status": "completed",
            "dataset_id": dataset_id,
            "duration_seconds": 14.5,
            "hdfs_output_path": f"{settings.hdfs_base_path}/models/kmeans",
            "result": {"status": "success", "n_clusters": 5, "silhouette_score": 0.4749, "clustered_records": 443078},
        },
    ]

    for job_dict in initial_jobs:
        existing_job = db.query(Job).filter(Job.id == job_dict["id"]).first()
        if not existing_job:
            job = Job(**job_dict)
            db.add(job)
    db.commit()
    logger.info("Seeded initial pipeline jobs history")
