import React, { useState, useEffect } from "react";
import { Play, CheckCircle2, Terminal, RefreshCw, ChevronRight } from "lucide-react";
import { fetchJobs, fetchJobLogs, triggerJob } from "../services/api";

export default function PipelineTab() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [logs, setLogs] = useState("");
  const [triggeringStage, setTriggeringStage] = useState(null);
  const [notice, setNotice] = useState(null);

  const pipelineStages = [
    {
      id: "ingest",
      step: "01",
      name: "Source Ingestion & Parquet Staging",
      script: "spark_jobs/ingest_data.py",
      input: "/agriscope/raw/apy/crop-wise-area-production-yield.csv",
      output: "/agriscope/staging/validated/apy_parquet",
      duration: "22.4s",
      desc: "Validates schema types, computes SHA-256 integrity checksum, and translates raw CSV to Snappy-compressed Parquet.",
    },
    {
      id: "clean",
      step: "02",
      name: "Data Cleaning & Quality Audit",
      script: "spark_jobs/clean_data.py",
      input: "/agriscope/staging/validated/apy_parquet",
      output: "/agriscope/processed/cleaned",
      duration: "18.2s",
      desc: "Audits duplicate records (0 found) and attaches non-destructive boolean validity flags for zero/negative production and yield records.",
    },
    {
      id: "feature_engineering",
      step: "03",
      name: "Feature Engineering & Baseline Ratios",
      script: "spark_jobs/build_features.py",
      input: "/agriscope/processed/cleaned",
      output: "/agriscope/processed/features",
      duration: "19.5s",
      desc: "Computes log_area, encodes seasonal and categorical indices, and generates historical state-crop benchmarks with strict target leakage prevention.",
    },
    {
      id: "analytics",
      step: "04",
      name: "Exploratory Analytics Aggregation",
      script: "spark_jobs/exploratory_analysis.py",
      input: "/agriscope/processed/cleaned",
      output: "/agriscope/analytics/aggregates",
      duration: "21.0s",
      desc: "Computes distributed aggregates for 25-year longitudinal trends, state productivity rankings, and seasonal distribution.",
    },
    {
      id: "train",
      step: "05",
      name: "MLlib Model Training & Evaluation",
      script: "spark_jobs/train_regression.py",
      input: "/agriscope/processed/features",
      output: "/agriscope/models/*",
      duration: "24.8s",
      desc: "Trains 4 regression models (Linear Regression, Decision Tree, Random Forest, GBT) on an 80/20 holdout test split (N=88,574).",
    },
    {
      id: "cluster",
      step: "06",
      name: "K-Means Agricultural Clustering",
      script: "spark_jobs/train_kmeans.py",
      input: "/agriscope/processed/features",
      output: "/agriscope/models/kmeans",
      duration: "14.5s",
      desc: "Groups 443,078 records into 5 agronomic clusters along yield, area, and season dimensions (Silhouette Score = 0.4749).",
    },
  ];

  async function loadJobs() {
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
      const res = await fetchJobLogs(jobId);
      setLogs(res?.logs || "No logs available.");
    } catch (e) {
      setLogs("Error loading logs.");
    }
  }

  useEffect(() => {
    loadJobs();
  }, []);

  async function handleTrigger(stageId) {
    setTriggeringStage(stageId);
    setNotice(`Launching PySpark job for stage: ${stageId}...`);
    try {
      const res = await triggerJob(stageId);
      setNotice(`Job triggered successfully (ID: ${res.id})`);
      setTimeout(() => {
        loadJobs();
        setNotice(null);
        setTriggeringStage(null);
      }, 3000);
    } catch (e) {
      setNotice(`Error triggering job: ${e}`);
      setTriggeringStage(null);
    }
  }

  return (
    <div className="page-container animate-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-header-title">Hadoop & Spark Pipeline</h1>
          <p className="page-header-desc">
            Distributed execution stages running across Apache Hadoop HDFS and PySpark 4.0.
          </p>
        </div>

        <button 
          className="btn-apple-secondary" 
          onClick={loadJobs}
          style={{ fontSize: "0.8125rem" }}
        >
          <RefreshCw size={13} />
          <span>Refresh Status</span>
        </button>
      </div>

      {notice && (
        <div style={{
          padding: "10px 16px",
          backgroundColor: "var(--color-pale-green)",
          borderRadius: "var(--radius-md)",
          color: "var(--color-forest)",
          fontSize: "0.8125rem",
          fontWeight: 500,
          border: "1px solid rgba(15, 42, 29, 0.12)",
        }}>
          {notice}
        </div>
      )}

      {/* Sequential Pipeline Stages */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {pipelineStages.map((stage) => (
          <div key={stage.id} className="apple-card" style={{ padding: "18px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
              <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-olive)", padding: "4px 8px", background: "var(--bg-surface-subtle)", borderRadius: "var(--radius-sm)" }}>
                  {stage.step}
                </span>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <h3 style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--color-forest)" }}>
                      {stage.name}
                    </h3>
                    <span className="status-pill status-pill-success">
                      <CheckCircle2 size={11} />
                      <span>Completed ({stage.duration})</span>
                    </span>
                  </div>
                  <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", marginTop: "4px", maxWidth: "680px" }}>
                    {stage.desc}
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <button
                  className="btn-apple-subtle"
                  onClick={() => {
                    const match = jobs.find((j) => j.job_type === stage.id);
                    if (match) {
                      setSelectedJob(match);
                      loadLogs(match.id);
                    }
                  }}
                  style={{ fontSize: "0.8125rem" }}
                >
                  <Terminal size={14} />
                  <span>Inspect Log</span>
                </button>
                <button
                  className="btn-apple-secondary"
                  disabled={triggeringStage === stage.id}
                  onClick={() => handleTrigger(stage.id)}
                  style={{ fontSize: "0.8125rem", padding: "6px 12px" }}
                >
                  <Play size={12} color="var(--color-olive)" />
                  <span>Run Stage</span>
                </button>
              </div>
            </div>

            {/* Path metadata */}
            <div style={{
              display: "flex",
              gap: "24px",
              marginTop: "12px",
              paddingTop: "12px",
              borderTop: "1px solid var(--border-subtle)",
              fontSize: "0.75rem",
              color: "var(--text-tertiary)",
              flexWrap: "wrap",
            }}>
              <div>
                <span>Source: </span>
                <code style={{ color: "var(--text-secondary)" }}>{stage.input}</code>
              </div>
              <div>
                <span>Output: </span>
                <code style={{ color: "var(--color-olive)" }}>{stage.output}</code>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Execution Log Stream */}
      <div className="apple-card" style={{ padding: "20px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Terminal size={16} color="var(--color-olive)" />
            <h3 style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--color-forest)" }}>
              Spark Submit Execution Log
            </h3>
          </div>
          {selectedJob && (
            <span style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
              Job ID: <code>{selectedJob.id}</code> ({selectedJob.job_type})
            </span>
          )}
        </div>

        <div style={{
          background: "var(--color-forest)",
          borderRadius: "var(--radius-md)",
          padding: "16px",
          color: "var(--color-pale-green)",
          fontFamily: "var(--font-mono)",
          fontSize: "0.75rem",
          lineHeight: 1.6,
          maxHeight: "260px",
          overflowY: "auto",
          whiteSpace: "pre-wrap",
        }}>
          {logs || "Select 'Inspect Log' on any pipeline stage to view spark-submit execution stream..."}
        </div>
      </div>
    </div>
  );
}
