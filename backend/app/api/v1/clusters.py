"""
AgriScope - K-Means Clustering Endpoints
Exposes agricultural cluster profiles, feature centroids, and top crops
"""
import os
import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ...models.database import get_db, ClusterResult
from ...schemas.cluster import ClusteringResponse
from ...core.config import get_settings

router = APIRouter()


@router.get("/", response_model=ClusteringResponse)
def get_clustering_results(db: Session = Depends(get_db)):
    """Get the latest K-Means clustering analysis results and cluster profiles."""
    settings = get_settings()
    cluster_file = os.path.join(settings.base_dir, "backend", "app", "cached_data", "cluster_summary.json")

    if os.path.exists(cluster_file):
        try:
            with open(cluster_file, "r") as f:
                data = json.load(f)
                return ClusteringResponse(
                    id="cluster-kmeans-k5",
                    n_clusters=data.get("n_clusters", 5),
                    silhouette_score=data.get("silhouette_score"),
                    cluster_sizes=data.get("cluster_sizes", {}),
                    cluster_summaries=data.get("cluster_summaries", []),
                    features_used=data.get("features_used", []),
                    total_records=data.get("total_records", 443078),
                    training_duration_seconds=data.get("training_duration_seconds"),
                )
        except Exception as e:
            pass

    # Fallback to DB
    res = db.query(ClusterResult).order_by(ClusterResult.created_at.desc()).first()
    if not res:
        raise HTTPException(status_code=404, detail="No clustering results found")

    return ClusteringResponse(
        id=res.id,
        n_clusters=res.n_clusters,
        silhouette_score=res.silhouette_score,
        cluster_sizes=res.cluster_sizes or {},
        cluster_summaries=res.cluster_summaries or [],
        features_used=res.features_used or [],
        total_records=443078,
    )
