import React, { useState } from "react";
import { BookOpen, HelpCircle, HardDrive, Cpu, Terminal, CheckCircle } from "lucide-react";

export default function DocsTab() {
  const [activeSection, setActiveSection] = useState("overview");

  const vivaQuestions = [
    {
      q: "Why is Hadoop HDFS necessary for this project instead of a standard PostgreSQL database?",
      a: "Hadoop HDFS provides fault-tolerant, horizontally scalable distributed storage across clusters with block-level replication (default 128MB blocks). In agricultural analytics, historical time-series datasets grow into tens of millions of sensor and district records. HDFS allows high-throughput streaming reads for distributed compute engines like Apache Spark, enabling data locality where compute tasks execute on the physical nodes where the data blocks reside, eliminating network saturation."
    },
    {
      q: "What is target leakage in crop yield prediction, and how does AgriScope prevent it?",
      a: "In agricultural data, Yield is defined as Production divided by Area (Yield = Production / Area). If Production is included as an input feature to predict Yield, the model trivially learns the mathematical division formula, achieving artificial R² = 0.99 without learning any real agronomic relationships. In production or pre-harvest scenarios, Production is unknown. AgriScope strictly enforces leakage prevention by dropping Production from feature sets and training only on exogenous variables (Area, Season, Crop Type, Geographical Baseline, Technology Trend)."
    },
    {
      q: "Explain why Gradient-Boosted Trees (GBT) outperformed Linear Regression and Decision Trees.",
      a: "Crop yield relationships are highly non-linear with complex interaction effects (e.g., specific crops perform well in specific soil/climatic seasons, and returns to scale diminish on massive land tracts). Linear Regression is constrained to additive linear hyperplanes (R² = 0.772). Single Decision Trees suffer from high variance (R² = 0.851). Gradient-Boosted Trees sequentially construct shallow trees where each tree corrects the residual errors of the previous ensemble, achieving the lowest RMSE (5.34) and highest R² (0.855)."
    },
    {
      q: "How does Apache Spark ensure fault tolerance and performance during distributed ETL?",
      a: "Spark utilizes Resilient Distributed Datasets (RDDs) and DAG (Directed Acyclic Graph) lineage graphs. If a partition fails during execution, Spark recomputes only the lost partition from the lineage graph rather than restarting the entire job. Performance is optimized through in-memory caching, catalyst query optimization, columnar Snappy-compressed Parquet storage, and whole-stage code generation."
    },
    {
      q: "What is the purpose of K-Means clustering in this academic agricultural platform?",
      a: "K-Means provides unsupervised crop and district segmentation without human labeling. By clustering 443,078 records along yield, area, and seasonal axes (achieving Silhouette Score = 0.475), AgriScope discovers natural agronomic clusters: intensive smallholder cash crops, rainfed low-yield pulses, commercial high-yield sugar plantations, and extensive grain basins. This enables targeted policy interventions."
    }
  ];

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
          <span className="badge badge-emerald">B.Tech CSET-371 Big Data Analytics</span>
          <span className="badge badge-indigo">Academic Project Documentation</span>
        </div>
        <h1 style={{ fontSize: "1.8rem", margin: 0 }}>Academic Project Report & Viva Voce Guide</h1>
        <p style={{ color: "var(--text-muted)", marginTop: "6px", fontSize: "0.95rem" }}>
          Comprehensive engineering documentation, mathematical formulations, architectural decisions, and examiner viva voce prep.
        </p>
      </div>

      {/* Navigation Pills */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        {[
          { id: "overview", label: "Executive Summary & Architecture" },
          { id: "hdfs", label: "HDFS Storage & Schema Design" },
          { id: "spark", label: "PySpark & MLlib Pipeline" },
          { id: "viva", label: "Examiner Viva Voce Question Bank" },
        ].map((sec) => (
          <button
            key={sec.id}
            onClick={() => setActiveSection(sec.id)}
            style={{
              padding: "8px 16px",
              borderRadius: "10px",
              fontSize: "0.85rem",
              fontWeight: activeSection === sec.id ? 600 : 500,
              background: activeSection === sec.id ? "var(--emerald-primary)" : "rgba(255, 255, 255, 0.04)",
              color: "#ffffff",
              border: "1px solid var(--border-subtle)",
              cursor: "pointer",
              transition: "all var(--transition-fast)",
            }}
          >
            {sec.label}
          </button>
        ))}
      </div>

      {/* Content Section */}
      {activeSection === "overview" && (
        <div className="glass-panel" style={{ padding: "2rem", lineHeight: 1.7 }}>
          <h2 style={{ fontSize: "1.4rem", color: "#ffffff", marginBottom: "1rem" }}>1. Executive Summary & Problem Formulation</h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "1.2rem" }}>
            Agricultural crop yield forecasting in India is challenged by immense geographical diversity, heterogeneous regional data collection standards, and extreme non-linearities across seasons and land sizes. 
            Traditional monolithic relational databases fail to handle high-throughput longitudinal agricultural analytics spanning 25+ years across 737 districts.
          </p>
          <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>
            <strong>AgriScope</strong> establishes a production-grade distributed Big Data platform combining <strong>Apache Hadoop HDFS</strong> for scalable distributed raw staging, <strong>Apache Spark (PySpark 4.0.0)</strong> for in-memory distributed transformations, and <strong>Spark MLlib</strong> for distributed model training across 4 regression pipelines and 1 unsupervised clustering pipeline.
          </p>

          <h3 style={{ fontSize: "1.15rem", color: "var(--emerald-light)", marginBottom: "0.8rem" }}>Core Architectural Pillars</h3>
          <ul style={{ paddingLeft: "1.4rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>
            <li><strong>Fault-Tolerant Distributed Storage:</strong> Raw CSV and Snappy-compressed Parquet staged under <code>/agriscope</code> on Hadoop HDFS.</li>
            <li><strong>Distributed ETL Engine:</strong> PySpark DataFrame transformations executing distributed cleaning, deduplication, and feature engineering across 455,359 records.</li>
            <li><strong>Target Leakage Prevention:</strong> Mathematical isolation of production variables ensuring zero test-set leakage.</li>
            <li><strong>Real-Time API & Interactive Sandbox:</strong> Asynchronous FastAPI serving sub-50ms predictions and live HDFS cluster metrics.</li>
          </ul>
        </div>
      )}

      {activeSection === "hdfs" && (
        <div className="glass-panel" style={{ padding: "2rem", lineHeight: 1.7 }}>
          <h2 style={{ fontSize: "1.4rem", color: "#ffffff", marginBottom: "1rem" }}>2. HDFS Layout & Distributed Schema Design</h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "1.2rem" }}>
            HDFS structure follows standard enterprise data lake partitioning zones:
          </p>

          <div style={{ background: "#070b12", padding: "1.2rem", borderRadius: "10px", border: "1px solid var(--border-subtle)", fontFamily: "var(--font-mono)", fontSize: "0.82rem", color: "var(--emerald-light)", marginBottom: "1.5rem" }}>
            {`/agriscope
├── raw/                      # Immutable raw landed data (CSV)
│   └── apy/crop-wise-area-production-yield.csv
├── staging/                  # Validated schema Parquet
│   └── validated/apy_parquet/
├── processed/                # Curated and feature-engineered datasets
│   ├── cleaned/              # Quality audited Parquet
│   └── features/             # Vector-assembled ML features
├── analytics/                # Pre-computed BI aggregates
│   └── aggregates/ (yield_trends, state_rankings, kpis, etc.)
├── models/                   # Serialized Spark MLlib pipeline models
│   ├── linear_regression/
│   ├── decision_tree/
│   ├── random_forest/
│   ├── gradient_boosted_trees/
│   └── kmeans/
└── results/                  # Evaluation metrics & cluster assignments`}
          </div>

          <h3 style={{ fontSize: "1.15rem", color: "var(--teal-accent)", marginBottom: "0.8rem" }}>Essential HDFS Shell Commands</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.85rem" }}>
            <div><code>hdfs dfs -ls -R /agriscope</code> — Recursive inspection of project namespace</div>
            <div><code>hdfs dfs -du -h /agriscope</code> — Human-readable storage utilization</div>
            <div><code>hdfs dfs -cat /agriscope/analytics/aggregates/kpis/part-00000</code> — View precomputed KPIs</div>
          </div>
        </div>
      )}

      {activeSection === "spark" && (
        <div className="glass-panel" style={{ padding: "2rem", lineHeight: 1.7 }}>
          <h2 style={{ fontSize: "1.4rem", color: "#ffffff", marginBottom: "1rem" }}>3. PySpark ETL & MLlib Algorithms</h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "1.2rem" }}>
            The machine learning pipeline evaluates 5 algorithms on 443,078 feature records with an 80/20 train/test split (seed=42):
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
            <div style={{ background: "rgba(255,255,255,0.02)", padding: "1rem", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
              <div style={{ fontWeight: 700, color: "#ffffff", marginBottom: "4px" }}>Linear Regression</div>
              <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>ElasticNet (L1/L2) regularized baseline. MAE: 1.28, RMSE: 6.70, R²: 0.7720</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.02)", padding: "1rem", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
              <div style={{ fontWeight: 700, color: "#ffffff", marginBottom: "4px" }}>Decision Tree Regressor</div>
              <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>Depth 8 recursive partitioning. MAE: 1.15, RMSE: 5.42, R²: 0.8508</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.02)", padding: "1rem", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
              <div style={{ fontWeight: 700, color: "#ffffff", marginBottom: "4px" }}>Random Forest Regressor</div>
              <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>25 Trees ensemble with bagging. MAE: 1.18, RMSE: 5.37, R²: 0.8532</div>
            </div>
            <div style={{ background: "rgba(16,185,129,0.08)", padding: "1rem", borderRadius: "8px", border: "1px solid rgba(16,185,129,0.3)" }}>
              <div style={{ fontWeight: 700, color: "var(--emerald-light)", marginBottom: "4px" }}>Gradient-Boosted Trees (Champion)</div>
              <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>20 iterations boosting with shrinkage. MAE: 1.13, RMSE: 5.34, R²: 0.8550</div>
            </div>
          </div>
        </div>
      )}

      {activeSection === "viva" && (
        <div className="glass-panel" style={{ padding: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1.4rem" }}>
            <HelpCircle size={22} color="var(--amber-light)" />
            <h2 style={{ fontSize: "1.4rem", color: "#ffffff", margin: 0 }}>Examiner Viva Voce Question Bank</h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
            {vivaQuestions.map((item, idx) => (
              <div key={idx} style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "10px",
                padding: "1.2rem",
              }}>
                <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#ffffff", marginBottom: "8px" }}>
                  Q{idx + 1}: {item.q}
                </div>
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
                  {item.a}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
