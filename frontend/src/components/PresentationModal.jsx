import React, { useState, useEffect } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  HardDrive,
  Cpu,
  LineChart,
  Trophy,
  Users,
  Compass,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Database,
  Layers,
  ShieldCheck,
  FileText
} from "lucide-react";

export default function PresentationModal({ isOpen, onClose, onSwitchToFarmerMode }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      step: "01 / 07",
      category: "Academic Motivation & Problem Statement",
      title: "Crop Yield Forecasting in India: The Big Data Challenge",
      subtitle: "B.Tech CSET-371 Big Data Analytics & Business Intelligence Project",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <p style={{ fontSize: "1.05rem", color: "var(--color-forest)", lineHeight: 1.6, margin: 0 }}>
            Indian agriculture supports over 58% of rural livelihoods across 737 districts, yet per-hectare productivity varies drastically due to seasonal monsoons, heterogeneous soil agro-climatic zones, and reporting latency.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
            <div style={{ padding: "16px", borderRadius: "10px", backgroundColor: "var(--bg-surface-subtle)", border: "1px solid var(--border-subtle)" }}>
              <div style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--color-olive)" }}>446,321</div>
              <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", marginTop: "4px" }}>Historical APY Records Cleaned</div>
            </div>
            <div style={{ padding: "16px", borderRadius: "10px", backgroundColor: "var(--bg-surface-subtle)", border: "1px solid var(--border-subtle)" }}>
              <div style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--color-olive)" }}>25 Years</div>
              <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", marginTop: "4px" }}>Longitudinal Span (1997–2022)</div>
            </div>
            <div style={{ padding: "16px", borderRadius: "10px", backgroundColor: "var(--bg-surface-subtle)", border: "1px solid var(--border-subtle)" }}>
              <div style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--color-olive)" }}>737 Districts</div>
              <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", marginTop: "4px" }}>Across 34 States & UTs</div>
            </div>
          </div>
          <div style={{ padding: "16px", borderRadius: "10px", border: "1px solid var(--color-olive)", backgroundColor: "var(--color-pale-green)" }}>
            <div style={{ fontWeight: 600, color: "var(--color-forest)", fontSize: "0.9375rem", marginBottom: "4px" }}>Core Problem Formulation:</div>
            <div style={{ fontSize: "0.875rem", color: "var(--color-forest)", lineHeight: 1.5 }}>
              Standard relational databases fail at high-throughput longitudinal aggregations and ML feature pipelines over multi-decade state records. AgriScope combines <strong>Hadoop HDFS</strong> and <strong>Apache Spark MLlib</strong> to deliver scalable storage, leakage-free modeling, and a farmer-first translation layer.
            </div>
          </div>
        </div>
      ),
    },
    {
      step: "02 / 07",
      category: "Dataset Provenance & Quality Audit",
      title: "Ministry of Agriculture APY Primary Corpus",
      subtitle: "Official Data.gov.in Repository with Cryptographic Integrity Verification",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "16px" }}>
            <div style={{ padding: "18px", borderRadius: "10px", backgroundColor: "var(--bg-surface-subtle)", border: "1px solid var(--border-subtle)" }}>
              <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-forest)", marginBottom: "8px" }}>Source Provenance</div>
              <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                • <strong>Dataset:</strong> Crop-wise Area, Production, and Yield (APY)<br />
                • <strong>Custodian:</strong> Directorate of Economics and Statistics (DES), Ministry of Agriculture & Farmers Welfare<br />
                • <strong>Raw Size:</strong> 42.6 MB (455,359 landed records)<br />
                • <strong>Integrity Hash (SHA-256):</strong> <code>e5c8290f...c31b</code>
              </div>
            </div>
            <div style={{ padding: "18px", borderRadius: "10px", backgroundColor: "var(--bg-surface-subtle)", border: "1px solid var(--border-subtle)" }}>
              <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-forest)", marginBottom: "8px" }}>Distributed Cleaning Rules</div>
              <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                • Dropped 9,038 null production rows<br />
                • Enforced positive area (&gt; 0 Ha)<br />
                • Computed mathematical Yield = Production / Area<br />
                • Standardized 98 crop commoditized names
              </div>
            </div>
          </div>
          <div style={{ padding: "14px 18px", borderRadius: "8px", border: "1px solid var(--border-subtle)", backgroundColor: "#FFFFFF", display: "flex", alignItems: "center", gap: "12px" }}>
            <ShieldCheck size={24} color="var(--color-olive)" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
              <strong>Zero Artificial Imputation:</strong> Outlier records (&gt;99.9th percentile) were flagged rather than deleted, preserving genuine high-intensity agricultural clusters (e.g., coconut plantation nuts in Kerala).
            </div>
          </div>
        </div>
      ),
    },
    {
      step: "03 / 07",
      category: "Distributed Big Data Storage",
      title: "Hadoop HDFS Storage Architecture (/agriscope)",
      subtitle: "Medallion Architecture with Block-Level Fault Tolerance and Locality",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <p style={{ fontSize: "0.9375rem", color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>
            AgriScope stages immutable landing files and distributed Parquet tables within a multi-tiered HDFS namespace:
          </p>
          <div style={{
            backgroundColor: "var(--bg-surface-subtle)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "10px",
            padding: "16px",
            fontFamily: "ui-monospace, monospace",
            fontSize: "0.8125rem",
            lineHeight: 1.6,
            color: "var(--color-forest)",
          }}>
{`/agriscope
├── raw/                         # Bronze: Landed CSV (crop-wise-area-production-yield.csv)
├── staging/                     # Silver: Schema-validated, partitioned Parquet
├── processed/                   # Gold: Deduplicated, feature-engineered Parquet (443k rows)
├── analytics/                   # Pre-computed BI aggregates (trends, state & district rankings)
├── models/                      # Serialized Spark MLlib Pipelines (GBT, RF, DT, LR, KMeans)
└── results/                     # Evaluation summaries & cluster assignments`}
          </div>
          <div style={{ display: "flex", gap: "12px", fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><CheckCircle2 size={16} color="var(--color-olive)" /> Default 128MB Block Size</span>
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><CheckCircle2 size={16} color="var(--color-olive)" /> Snappy Compression</span>
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><CheckCircle2 size={16} color="var(--color-olive)" /> Data Locality for Spark Workers</span>
          </div>
        </div>
      ),
    },
    {
      step: "04 / 07",
      category: "Distributed In-Memory Computing",
      title: "PySpark 4.0 Distributed ETL & Target Leakage Prevention",
      subtitle: "DAG Execution Plans with Strict Exclusion of Target Information",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ padding: "16px", borderRadius: "10px", border: "1px solid var(--color-olive)", backgroundColor: "var(--color-pale-green)" }}>
            <div style={{ fontWeight: 700, color: "var(--color-forest)", fontSize: "0.9375rem", marginBottom: "6px" }}>
              Examiner Defense: Why Production CANNOT be an Input Feature
            </div>
            <div style={{ fontSize: "0.875rem", color: "var(--color-forest)", lineHeight: 1.5 }}>
              Since Yield is defined mathematically as <code>Yield = Production / Area</code>, including Production as a feature causes immediate <strong>target leakage</strong>, yielding an artificial R² = 0.999. In real-world pre-harvest forecasting, Production is completely unknown. AgriScope trains solely on exogenous factors: Cultivated Area, Agricultural Season, Geographical Region, and Crop Taxonomy.
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
            <div style={{ padding: "14px", borderRadius: "8px", border: "1px solid var(--border-subtle)", backgroundColor: "#FFFFFF" }}>
              <div style={{ fontWeight: 600, color: "var(--color-forest)", fontSize: "0.875rem" }}>Catalyst Query Optimizer</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "4px" }}>Pushes predicates down into Snappy Parquet files before memory transfer.</div>
            </div>
            <div style={{ padding: "14px", borderRadius: "8px", border: "1px solid var(--border-subtle)", backgroundColor: "#FFFFFF" }}>
              <div style={{ fontWeight: 600, color: "var(--color-forest)", fontSize: "0.875rem" }}>VectorAssembler Pipeline</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "4px" }}>Assembles multi-dimensional numeric & index vectors across 443k rows in parallel.</div>
            </div>
            <div style={{ padding: "14px", borderRadius: "8px", border: "1px solid var(--border-subtle)", backgroundColor: "#FFFFFF" }}>
              <div style={{ fontWeight: 600, color: "var(--color-forest)", fontSize: "0.875rem" }}>Chronological Integrity</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "4px" }}>Fixed random seed 42 with 80/20 train/test holdout (N = 88,574 test samples).</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      step: "05 / 07",
      category: "Machine Learning Evaluation",
      title: "Model Leaderboard & Empirical Benchmark",
      subtitle: "Empirical Comparison Across 4 MLlib Regressors and 1 K-Means Clusterer",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ border: "1px solid var(--border-subtle)", borderRadius: "10px", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem", textAlign: "left" }}>
              <thead>
                <tr style={{ backgroundColor: "var(--bg-surface-subtle)", borderBottom: "1px solid var(--border-subtle)" }}>
                  <th style={{ padding: "10px 14px", color: "var(--text-secondary)" }}>Algorithm</th>
                  <th style={{ padding: "10px 14px", color: "var(--text-secondary)" }}>MAE (T/Ha)</th>
                  <th style={{ padding: "10px 14px", color: "var(--text-secondary)" }}>RMSE (T/Ha)</th>
                  <th style={{ padding: "10px 14px", color: "var(--text-secondary)" }}>R² Score</th>
                  <th style={{ padding: "10px 14px", color: "var(--text-secondary)" }}>Verdict</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td style={{ padding: "10px 14px", fontWeight: 600, color: "var(--color-forest)" }}>Linear Regression</td>
                  <td style={{ padding: "10px 14px" }} className="tabular-numbers">1.2779</td>
                  <td style={{ padding: "10px 14px" }} className="tabular-numbers">6.6974</td>
                  <td style={{ padding: "10px 14px" }} className="tabular-numbers">0.7720</td>
                  <td style={{ padding: "10px 14px" }}><span className="status-pill status-pill-neutral">Baseline</span></td>
                </tr>
                <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td style={{ padding: "10px 14px", fontWeight: 600, color: "var(--color-forest)" }}>Decision Tree</td>
                  <td style={{ padding: "10px 14px" }} className="tabular-numbers">1.1505</td>
                  <td style={{ padding: "10px 14px" }} className="tabular-numbers">5.4169</td>
                  <td style={{ padding: "10px 14px" }} className="tabular-numbers">0.8508</td>
                  <td style={{ padding: "10px 14px" }}><span className="status-pill status-pill-neutral">Non-linear</span></td>
                </tr>
                <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td style={{ padding: "10px 14px", fontWeight: 600, color: "var(--color-forest)" }}>Random Forest</td>
                  <td style={{ padding: "10px 14px" }} className="tabular-numbers">1.1769</td>
                  <td style={{ padding: "10px 14px" }} className="tabular-numbers">5.3743</td>
                  <td style={{ padding: "10px 14px" }} className="tabular-numbers">0.8532</td>
                  <td style={{ padding: "10px 14px" }}><span className="status-pill status-pill-neutral">Bagging</span></td>
                </tr>
                <tr style={{ backgroundColor: "var(--color-pale-green)" }}>
                  <td style={{ padding: "10px 14px", fontWeight: 700, color: "var(--color-forest)" }}>Gradient-Boosted Trees</td>
                  <td style={{ padding: "10px 14px", fontWeight: 700 }} className="tabular-numbers">1.1332</td>
                  <td style={{ padding: "10px 14px", fontWeight: 700 }} className="tabular-numbers">5.3413</td>
                  <td style={{ padding: "10px 14px", fontWeight: 700 }} className="tabular-numbers">0.8550</td>
                  <td style={{ padding: "10px 14px" }}><span className="status-pill status-pill-brand">Champion</span></td>
                </tr>
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>
            GBT outperformed other algorithms because gradient boosting sequentially minimizes pseudo-residuals across complex non-linear seasonal interactions. K-Means clustering (k=5) achieved a Silhouette Score of <strong>0.4749</strong> across acreage and yield intensity.
          </p>
        </div>
      ),
    },
    {
      step: "06 / 07",
      category: "Empirical Agricultural Findings",
      title: "Key Agronomic & Regional Insights Discovered",
      subtitle: "Data-Driven Findings from Longitudinal Distributed PySpark Analysis",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ padding: "16px", borderRadius: "10px", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)" }}>
            <div style={{ fontWeight: 600, color: "var(--color-forest)", fontSize: "0.9375rem", marginBottom: "4px" }}>1. Technology Yield Trajectory (+32.4% Overall Gain)</div>
            <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              National weighted productivity rose from 48.2 Tonnes/Ha (1997) to 63.8 Tonnes/Ha (2022), driven by mechanized canal irrigation in the Indo-Gangetic plain and southern irrigated basins.
            </div>
          </div>
          <div style={{ padding: "16px", borderRadius: "10px", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)" }}>
            <div style={{ fontWeight: 600, color: "var(--color-forest)", fontSize: "0.9375rem", marginBottom: "4px" }}>2. Extreme Regional Disparities</div>
            <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              Kerala (374.6 T/Ha) and Tamil Nadu (251.8 T/Ha) dominate high-yield commercial crops (Coconut, Sugarcane, Banana), whereas central rainfed states (Madhya Pradesh, Rajasthan) exhibit lower average yields (1.1–1.5 T/Ha) dominated by pulses and oilseeds.
            </div>
          </div>
          <div style={{ padding: "16px", borderRadius: "10px", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)" }}>
            <div style={{ fontWeight: 600, color: "var(--color-forest)", fontSize: "0.9375rem", marginBottom: "4px" }}>3. Seasonality Yield Premium</div>
            <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              Rabi (winter harvest) crops systematically outperform Kharif (monsoon) crops in per-hectare productivity consistency due to controlled tube-well irrigation and reduced flood risk.
            </div>
          </div>
        </div>
      ),
    },
    {
      step: "07 / 07",
      category: "Social Impact & Farmer Mode",
      title: "Bridging the Academic Gap: Farmer-First Experience",
      subtitle: "Translating Big Data Analytics into Everyday Agricultural Decisions",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <p style={{ fontSize: "0.9375rem", color: "var(--color-forest)", lineHeight: 1.5, margin: 0 }}>
            Academic platforms frequently fail real stakeholders because complex metrics (R², HDFS block distributions, RMSE) are inaccessible to rural cultivators.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div style={{ padding: "16px", borderRadius: "10px", backgroundColor: "var(--bg-surface-subtle)", border: "1px solid var(--border-subtle)" }}>
              <div style={{ fontWeight: 600, color: "var(--color-forest)", fontSize: "0.875rem", marginBottom: "6px" }}>Analyst Dashboard</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                Designed for professors, researchers & data scientists. Provides Spark pipeline logs, holdout evaluation matrices, multi-year charts, and raw schema audits.
              </div>
            </div>
            <div style={{ padding: "16px", borderRadius: "10px", border: "1px solid var(--color-olive)", backgroundColor: "var(--color-pale-green)" }}>
              <div style={{ fontWeight: 700, color: "var(--color-forest)", fontSize: "0.875rem", marginBottom: "6px" }}>Farmer Mode</div>
              <div style={{ fontSize: "0.75rem", color: "var(--color-forest)", lineHeight: 1.5 }}>
                Designed for ordinary cultivators. Features bilingual English/Hindi support, native farm units (Quintals/Acre), transparent yield projections, and simple regional comparisons.
              </div>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "center", marginTop: "10px" }}>
            <button
              onClick={() => {
                onClose();
                onSwitchToFarmerMode();
              }}
              className="btn-apple-primary"
              style={{ padding: "12px 24px", fontSize: "0.9375rem", gap: "8px" }}
            >
              <span>Launch Live Farmer Mode Demonstration</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      ),
    },
  ];

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e) {
      if (!isOpen) return;
      if (e.key === "ArrowRight") {
        setCurrentSlide((prev) => Math.min(slides.length - 1, prev + 1));
      } else if (e.key === "ArrowLeft") {
        setCurrentSlide((prev) => Math.max(0, prev - 1));
      } else if (e.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, slides.length, onClose]);

  if (!isOpen) return null;

  const current = slides[currentSlide];

  return (
    <div className="presentation-backdrop">
      <div className="presentation-modal apple-card">
        {/* Top Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", padding: "18px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "6px", backgroundColor: "var(--color-olive)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <GraduationCap size={16} color="#FFFFFF" />
            </div>
            <div>
              <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-forest)" }}>
                AgriScope Presentation Mode — B.Tech CSET-371
              </div>
              <div style={{ fontSize: "0.6875rem", color: "var(--text-tertiary)" }}>
                Examiner Viva Voce Guided Walkthrough (10–15 Minutes)
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)", backgroundColor: "var(--bg-surface-subtle)", padding: "4px 8px", borderRadius: "6px" }}>
              Slide {currentSlide + 1} of {slides.length}
            </span>
            <button
              onClick={onClose}
              className="btn-apple-subtle"
              style={{ padding: "6px" }}
              aria-label="Close presentation"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Slide Body */}
        <div style={{ padding: "28px 32px", minHeight: "380px", display: "flex", flexDirection: "column" }}>
          <div style={{ marginBottom: "16px" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-olive)" }}>
              {current.category}
            </div>
            <h2 style={{ fontSize: "1.45rem", fontWeight: 600, color: "var(--color-forest)", letterSpacing: "-0.02em", margin: "4px 0 2px" }}>
              {current.title}
            </h2>
            <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
              {current.subtitle}
            </div>
          </div>

          <div style={{ flex: 1, marginTop: "8px" }}>
            {current.content}
          </div>
        </div>

        {/* Bottom Navigation Controls */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 24px",
          borderTop: "1px solid var(--border-subtle)",
          backgroundColor: "var(--bg-surface-subtle)",
        }}>
          {/* Step Dots */}
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                style={{
                  width: idx === currentSlide ? "24px" : "8px",
                  height: "8px",
                  borderRadius: "4px",
                  backgroundColor: idx === currentSlide ? "var(--color-olive)" : "var(--border-subtle)",
                  border: "none",
                  cursor: "pointer",
                  transition: "all var(--transition-fast)",
                }}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Prev / Next Buttons */}
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => setCurrentSlide((prev) => Math.max(0, prev - 1))}
              disabled={currentSlide === 0}
              className="btn-apple-secondary"
              style={{ padding: "8px 14px", fontSize: "0.8125rem", gap: "6px" }}
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
            </button>

            {currentSlide < slides.length - 1 ? (
              <button
                onClick={() => setCurrentSlide((prev) => Math.min(slides.length - 1, prev + 1))}
                className="btn-apple-primary"
                style={{ padding: "8px 16px", fontSize: "0.8125rem", gap: "6px" }}
              >
                <span>Next Slide</span>
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  onSwitchToFarmerMode();
                }}
                className="btn-apple-primary"
                style={{ padding: "8px 16px", fontSize: "0.8125rem", gap: "6px" }}
              >
                <span>Launch Farmer Mode Demo</span>
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .presentation-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(15, 42, 29, 0.45);
          backdrop-filter: blur(6px);
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .presentation-modal {
          width: 100%;
          max-width: 860px;
          background: #FFFFFF;
          border-radius: var(--radius-lg);
          box-shadow: 0 20px 40px rgba(15, 42, 29, 0.18);
          overflow: hidden;
          animation: slideUp 200ms ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
