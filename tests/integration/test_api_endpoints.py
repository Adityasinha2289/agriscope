"""
==============================================================================
NEXGram — Integration Tests for FastAPI Endpoints
Architecture & Test Suite: Developed by Aditya Sinha
B.Tech CSET-371 Big Data Analytics & Business Intelligence
==============================================================================
"""
import pytest
from starlette.testclient import TestClient
from backend.app.main import app


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as test_client:
        yield test_client


def test_root_endpoint(client):
    res = client.get("/api/status")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "online"
    assert "NEXGram" in data["platform"]
    assert "Aditya Sinha" in data["developer"]
    assert res.headers["X-Developer"] == "Aditya Sinha"

    # Also verify / returns 200 (serves static UI)
    html_res = client.get("/")
    assert html_res.status_code == 200


def test_health_endpoint(client):
    res = client.get("/api/v1/health/")
    assert res.status_code == 200
    data = res.json()
    assert "hdfs" in data
    assert "spark" in data
    assert "database" in data


def test_datasets_list(client):
    res = client.get("/api/v1/datasets/")
    assert res.status_code == 200
    datasets = res.json()
    assert len(datasets) >= 1
    assert datasets[0]["filename"] == "crop-wise-area-production-yield.csv"


def test_models_comparison(client):
    res = client.get("/api/v1/models/comparison")
    assert res.status_code == 200
    data = res.json()
    assert len(data["models"]) >= 4
    assert data["best_model_by_r2"] is not None


def test_analytics_overview(client):
    res = client.get("/api/v1/analytics/overview")
    assert res.status_code == 200
    data = res.json()
    assert "kpis" in data
    assert "yield_trends" in data
    assert "top_states" in data
    assert "season_distribution" in data


def test_clusters_endpoint(client):
    res = client.get("/api/v1/clusters/")
    assert res.status_code == 200
    data = res.json()
    assert data["n_clusters"] == 5
    assert data["silhouette_score"] is not None
    assert len(data["cluster_summaries"]) == 5


def test_prediction_endpoint(client):
    payload = {
        "state_name": "Punjab",
        "district_name": "Ludhiana",
        "crop_name": "Wheat",
        "season": "Rabi",
        "year": 2024,
        "area": 50.0,
        "algorithm": "gradient_boosted_trees"
    }
    res = client.post("/api/v1/predictions/", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["predicted_yield"] > 0
    assert data["estimated_production"] > 0
    assert "confidence_interval" in data
    assert "feature_contributions" in data
    assert "farmer_conversion" in data
    assert data["farmer_conversion"]["yield_quintals_per_acre"] > 0
    assert data["farmer_conversion"]["area_acres"] > 0


def test_districts_endpoint(client):
    # Test all districts
    res = client.get("/api/v1/analytics/districts")
    assert res.status_code == 200
    all_districts = res.json()
    assert len(all_districts) > 50

    # Test state filtered districts
    res_pb = client.get("/api/v1/analytics/districts?state=Punjab")
    assert res_pb.status_code == 200
    pb_districts = res_pb.json()
    assert len(pb_districts) > 0
    assert all(d["state_name"].lower() == "punjab" for d in pb_districts)


def test_farmer_summary_endpoint(client):
    res = client.get("/api/v1/analytics/farmer-summary?crop=Wheat&state=Punjab")
    assert res.status_code == 200
    data = res.json()
    assert data["crop_name"].lower() == "wheat"
    assert data["national_avg_yield_quintals_per_acre"] > 0
    assert len(data["top_districts_in_state"]) > 0
    assert "plain_language_insight" in data

