"""
AgriScope - Database models and SQLite setup
Tracks jobs, datasets, models, and experiments
"""
import datetime
import uuid
from sqlalchemy import (
    Column, String, Integer, Float, Text, DateTime, Boolean,
    create_engine, JSON
)
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from typing import Generator

Base = declarative_base()


def generate_uuid() -> str:
    return str(uuid.uuid4())[:8]


class Dataset(Base):
    """Registered dataset metadata."""
    __tablename__ = "datasets"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    filename = Column(String, nullable=False)
    source_url = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    file_size_bytes = Column(Integer, nullable=True)
    row_count = Column(Integer, nullable=True)
    column_count = Column(Integer, nullable=True)
    checksum_sha256 = Column(String, nullable=True)
    hdfs_raw_path = Column(String, nullable=True)
    hdfs_cleaned_path = Column(String, nullable=True)
    local_path = Column(String, nullable=True)
    schema_info = Column(JSON, nullable=True)
    profile_summary = Column(JSON, nullable=True)
    validation_status = Column(String, default="pending")  # pending, valid, invalid, error
    retrieval_date = Column(String, nullable=True)
    licence = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)


class Job(Base):
    """Spark/pipeline job tracking."""
    __tablename__ = "jobs"

    id = Column(String, primary_key=True, default=generate_uuid)
    job_type = Column(String, nullable=False)  # ingest, clean, profile, train, predict, cluster, export
    job_name = Column(String, nullable=False)
    status = Column(String, default="pending")  # pending, running, completed, failed, cancelled
    dataset_id = Column(String, nullable=True)
    config = Column(JSON, nullable=True)
    result = Column(JSON, nullable=True)
    error_message = Column(Text, nullable=True)
    log_path = Column(String, nullable=True)
    hdfs_output_path = Column(String, nullable=True)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    duration_seconds = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class TrainedModel(Base):
    """ML model metadata and evaluation results."""
    __tablename__ = "trained_models"

    id = Column(String, primary_key=True, default=generate_uuid)
    algorithm = Column(String, nullable=False)  # linear_regression, decision_tree, random_forest, gbt, kmeans
    model_name = Column(String, nullable=False)
    version = Column(Integer, default=1)
    dataset_id = Column(String, nullable=True)
    job_id = Column(String, nullable=True)
    target_variable = Column(String, nullable=True)
    feature_columns = Column(JSON, nullable=True)
    hyperparameters = Column(JSON, nullable=True)
    metrics = Column(JSON, nullable=True)  # {mae, rmse, r2, ...}
    training_samples = Column(Integer, nullable=True)
    test_samples = Column(Integer, nullable=True)
    split_strategy = Column(String, nullable=True)
    random_seed = Column(Integer, nullable=True)
    training_duration_seconds = Column(Float, nullable=True)
    hdfs_model_path = Column(String, nullable=True)
    hdfs_predictions_path = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class Prediction(Base):
    """Prediction request log."""
    __tablename__ = "predictions"

    id = Column(String, primary_key=True, default=generate_uuid)
    model_id = Column(String, nullable=False)
    input_data = Column(JSON, nullable=False)
    predicted_value = Column(Float, nullable=True)
    prediction_unit = Column(String, nullable=True)
    is_batch = Column(Boolean, default=False)
    batch_file_path = Column(String, nullable=True)
    result_file_path = Column(String, nullable=True)
    warnings = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class ClusterResult(Base):
    """K-Means clustering results."""
    __tablename__ = "cluster_results"

    id = Column(String, primary_key=True, default=generate_uuid)
    job_id = Column(String, nullable=True)
    model_id = Column(String, nullable=True)
    n_clusters = Column(Integer, nullable=False)
    features_used = Column(JSON, nullable=True)
    cluster_sizes = Column(JSON, nullable=True)
    cluster_summaries = Column(JSON, nullable=True)
    silhouette_score = Column(Float, nullable=True)
    hdfs_assignments_path = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


# Database engine setup
_engine = None
_SessionLocal = None


def init_db(database_url: str):
    """Initialize database engine and create tables."""
    global _engine, _SessionLocal
    _engine = create_engine(database_url, connect_args={"check_same_thread": False})
    _SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=_engine)
    Base.metadata.create_all(bind=_engine)
    return _engine


def get_db() -> Generator[Session, None, None]:
    """Get database session dependency."""
    if _SessionLocal is None:
        raise RuntimeError("Database not initialized. Call init_db() first.")
    db = _SessionLocal()
    try:
        yield db
    finally:
        db.close()
