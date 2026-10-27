"""
==============================================================================
NEXGram — Apache Spark & PySpark Distributed Job Runner
Architecture & Implementation: Developed by Aditya Sinha
B.Tech CSET-371 Big Data Analytics & Business Intelligence
Manages PySpark job submission, DAG tracking, and background process control
==============================================================================
"""
import subprocess
import os
import logging
import datetime
import threading
import json
from pathlib import Path
from typing import Optional, Callable
from ..core.config import get_settings

logger = logging.getLogger(__name__)


class SparkJobRunner:
    """Manages Spark job submission and tracking."""

    def __init__(self):
        self.settings = get_settings()
        self._running_jobs: dict[str, subprocess.Popen] = {}

    def _get_spark_submit(self) -> str:
        """Get spark-submit command path."""
        spark_home = self.settings.spark_home
        if spark_home:
            path = os.path.join(spark_home, "bin", "spark-submit")
            if os.path.exists(path):
                return path
        return "spark-submit"

    def _build_env(self) -> dict:
        """Build environment variables for Spark jobs."""
        env = os.environ.copy()
        env["JAVA_HOME"] = self.settings.java_home
        env["HADOOP_HOME"] = self.settings.hadoop_home
        if self.settings.spark_home:
            env["SPARK_HOME"] = self.settings.spark_home
        env["PYSPARK_PYTHON"] = "python3"
        # Add Hadoop configs to classpath
        hadoop_conf = os.path.join(self.settings.hadoop_home, "etc", "hadoop")
        if os.path.exists(hadoop_conf):
            env["HADOOP_CONF_DIR"] = hadoop_conf
        return env

    def submit_job(
        self,
        script_path: str,
        args: Optional[list[str]] = None,
        job_name: str = "agriscope-job",
        log_path: Optional[str] = None,
        on_complete: Optional[Callable] = None,
        conf: Optional[dict[str, str]] = None,
    ) -> dict:
        """
        Submit a PySpark job via spark-submit.
        Runs in background thread, returns job info immediately.
        """
        if not os.path.exists(script_path):
            return {"success": False, "error": f"Script not found: {script_path}"}

        cmd = [
            self._get_spark_submit(),
            "--master", self.settings.spark_master,
            "--name", job_name,
            "--conf", "spark.driver.memory=2g",
            "--conf", "spark.sql.adaptive.enabled=true",
            "--conf", f"spark.hadoop.fs.defaultFS={self.settings.hdfs_uri}",
        ]

        # Add extra conf
        if conf:
            for key, value in conf.items():
                cmd.extend(["--conf", f"{key}={value}"])

        cmd.append(script_path)

        # Add script arguments
        if args:
            cmd.extend(args)

        # Set up log file
        if not log_path:
            log_dir = self.settings.logs_dir
            timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            log_path = str(log_dir / f"{job_name}_{timestamp}.log")

        logger.info(f"Submitting Spark job: {job_name}")
        logger.info(f"Command: {' '.join(cmd)}")

        job_id = f"{job_name}_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}"

        def _run_job():
            try:
                with open(log_path, "w") as log_file:
                    process = subprocess.Popen(
                        cmd,
                        stdout=log_file,
                        stderr=subprocess.STDOUT,
                        env=self._build_env(),
                    )
                    self._running_jobs[job_id] = process
                    exit_code = process.wait()

                if on_complete:
                    on_complete(job_id, exit_code, log_path)

            except Exception as e:
                logger.error(f"Spark job {job_id} failed: {e}")
                if on_complete:
                    on_complete(job_id, -1, log_path)
            finally:
                self._running_jobs.pop(job_id, None)

        thread = threading.Thread(target=_run_job, daemon=True)
        thread.start()

        return {
            "success": True,
            "job_id": job_id,
            "log_path": log_path,
            "command": " ".join(cmd),
        }

    def submit_job_sync(
        self,
        script_path: str,
        args: Optional[list[str]] = None,
        job_name: str = "agriscope-job",
        timeout: int = 600,
        conf: Optional[dict[str, str]] = None,
    ) -> dict:
        """Submit a Spark job synchronously and wait for completion."""
        if not os.path.exists(script_path):
            return {"success": False, "error": f"Script not found: {script_path}"}

        cmd = [
            self._get_spark_submit(),
            "--master", self.settings.spark_master,
            "--name", job_name,
            "--conf", "spark.driver.memory=2g",
            "--conf", "spark.sql.adaptive.enabled=true",
            "--conf", f"spark.hadoop.fs.defaultFS={self.settings.hdfs_uri}",
        ]

        if conf:
            for key, value in conf.items():
                cmd.extend(["--conf", f"{key}={value}"])

        cmd.append(script_path)

        if args:
            cmd.extend(args)

        log_dir = self.settings.logs_dir
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        log_path = str(log_dir / f"{job_name}_{timestamp}.log")

        start_time = datetime.datetime.now()

        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=timeout,
                env=self._build_env(),
            )

            duration = (datetime.datetime.now() - start_time).total_seconds()

            # Write log
            with open(log_path, "w") as f:
                f.write(f"=== STDOUT ===\n{result.stdout}\n")
                f.write(f"=== STDERR ===\n{result.stderr}\n")
                f.write(f"=== EXIT CODE: {result.returncode} ===\n")

            return {
                "success": result.returncode == 0,
                "exit_code": result.returncode,
                "stdout": result.stdout,
                "stderr": result.stderr,
                "log_path": log_path,
                "duration_seconds": duration,
            }

        except subprocess.TimeoutExpired:
            return {"success": False, "error": f"Job timed out after {timeout}s", "log_path": log_path}
        except Exception as e:
            return {"success": False, "error": str(e), "log_path": log_path}

    def is_job_running(self, job_id: str) -> bool:
        """Check if a job is still running."""
        proc = self._running_jobs.get(job_id)
        if proc:
            return proc.poll() is None
        return False

    def cancel_job(self, job_id: str) -> bool:
        """Cancel a running job."""
        proc = self._running_jobs.get(job_id)
        if proc and proc.poll() is None:
            proc.terminate()
            return True
        return False

    def get_running_jobs(self) -> list[str]:
        """Get list of currently running job IDs."""
        return [jid for jid, proc in self._running_jobs.items() if proc.poll() is None]
