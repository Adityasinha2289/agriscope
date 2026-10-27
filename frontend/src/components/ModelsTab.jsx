import React, { useState, useEffect } from "react";
import { BrainCircuit, Trophy, CheckCircle, Sliders, ShieldCheck, Zap, HardDrive } from "lucide-react";
import { fetchModelComparison } from "../services/api";

export default function ModelsTab() {
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchModelComparison();
        setComparison(res);
      } catch (e) {
        console.error("Error loading model comparison:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const models = comparison?.models || [
    {
      model_name: "Gradient-Boosted Trees",
      algorithm: "gradient_boosted_trees",
      metrics: { mae: 1.1332, rmse: 5.3413, r2: 0.8550, training_duration_seconds: 11.96, prediction_duration_seconds: 0.05, training_samples: 354504, test_samples: 88574 },
      hyperparameters: { maxIter: 20, maxDepth: 6, stepSize: 0.1, seed: 42 },
      hdfs_model_path: "/agriscope/models/gradient_boosted_trees",
    },
    {
      model_name: "Random Forest",
      algorithm: "random_forest",
      metrics: { mae: 1.1769, rmse: 5.3743, r2: 0.8532, training_duration_seconds: 3.46, prediction_duration_seconds: 0.07, training_samples: 354504, test_samples: 88574 },
      hyperparameters: { numTrees: 25, maxDepth: 8, seed: 42 },
      hdfs_model_path: "/agriscope/models/random_forest",
    },
    {
      model_name: "Decision Tree",
      algorithm: "decision_tree",
      metrics: { mae: 1.1505, rmse: 5.4169, r2: 0.8508, training_duration_seconds: 1.73, prediction_duration_seconds: 0.03, training_samples: 354504, test_samples: 88574 },
      hyperparameters: { maxDepth: 8, seed: 42 },
      hdfs_model_path: "/agriscope/models/decision_tree",
    },
    {
      model_name: "Linear Regression",
      algorithm: "linear_regression",
      metrics: { mae: 1.2779, rmse: 6.6974, r2: 0.7720, training_duration_seconds: 3.14, prediction_duration_seconds: 0.03, training_samples: 354504, test_samples: 88574 },
      hyperparameters: { maxIter: 50, regParam: 0.1, elasticNetParam: 0.5 },
      hdfs_model_path: "/agriscope/models/linear_regression",
    },
  ];

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <span className="badge badge-emerald">Spark MLlib Pipelines</span>
              <span className="badge badge-amber">80/20 Holdout Split (N=88,574)</span>
            </div>
            <h1 style={{ fontSize: "1.8rem", margin: 0 }}>Academic ML Model Leaderboard & Evaluation</h1>
            <p style={{ color: "var(--text-muted)", marginTop: "6px", fontSize: "0.95rem" }}>
              Side-by-side empirical comparison of 4 supervised regression algorithms evaluated on identical test splits.
            </p>
          </div>

          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            background: "rgba(245, 158, 11, 0.12)",
            border: "1px solid rgba(245, 158, 11, 0.3)",
            padding: "12px 18px",
            borderRadius: "12px",
          }}>
            <Trophy size={28} color="var(--amber-light)" />
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-subtle)", textTransform: "uppercase", fontWeight: 700 }}>
                Leaderboard Champion
              </div>
              <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "#ffffff" }}>
                Gradient-Boosted Trees (R² = 0.8550)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="glass-panel" style={{ padding: "2rem" }}>
        <h3 style={{ fontSize: "1.2rem", marginBottom: "1.2rem" }}>Model Performance Metrics (Holdout Evaluation)</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)", textAlign: "left" }}>
                <th style={{ padding: "12px 16px", color: "var(--text-subtle)" }}>Rank / Algorithm</th>
                <th style={{ padding: "12px 16px", color: "var(--text-subtle)" }}>R² Score (Higher is Better)</th>
                <th style={{ padding: "12px 16px", color: "var(--text-subtle)" }}>RMSE (Lower is Better)</th>
                <th style={{ padding: "12px 16px", color: "var(--text-subtle)" }}>MAE (Lower is Better)</th>
                <th style={{ padding: "12px 16px", color: "var(--text-subtle)" }}>Train Duration</th>
                <th style={{ padding: "12px 16px", color: "var(--text-subtle)" }}>Inference Speed</th>
                <th style={{ padding: "12px 16px", color: "var(--text-subtle)" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {models.map((m, idx) => {
                const isBest = idx === 0;
                return (
                  <tr key={m.algorithm} style={{
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    background: isBest ? "rgba(16, 185, 129, 0.05)" : "transparent",
                  }}>
                    <td style={{ padding: "14px 16px", fontWeight: 700, color: isBest ? "var(--emerald-light)" : "#ffffff" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {isBest && <Trophy size={16} color="var(--amber-light)" />}
                        <span>{m.model_name}</span>
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px", fontWeight: 700, color: isBest ? "var(--emerald-light)" : "var(--text-main)" }}>
                      {(m.metrics?.r2 || 0).toFixed(4)}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      {(m.metrics?.rmse || 0).toFixed(4)}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      {(m.metrics?.mae || 0).toFixed(4)}
                    </td>
                    <td style={{ padding: "14px 16px", color: "var(--teal-accent)" }}>
                      {(m.metrics?.training_duration_seconds || 0).toFixed(2)}s
                    </td>
                    <td style={{ padding: "14px 16px", color: "var(--text-muted)" }}>
                      &lt; 50ms
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span className={`badge ${isBest ? "badge-emerald" : "badge-indigo"}`} style={{ fontSize: "0.7rem" }}>
                        {isBest ? "Best Performer" : "Evaluated"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Model Hyperparameters & HDFS Paths */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem" }}>
        {models.map((m) => (
          <div key={m.algorithm} className="glass-panel" style={{ padding: "1.6rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h4 style={{ fontSize: "1.05rem", margin: 0, color: "#ffffff" }}>{m.model_name}</h4>
              <span className="badge badge-teal" style={{ fontSize: "0.7rem" }}>Spark MLlib</span>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--text-subtle)", marginBottom: "4px" }}>Configured Hyperparameters</div>
              <pre style={{
                background: "rgba(0,0,0,0.3)",
                padding: "10px",
                borderRadius: "8px",
                fontSize: "0.78rem",
                color: "var(--emerald-light)",
                overflowX: "auto"
              }}>
                {JSON.stringify(m.hyperparameters || {}, null, 2)}
              </pre>
            </div>

            <div style={{ fontSize: "0.78rem", color: "var(--text-subtle)", display: "flex", alignItems: "center", gap: "6px" }}>
              <HardDrive size={13} />
              <span>HDFS Artifact: <code>{m.hdfs_model_path}</code></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
