"""
AgriScope - Analytics & Business Intelligence Endpoints
Serves pre-computed PySpark aggregates, trends, rankings, and KPIs
"""
import os
import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ...models.database import get_db
from ...core.config import get_settings

router = APIRouter()


def _load_json_cached(filename: str):
    settings = get_settings()
    path = os.path.join(settings.base_dir, "backend", "app", "cached_data", "json", filename)
    if os.path.exists(path):
        with open(path, "r") as f:
            return json.load(f)
    return []


@router.get("/overview")
def get_dashboard_overview():
    """
    Returns full high-level dashboard data:
    - KPIs
    - 25-Year Yield Trends (1997-2022)
    - Top 10 States by Production
    - Top 10 Crops by Yield
    - Seasonal Distribution
    """
    kpis = _load_json_cached("kpis.json") or {}
    yield_trends = _load_json_cached("yield_trends.json") or []
    state_rankings = _load_json_cached("state_rankings.json") or []
    crop_rankings = _load_json_cached("crop_rankings.json") or []
    season_distribution = _load_json_cached("season_distribution.json") or []
    crop_types = _load_json_cached("crop_type_distribution.json") or []

    # Sort and clean
    sorted_trends = sorted(yield_trends, key=lambda x: x.get("start_year", 0))

    return {
        "kpis": kpis,
        "yield_trends": sorted_trends,
        "top_states": state_rankings[:15],
        "top_crops": crop_rankings[:15],
        "season_distribution": season_distribution,
        "crop_types": crop_types,
    }


@router.get("/trends")
def get_yield_trends():
    """Returns 25-year agricultural trends across India."""
    trends = _load_json_cached("yield_trends.json") or []
    return sorted(trends, key=lambda x: x.get("start_year", 0))


@router.get("/states")
def get_state_rankings():
    """Returns state rankings by average yield, total area, and production."""
    return _load_json_cached("state_rankings.json") or []


@router.get("/crops")
def get_crop_rankings():
    """Returns crop rankings across all agricultural records."""
    return _load_json_cached("crop_rankings.json") or []


@router.get("/seasons")
def get_season_distribution():
    """Returns production and area distribution by agricultural season."""
    return _load_json_cached("season_distribution.json") or []


@router.get("/metadata/options")
def get_form_options():
    """Returns list of distinct states, crops, and seasons for the prediction form."""
    states_data = _load_json_cached("state_rankings.json") or []
    crops_data = _load_json_cached("crop_rankings.json") or []
    seasons_data = _load_json_cached("season_distribution.json") or []

    states = [s.get("state_name") or s.get("State") for s in states_data if s.get("state_name") or s.get("State")]
    crops = [c.get("crop_name") or c.get("Crop") for c in crops_data if c.get("crop_name") or c.get("Crop")]
    seasons = [s.get("season") or s.get("Season") for s in seasons_data if s.get("season") or s.get("Season")]

    return {
        "states": sorted(states),
        "crops": sorted(crops),
        "seasons": sorted(seasons),
        "algorithms": [
            {"id": "gradient_boosted_trees", "name": "Gradient-Boosted Trees (Best R²=0.855)"},
            {"id": "random_forest", "name": "Random Forest Regressor (R²=0.853)"},
            {"id": "decision_tree", "name": "Decision Tree Regressor (R²=0.851)"},
            {"id": "linear_regression", "name": "Linear Regression (R²=0.772)"},
        ],
    }
