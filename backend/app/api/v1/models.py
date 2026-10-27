"""
==============================================================================
NEXGram — MLlib Model Management & Academic Evaluation Leaderboard
Architecture & Implementation: Developed by Aditya Sinha
B.Tech CSET-371 Big Data Analytics & Business Intelligence
Leaderboard and metrics for trained PySpark ML models
==============================================================================
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ...models.database import get_db, TrainedModel
from ...schemas.model import TrainedModelResponse, ModelComparisonResponse

router = APIRouter()


@router.get("/", response_model=list[TrainedModelResponse])
def list_models(db: Session = Depends(get_db)):
    """List all registered ML models."""
    return db.query(TrainedModel).order_by(TrainedModel.created_at.desc()).all()


@router.get("/comparison", response_model=ModelComparisonResponse)
def compare_models(db: Session = Depends(get_db)):
    """
    Return side-by-side comparison table of all regression models
    with academic evaluation metrics: MAE, RMSE, and R².
    """
    models = (
        db.query(TrainedModel)
        .filter(TrainedModel.algorithm.in_([
            "linear_regression", "decision_tree", "random_forest", "gradient_boosted_trees"
        ]))
        .all()
    )

    if not models:
        raise HTTPException(status_code=404, detail="No trained regression models found")

    best_r2_model = None
    best_rmse_model = None
    best_mae_model = None

    max_r2 = -float("inf")
    min_rmse = float("inf")
    min_mae = float("inf")

    for m in models:
        metrics = m.metrics or {}
        r2 = metrics.get("r2")
        rmse = metrics.get("rmse")
        mae = metrics.get("mae")

        if r2 is not None and r2 > max_r2:
            max_r2 = r2
            best_r2_model = m.model_name
        if rmse is not None and rmse < min_rmse:
            min_rmse = rmse
            best_rmse_model = m.model_name
        if mae is not None and mae < min_mae:
            min_mae = mae
            best_mae_model = m.model_name

    return ModelComparisonResponse(
        target="yield (Tonnes/Hectare)",
        evaluation_dataset="Holdout Test Set (20% random split, seed=42, N=88,574)",
        models=[TrainedModelResponse.model_validate(m) for m in models],
        best_model_by_r2=best_r2_model,
        best_model_by_rmse=best_rmse_model,
        best_model_by_mae=best_mae_model,
    )


@router.get("/{model_id}", response_model=TrainedModelResponse)
def get_model(model_id: str, db: Session = Depends(get_db)):
    """Get details for a specific model."""
    model = db.query(TrainedModel).filter(TrainedModel.id == model_id).first()
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    return model
