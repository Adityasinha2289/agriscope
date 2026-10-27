"""
AgriScope - Pydantic Schemas for Predictions
"""
from pydantic import BaseModel, Field
from typing import Optional, Any
from datetime import datetime


class PredictionRequest(BaseModel):
    state_name: str
    district_name: Optional[str] = None
    crop_name: str
    season: str
    year: int = Field(default=2024, ge=1990, le=2030)
    area: float = Field(..., gt=0, description="Area in hectares")
    crop_type: Optional[str] = None
    algorithm: Optional[str] = "gradient_boosted_trees"


class PredictionResponse(BaseModel):
    id: str
    model_id: str
    algorithm: str
    input_data: dict[str, Any]
    predicted_yield: float
    yield_unit: str = "Tonnes/Hectare"
    estimated_production: float
    production_unit: str = "Tonnes"
    confidence_interval: Optional[dict[str, float]] = None
    feature_contributions: Optional[dict[str, float]] = None
    historical_benchmark: Optional[dict[str, Any]] = None
    farmer_conversion: Optional[dict[str, Any]] = None
    created_at: Optional[datetime] = None


class BatchPredictionRequest(BaseModel):
    items: list[PredictionRequest]
    algorithm: Optional[str] = "gradient_boosted_trees"


class BatchPredictionResponse(BaseModel):
    total_records: int
    predictions: list[PredictionResponse]
    summary_stats: dict[str, Any]
