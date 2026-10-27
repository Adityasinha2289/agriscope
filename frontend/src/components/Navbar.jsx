import React from "react";
import { 
  Sprout, 
  Database, 
  Cpu, 
  BarChart3, 
  GitBranch, 
  BrainCircuit, 
  Sliders, 
  PieChart, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react";

export default function Navbar({ activeTab, setActiveTab, health }) {
  const navItems = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "dataset", label: "HDFS Dataset", icon: Database },
    { id: "pipeline", label: "Spark Pipeline", icon: GitBranch },
    { id: "analytics", label: "Yield Intelligence", icon: PieChart },
    { id: "models", label: "ML Leaderboard", icon: BrainCircuit },
    { id: "predict", label: "Yield Sandbox", icon: Sliders },
    { id: "clustering", label: "K-Means Clusters", icon: Cpu },
    { id: "docs", label: "Academic Report", icon: BookOpen },
  ];

  const isHdfsConnected = health?.hdfs?.connected;

  return (
    <header style={{
      position: "sticky",
      top: 0,
      zIndex: 100,
      background: "rgba(10, 14, 23, 0.85)",
      backdropFilter: "blur(20px)",
      borderBottom: "1px solid var(--border-subtle)",
      padding: "0.8rem 2rem",
    }}>
      <div style={{
        maxWidth: "1440px",
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1.5rem"
      }}>
        {/* Logo and Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }} onClick={() => setActiveTab("overview")}>
          <div style={{
            background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
            padding: "8px",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 15px rgba(16, 185, 129, 0.4)"
          }}>
            <Sprout size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "1.35rem", fontWeight: 800, letterSpacing: "-0.03em", color: "#ffffff" }}>
                Agri<span style={{ color: "var(--emerald-light)" }}>Scope</span>
              </span>
              <span className="badge badge-emerald" style={{ fontSize: "0.68rem" }}>v1.0 MLlib</span>
            </div>
            <p style={{ fontSize: "0.72rem", color: "var(--text-subtle)", margin: 0, fontWeight: 500 }}>
              Hadoop HDFS & PySpark Intelligence Platform
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  padding: "8px 14px",
                  borderRadius: "10px",
                  fontSize: "0.86rem",
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? "#ffffff" : "var(--text-muted)",
                  background: isActive ? "rgba(16, 185, 129, 0.15)" : "transparent",
                  border: isActive ? "1px solid rgba(16, 185, 129, 0.35)" : "1px solid transparent",
                  cursor: "pointer",
                  transition: "all var(--transition-fast)",
                  boxShadow: isActive ? "0 0 12px rgba(16, 185, 129, 0.2)" : "none",
                }}
              >
                <Icon size={16} color={isActive ? "var(--emerald-light)" : "var(--text-subtle)"} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Live Status Indicators */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 12px",
            borderRadius: "20px",
            background: isHdfsConnected ? "rgba(16, 185, 129, 0.1)" : "rgba(244, 63, 94, 0.1)",
            border: isHdfsConnected ? "1px solid rgba(16, 185, 129, 0.25)" : "1px solid rgba(244, 63, 94, 0.3)",
            fontSize: "0.75rem",
            fontWeight: 600,
          }}>
            <span className={isHdfsConnected ? "pulsing-dot" : ""} style={!isHdfsConnected ? { width: 8, height: 8, borderRadius: "50%", background: "#f43f5e" } : {}} />
            <span style={{ color: isHdfsConnected ? "var(--emerald-light)" : "#f43f5e" }}>
              {isHdfsConnected ? "HDFS: Port 9000 Active" : "HDFS: Offline"}
            </span>
          </div>

          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "6px 12px",
            borderRadius: "20px",
            background: "rgba(6, 182, 212, 0.1)",
            border: "1px solid rgba(6, 182, 212, 0.25)",
            fontSize: "0.75rem",
            fontWeight: 600,
            color: "#38bdf8",
          }}>
            <Cpu size={13} />
            <span>Spark 4.0.0 MLlib</span>
          </div>
        </div>
      </div>
    </header>
  );
}
