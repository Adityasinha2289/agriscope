"""
AgriScope - Enterprise Big Data Crop Yield Intelligence Platform
FastAPI Application Entry Point
"""
import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .core.config import get_settings
from .models.database import init_db, get_db
from .core.seed import seed_database
from .api.v1.router import api_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("agriscope")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: initialize database and seed on startup."""
    settings = get_settings()
    logger.info("Initializing AgriScope Intelligence Engine...")
    
    # Init SQLite DB and create tables
    init_db(settings.database_url)
    logger.info(f"Database initialized: {settings.database_url}")

    # Seed initial datasets, models, clusters, and past job logs
    db_gen = get_db()
    db = next(db_gen)
    try:
        seed_database(db)
        logger.info("Initial data seeded successfully.")
    except Exception as e:
        logger.error(f"Error seeding database: {e}")
    finally:
        db.close()

    yield
    logger.info("AgriScope Backend shutting down.")


app = FastAPI(
    title="AgriScope — Crop Yield Intelligence & Agricultural Analytics",
    description="Big Data analytics and machine learning platform powered by Apache Hadoop HDFS and Apache Spark (PySpark).",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Router
app.include_router(api_router, prefix="/api")


@app.get("/api/status")
def api_status():
    return {
        "platform": "AgriScope — Crop Yield Intelligence & Big Data Analytics",
        "version": "1.0.0",
        "status": "online",
        "docs_url": "/docs",
        "api_v1": "/api/v1",
        "stack": {
            "storage": "Apache Hadoop HDFS (hdfs://localhost:9000)",
            "processing": "Apache Spark (PySpark 4.0.0, MLlib)",
            "api": "FastAPI + Uvicorn + SQLite",
            "frontend": "Modern Glassmorphism UI",
        },
    }


# Mount static build if present
dist_dir = os.path.join(get_settings().base_dir, "frontend", "dist")
if os.path.exists(dist_dir):
    app.mount("/", StaticFiles(directory=dist_dir, html=True), name="static-frontend")
else:
    @app.get("/")
    def root():
        return api_status()
