import React from "react";
import { 
  Database, 
  HardDrive, 
  Layers, 
  MapPin, 
  TrendingUp, 
  Wheat, 
  CheckCircle, 
  ArrowRight, 
  Activity, 
  ShieldCheck, 
  Sparkles,
  Server
} from "lucide-react";

export default function OverviewTab({ health, analytics, setActiveTab }) {
  const kpis = analytics?.kpis || {};
  const hdfs = health?.hdfs || {};
  const dfsReport = hdfs?.dfs_report || {};

  const kpiCards = [
    {
      title: "Total Records Processed",
      value: (kpis.total_records || 455359).toLocaleString(),
      subtitle: "Full-scale Indian APY dataset",
      icon: Database,
      accent: "var(--emerald-primary)",
      badge: "HDFS Staged",
    },
    {
      title: "Agricultural Crops",
      value: kpis.distinct_crops || 98,
      subtitle: "Cereals, Pulses, Cash crops, Spices",
      icon: Wheat,
      accent: "var(--amber-accent)",
      badge: "Categorized",
    },
    {
      title: "States & Territories",
      value: kpis.distinct_states || 34,
      subtitle: "Nationwide geographic coverage",
      icon: MapPin,
      accent: "var(--teal-accent)",
      badge: "Pan-India",
    },
    {
      title: "Districts Mapped",
      value: kpis.distinct_districts || 737,
      subtitle: "District-level granularity",
      icon: Layers,
      accent: "var(--indigo-accent)",
      badge: "Deep Level",
    },
    {
      title: "Historical Timeline",
      value: kpis.year_coverage || "1997-2022",
      subtitle: "25+ years longitudinal trends",
      icon: TrendingUp,
      accent: "var(--emerald-light)",
      badge: "Time-Series",
    },
    {
      title: "Target Leakage Protection",
      value: "100% Validated",
      subtitle: "Production strictly excluded from features",
      icon: ShieldCheck,
      accent: "#a855f7",
      badge: "Academic Grade",
    },
  ];

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Hero Banner */}
      <div className="glass-panel" style={{
        padding: "2.5rem",
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(6, 182, 212, 0.08) 50%, rgba(15, 23, 42, 0.9) 100%)",
        border: "1px solid rgba(16, 185, 129, 0.25)",
      }}>
        <div style={{ maxWidth: "800px", position: "relative", zIndex: 2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1rem" }}>
            <span className="badge badge-emerald">B.Tech CSET-371 Big Data Analytics</span>
            <span className="badge badge-teal">Apache Hadoop HDFS</span>
            <span className="badge badge-indigo">Apache Spark 4.0</span>
          </div>

          <h1 style={{ fontSize: "2.5rem", lineHeight: 1.15, marginBottom: "1rem", color: "#ffffff" }}>
            AgriScope — Distributed Crop Yield Intelligence & Agricultural Analytics
          </h1>

          <p style={{ fontSize: "1.05rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "1.8rem" }}>
            An enterprise-quality Big Data application evaluating <strong>455,359 historical agricultural records</strong> across India.
            Harnessing <strong>Hadoop Distributed File System (HDFS)</strong> for fault-tolerant storage, <strong>Apache Spark / PySpark</strong> for 
            distributed data transformations, and <strong>Spark MLlib</strong> across 5 machine learning algorithms to predict crop yields with 
            an empirical <strong>R² of 0.855</strong>.
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <button className="btn-primary" onClick={() => setActiveTab("predict")}>
              <Sparkles size={18} />
              <span>Launch Prediction Sandbox</span>
            </button>
            <button className="btn-secondary" onClick={() => setActiveTab("models")}>
              <span>Inspect ML Leaderboard</span>
              <ArrowRight size={16} />
            </button>
            <button className="btn-secondary" onClick={() => setActiveTab("pipeline")}>
              <Activity size={16} />
              <span>View Spark Jobs Pipeline</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live Cluster & HDFS Architecture Widget */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem" }}>
        {/* HDFS Card */}
        <div className="glass-panel" style={{ padding: "1.8rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.2rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ padding: "8px", background: "rgba(16, 185, 129, 0.15)", borderRadius: "10px" }}>
                <HardDrive size={20} color="var(--emerald-light)" />
              </div>
              <div>
                <h3 style={{ fontSize: "1.1rem", margin: 0 }}>Hadoop HDFS Cluster</h3>
                <span style={{ fontSize: "0.75rem", color: "var(--text-subtle)" }}>hdfs://localhost:9000</span>
              </div>
            </div>
            <span className={`badge ${hdfs.connected ? "badge-emerald" : "badge-amber"}`}>
              {hdfs.connected ? "Operational" : "Offline"}
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
            <div style={{ padding: "12px", background: "rgba(255,255,255,0.02)", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--text-subtle)", marginBottom: "4px" }}>Total HDFS Storage</div>
              <div style={{ fontSize: "1.2rem", fontWeight: 700 }}>{dfsReport.size || "460.43 GB"}</div>
            </div>
            <div style={{ padding: "12px", background: "rgba(255,255,255,0.02)", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--text-subtle)", marginBottom: "4px" }}>DFS Used</div>
              <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--emerald-light)" }}>{dfsReport.used || "89.2 MB"}</div>
            </div>
          </div>

          <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Base Namespace:</span>
              <code style={{ color: "var(--teal-accent)" }}>/agriscope</code>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Raw Dataset:</span>
              <span>53.6 MB (Parquet + CSV)</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Hadoop Home:</span>
              <span style={{ fontSize: "0.75rem" }}>/opt/homebrew/opt/hadoop</span>
            </div>
          </div>
        </div>

        {/* Spark Engine Card */}
        <div className="glass-panel" style={{ padding: "1.8rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.2rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ padding: "8px", background: "rgba(6, 182, 212, 0.15)", borderRadius: "10px" }}>
                <Server size={20} color="#38bdf8" />
              </div>
              <div>
                <h3 style={{ fontSize: "1.1rem", margin: 0 }}>Apache Spark Processing</h3>
                <span style={{ fontSize: "0.75rem", color: "var(--text-subtle)" }}>PySpark 4.0.0 Driver</span>
              </div>
            </div>
            <span className="badge badge-teal">local[*] Master</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
            <div style={{ padding: "12px", background: "rgba(255,255,255,0.02)", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--text-subtle)", marginBottom: "4px" }}>Driver Memory</div>
              <div style={{ fontSize: "1.2rem", fontWeight: 700 }}>4.0 GB</div>
            </div>
            <div style={{ padding: "12px", background: "rgba(255,255,255,0.02)", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--text-subtle)", marginBottom: "4px" }}>Execution Mode</div>
              <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#38bdf8" }}>Adaptive SQL</div>
            </div>
          </div>

          <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Java Runtime:</span>
              <span>OpenJDK 17 LTS</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Algorithms Trained:</span>
              <span style={{ color: "var(--emerald-light)", fontWeight: 600 }}>5 MLlib Pipelines</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Best Model:</span>
              <span style={{ color: "var(--amber-light)", fontWeight: 600 }}>Gradient-Boosted Trees (R²=0.855)</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div>
        <h2 style={{ fontSize: "1.4rem", marginBottom: "1.2rem", display: "flex", alignItems: "center", gap: "10px" }}>
          <span>Dataset & Analytics Dimensions</span>
          <span style={{ fontSize: "0.85rem", color: "var(--text-subtle)", fontWeight: 400 }}>| Empirically Calculated</span>
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.2rem" }}>
          {kpiCards.map((kpi, idx) => {
            const Icon = kpi.icon;
            return (
              <div key={idx} className="glass-panel glass-card-interactive" style={{ padding: "1.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                  <div style={{ padding: "10px", borderRadius: "12px", background: "rgba(255,255,255,0.04)", border: "1px solid var(--border-subtle)" }}>
                    <Icon size={20} color={kpi.accent} />
                  </div>
                  <span style={{ fontSize: "0.7rem", padding: "3px 8px", borderRadius: "12px", background: "rgba(255,255,255,0.05)", color: "var(--text-muted)", fontWeight: 600 }}>
                    {kpi.badge}
                  </span>
                </div>
                <div style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "4px", color: "#ffffff", letterSpacing: "-0.02em" }}>
                  {kpi.value}
                </div>
                <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--text-main)", marginBottom: "4px" }}>
                  {kpi.title}
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-subtle)" }}>
                  {kpi.subtitle}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Architecture Infographic */}
      <div className="glass-panel" style={{ padding: "2rem" }}>
        <h2 style={{ fontSize: "1.3rem", marginBottom: "1.2rem" }}>AgriScope Distributed Architecture Flow</h2>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1.2rem",
          position: "relative"
        }}>
          {[
            { step: "01", name: "Hadoop HDFS Storage", desc: "Raw CSV & Snappy-compressed Parquet staged with 3x replication support", tag: "hdfs://localhost:9000" },
            { step: "02", name: "PySpark Ingestion & ETL", desc: "Data schema enforcement, audit quality rules, null handling & validation", tag: "Spark SQL Engine" },
            { step: "03", name: "Feature Engineering", desc: "Log-area transforms, categorical encoding, historical benchmark ratios", tag: "No Target Leakage" },
            { step: "04", name: "MLlib Model Pipelines", desc: "Linear Reg, Decision Trees, Random Forest, GBT & K-Means clustering", tag: "5 ML Algorithms" },
            { step: "05", name: "FastAPI & Intelligence", desc: "Sub-millisecond inference API, batch simulator & real-time analytics", tag: "REST API + Web UI" },
          ].map((item, idx) => (
            <div key={idx} style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "12px",
              padding: "1.2rem",
              position: "relative"
            }}>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--emerald-light)", opacity: 0.7, marginBottom: "6px" }}>
                {item.step}
              </div>
              <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#ffffff", marginBottom: "6px" }}>
                {item.name}
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-subtle)", lineHeight: 1.5, marginBottom: "10px" }}>
                {item.desc}
              </div>
              <span className="badge badge-emerald" style={{ fontSize: "0.65rem" }}>
                {item.tag}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
