"""
==============================================================================
NEXGram — PySpark Job Execution & Orchestration Endpoints
Architecture & Implementation: Developed by Aditya Sinha
B.Tech CSET-371 Big Data Analytics & Business Intelligence
Trigger and monitor distributed PySpark pipeline jobs
==============================================================================
"""
import os
import uuid
import datetime
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from ...models.database import get_db, Job
from ...schemas.job import JobResponse, JobTriggerRequest
from ...services.spark_service import SparkJobRunner
from ...core.config import get_settings

router = APIRouter()
spark_runner = SparkJobRunner()


@router.get("/", response_model=list[JobResponse])
def list_jobs(limit: int = 50, db: Session = Depends(get_db)):
    """List recent pipeline jobs."""
    return db.query(Job).order_by(Job.created_at.desc()).limit(limit).all()


@router.get("/{job_id}", response_model=JobResponse)
def get_job(job_id: str, db: Session = Depends(get_db)):
    """Get status and details of a specific job."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@router.get("/{job_id}/logs")
def get_job_logs(job_id: str, db: Session = Depends(get_db)):
    """Get log file content for a job."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if not job.log_path:
        return {"job_id": job_id, "logs": "No log file specified for this job."}

    settings = get_settings()
    resolved_path = os.path.abspath(job.log_path)
    # Ensure log path is within logs_dir to prevent path traversal
    if not resolved_path.startswith(str(settings.logs_dir.resolve())):
        raise HTTPException(status_code=403, detail="Access denied: invalid log path")

    if not os.path.exists(resolved_path):
        return {"job_id": job_id, "logs": "Log file not found or awaiting job initialization."}

    try:
        with open(resolved_path, "r") as f:
            lines = f.readlines()
            # Return last 300 lines
            return {"job_id": job_id, "logs": "".join(lines[-300:])}
    except Exception as e:
        return {"job_id": job_id, "error": f"Error reading log file: {e}"}


@router.post("/trigger", response_model=JobResponse)
def trigger_job(
    req: JobTriggerRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """
    Trigger a PySpark job asynchronously.
    job_type can be: 'ingest', 'clean', 'feature_engineering', 'analytics', 'train', 'cluster'.
    """
    settings = get_settings()
    job_id = f"job-{req.job_type}-{str(uuid.uuid4())[:6]}"
    
    script_mapping = {
        "ingest": (
            str(settings.base_dir / "spark_jobs" / "ingest_data.py"),
            [f"{settings.hdfs_base_path}/raw/apy/crop-wise-area-production-yield.csv", f"{settings.hdfs_base_path}/staging/validated/apy_parquet"],
            "Ingestion to Parquet Staging"
        ),
        "clean": (
            str(settings.base_dir / "spark_jobs" / "clean_data.py"),
            [f"{settings.hdfs_base_path}/staging/validated/apy_parquet", f"{settings.hdfs_base_path}/processed/cleaned"],
            "Data Quality Cleaning Job"
        ),
        "feature_engineering": (
            str(settings.base_dir / "spark_jobs" / "build_features.py"),
            [f"{settings.hdfs_base_path}/processed/cleaned", f"{settings.hdfs_base_path}/processed/features"],
            "Feature Engineering Pipeline"
        ),
        "analytics": (
            str(settings.base_dir / "spark_jobs" / "exploratory_analysis.py"),
            [f"{settings.hdfs_base_path}/processed/cleaned", f"{settings.hdfs_base_path}/analytics"],
            "Exploratory Analytics Job"
        ),
        "train": (
            str(settings.base_dir / "spark_jobs" / "train_regression.py"),
            [f"{settings.hdfs_base_path}/processed/features", f"{settings.hdfs_base_path}/models", f"{settings.hdfs_base_path}/results"],
            "Train 4 MLlib Regression Models"
        ),
        "cluster": (
            str(settings.base_dir / "spark_jobs" / "train_kmeans.py"),
            [f"{settings.hdfs_base_path}/processed/features", f"{settings.hdfs_base_path}/models/kmeans", f"{settings.hdfs_base_path}/results/clusters", "5"],
            "K-Means Clustering Job"
        ),
    }

    if req.job_type not in script_mapping:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown job_type: {req.job_type}. Valid: {list(script_mapping.keys())}"
        )

    script_path, args, job_name = script_mapping[req.job_type]

    # Create job record in DB
    new_job = Job(
        id=job_id,
        job_type=req.job_type,
        job_name=job_name,
        status="running",
        dataset_id=req.dataset_id or "apy-primary",
        config={"args": args, "script": script_path},
        started_at=datetime.datetime.now(datetime.timezone.utc),
    )
    db.add(new_job)
    db.commit()
    db.refresh(new_job)

    # Launch in background
    def run_spark_task():
        runner = SparkJobRunner()
        runner.submit_job(
            script_path=script_path,
            args=args,
            job_name=f"agriscope-{req.job_type}",
        )

    background_tasks.add_task(run_spark_task)
    return new_job
