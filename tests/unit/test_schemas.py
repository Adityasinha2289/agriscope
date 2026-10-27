"""
==============================================================================
NEXGram — Unit Tests for Pydantic v2 Schemas
Architecture & Test Suite: Developed by Aditya Sinha
B.Tech CSET-371 Big Data Analytics & Business Intelligence
==============================================================================
"""
import pytest
from backend.app.schemas.prediction import PredictionRequest, PredictionResponse
from backend.app.schemas.dataset import DatasetBase
from backend.app.schemas.model import TrainedModelBase


def test_prediction_request_valid():
    req = PredictionRequest(
        state_name="Punjab",
        crop_name="Wheat",
        season="Rabi",
        year=2024,
        area=150.0,
        algorithm="gradient_boosted_trees"
    )
    assert req.state_name == "Punjab"
    assert req.crop_name == "Wheat"
    assert req.area == 150.0
    assert req.algorithm == "gradient_boosted_trees"


def test_prediction_request_invalid_area():
    with pytest.raises(ValueError):
        PredictionRequest(
            state_name="Punjab",
            crop_name="Wheat",
            season="Rabi",
            year=2024,
            area=-5.0,  # Negative area should fail validation
        )


def test_dataset_schema():
    ds = DatasetBase(
        name="Test Crop Dataset",
        filename="test.csv",
        row_count=1000,
        column_count=10,
    )
    assert ds.name == "Test Crop Dataset"
    assert ds.row_count == 1000
    assert ds.validation_status == "pending"


def test_trained_model_schema():
    model = TrainedModelBase(
        algorithm="random_forest",
        model_name="Random Forest Regressor",
        metrics={"r2": 0.853, "mae": 1.17, "rmse": 5.37},
        training_samples=354504,
    )
    assert model.algorithm == "random_forest"
    assert model.metrics["r2"] == 0.853
    assert model.training_samples == 354504
