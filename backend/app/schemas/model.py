"""
AgriScope - Pydantic Schemas for ML Models and Evaluation
"""
from pydantic import BaseModel, ConfigDict
from typing import Optional, Any
from datetime import datetime


class ModelMetrics(BaseModel):
    mae: Optional[float] = None
    rmse: Optional[float] = None
    r2: Optional[float] = None
    training_duration_seconds: Optional[float] = None
    prediction_duration_seconds: Optional[float] = None
    training_samples: Optional[int] = None


class TrainedModelBase(BaseModel):
    algorithm: str
    model_name: str
    version: int = 1
    dataset_id: Optional[str] = None
    job_id: Optional[str] = None
    target_variable: Optional[str] = "yield"
    feature_columns: Optional[list[str]] = None
    hyperparameters: Optional[dict[str, Any]] = None
    metrics: Optional[dict[str, Any]] = None
    training_samples: Optional[int] = None
    test_samples: Optional[int] = None
    split_strategy: Optional[str] = "80/20 random"
    random_seed: Optional[int] = 42
    training_duration_seconds: Optional[float] = None
    hdfs_model_path: Optional[str] = None
    hdfs_predictions_path: Optional[str] = None
    is_active: bool = True


class TrainedModelCreate(TrainedModelBase):
    pass


class TrainedModelResponse(TrainedModelBase):
    id: str
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class ModelComparisonResponse(BaseModel):
    target: str = "yield (Tonnes/Hectare)"
    evaluation_dataset: str
    models: list[TrainedModelResponse]
    best_model_by_r2: Optional[str] = None
    best_model_by_rmse: Optional[str] = None
    best_model_by_mae: Optional[str] = None
