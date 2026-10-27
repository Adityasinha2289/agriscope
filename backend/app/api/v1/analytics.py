"""
==============================================================================
NEXGram — Analytics & Agricultural Intelligence Endpoints
Architecture & Implementation: Developed by Aditya Sinha
B.Tech CSET-371 Big Data Analytics & Business Intelligence
Serves pre-computed PySpark aggregates, trends, rankings, and KPIs
==============================================================================
"""
import os
import json
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from ...models.database import get_db
from ...core.config import get_settings

router = APIRouter()


def _load_json_cached(filename: str):
    """Safely load cached JSON analytics file with path traversal protection."""
    settings = get_settings()
    safe_filename = os.path.basename(filename)
    path = os.path.join(settings.base_dir, "backend", "app", "cached_data", "json", safe_filename)
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


@router.get("/districts")
def get_districts(state: Optional[str] = Query(default=None)):
    """Returns district rankings, optionally filtered by state."""
    districts = _load_json_cached("district_rankings.json") or []
    if state:
        state_clean = state.strip().lower()
        districts = [
            d for d in districts
            if d.get("state_name", "").strip().lower() == state_clean
        ]
    return districts


@router.get("/crops")
def get_crop_rankings():
    """Returns crop rankings across all agricultural records."""
    return _load_json_cached("crop_rankings.json") or []


@router.get("/seasons")
def get_season_distribution():
    """Returns production and area distribution by agricultural season."""
    return _load_json_cached("season_distribution.json") or []


@router.get("/farmer-summary")
def get_farmer_summary(crop: str = Query(...), state: Optional[str] = Query(default=None)):
    """
    Provides plain-language farmer statistics, benchmark yields in both
    Metric Tonnes/Ha and Quintals/Acre, and regional comparisons.
    """
    crops_data = _load_json_cached("crop_rankings.json") or []
    states_data = _load_json_cached("state_rankings.json") or []
    districts_data = _load_json_cached("district_rankings.json") or []

    crop_clean = crop.strip().lower()
    selected_crop = next((c for c in crops_data if c.get("crop_name", "").strip().lower() == crop_clean), None)

    avg_yield_tha = selected_crop.get("avg_yield", 2.5) if selected_crop else 2.5
    # Conversion factor: 1 Tonne/Hectare ≈ 4.04686 Quintals/Acre
    avg_yield_qacre = round(avg_yield_tha * 4.04686, 2)

    top_districts = []
    if state:
        state_clean = state.strip().lower()
        top_districts = [
            d.get("district_name") for d in districts_data
            if d.get("state_name", "").strip().lower() == state_clean
        ][:5]

    return {
        "crop_name": selected_crop.get("crop_name", crop) if selected_crop else crop,
        "crop_type": selected_crop.get("crop_type", "Standard Field Crop") if selected_crop else "Standard Field Crop",
        "national_avg_yield_tonnes_per_ha": round(avg_yield_tha, 2),
        "national_avg_yield_quintals_per_acre": avg_yield_qacre,
        "total_cultivated_area_hectares": selected_crop.get("total_area", 0) if selected_crop else 0,
        "historical_coverage": f"{selected_crop.get('first_year', 1997)}-{selected_crop.get('last_year', 2022)}" if selected_crop else "1997-2022",
        "top_districts_in_state": top_districts,
        "plain_language_insight": (
            f"{selected_crop.get('crop_name', crop) if selected_crop else crop} yields average "
            f"approx. {avg_yield_qacre} quintals per acre ({round(avg_yield_tha, 2)} tonnes/ha) across historical data."
        ),
    }


@router.get("/metadata/options")
def get_form_options():
    """Returns list of distinct states, crops, seasons, and state-district mapping."""
    states_data = _load_json_cached("state_rankings.json") or []
    crops_data = _load_json_cached("crop_rankings.json") or []
    seasons_data = _load_json_cached("season_distribution.json") or []
    districts_data = _load_json_cached("district_rankings.json") or []

    states = [s.get("state_name") or s.get("State") for s in states_data if s.get("state_name") or s.get("State")]
    crops = [c.get("crop_name") or c.get("Crop") for c in crops_data if c.get("crop_name") or c.get("Crop")]
    seasons = [s.get("season") or s.get("Season") for s in seasons_data if s.get("season") or s.get("Season")]

    # Build state -> list of district names mapping
    state_districts = {}
    for d in districts_data:
        st = d.get("state_name")
        dist = d.get("district_name")
        if st and dist:
            if st not in state_districts:
                state_districts[st] = []
            if dist not in state_districts[st]:
                state_districts[st].append(dist)

    for st in state_districts:
        state_districts[st].sort()

    return {
        "states": sorted(states),
        "crops": sorted(crops),
        "seasons": sorted(seasons),
        "state_districts": state_districts,
        "algorithms": [
            {"id": "gradient_boosted_trees", "name": "Gradient-Boosted Trees (Champion, R²=0.855)"},
            {"id": "random_forest", "name": "Random Forest Regressor (R²=0.853)"},
            {"id": "decision_tree", "name": "Decision Tree Regressor (R²=0.851)"},
            {"id": "linear_regression", "name": "Linear Regression Baseline (R²=0.772)"},
        ],
    }
