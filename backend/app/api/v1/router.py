"""
AgriScope - API v1 Router Aggregator
"""
from fastapi import APIRouter
from .health import router as health_router
from .datasets import router as datasets_router
from .jobs import router as jobs_router
from .models import router as models_router
from .predictions import router as predictions_router
from .analytics import router as analytics_router
from .clusters import router as clusters_router

api_router = APIRouter(prefix="/v1")

api_router.include_router(health_router, prefix="/health", tags=["System Health"])
api_router.include_router(datasets_router, prefix="/datasets", tags=["Datasets"])
api_router.include_router(jobs_router, prefix="/jobs", tags=["Spark Jobs"])
api_router.include_router(models_router, prefix="/models", tags=["ML Models"])
api_router.include_router(predictions_router, prefix="/predictions", tags=["Predictions"])
api_router.include_router(analytics_router, prefix="/analytics", tags=["Analytics & BI"])
api_router.include_router(clusters_router, prefix="/clusters", tags=["Clustering"])
