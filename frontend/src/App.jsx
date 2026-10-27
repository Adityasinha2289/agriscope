/**
 * NEXGram — Crop Yield Intelligence & Big Data Analytics Platform
 * Architecture & Implementation: Developed by Aditya Sinha
 * B.Tech CSET-371 Big Data Analytics & Business Intelligence
 */
import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import OverviewTab from "./components/OverviewTab";
import DatasetTab from "./components/DatasetTab";
import PipelineTab from "./components/PipelineTab";
import AnalyticsTab from "./components/AnalyticsTab";
import ModelsTab from "./components/ModelsTab";
import PredictionTab from "./components/PredictionTab";
import ClusteringTab from "./components/ClusteringTab";
import ReportsTab from "./components/ReportsTab";
import DocsTab from "./components/DocsTab";
import FarmerMode from "./components/FarmerMode";
import PresentationModal from "./components/PresentationModal";
import { fetchHealth, fetchOverviewAnalytics } from "./services/api";

export default function App() {
  // App Experience Mode: 'analyst' (default) or 'farmer'
  const [appMode, setAppMode] = useState(() => {
    return localStorage.getItem("nexgram_mode") || localStorage.getItem("agriscope_mode") || "analyst";
  });

  const [activeTab, setActiveTab] = useState("overview");
  const [health, setHealth] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [isPresentationOpen, setIsPresentationOpen] = useState(false);

  function handleSetAppMode(mode) {
    setAppMode(mode);
    localStorage.setItem("nexgram_mode", mode);
  }

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [h, a] = await Promise.all([
          fetchHealth().catch(() => null),
          fetchOverviewAnalytics().catch(() => null),
        ]);
        setHealth(h);
        setAnalytics(a);
      } catch (e) {
        console.error("Initial load error:", e);
      }
    }
    loadInitialData();

    // Poll health every 25s
    const interval = setInterval(async () => {
      try {
        const h = await fetchHealth();
        setHealth(h);
      } catch (e) {}
    }, 25000);

    return () => clearInterval(interval);
  }, []);

  // Global shortcut 'p' to open presentation
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.key === "p" || e.key === "P") && appMode === "analyst" && !isPresentationOpen) {
        // Only if not typing in input
        if (!["INPUT", "SELECT", "TEXTAREA"].includes(e.target.tagName)) {
          setIsPresentationOpen(true);
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [appMode, isPresentationOpen]);

  // If in Farmer Mode, render dedicated Farmer-First interface
  if (appMode === "farmer") {
    return <FarmerMode onSwitchToAnalyst={() => handleSetAppMode("analyst")} />;
  }

  // Otherwise, render full academic Analyst Dashboard
  return (
    <div className="app-shell">
      {/* Apple-Style Slim Navigation Sidebar & Mobile Drawer */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        health={health}
        onSwitchToFarmerMode={() => handleSetAppMode("farmer")}
        onOpenPresentation={() => setIsPresentationOpen(true)}
      />

      {/* Main Workspace Container */}
      <div className="main-content-wrapper">
        <main className="content-container">
          {activeTab === "overview" && (
            <OverviewTab
              health={health}
              analytics={analytics}
              setActiveTab={setActiveTab}
              onSwitchToFarmerMode={() => handleSetAppMode("farmer")}
              onOpenPresentation={() => setIsPresentationOpen(true)}
            />
          )}
          {activeTab === "analytics" && <AnalyticsTab analytics={analytics} />}
          {activeTab === "dataset" && <DatasetTab />}
          {activeTab === "predict" && <PredictionTab />}
          {activeTab === "models" && <ModelsTab />}
          {activeTab === "clustering" && <ClusteringTab />}
          {activeTab === "pipeline" && <PipelineTab />}
          {activeTab === "reports" && <ReportsTab />}
          {activeTab === "docs" && <DocsTab />}
        </main>

        {/* Quiet, Minimalist Academic Footer */}
        <footer className="apple-footer">
          <div className="footer-content">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontWeight: 600, color: "var(--color-forest)" }}>NEXGram</span>
              <span>—</span>
              <span>Agricultural Intelligence Platform</span>
              <span className="dot-divider">•</span>
              <span>Developed by Aditya Sinha</span>
              <span className="dot-divider">•</span>
              <span>B.Tech CSET-371</span>
            </div>
            <div style={{ color: "var(--text-tertiary)" }}>
              Apache Hadoop HDFS • Apache Spark • FastAPI • Apple HIG Principles
            </div>
          </div>
        </footer>
      </div>

      {/* Presentation Mode Walkthrough Modal */}
      <PresentationModal
        isOpen={isPresentationOpen}
        onClose={() => setIsPresentationOpen(false)}
        onSwitchToFarmerMode={() => handleSetAppMode("farmer")}
      />

      <style>{`
        .app-shell {
          display: flex;
          min-height: 100vh;
          background-color: var(--bg-app);
        }

        .main-content-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          overflow-y: auto;
        }

        .content-container {
          flex: 1;
          max-width: 1360px;
          width: 100%;
          margin: 0 auto;
          padding: 36px 40px;
        }

        .apple-footer {
          border-top: 1px solid var(--border-subtle);
          background-color: #FFFFFF;
          padding: 20px 40px;
          font-size: 0.8125rem;
          color: var(--text-secondary);
        }

        .footer-content {
          max-width: 1360px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
        }

        .dot-divider {
          color: var(--border-subtle);
        }

        @media (max-width: 900px) {
          .app-shell {
            flex-direction: column;
          }

          .content-container {
            padding: 20px 16px;
          }

          .apple-footer {
            padding: 16px;
            font-size: 0.75rem;
          }

          .footer-content {
            flex-direction: column;
            align-items: flex-start;
            gap: 6px;
          }
        }
      `}</style>
    </div>
  );
}
