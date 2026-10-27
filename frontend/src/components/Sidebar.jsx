import React, { useState } from "react";
import {
  LayoutDashboard,
  LineChart,
  Database,
  SlidersHorizontal,
  FlaskConical,
  Boxes,
  Workflow,
  FileSpreadsheet,
  BookOpen,
  Menu,
  X,
  Server
} from "lucide-react";

export default function Sidebar({ activeTab, setActiveTab, health }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "analytics", label: "Crop Analytics", icon: LineChart },
    { id: "dataset", label: "Dataset", icon: Database },
    { id: "predict", label: "Yield Prediction", icon: SlidersHorizontal },
    { id: "models", label: "Model Laboratory", icon: FlaskConical },
    { id: "clustering", label: "Clusters", icon: Boxes },
    { id: "pipeline", label: "Pipeline", icon: Workflow },
    { id: "reports", label: "Reports", icon: FileSpreadsheet },
  ];

  const secondaryItems = [
    { id: "docs", label: "Documentation", icon: BookOpen },
  ];

  const isHdfsConnected = health?.hdfs?.connected;

  function handleSelect(id) {
    setActiveTab(id);
    setMobileOpen(false);
  }

  return (
    <>
      {/* Mobile Top Header */}
      <header className="mobile-header">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div className="brand-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a10 10 0 0 1 10 10c0 5.5-4.5 10-10 10S2 17.5 2 12A10 10 0 0 1 12 2z"/>
              <path d="M12 6v12"/>
              <path d="M8 10l4-4 4 4"/>
            </svg>
          </div>
          <span style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--color-forest)", letterSpacing: "-0.02em" }}>
            AgriScope
          </span>
        </div>

        <button 
          onClick={() => setMobileOpen(!mobileOpen)}
          className="btn-apple-subtle"
          aria-label="Toggle navigation"
          style={{ padding: "8px" }}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Backdrop for mobile */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 42, 29, 0.2)",
            backdropFilter: "blur(4px)",
            zIndex: 40,
          }}
        />
      )}

      {/* Main Sidebar (Desktop fixed/sticky, Mobile drawer) */}
      <aside className={`apple-sidebar ${mobileOpen ? "open" : ""}`}>
        {/* Brand */}
        <div style={{ padding: "24px 20px 20px", display: "flex", alignItems: "center", gap: "10px" }}>
          <div className="brand-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a10 10 0 0 1 10 10c0 5.5-4.5 10-10 10S2 17.5 2 12A10 10 0 0 1 12 2z"/>
              <path d="M12 6v12"/>
              <path d="M8 10l4-4 4 4"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: "1.05rem", fontWeight: 600, color: "var(--color-forest)", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
              AgriScope
            </div>
            <div style={{ fontSize: "0.6875rem", color: "var(--text-tertiary)", fontWeight: 500 }}>
              Yield Intelligence
            </div>
          </div>
        </div>

        {/* Primary Navigation */}
        <nav style={{ padding: "8px 12px", display: "flex", flexDirection: "column", gap: "2px", flex: 1 }}>
          <div style={{ fontSize: "0.6875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-tertiary)", padding: "8px 10px 4px" }}>
            Platform
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "var(--radius-md)",
                  border: "none",
                  fontSize: "0.875rem",
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? "var(--color-forest)" : "var(--text-secondary)",
                  backgroundColor: isActive ? "var(--color-pale-green)" : "transparent",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background-color var(--transition-fast), color var(--transition-fast)",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = "var(--bg-surface-subtle)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <Icon size={17} strokeWidth={isActive ? 2.2 : 1.8} color={isActive ? "var(--color-olive)" : "var(--color-sage)"} />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div style={{ fontSize: "0.6875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-tertiary)", padding: "16px 10px 4px" }}>
            Resources
          </div>
          {secondaryItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "var(--radius-md)",
                  border: "none",
                  fontSize: "0.875rem",
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? "var(--color-forest)" : "var(--text-secondary)",
                  backgroundColor: isActive ? "var(--color-pale-green)" : "transparent",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background-color var(--transition-fast), color var(--transition-fast)",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = "var(--bg-surface-subtle)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <Icon size={17} strokeWidth={isActive ? 2.2 : 1.8} color={isActive ? "var(--color-olive)" : "var(--color-sage)"} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer / System Status */}
        <div style={{ padding: "16px", borderTop: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-surface-subtle)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className={`dot-indicator ${isHdfsConnected ? "dot-indicator-success" : "dot-indicator-warning"}`} />
              <span style={{ fontSize: "0.75rem", fontWeight: 500, color: "var(--text-secondary)" }}>
                {isHdfsConnected ? "HDFS 9000 Online" : "HDFS Standby"}
              </span>
            </div>
            <span style={{ fontSize: "0.6875rem", color: "var(--text-tertiary)" }}>
              PySpark 4.0
            </span>
          </div>
        </div>
      </aside>

      <style>{`
        .brand-icon {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          background-color: var(--color-olive);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 1px 3px rgba(15, 42, 29, 0.15);
        }

        .apple-sidebar {
          width: 230px;
          background-color: #ffffff;
          border-right: 1px solid var(--border-subtle);
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 0;
          height: 100vh;
          z-index: 30;
          transition: transform var(--transition-normal);
        }

        .mobile-header {
          display: none;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: #ffffff;
          border-bottom: 1px solid var(--border-subtle);
          position: sticky;
          top: 0;
          z-index: 50;
        }

        @media (max-width: 900px) {
          .mobile-header {
            display: flex;
          }
          .apple-sidebar {
            position: fixed;
            top: 0;
            bottom: 0;
            left: 0;
            transform: translateX(-100%);
            box-shadow: var(--shadow-dropdown);
            z-index: 50;
          }
          .apple-sidebar.open {
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
}
