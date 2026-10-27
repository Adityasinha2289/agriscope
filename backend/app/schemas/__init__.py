"""
AgriScope - Pydantic Schemas
"""
from .dataset import DatasetBase, DatasetCreate, DatasetResponse
from .job import JobBase, JobCreate, JobResponse, JobTriggerRequest
from .model import ModelMetrics, TrainedModelBase, TrainedModelCreate, TrainedModelResponse, ModelComparisonResponse
from .prediction import PredictionRequest, PredictionResponse, BatchPredictionRequest, BatchPredictionResponse
from .analytics import KPISummary, YieldTrendPoint, StateRankingItem, CropRankingItem, SeasonDistributionItem, DashboardOverviewResponse
from .cluster import ClusterSummary, ClusteringResponse

__all__ = [
    "DatasetBase", "DatasetCreate", "DatasetResponse",
    "JobBase", "JobCreate", "JobResponse", "JobTriggerRequest",
    "ModelMetrics", "TrainedModelBase", "TrainedModelCreate", "TrainedModelResponse", "ModelComparisonResponse",
    "PredictionRequest", "PredictionResponse", "BatchPredictionRequest", "BatchPredictionResponse",
    "KPISummary", "YieldTrendPoint", "StateRankingItem", "CropRankingItem", "SeasonDistributionItem", "DashboardOverviewResponse",
    "ClusterSummary", "ClusteringResponse",
]
