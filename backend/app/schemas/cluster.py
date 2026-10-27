"""
AgriScope - Pydantic Schemas for K-Means Clustering Results
"""
from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime


class ClusterSummary(BaseModel):
    cluster_id: int
    size: int
    label: str
    feature_stats: dict[str, Any]
    top_crops: list[str]
    top_states: list[str]


class ClusteringResponse(BaseModel):
    id: Optional[str] = None
    n_clusters: int
    silhouette_score: Optional[float] = None
    cluster_sizes: dict[str, int]
    cluster_summaries: list[ClusterSummary]
    features_used: list[str]
    total_records: int
    training_duration_seconds: Optional[float] = None
    created_at: Optional[datetime] = None
