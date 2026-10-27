"""
AgriScope - Pydantic Schemas for Spark/Pipeline Jobs
"""
from pydantic import BaseModel, ConfigDict
from typing import Optional, Any
from datetime import datetime


class JobBase(BaseModel):
    job_type: str
    job_name: str
    dataset_id: Optional[str] = None
    config: Optional[Any] = None


class JobCreate(JobBase):
    pass


class JobResponse(JobBase):
    id: str
    status: str
    result: Optional[Any] = None
    error_message: Optional[str] = None
    log_path: Optional[str] = None
    hdfs_output_path: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    duration_seconds: Optional[float] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class JobTriggerRequest(BaseModel):
    job_type: str
    dataset_id: Optional[str] = None
    parameters: Optional[dict[str, Any]] = None
