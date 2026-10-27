import React, { useState } from "react";
import {
  BookOpen,
  HelpCircle,
  HardDrive,
  Cpu,
  ChevronDown,
  ChevronRight,
  Terminal,
  CheckCircle2,
  Layers,
  Sparkles
} from "lucide-react";

export default function DocsTab() {
  const [activeSection, setActiveSection] = useState("overview");
  const [openFaq, setOpenFaq] = useState({ 0: true, 1: true });

  const vivaQuestions = [
    {
      q: "Why is Hadoop HDFS necessary for this project instead of a standard relational database?",
      a: "Hadoop HDFS provides fault-tolerant, horizontally scalable distributed storage across commodity clusters with block-level replication (default 128MB blocks). In agricultural intelligence, longitudinal state and district time-series datasets scale into tens of millions of sensor, satellite, and district records. HDFS allows high-throughput streaming reads for distributed compute engines like Apache Spark, enabling data locality where compute tasks execute on the physical worker nodes where data blocks reside, eliminating expensive cross-network data transfer."
    },
    {
      q: "What is target leakage in crop yield prediction, and how does AgriScope prevent it?",
      a: "In agricultural statistics, Yield is mathematically defined as Production divided by Area (Yield = Production / Area). If Production is included as an input feature to predict Yield, machine learning models trivially learn the algebraic division formula, reaching an artificial R² of 0.99 without capturing any genuine agronomic relationships. In real-world pre-harvest forecasting, Production is completely unknown. AgriScope strictly enforces leakage prevention by dropping Production from feature sets and training only on exogenous variables: Cultivated Area, Agricultural Season, Crop Taxonomy, Geographical District, and Historical Technology Trend."
    },
    {
      q: "Explain why Gradient-Boosted Trees (GBT) outperformed Linear Regression and Decision Trees.",
      a: "Crop yield dynamics across India exhibit extreme non-linearities and high-order feature interactions (e.g., specific crops thrive only in specific agro-ecological seasons, with diminishing returns to scale on large plots). Linear Regression is fundamentally constrained to additive linear hyperplanes (R² = 0.772). Single Decision Trees suffer from high variance and overfitting (R² = 0.851). Gradient-Boosted Trees sequentially construct ensembles of shallow trees where each consecutive tree minimizes the pseudo-residuals of previous estimators, achieving the lowest test RMSE (5.34 Tonnes/Ha) and highest R² (0.855)."
    },
    {
      q: "How does Apache Spark ensure fault tolerance and performance during distributed ETL?",
      a: "Spark relies on Resilient Distributed Datasets (RDDs) and Directed Acyclic Graph (DAG) execution plans. If a partition fails during execution, Spark recomputes only the lost partition from the lineage DAG rather than re-running the entire ETL job. Performance is accelerated through in-memory caching, catalyst optimizer query tree transformations, Snappy-compressed columnar Parquet storage, and whole-stage code generation."
    },
    {
      q: "What is the purpose of K-Means clustering in this academic agricultural platform?",
      a: "K-Means provides unsupervised crop and district profiling without requiring manual labels. By segmenting 443,078 records along yield intensity, acreage scale, and seasonal distribution (achieving a Silhouette Score of 0.4749 at k=5), AgriScope discovers natural agro-economic typologies: intensive smallholder cash crops, rainfed low-yield pulses, commercial high-yield sugar plantations, and extensive cereal basins. This enables targeted district-level policy interventions."
    }
  ];

  const sections = [
    { id: "overview", label: "Architecture & Pillars" },
    { id: "hdfs", label: "HDFS Storage Layout" },
    { id: "spark", label: "PySpark & MLlib Pipeline" },
    { id: "viva", label: "Examiner Viva Voce Prep" },
  ];

  const toggleFaq = (idx) => {
    setOpenFaq(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Page Header */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
          <span className="status-pill status-pill-brand">
            B.Tech CSET-371 Big Data Analytics
          </span>
          <span className="status-pill status-pill-neutral">
            Academic Technical Documentation
          </span>
        </div>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 600, color: "var(--color-forest)", letterSpacing: "-0.02em", margin: 0 }}>
          System Architecture & Viva Guide
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", marginTop: "6px", maxWidth: "800px", lineHeight: 1.5 }}>
          Engineering specifications, distributed HDFS schema design, PySpark ETL logic, mathematical leakage prevention, and academic viva voce review.
        </p>
      </div>

      {/* Segmented Section Navigation */}
      <div style={{
        display: "inline-flex",
        background: "var(--bg-surface-subtle)",
        padding: "4px",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--border-subtle)",
        gap: "4px",
        alignSelf: "flex-start",
        flexWrap: "wrap",
      }}>
        {sections.map((sec) => {
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              style={{
                padding: "8px 16px",
                borderRadius: "var(--radius-sm)",
                border: "none",
                fontSize: "0.8125rem",
                fontWeight: isActive ? 600 : 500,
                color: isActive ? "var(--color-forest)" : "var(--text-secondary)",
                backgroundColor: isActive ? "#ffffff" : "transparent",
                boxShadow: isActive ? "var(--shadow-card)" : "none",
                cursor: "pointer",
                transition: "all var(--transition-fast)",
              }}
            >
              {sec.label}
            </button>
          );
        })}
      </div>

      {/* Section 1: Architecture & Pillars */}
      {activeSection === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div className="apple-card" style={{ padding: "28px" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--color-forest)", marginBottom: "12px", letterSpacing: "-0.01em" }}>
              1. Executive Summary & Problem Formulation
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", lineHeight: 1.6, marginBottom: "16px" }}>
              Agricultural crop yield forecasting in India is challenged by immense geographical diversity, heterogeneous regional reporting standards, and extreme non-linearities across seasons and land sizes. Monolithic databases fail to handle longitudinal analytical queries spanning 25+ years across 737 districts with sub-second response times.
            </p>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", lineHeight: 1.6, marginBottom: "24px" }}>
              <strong>AgriScope</strong> establishes an enterprise-grade distributed Big Data platform combining <strong>Apache Hadoop HDFS</strong> for scalable distributed raw staging, <strong>Apache Spark (PySpark 4.0.0)</strong> for in-memory distributed transformations, and <strong>Spark MLlib</strong> for distributed model training across 4 regression pipelines and 1 unsupervised clustering pipeline.
            </p>

            <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--color-forest)", marginBottom: "16px" }}>
              Core Engineering Pillars
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
              <div style={{ padding: "18px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-surface-subtle)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <HardDrive size={18} color="var(--color-olive)" />
                  <span style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--color-forest)" }}>Fault-Tolerant Storage</span>
                </div>
                <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>
                  Raw CSV and Snappy-compressed Parquet staged under <code>/agriscope</code> on Hadoop HDFS with block replication and data locality.
                </p>
              </div>

              <div style={{ padding: "18px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-surface-subtle)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <Cpu size={18} color="var(--color-olive)" />
                  <span style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--color-forest)" }}>Distributed PySpark ETL</span>
                </div>
                <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>
                  Resilient DataFrame transformations executing distributed cleaning, deduplication, and vector assembly across 455,359 historical records.
                </p>
              </div>

              <div style={{ padding: "18px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-surface-subtle)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <CheckCircle2 size={18} color="var(--color-olive)" />
                  <span style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--color-forest)" }}>Leakage Prevention</span>
                </div>
                <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>
                  Strict mathematical exclusion of Production feature columns to prevent trivial identity mapping and ensure genuine agronomic generalizability.
                </p>
              </div>

              <div style={{ padding: "18px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-surface-subtle)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <Sparkles size={18} color="var(--color-olive)" />
                  <span style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--color-forest)" }}>Sub-50ms Serving API</span>
                </div>
                <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>
                  FastAPI backend with vectorized pre-computed parquet caches serving real-time analytics, ML predictions, and cluster assignments.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 2: HDFS Storage Layout */}
      {activeSection === "hdfs" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div className="apple-card" style={{ padding: "28px" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--color-forest)", marginBottom: "12px", letterSpacing: "-0.01em" }}>
              2. HDFS Layout & Distributed Schema Design
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", lineHeight: 1.6, marginBottom: "20px" }}>
              The AgriScope HDFS namespace strictly adheres to the enterprise medallion storage architecture:
            </p>

            <div style={{
              backgroundColor: "var(--bg-surface-subtle)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-md)",
              padding: "20px",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
              fontSize: "0.8125rem",
              lineHeight: 1.6,
              color: "var(--color-forest)",
              overflowX: "auto",
              marginBottom: "24px"
            }}>
{`/agriscope
├── raw/                         # Raw immutable landed data (Bronze Layer)
│   └── apy/crop-wise-area-production-yield.csv
├── staging/                     # Schema validated, deduplicated Parquet
│   └── validated/apy_parquet/
├── processed/                   # Feature-engineered Silver Layer
│   ├── cleaned/                 # Quality-audited Parquet with imputed yields
│   └── features/                # One-hot encoded & vector-assembled ML features
├── analytics/                   # Pre-computed Gold Layer BI Aggregates
│   └── aggregates/ (yield_trends, state_rankings, kpis, seasonal_distribution)
├── models/                      # Serialized Spark MLlib pipeline binaries
│   ├── linear_regression/
│   ├── decision_tree/
│   ├── random_forest/
│   ├── gradient_boosted_trees/
│   └── kmeans/
└── results/                     # Metric evaluation logs & cluster assignments`}
            </div>

            <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--color-forest)", marginBottom: "12px" }}>
              Standard HDFS Operations Reference
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ padding: "10px 14px", backgroundColor: "#FFFFFF", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)", fontSize: "0.8125rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <code>hdfs dfs -ls -R /agriscope</code>
                <span style={{ color: "var(--text-secondary)", fontSize: "0.75rem" }}>Recursive cluster directory listing</span>
              </div>
              <div style={{ padding: "10px 14px", backgroundColor: "#FFFFFF", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)", fontSize: "0.8125rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <code>hdfs dfs -du -h /agriscope</code>
                <span style={{ color: "var(--text-secondary)", fontSize: "0.75rem" }}>Human-readable disk quota and block usage</span>
              </div>
              <div style={{ padding: "10px 14px", backgroundColor: "#FFFFFF", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)", fontSize: "0.8125rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <code>hdfs dfs -cat /agriscope/analytics/aggregates/kpis/part-00000</code>
                <span style={{ color: "var(--text-secondary)", fontSize: "0.75rem" }}>Direct inspection of precomputed KPI partitions</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 3: PySpark & MLlib Pipeline */}
      {activeSection === "spark" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div className="apple-card" style={{ padding: "28px" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--color-forest)", marginBottom: "12px", letterSpacing: "-0.01em" }}>
              3. PySpark ETL & MLlib Pipeline Evaluation
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", lineHeight: 1.6, marginBottom: "20px" }}>
              The analytical engine trained four supervised regressors and one unsupervised cluster model over 443,078 feature-engineered records using an 80/20 train/test split (seed=42):
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginBottom: "24px" }}>
              <div style={{ padding: "18px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)", backgroundColor: "#FFFFFF" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ fontWeight: 600, color: "var(--color-forest)", fontSize: "0.9375rem" }}>Linear Regression</span>
                  <span className="status-pill status-pill-neutral">Baseline</span>
                </div>
                <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "12px" }}>
                  ElasticNet regularized formulation with L1/L2 penalty mix. Constrained by additive linear assumptions.
                </p>
                <div style={{ display: "flex", gap: "14px", fontSize: "0.75rem", color: "var(--text-primary)" }}>
                  <span>MAE: <strong>1.28</strong></span>
                  <span>RMSE: <strong>6.70</strong></span>
                  <span>R²: <strong>0.7720</strong></span>
                </div>
              </div>

              <div style={{ padding: "18px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)", backgroundColor: "#FFFFFF" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ fontWeight: 600, color: "var(--color-forest)", fontSize: "0.9375rem" }}>Decision Tree</span>
                  <span className="status-pill status-pill-neutral">Non-linear</span>
                </div>
                <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "12px" }}>
                  Max depth 8 recursive partitioner minimizing variance across orthogonal feature boundaries.
                </p>
                <div style={{ display: "flex", gap: "14px", fontSize: "0.75rem", color: "var(--text-primary)" }}>
                  <span>MAE: <strong>1.15</strong></span>
                  <span>RMSE: <strong>5.42</strong></span>
                  <span>R²: <strong>0.8508</strong></span>
                </div>
              </div>

              <div style={{ padding: "18px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)", backgroundColor: "#FFFFFF" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ fontWeight: 600, color: "var(--color-forest)", fontSize: "0.9375rem" }}>Random Forest</span>
                  <span className="status-pill status-pill-neutral">Bagging</span>
                </div>
                <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "12px" }}>
                  25 uncorrelated bootstrap-aggregated trees with feature sub-sampling to reduce tree variance.
                </p>
                <div style={{ display: "flex", gap: "14px", fontSize: "0.75rem", color: "var(--text-primary)" }}>
                  <span>MAE: <strong>1.18</strong></span>
                  <span>RMSE: <strong>5.37</strong></span>
                  <span>R²: <strong>0.8532</strong></span>
                </div>
              </div>

              <div style={{ padding: "18px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-olive)", backgroundColor: "var(--color-pale-green)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ fontWeight: 600, color: "var(--color-forest)", fontSize: "0.9375rem" }}>Gradient-Boosted Trees</span>
                  <span className="status-pill status-pill-brand">Champion</span>
                </div>
                <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "12px" }}>
                  Sequential shallow tree gradient optimization with shrinkage (step size 0.1). Captures complex crop interactions.
                </p>
                <div style={{ display: "flex", gap: "14px", fontSize: "0.75rem", color: "var(--color-forest)" }}>
                  <span>MAE: <strong>1.13</strong></span>
                  <span>RMSE: <strong>5.34</strong></span>
                  <span>R²: <strong>0.8550</strong></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 4: Examiner Viva Voce Prep */}
      {activeSection === "viva" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="apple-card" style={{ padding: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <HelpCircle size={22} color="var(--color-olive)" />
              <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--color-forest)", margin: 0, letterSpacing: "-0.01em" }}>
                Academic Examiner Viva Voce Question Bank
              </h2>
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", lineHeight: 1.6, marginBottom: "24px" }}>
              Key architectural defenses, Big Data concepts, and algorithmic rationales designed specifically for external university viva voce examination.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {vivaQuestions.map((item, idx) => {
                const isOpen = openFaq[idx];
                return (
                  <div
                    key={idx}
                    style={{
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "var(--radius-md)",
                      backgroundColor: "#FFFFFF",
                      overflow: "hidden",
                      transition: "border-color var(--transition-fast)",
                    }}
                  >
                    <button
                      onClick={() => toggleFaq(idx)}
                      style={{
                        width: "100%",
                        padding: "16px 20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        textAlign: "left",
                        gap: "12px",
                      }}
                    >
                      <span style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--color-forest)", lineHeight: 1.4 }}>
                        Q{idx + 1}: {item.q}
                      </span>
                      {isOpen ? (
                        <ChevronDown size={18} color="var(--color-olive)" style={{ flexShrink: 0 }} />
                      ) : (
                        <ChevronRight size={18} color="var(--text-tertiary)" style={{ flexShrink: 0 }} />
                      )}
                    </button>
                    {isOpen && (
                      <div style={{
                        padding: "0 20px 20px",
                        fontSize: "0.875rem",
                        color: "var(--text-secondary)",
                        lineHeight: 1.6,
                        borderTop: "1px solid var(--border-subtle)",
                        paddingTop: "14px",
                        backgroundColor: "var(--bg-surface-subtle)"
                      }}>
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
