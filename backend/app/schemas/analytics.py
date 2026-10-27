"""
AgriScope - Pydantic Schemas for Analytics & Aggregates
"""
from pydantic import BaseModel
from typing import Optional, Any


class KPISummary(BaseModel):
    total_records: int
    unique_crops: int
    unique_states: int
    unique_districts: int
    year_range: str
    avg_yield: float
    max_yield: float
    total_area_cultivated_ha: float
    total_production_tonnes: float


class YieldTrendPoint(BaseModel):
    year: int
    year_label: str
    avg_yield: float
    total_production: float
    total_area: float
    crop_count: int


class StateRankingItem(BaseModel):
    state_name: str
    avg_yield: float
    total_production: float
    total_area: float
    top_crop: Optional[str] = None


class CropRankingItem(BaseModel):
    crop_name: str
    crop_type: Optional[str] = None
    avg_yield: float
    total_production: float
    total_area: float


class SeasonDistributionItem(BaseModel):
    season: str
    record_count: int
    percentage: float
    avg_yield: float
    total_production: float


class DashboardOverviewResponse(BaseModel):
    kpis: KPISummary
    yield_trends: list[YieldTrendPoint]
    top_states: list[StateRankingItem]
    top_crops: list[CropRankingItem]
    season_distribution: list[SeasonDistributionItem]
