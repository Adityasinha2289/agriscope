"""
AgriScope - Dataset Repository
Database operations for dataset metadata
"""
import datetime
from sqlalchemy.orm import Session
from ..models.database import Dataset


class DatasetRepository:
    """Repository for Dataset CRUD operations."""

    def __init__(self, db: Session):
        self.db = db

    def create(self, **kwargs) -> Dataset:
        dataset = Dataset(**kwargs)
        self.db.add(dataset)
        self.db.commit()
        self.db.refresh(dataset)
        return dataset

    def get_by_id(self, dataset_id: str) -> Dataset | None:
        return self.db.query(Dataset).filter(Dataset.id == dataset_id).first()

    def get_all(self) -> list[Dataset]:
        return self.db.query(Dataset).order_by(Dataset.created_at.desc()).all()

    def update(self, dataset_id: str, **kwargs) -> Dataset | None:
        dataset = self.get_by_id(dataset_id)
        if dataset:
            for key, value in kwargs.items():
                if hasattr(dataset, key):
                    setattr(dataset, key, value)
            dataset.updated_at = datetime.datetime.utcnow()
            self.db.commit()
            self.db.refresh(dataset)
        return dataset

    def delete(self, dataset_id: str) -> bool:
        dataset = self.get_by_id(dataset_id)
        if dataset:
            self.db.delete(dataset)
            self.db.commit()
            return True
        return False
