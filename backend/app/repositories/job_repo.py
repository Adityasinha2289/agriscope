"""
AgriScope - Job Repository
Database operations for Spark/pipeline jobs
"""
import datetime
from typing import Optional
from sqlalchemy.orm import Session
from ..models.database import Job


class JobRepository:
    """Repository for Job CRUD operations."""

    def __init__(self, db: Session):
        self.db = db

    def create(self, **kwargs) -> Job:
        job = Job(**kwargs)
        self.db.add(job)
        self.db.commit()
        self.db.refresh(job)
        return job

    def get_by_id(self, job_id: str) -> Optional[Job]:
        return self.db.query(Job).filter(Job.id == job_id).first()

    def get_all(self, limit: int = 50) -> list[Job]:
        return self.db.query(Job).order_by(Job.created_at.desc()).limit(limit).all()

    def update_status(
        self,
        job_id: str,
        status: str,
        result: Optional[dict] = None,
        error_message: Optional[str] = None,
        duration_seconds: Optional[float] = None,
    ) -> Optional[Job]:
        job = self.get_by_id(job_id)
        if job:
            job.status = status
            if result is not None:
                job.result = result
            if error_message is not None:
                job.error_message = error_message
            if duration_seconds is not None:
                job.duration_seconds = duration_seconds
            if status in ("completed", "failed", "cancelled"):
                job.completed_at = datetime.datetime.utcnow()
            elif status == "running" and not job.started_at:
                job.started_at = datetime.datetime.utcnow()
            self.db.commit()
            self.db.refresh(job)
        return job
