"""
AgriScope - Pydantic Schemas for Dataset Metadata
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Any
from datetime import datetime


class DatasetBase(BaseModel):
    name: str
    filename: str
    source_url: Optional[str] = None
    description: Optional[str] = None
    file_size_bytes: Optional[int] = None
    row_count: Optional[int] = None
    column_count: Optional[int] = None
    checksum_sha256: Optional[str] = None
    hdfs_raw_path: Optional[str] = None
    hdfs_cleaned_path: Optional[str] = None
    local_path: Optional[str] = None
    schema_info: Optional[Any] = None
    profile_summary: Optional[Any] = None
    validation_status: str = "pending"
    retrieval_date: Optional[str] = None
    licence: Optional[str] = None


class DatasetCreate(DatasetBase):
    pass


class DatasetResponse(DatasetBase):
    id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
