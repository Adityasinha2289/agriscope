"""
AgriScope - Model Repository
Database operations for trained models, clustering results, and predictions
"""
import datetime
from typing import Optional
from sqlalchemy.orm import Session
from ..models.database import TrainedModel, ClusterResult, Prediction


class ModelRepository:
    """Repository for TrainedModel and Prediction CRUD operations."""

    def __init__(self, db: Session):
        self.db = db

    def register_model(self, **kwargs) -> TrainedModel:
        model = TrainedModel(**kwargs)
        self.db.add(model)
        self.db.commit()
        self.db.refresh(model)
        return model

    def get_model_by_id(self, model_id: str) -> Optional[TrainedModel]:
        return self.db.query(TrainedModel).filter(TrainedModel.id == model_id).first()

    def get_model_by_algorithm(self, algorithm: str) -> Optional[TrainedModel]:
        return (
            self.db.query(TrainedModel)
            .filter(TrainedModel.algorithm == algorithm, TrainedModel.is_active == True)
            .order_by(TrainedModel.created_at.desc())
            .first()
        )

    def get_all_models(self) -> list[TrainedModel]:
        return self.db.query(TrainedModel).order_by(TrainedModel.created_at.desc()).all()

    def save_cluster_result(self, **kwargs) -> ClusterResult:
        result = ClusterResult(**kwargs)
        self.db.add(result)
        self.db.commit()
        self.db.refresh(result)
        return result

    def get_latest_cluster_result(self) -> Optional[ClusterResult]:
        return self.db.query(ClusterResult).order_by(ClusterResult.created_at.desc()).first()

    def log_prediction(self, **kwargs) -> Prediction:
        pred = Prediction(**kwargs)
        self.db.add(pred)
        self.db.commit()
        self.db.refresh(pred)
        return pred

    def get_prediction_history(self, limit: int = 50) -> list[Prediction]:
        return self.db.query(Prediction).order_by(Prediction.created_at.desc()).limit(limit).all()
