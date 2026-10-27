import React, { useState, useEffect } from "react";
import { Cpu, Layers, Sparkles, MapPin, Wheat, BarChart3, Info } from "lucide-react";
import { fetchClusteringResults } from "../services/api";

export default function ClusteringTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCluster, setSelectedCluster] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchClusteringResults();
        setData(res);
        if (res?.cluster_summaries?.length > 0) {
          setSelectedCluster(res.cluster_summaries[0]);
        }
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

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <span className="badge badge-emerald">Unsupervised Learning</span>
              <span className="badge badge-teal">PySpark MLlib K-Means</span>
            </div>
            <h1 style={{ fontSize: "1.8rem", margin: 0 }}>Agricultural Typology & Crop Clustering</h1>
            <p style={{ color: "var(--text-muted)", marginTop: "6px", fontSize: "0.95rem" }}>
              Categorizes 443,078 agricultural production records into 5 distinct agronomic profiles based on yield, cultivated area, and seasonality.
            </p>
          </div>

          <div style={{
            background: "rgba(6, 182, 212, 0.12)",
            border: "1px solid rgba(6, 182, 212, 0.3)",
            padding: "12px 18px",
            borderRadius: "12px",
            textAlign: "right"
          }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-subtle)", textTransform: "uppercase", fontWeight: 700 }}>
              Silhouette Score
            </div>
            <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--teal-accent)" }}>
              {silhouette.toFixed(4)}
            </div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Well-separated cluster boundaries</div>
          </div>
        </div>
      </div>

      {/* Cluster Selection Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.2rem" }}>
        {clusters.map((c) => {
          const isSelected = selectedCluster?.cluster_id === c.cluster_id;
          return (
            <div
              key={c.cluster_id}
              onClick={() => setSelectedCluster(c)}
              className="glass-panel glass-card-interactive"
              style={{
                padding: "1.5rem",
                border: isSelected ? "1px solid var(--emerald-primary)" : "1px solid var(--border-subtle)",
                background: isSelected ? "rgba(16, 185, 129, 0.1)" : "var(--bg-card)",
                boxShadow: isSelected ? "0 0 20px rgba(16, 185, 129, 0.2)" : "none",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span className="badge badge-emerald" style={{ fontSize: "0.7rem" }}>
                  Cluster {c.cluster_id}
                </span>
                <span style={{ fontSize: "0.78rem", color: "var(--text-subtle)", fontWeight: 600 }}>
                  {c.size.toLocaleString()} records
                </span>
              </div>

              <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "#ffffff", marginBottom: "8px" }}>
                {c.label}
              </div>

              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                Mean Yield: <strong>{(c.feature_stats?.yield?.mean || 0).toFixed(2)} T/Ha</strong>
              </div>
            </div>
          );
        })}
      </div>

      {/* Deep-Dive into Selected Cluster */}
      {selectedCluster && (
        <div className="glass-panel" style={{ padding: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <span className="badge badge-emerald" style={{ marginBottom: "6px" }}>Detailed Agronomic Profile</span>
              <h2 style={{ fontSize: "1.5rem", color: "#ffffff", margin: "4px 0" }}>
                Cluster {selectedCluster.cluster_id}: {selectedCluster.label}
              </h2>
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                Encompasses {selectedCluster.size.toLocaleString()} records ({(selectedCluster.size / (data?.total_records || 443078) * 100).toFixed(1)}% of all Indian cultivation data)
              </span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", marginBottom: "1.5rem" }}>
            {/* Feature Statistics */}
            <div style={{ background: "rgba(0,0,0,0.3)", padding: "1.2rem", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
              <h4 style={{ fontSize: "0.95rem", color: "var(--emerald-light)", marginBottom: "10px" }}>Feature Centroids & Spread</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.82rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-subtle)" }}>Mean Yield:</span>
                  <span style={{ fontWeight: 700, color: "#ffffff" }}>{(selectedCluster.feature_stats?.yield?.mean || 0).toFixed(2)} Tonnes/Ha</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-subtle)" }}>Median Yield:</span>
                  <span>{(selectedCluster.feature_stats?.yield?.median || 0).toFixed(2)} Tonnes/Ha</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-subtle)" }}>Mean Cultivated Area:</span>
                  <span>{(selectedCluster.feature_stats?.area?.mean || 0).toLocaleString(undefined, { maximumFractionDigits: 1 })} Ha</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-subtle)" }}>Median Cultivated Area:</span>
                  <span>{(selectedCluster.feature_stats?.area?.median || 0).toLocaleString()} Ha</span>
                </div>
              </div>
            </div>

            {/* Top Crops */}
            <div style={{ background: "rgba(0,0,0,0.3)", padding: "1.2rem", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                <Wheat size={16} color="var(--amber-light)" />
                <h4 style={{ fontSize: "0.95rem", color: "#ffffff", margin: 0 }}>Predominant Crops</h4>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {selectedCluster.top_crops?.map((crop, idx) => (
                  <span key={idx} className="badge badge-amber" style={{ fontSize: "0.75rem" }}>
                    {crop}
                  </span>
                ))}
              </div>
            </div>

            {/* Top States */}
            <div style={{ background: "rgba(0,0,0,0.3)", padding: "1.2rem", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                <MapPin size={16} color="var(--teal-accent)" />
                <h4 style={{ fontSize: "0.95rem", color: "#ffffff", margin: 0 }}>Key Geographic Hubs</h4>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {selectedCluster.top_states?.map((st, idx) => (
                  <span key={idx} className="badge badge-teal" style={{ fontSize: "0.75rem" }}>
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
