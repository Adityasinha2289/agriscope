"""
AgriScope - Backend Application Configuration
Centralized settings management using pydantic-settings
"""
import os
from pathlib import Path
from pydantic_settings import BaseSettings
from pydantic import Field
from functools import lru_cache


class Settings(BaseSettings):
    """Application configuration loaded from environment variables."""

    # Application
    app_name: str = "AgriScope"
    app_env: str = "development"
    app_debug: bool = True
    app_port: int = 8000
    frontend_port: int = 5173

    # Hadoop / HDFS
    hadoop_home: str = Field(default="/opt/homebrew/opt/hadoop/libexec")
    hdfs_uri: str = Field(default="hdfs://localhost:9000")
    hdfs_base_path: str = Field(default="/agriscope")

    # Spark
    spark_home: str = Field(default="")
    spark_master: str = Field(default="local[*]")

    # Java
    java_home: str = Field(default="/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home")

    # Database
    database_url: str = Field(default="sqlite:///./agriscope.db")

    # CORS
    cors_origins: str = Field(default="http://localhost:5173")

    # Upload
    max_upload_size_mb: int = 500
    allowed_upload_extensions: str = ".csv,.tsv,.json"

    # Logging
    log_level: str = "INFO"
    log_dir: str = "./logs"

    # Paths
    base_dir: Path = Field(default_factory=lambda: Path(__file__).resolve().parent.parent.parent.parent)

    @property
    def data_dir(self) -> Path:
        return self.base_dir / "data"

    @property
    def spark_jobs_dir(self) -> Path:
        return self.base_dir / "spark_jobs"

    @property
    def logs_dir(self) -> Path:
        path = Path(self.log_dir) if Path(self.log_dir).is_absolute() else self.base_dir / self.log_dir
        path.mkdir(parents=True, exist_ok=True)
        return path

    @property
    def db_path(self) -> Path:
        url = self.database_url.replace("sqlite:///", "")
        return Path(url) if Path(url).is_absolute() else self.base_dir / url

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",")]

    @property
    def allowed_extensions(self) -> list[str]:
        return [e.strip() for e in self.allowed_upload_extensions.split(",")]

    @property
    def hdfs_agriscope_paths(self) -> dict[str, str]:
        base = self.hdfs_base_path
        return {
            "raw_apy": f"{base}/raw/apy",
            "raw_weather": f"{base}/raw/weather",
            "raw_soil": f"{base}/raw/soil",
            "staging_validated": f"{base}/staging/validated",
            "processed_cleaned": f"{base}/processed/cleaned",
            "processed_features": f"{base}/processed/features",
            "analytics_aggregates": f"{base}/analytics/aggregates",
            "analytics_trends": f"{base}/analytics/trends",
            "models_linear_regression": f"{base}/models/linear_regression",
            "models_decision_tree": f"{base}/models/decision_tree",
            "models_random_forest": f"{base}/models/random_forest",
            "models_gradient_boosted_trees": f"{base}/models/gradient_boosted_trees",
            "models_kmeans": f"{base}/models/kmeans",
            "results_predictions": f"{base}/results/predictions",
            "results_evaluations": f"{base}/results/evaluations",
            "results_clusters": f"{base}/results/clusters",
            "metadata": f"{base}/metadata",
        }

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
