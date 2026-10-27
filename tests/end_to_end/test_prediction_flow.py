"""
==============================================================================
NEXGram — End-to-End Prediction and Analytics Workflow Test
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


def test_full_user_intelligence_workflow(client):
    """
    Simulates a full user interaction:
    1. Check system health
    2. Inspect dataset
    3. Review model leaderboard
    4. Fetch form options
    5. Run multiple predictions
    6. Run batch comparison
    7. Inspect prediction audit log
    """
    # 1. Health
    h_res = client.get("/api/v1/health/")
    assert h_res.status_code == 200

    # 2. Dataset
    d_res = client.get("/api/v1/datasets/")
    assert d_res.status_code == 200
    dataset_id = d_res.json()[0]["id"]

    # 3. Model comparison
    m_res = client.get("/api/v1/models/comparison")
    assert m_res.status_code == 200
    assert m_res.json()["best_model_by_r2"] == "Gradient-Boosted Trees"

    # 4. Form options
    opt_res = client.get("/api/v1/analytics/metadata/options")
    assert opt_res.status_code == 200
    opts = opt_res.json()
    assert "Wheat" in opts["crops"]
    assert "Punjab" in opts["states"]

    # 5. Single Prediction
    p_res = client.post("/api/v1/predictions/", json={
        "state_name": "Punjab",
        "crop_name": "Wheat",
        "season": "Rabi",
        "year": 2024,
        "area": 100.0,
        "algorithm": "gradient_boosted_trees"
    })
    assert p_res.status_code == 200
    pred = p_res.json()
    assert pred["predicted_yield"] > 0
    assert pred["estimated_production"] == round(pred["predicted_yield"] * 100.0, 2)

    # 6. Batch Prediction
    batch_payload = {
        "items": [
            {"state_name": "Punjab", "crop_name": "Wheat", "season": "Rabi", "year": 2024, "area": 100.0},
            {"state_name": "Tamil Nadu", "crop_name": "Rice", "season": "Kharif", "year": 2024, "area": 80.0},
            {"state_name": "Uttar Pradesh", "crop_name": "Sugarcane", "season": "Whole Year", "year": 2024, "area": 50.0},
        ],
        "algorithm": "gradient_boosted_trees"
    }
    b_res = client.post("/api/v1/predictions/batch", json=batch_payload)
    assert b_res.status_code == 200
    b_data = b_res.json()
    assert b_data["total_records"] == 3
    assert b_data["summary_stats"]["total_estimated_production_tonnes"] > 0

    # 7. Check Prediction History
    hist_res = client.get("/api/v1/predictions/history")
    assert hist_res.status_code == 200
    history = hist_res.json()
    assert len(history) >= 1
