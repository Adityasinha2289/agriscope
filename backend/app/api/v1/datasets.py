"""
AgriScope - Dataset Endpoints
Inspection, schema, profile, and preview for registered datasets
"""
import os
import pandas as pd
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ...models.database import get_db, Dataset
from ...schemas.dataset import DatasetResponse
from ...services.hdfs_service import HDFSService
from ...core.config import get_settings

router = APIRouter()
hdfs_service = HDFSService()


@router.get("/", response_model=list[DatasetResponse])
def list_datasets(db: Session = Depends(get_db)):
    """List all registered datasets."""
    return db.query(Dataset).order_by(Dataset.created_at.desc()).all()


@router.get("/{dataset_id}", response_model=DatasetResponse)
def get_dataset(dataset_id: str, db: Session = Depends(get_db)):
    """Get metadata for a specific dataset."""
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return dataset


@router.get("/{dataset_id}/preview")
def preview_dataset(
    dataset_id: str,
    limit: int = Query(default=20, ge=1, le=100),
    view_type: str = Query(default="cleaned", regex="^(raw|cleaned)$"),
    db: Session = Depends(get_db),
):
    """
    Return a sample preview of rows for the dataset.
    view_type can be 'raw' or 'cleaned'.
    """
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")

    settings = get_settings()

    if view_type == "raw" and dataset.local_path and os.path.exists(dataset.local_path):
        try:
            df = pd.read_csv(dataset.local_path, nrows=limit)
            return {
                "dataset_id": dataset_id,
                "view_type": "raw",
                "total_rows_sampled": len(df),
                "columns": list(df.columns),
                "data": df.fillna("").to_dict(orient="records"),
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error reading raw dataset: {e}")

    # Fallback to local cleaned parquet sample if exists or read raw
    local_csv = str(settings.data_dir / dataset.filename)
    if os.path.exists(local_csv):
        df = pd.read_csv(local_csv, nrows=limit)
        return {
            "dataset_id": dataset_id,
            "view_type": view_type,
            "total_rows_sampled": len(df),
            "columns": list(df.columns),
            "data": df.fillna("").to_dict(orient="records"),
        }

    raise HTTPException(status_code=404, detail="Dataset data file not found locally")


@router.get("/{dataset_id}/profile")
def get_dataset_profile(dataset_id: str, db: Session = Depends(get_db)):
    """Get data profiling report (missing values, types, cardinalities)."""
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return {
        "dataset_id": dataset_id,
        "name": dataset.name,
        "profile": dataset.profile_summary or {},
        "schema": dataset.schema_info or {},
    }
