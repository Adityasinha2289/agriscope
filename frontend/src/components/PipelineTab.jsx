import React, { useState, useEffect } from "react";
import { GitBranch, Play, CheckCircle2, Clock, AlertTriangle, Terminal, RefreshCw, FileText } from "lucide-react";
import { fetchJobs, fetchJobLogs, triggerJob } from "../services/api";

export default function PipelineTab() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [logs, setLogs] = useState("");
  const [triggering, setTriggering] = useState(false);
  const [triggerStatus, setTriggerStatus] = useState(null);

  const pipelineStages = [
    {
      id: "ingest",
      title: "1. Data Ingestion & Staging",
      script: "spark_jobs/ingest_data.py",
      input: "hdfs://.../raw/apy/crop-wise-area-production-yield.csv",
      output: "hdfs://.../staging/validated/apy_parquet",
      desc: "Validates schema integrity, calculates SHA-256 checksum, profiles data types, and converts raw CSV to Snappy-compressed Parquet.",
      status: "completed",
      duration: "22.4s",
    },
    {
      id: "clean",
      title: "2. Data Cleaning & Audit",
      script: "spark_jobs/clean_data.py",
      input: "hdfs://.../staging/validated/apy_parquet",
      output: "hdfs://.../processed/cleaned",
      desc: "Audits duplicate records, flags invalid negative or zero production/yield records, and applies non-destructive boolean flags.",
      status: "completed",
      duration: "18.2s",
    },
    {
      id: "feature_engineering",
      title: "3. Feature Engineering",
      script: "spark_jobs/build_features.py",
      input: "hdfs://.../processed/cleaned",
      output: "hdfs://.../processed/features",
      desc: "Computes log_area, encodes season and crop_type indices, and generates historical state-crop and crop average yield benchmarks (target leakage strictly prevented).",
      status: "completed",
      duration: "19.5s",
    },
    {
      id: "analytics",
      title: "4. Exploratory Analytics",
      script: "spark_jobs/exploratory_analysis.py",
      input: "hdfs://.../processed/cleaned",
      output: "hdfs://.../analytics/aggregates",
      desc: "Calculates distributed aggregations for 25-year yield trends, state rankings, crop rankings, and seasonal distributions.",
      status: "completed",
      duration: "21.0s",
    },
    {
      id: "train",
      title: "5. MLlib Model Training",
      script: "spark_jobs/train_regression.py",
      input: "hdfs://.../processed/features",
      output: "hdfs://.../models/*",
      desc: "Trains 4 regression models (Linear Regression, Decision Tree, Random Forest, Gradient-Boosted Trees) with 80/20 train-test split (N=443,078).",
      status: "completed",
      duration: "24.8s",
    },
    {
      id: "cluster",
      title: "6. K-Means Clustering",
      script: "spark_jobs/train_kmeans.py",
      input: "hdfs://.../processed/features",
      output: "hdfs://.../models/kmeans",
      desc: "Discovers 5 distinct agricultural clusters using yield, area, and seasonal characteristics via unsupervised MLlib K-Means.",
      status: "completed",
      duration: "14.5s",
    },
  ];

  async function loadJobsList() {
    try {
      const data = await fetchJobs(20);
      setJobs(data || []);
      if (data && data.length > 0 && !selectedJob) {
        setSelectedJob(data[0]);
        loadLogs(data[0].id);
      }
    } catch (e) {
      console.error("Error loading jobs:", e);
    }
  }

  async function loadLogs(jobId) {
    try {
      const logData = await fetchJobLogs(jobId);
      setLogs(logData?.logs || "No logs available.");
    } catch (e) {
      setLogs("Error loading logs.");
    }
  }

  useEffect(() => {
    loadJobsList();
  }, []);

  async function handleTrigger(jobType) {
    setTriggering(true);
    setTriggerStatus(`Launching Spark Job: ${jobType}...`);
    try {
      const res = await triggerJob(jobType);
      setTriggerStatus(`Job triggered successfully (ID: ${res.id})`);
      setTimeout(() => {
        loadJobsList();
        setTriggerStatus(null);
        setTriggering(false);
      }, 3000);
    } catch (e) {
      setTriggerStatus(`Error triggering job: ${e}`);
      setTriggering(false);
    }
  }

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <span className="badge badge-emerald">Directed Acyclic Graph (DAG)</span>
              <span className="badge badge-teal">PySpark MLlib Pipelines</span>
            </div>
            <h1 style={{ fontSize: "1.8rem", margin: 0 }}>Big Data Distributed Processing Pipeline</h1>
          </div>

          <button className="btn-secondary" onClick={loadJobsList} style={{ fontSize: "0.85rem" }}>
            <RefreshCw size={14} />
            <span>Refresh Jobs</span>
          </button>
        </div>

        {triggerStatus && (
          <div style={{
            marginTop: "1.2rem",
            padding: "10px 16px",
            background: "rgba(16, 185, 129, 0.15)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            borderRadius: "8px",
            color: "var(--emerald-light)",
            fontSize: "0.88rem",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <RefreshCw size={14} className="animate-spin" />
            <span>{triggerStatus}</span>
          </div>
        )}
      </div>

      {/* DAG Stages */}
      <div>
        <h2 style={{ fontSize: "1.3rem", marginBottom: "1.2rem" }}>Pipeline Stages Execution Architecture</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "1.5rem" }}>
          {pipelineStages.map((stage) => (
            <div key={stage.id} className="glass-panel" style={{ padding: "1.6rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                  <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#ffffff" }}>
                    {stage.title}
                  </div>
                  <span className="badge badge-emerald" style={{ fontSize: "0.7rem" }}>
                    <CheckCircle2 size={12} />
                    <span>{stage.status} ({stage.duration})</span>
                  </span>
                </div>

                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1.2rem", lineHeight: 1.5 }}>
                  {stage.desc}
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.78rem", marginBottom: "1.4rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-subtle)" }}>Script:</span>
                    <code style={{ color: "var(--emerald-light)" }}>{stage.script}</code>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-subtle)" }}>Output HDFS:</span>
                    <span style={{ color: "var(--teal-accent)", wordBreak: "break-all" }}>{stage.output}</span>
                  </div>
                </div>
              </div>

              <button
                className="btn-secondary"
                disabled={triggering}
                onClick={() => handleTrigger(stage.id)}
                style={{ width: "100%", justifyContent: "center", fontSize: "0.85rem" }}
              >
                <Play size={14} color="var(--emerald-light)" />
                <span>Trigger PySpark Stage</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Real-time Spark Log Viewer */}
      <div className="glass-panel" style={{ padding: "1.8rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Terminal size={20} color="var(--teal-accent)" />
            <h3 style={{ fontSize: "1.2rem", margin: 0 }}>PySpark Job Execution Log Stream</h3>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            {jobs.slice(0, 4).map((j) => (
              <button
                key={j.id}
                onClick={() => {
                  setSelectedJob(j);
                  loadLogs(j.id);
                }}
                style={{
                  background: selectedJob?.id === j.id ? "rgba(16, 185, 129, 0.2)" : "rgba(255, 255, 255, 0.04)",
                  border: selectedJob?.id === j.id ? "1px solid var(--emerald-primary)" : "1px solid var(--border-subtle)",
                  color: selectedJob?.id === j.id ? "#ffffff" : "var(--text-muted)",
                  padding: "5px 10px",
                  borderRadius: "6px",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                }}
              >
                {j.job_type}
              </button>
            ))}
          </div>
        </div>

        <div style={{
          background: "#070b12",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "10px",
          padding: "1.2rem",
          maxHeight: "340px",
          overflowY: "auto",
          fontFamily: "var(--font-mono)",
          fontSize: "0.8rem",
          lineHeight: 1.6,
          color: "#94a3b8",
          whiteSpace: "pre-wrap",
        }}>
          {logs || "Select a job above to view its spark-submit terminal execution log..."}
        </div>
      </div>
    </div>
  );
}
