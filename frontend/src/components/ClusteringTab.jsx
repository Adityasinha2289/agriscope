import React, { useState, useEffect } from "react";
import { Boxes, CheckCircle2, ChevronRight, Layers } from "lucide-react";
import { fetchClusteringResults } from "../services/api";

export default function ClusteringTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedClusterId, setSelectedClusterId] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchClusteringResults();
        setData(res);
      } catch (e) {
        console.error("Error loading clustering data:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const clusters = data?.cluster_summaries || [];
  const silhouette = data?.silhouette_score || 0.4749;
  const totalRecords = data?.total_records || 443078;

  const selectedCluster = clusters.find((c) => c.cluster_id === selectedClusterId) || clusters[0];

  return (
    <div className="page-container animate-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-header-title">Agricultural Clusters</h1>
          <p className="page-header-desc">
            Unsupervised PySpark MLlib segmentation of 443,078 cultivation records into 5 agronomic typologies.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span className="status-pill status-pill-brand">
            Silhouette Score: {silhouette.toFixed(4)}
          </span>
          <span className="status-pill status-pill-neutral">
            k = 5 Clusters
          </span>
        </div>
      </div>

      {/* Primary Overview: Clean Clusters Table */}
      <div className="apple-card" style={{ padding: "20px 24px" }}>
        <h3 style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--color-forest)", marginBottom: "16px" }}>
          Discovered Agronomic Typologies
        </h3>

        <div className="apple-table-wrapper">
          <table className="apple-table">
            <thead>
              <tr>
                <th>Cluster</th>
                <th>Typology Description</th>
                <th style={{ textAlign: "right" }}>Records</th>
                <th style={{ textAlign: "right" }}>Share</th>
                <th style={{ textAlign: "right" }}>Mean Yield (T/Ha)</th>
                <th>Predominant Crops</th>
              </tr>
            </thead>
            <tbody>
              {clusters.map((c) => {
                const isSelected = selectedCluster?.cluster_id === c.cluster_id;
                const pct = ((c.size / totalRecords) * 100).toFixed(1);
                return (
                  <tr
                    key={c.cluster_id}
                    onClick={() => setSelectedClusterId(c.cluster_id)}
                    style={{
                      cursor: "pointer",
                      backgroundColor: isSelected ? "var(--bg-surface-subtle)" : "transparent",
                    }}
                  >
                    <td style={{ fontWeight: 600, color: "var(--color-olive)" }}>
                      Cluster {c.cluster_id}
                    </td>
                    <td style={{ fontWeight: 600, color: "var(--color-forest)" }}>
                      {c.label}
                    </td>
                    <td style={{ textAlign: "right" }} className="tabular-numbers">
                      {c.size.toLocaleString()}
                    </td>
                    <td style={{ textAlign: "right", color: "var(--text-secondary)" }} className="tabular-numbers">
                      {pct}%
                    </td>
                    <td style={{ textAlign: "right", fontWeight: 600 }} className="tabular-numbers">
                      {(c.feature_stats?.yield?.mean || 0).toFixed(2)}
                    </td>
                    <td style={{ color: "var(--text-secondary)", fontSize: "0.8125rem" }}>
                      {c.top_crops?.slice(0, 3).join(", ")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Cluster Deep-Dive */}
      {selectedCluster && (
        <div className="apple-card" style={{ padding: "20px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--color-olive)", fontWeight: 600 }}>
                Cluster {selectedCluster.cluster_id} Profile
              </span>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--color-forest)", marginTop: "2px" }}>
                {selectedCluster.label}
              </h3>
            </div>
            <span className="status-pill status-pill-neutral tabular-numbers">
              {selectedCluster.size.toLocaleString()} cultivation records
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px" }}>
            {/* Centroid Statistics */}
            <div style={{ padding: "16px", background: "var(--bg-surface-subtle)", borderRadius: "var(--radius-md)" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-olive)", marginBottom: "8px", textTransform: "uppercase" }}>
                Feature Centroids
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.8125rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Average Yield:</span>
                  <span style={{ fontWeight: 600, color: "var(--color-forest)" }} className="tabular-numbers">
                    {(selectedCluster.feature_stats?.yield?.mean || 0).toFixed(2)} T/Ha
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Average Land Area:</span>
                  <span style={{ fontWeight: 500 }} className="tabular-numbers">
                    {Math.round(selectedCluster.feature_stats?.area?.mean || 0).toLocaleString()} Ha
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Median Land Area:</span>
                  <span style={{ fontWeight: 500 }} className="tabular-numbers">
                    {Math.round(selectedCluster.feature_stats?.area?.median || 0).toLocaleString()} Ha
                  </span>
                </div>
              </div>
            </div>

            {/* Predominant Crops */}
            <div style={{ padding: "16px", background: "var(--bg-surface-subtle)", borderRadius: "var(--radius-md)" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-olive)", marginBottom: "8px", textTransform: "uppercase" }}>
                Characteristic Crops
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {selectedCluster.top_crops?.map((crop, idx) => (
                  <span key={idx} className="status-pill status-pill-neutral">
                    {crop}
                  </span>
                ))}
              </div>
            </div>

            {/* Key Geographic States */}
            <div style={{ padding: "16px", background: "var(--bg-surface-subtle)", borderRadius: "var(--radius-md)" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-olive)", marginBottom: "8px", textTransform: "uppercase" }}>
                Primary Geographic Hubs
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {selectedCluster.top_states?.map((st, idx) => (
                  <span key={idx} className="status-pill status-pill-brand">
                    {st}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
