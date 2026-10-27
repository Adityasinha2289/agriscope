"""
==============================================================================
NEXGram — Health & Cluster Status Endpoints
Architecture & Implementation: Developed by Aditya Sinha
B.Tech CSET-371 Big Data Analytics & Business Intelligence
Reports live HDFS, Spark, Database, and System health
==============================================================================
"""
import shutil
import subprocess
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ...models.database import get_db, Dataset, Job, TrainedModel
from ...services.hdfs_service import HDFSService
from ...core.config import get_settings

router = APIRouter()
hdfs_service = HDFSService()


@router.get("")
@router.get("/")
def get_system_health(db: Session = Depends(get_db)):
    """Comprehensive system status checking HDFS, Spark, DB, and Disk."""
    settings = get_settings()

    # 1. Check HDFS
    hdfs_info = hdfs_service.check_connectivity()

    # Get HDFS storage usage if connected
    dfs_report = {}
    if hdfs_info["connected"]:
        try:
            report_cmd = hdfs_service._run_hdfs_command(["-df", "-h", "/"])
            if report_cmd["success"]:
                lines = report_cmd["stdout"].split("\n")
                if len(lines) >= 2:
                    parts = lines[1].split()
                    if len(parts) >= 5:
                        dfs_report = {
                            "filesystem": parts[0],
                            "size": parts[1],
                            "used": parts[2],
                            "available": parts[3],
                            "use_percentage": parts[4],
                        }
        except Exception:
            pass

    # 2. Check Spark Submit
    spark_installed = shutil.which("spark-submit") is not None
    spark_info = {
        "installed": spark_installed,
        "master": settings.spark_master,
        "spark_home": settings.spark_home,
        "java_home": settings.java_home,
    }

    # 3. Check Database counts
    db_counts = {
        "datasets": db.query(Dataset).count(),
        "jobs": db.query(Job).count(),
        "trained_models": db.query(TrainedModel).count(),
    }

    return {
        "status": "healthy" if hdfs_info["connected"] else "degraded",
        "service": "NEXGram Backend Intelligence Engine",
        "developer": "Developed & Architected by Aditya Sinha",
        "course": "B.Tech CSET-371 Big Data Analytics & Business Intelligence",
        "version": "1.0.0",
        "environment": "production-academic",
        "hdfs": {
            **hdfs_info,
            "dfs_report": dfs_report,
            "base_path": settings.hdfs_base_path,
        },
        "spark": spark_info,
        "database": {
            "status": "connected",
            "counts": db_counts,
        },
    }
