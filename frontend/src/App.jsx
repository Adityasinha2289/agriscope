import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import OverviewTab from "./components/OverviewTab";
import DatasetTab from "./components/DatasetTab";
import PipelineTab from "./components/PipelineTab";
import AnalyticsTab from "./components/AnalyticsTab";
import ModelsTab from "./components/ModelsTab";
import PredictionTab from "./components/PredictionTab";
import ClusteringTab from "./components/ClusteringTab";
import DocsTab from "./components/DocsTab";
import { fetchHealth, fetchOverviewAnalytics } from "./services/api";

export default function App() {
  const [activeTab, setActiveTab] = useState("overview");
  const [health, setHealth] = useState(null);
  const [analytics, setAnalytics] = useState(null);

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

    // Poll health every 15s
    const interval = setInterval(async () => {
      try {
        const h = await fetchHealth();
        setHealth(h);
      } catch (e) {}
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Navigation Bar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} health={health} />

      {/* Main Container */}
      <main style={{
        maxWidth: "1440px",
        width: "100%",
        margin: "0 auto",
        padding: "2rem",
        flex: 1,
      }}>
        {activeTab === "overview" && (
          <OverviewTab health={health} analytics={analytics} setActiveTab={setActiveTab} />
        )}
        {activeTab === "dataset" && <DatasetTab />}
        {activeTab === "pipeline" && <PipelineTab />}
        {activeTab === "analytics" && <AnalyticsTab />}
        {activeTab === "models" && <ModelsTab />}
        {activeTab === "predict" && <PredictionTab />}
        {activeTab === "clustering" && <ClusteringTab />}
        {activeTab === "docs" && <DocsTab />}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid var(--border-subtle)",
        background: "rgba(10, 14, 23, 0.9)",
        padding: "1.5rem 2rem",
        marginTop: "3rem",
        textAlign: "center",
        fontSize: "0.82rem",
        color: "var(--text-subtle)",
      }}>
        <div style={{ maxWidth: "1440px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <strong>AgriScope</strong> — B.Tech CSET-371 Big Data Analytics and Business Intelligence Project
          </div>
          <div>
            Engineered with Apache Hadoop HDFS, Apache Spark (PySpark), FastAPI & React
          </div>
        </div>
      </footer>
    </div>
  );
}
