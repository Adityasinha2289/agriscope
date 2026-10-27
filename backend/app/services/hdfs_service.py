"""
AgriScope - HDFS Service
Manages all interactions with Hadoop HDFS
"""
import subprocess
import os
import logging
from pathlib import Path
from typing import Optional
from ..core.config import get_settings

logger = logging.getLogger(__name__)


class HDFSService:
    """Service layer for Hadoop HDFS operations."""

    def __init__(self):
        self.settings = get_settings()
        self.hdfs_uri = self.settings.hdfs_uri
        self.base_path = self.settings.hdfs_base_path
        self.hadoop_home = self.settings.hadoop_home

    def _get_hdfs_cmd(self) -> str:
        """Get the hdfs command path."""
        hdfs_bin = os.path.join(self.hadoop_home, "..", "bin", "hdfs")
        if os.path.exists(hdfs_bin):
            return hdfs_bin
        # Try system PATH
        return "hdfs"

    def _run_hdfs_command(self, args: list[str], timeout: int = 30) -> dict:
        """Execute an HDFS command safely and return result."""
        cmd = [self._get_hdfs_cmd(), "dfs"] + args
        env = os.environ.copy()
        env["HADOOP_HOME"] = self.hadoop_home
        env["JAVA_HOME"] = self.settings.java_home

        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=timeout,
                env=env,
            )
            return {
                "success": result.returncode == 0,
                "stdout": result.stdout.strip(),
                "stderr": result.stderr.strip(),
                "returncode": result.returncode,
            }
        except subprocess.TimeoutExpired:
            return {"success": False, "stdout": "", "stderr": "Command timed out", "returncode": -1}
        except FileNotFoundError:
            return {"success": False, "stdout": "", "stderr": "hdfs command not found", "returncode": -1}
        except Exception as e:
            return {"success": False, "stdout": "", "stderr": str(e), "returncode": -1}

    def check_connectivity(self) -> dict:
        """Test HDFS connectivity by listing root directory."""
        result = self._run_hdfs_command(["-ls", "/"])
        return {
            "connected": result["success"],
            "hdfs_uri": self.hdfs_uri,
            "hadoop_home": self.hadoop_home,
            "message": "HDFS is accessible" if result["success"] else f"HDFS unreachable: {result['stderr']}",
            "details": result,
        }

    def mkdir(self, hdfs_path: str) -> dict:
        """Create a directory in HDFS (with -p for parent dirs)."""
        return self._run_hdfs_command(["-mkdir", "-p", hdfs_path])

    def put(self, local_path: str, hdfs_path: str, overwrite: bool = False) -> dict:
        """Upload a local file to HDFS."""
        if not os.path.exists(local_path):
            return {"success": False, "stderr": f"Local file not found: {local_path}"}
        
        args = ["-put"]
        if overwrite:
            args.append("-f")
        args.extend([local_path, hdfs_path])
        return self._run_hdfs_command(args, timeout=300)

    def ls(self, hdfs_path: str) -> dict:
        """List contents of an HDFS directory."""
        result = self._run_hdfs_command(["-ls", hdfs_path])
        if result["success"]:
            lines = result["stdout"].split("\n")
            entries = []
            for line in lines:
                if line.startswith("Found") or not line.strip():
                    continue
                parts = line.split()
                if len(parts) >= 8:
                    entries.append({
                        "permissions": parts[0],
                        "replication": parts[1],
                        "owner": parts[2],
                        "group": parts[3],
                        "size": int(parts[4]) if parts[4].isdigit() else 0,
                        "date": parts[5],
                        "time": parts[6],
                        "path": parts[7],
                    })
            result["entries"] = entries
        return result

    def cat(self, hdfs_path: str, max_bytes: int = 10000) -> dict:
        """Read content of a file in HDFS (limited output)."""
        result = self._run_hdfs_command(["-cat", hdfs_path], timeout=30)
        if result["success"] and len(result["stdout"]) > max_bytes:
            result["stdout"] = result["stdout"][:max_bytes] + "\n... (truncated)"
            result["truncated"] = True
        return result

    def test_exists(self, hdfs_path: str) -> bool:
        """Check if a path exists in HDFS."""
        result = self._run_hdfs_command(["-test", "-e", hdfs_path])
        return result["success"]

    def du(self, hdfs_path: str) -> dict:
        """Get disk usage of an HDFS path."""
        result = self._run_hdfs_command(["-du", "-s", "-h", hdfs_path])
        return result

    def rm(self, hdfs_path: str, recursive: bool = False) -> dict:
        """Remove a file or directory from HDFS."""
        # Safety: never allow removing the root or critical paths
        if hdfs_path in ["/", "/user", "/tmp"]:
            return {"success": False, "stderr": "Cannot remove protected path"}
        args = ["-rm"]
        if recursive:
            args.append("-r")
        args.append(hdfs_path)
        return self._run_hdfs_command(args)

    def initialize_directories(self) -> dict:
        """Create the full AgriScope HDFS directory structure."""
        results = {}
        for name, path in self.settings.hdfs_agriscope_paths.items():
            result = self.mkdir(path)
            results[name] = {
                "path": path,
                "success": result["success"],
                "message": result.get("stderr", "") if not result["success"] else "created",
            }
        return results

    def get_directory_info(self) -> dict:
        """Get information about all AgriScope HDFS directories."""
        info = {}
        for name, path in self.settings.hdfs_agriscope_paths.items():
            exists = self.test_exists(path)
            size_info = None
            if exists:
                du_result = self.du(path)
                size_info = du_result.get("stdout", "") if du_result["success"] else None
            info[name] = {
                "path": path,
                "exists": exists,
                "size": size_info,
            }
        return info

    def verify_hdfs_roundtrip(self, local_file: str, hdfs_dest: str) -> dict:
        """
        Full HDFS verification: upload, verify exists, check size.
        Returns detailed result for each step.
        """
        steps = []

        # Step 1: Upload
        put_result = self.put(local_file, hdfs_dest, overwrite=True)
        steps.append({
            "step": "upload",
            "success": put_result["success"],
            "detail": put_result.get("stderr", "uploaded successfully"),
        })
        if not put_result["success"]:
            return {"success": False, "steps": steps}

        # Step 2: Verify exists
        exists = self.test_exists(hdfs_dest)
        steps.append({
            "step": "verify_exists",
            "success": exists,
            "detail": "file exists in HDFS" if exists else "file NOT found in HDFS",
        })
        if not exists:
            return {"success": False, "steps": steps}

        # Step 3: Check size
        du_result = self.du(hdfs_dest)
        steps.append({
            "step": "check_size",
            "success": du_result["success"],
            "detail": du_result.get("stdout", ""),
        })

        return {
            "success": all(s["success"] for s in steps),
            "hdfs_path": hdfs_dest,
            "local_path": local_file,
            "steps": steps,
        }
