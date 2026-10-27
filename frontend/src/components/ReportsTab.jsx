import React, { useState } from "react";
import { Download, FileText, CheckCircle2 } from "lucide-react";
import {
  fetchOverviewAnalytics,
  fetchModelComparison,
  fetchClusteringResults,
  fetchDatasets,
} from "../services/api";

export default function ReportsTab() {
  const [downloading, setDownloading] = useState(null);

  function triggerDownload(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  async function handleExport(reportId) {
    setDownloading(reportId);
    try {
      if (reportId === "trends") {
        const data = await fetchOverviewAnalytics();
        const rows = data?.yield_trends || [];
        if (rows.length > 0) {
          const headers = Object.keys(rows[0]).join(",");
          const csv = [headers, ...rows.map((r) => Object.values(r).join(","))].join("\n");
          triggerDownload(csv, "agriscope_yield_trends_1997_2022.csv", "text/csv");
        }
      } else if (reportId === "models") {
        const data = await fetchModelComparison();
        triggerDownload(JSON.stringify(data, null, 2), "agriscope_model_evaluation_report.json", "application/json");
      } else if (reportId === "clusters") {
        const data = await fetchClusteringResults();
        triggerDownload(JSON.stringify(data, null, 2), "agriscope_kmeans_cluster_report.json", "application/json");
      } else if (reportId === "schema") {
        const data = await fetchDatasets();
        triggerDownload(JSON.stringify(data[0] || {}, null, 2), "agriscope_dataset_provenance_schema.json", "application/json");
      }
    } catch (e) {
      console.error("Export error:", e);
    } finally {
      setTimeout(() => setDownloading(null), 600);
    }
  }

  const reports = [
    {
      id: "trends",
      name: "Longitudinal Yield Trends (1997–2022)",
      format: "CSV",
      size: "4.2 KB",
      updated: "2026-10-27",
      desc: "Annual national yield averages, cultivated land area in hectares, and harvest volumes across all 737 districts.",
    },
    {
      id: "models",
      name: "MLlib Model Evaluation Leaderboard",
      format: "JSON",
      size: "3.6 KB",
      updated: "2026-10-27",
      desc: "Formal metrics (MAE, RMSE, R²), hyperparameters, and holdout sample diagnostics for Linear Regression, Decision Tree, Random Forest, and GBT.",
    },
    {
      id: "clusters",
      name: "K-Means Agronomic Typology Report",
      format: "JSON",
      size: "7.1 KB",
      updated: "2026-10-27",
      desc: "Unsupervised cluster summaries, feature centroids (yield, area, season), and regional crop distributions for k=5 clusters.",
    },
    {
      id: "schema",
      name: "Dataset Provenance & Quality Audit Schema",
      format: "JSON",
      size: "2.7 KB",
      updated: "2026-10-27",
      desc: "16-column attribute specifications, SHA-256 verification hash, duplicate audit findings, and non-destructive outlier flags.",
    },
  ];

  return (
    <div className="page-container animate-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-header-title">Export & Intelligence Reports</h1>
          <p className="page-header-desc">
            Standardized data exports and model evaluations generated from Hadoop HDFS and Apache Spark.
          </p>
        </div>
      </div>

      {/* Clean Reports List */}
      <div className="apple-card" style={{ padding: "8px 0" }}>
        {reports.map((rep, idx) => (
          <div
            key={rep.id}
            style={{
              padding: "18px 24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
              borderBottom: idx < reports.length - 1 ? "1px solid var(--border-subtle)" : "none",
            }}
          >
            <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", maxWidth: "680px" }}>
              <div style={{ padding: "8px", background: "var(--bg-surface-subtle)", borderRadius: "var(--radius-sm)", color: "var(--color-olive)", marginTop: "2px" }}>
                <FileText size={18} />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <h3 style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--color-forest)" }}>
                    {rep.name}
                  </h3>
                  <span className="status-pill status-pill-neutral">
                    {rep.format} • {rep.size}
                  </span>
                </div>
                <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", marginTop: "4px" }}>
                  {rep.desc}
                </p>
              </div>
            </div>

            <button
              className="btn-apple-secondary"
              disabled={downloading === rep.id}
              onClick={() => handleExport(rep.id)}
              style={{ fontSize: "0.8125rem" }}
            >
              <Download size={13} color="var(--color-olive)" />
              <span>{downloading === rep.id ? "Preparing..." : `Export ${rep.format}`}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
