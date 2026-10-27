import React, { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Filler,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import { ArrowUpRight, ArrowRight, Sprout, GraduationCap } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Filler
);

export default function OverviewTab({ analytics, setActiveTab, onSwitchToFarmerMode, onOpenPresentation }) {
  const kpis = analytics?.kpis || {};
  const trends = analytics?.yield_trends || [];
  const states = analytics?.top_states || [];

  // 4 Essential KPIs
  const kpiItems = [
    {
      label: "Records Analyzed",
      value: (kpis.total_records || 446321).toLocaleString(),
      subtext: "Quality-audited crop records",
    },
    {
      label: "Crops Monitored",
      value: (kpis.distinct_crops || 98).toString(),
      subtext: "Cereals, pulses, spices & cash crops",
    },
    {
      label: "Regions Covered",
      value: `${kpis.distinct_states || 34} States`,
      subtext: `${kpis.distinct_districts || 737} districts across India`,
    },
    {
      label: "Timeline Span",
      value: kpis.year_coverage || "1997–2022",
      subtext: "25-year longitudinal history",
    },
  ];

  // Primary Trend Chart Data (Clean Apple-style line)
  const trendChartData = useMemo(() => {
    return {
      labels: trends.map((t) => t.start_year || t.Year || ""),
      datasets: [
        {
          data: trends.map((t) => t.avg_yield || 0),
          borderColor: "#375534", // Olive
          backgroundColor: "rgba(55, 85, 52, 0.06)",
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointHoverBackgroundColor: "#0F2A1D",
          fill: true,
          tension: 0.3,
        },
      ],
    };
  }, [trends]);

  const trendChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#0F2A1D",
        titleFont: { size: 12, weight: "bold", family: "-apple-system, sans-serif" },
        bodyFont: { size: 12, family: "-apple-system, sans-serif" },
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: (context) => `Yield: ${context.parsed.y.toFixed(2)} Tonnes / Ha`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: "#536557",
          font: { size: 10 },
          maxRotation: 45,
          autoSkip: true,
          maxTicksLimit: 12,
        },
        border: { display: false },
      },
      y: {
        grid: { color: "#E1E7DC", drawBorder: false },
        ticks: { color: "#536557", font: { size: 10 } },
        border: { display: false },
      },
    },
  };

  // Top States Chart Data (Clean Sage Bar)
  const topStatesData = useMemo(() => {
    const top7 = states.slice(0, 7);
    return {
      labels: top7.map((s) => s.state_name || s.State || ""),
      datasets: [
        {
          data: top7.map((s) => s.avg_yield || 0),
          backgroundColor: "#6B9071", // Sage
          borderRadius: 4,
          barThickness: 16,
        },
      ],
    };
  }, [states]);

  const topStatesOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#0F2A1D",
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: (context) => `Avg Yield: ${context.parsed.y.toFixed(1)} T/Ha`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#536557", font: { size: 10 }, maxRotation: 20 },
        border: { display: false },
      },
      y: {
        grid: { color: "#E1E7DC", drawBorder: false },
        ticks: { color: "#536557", font: { size: 10 } },
        border: { display: false },
      },
    },
  };

  return (
    <div className="page-container animate-in">
      {/* Top Header & Viva Voce Actions */}
      <div className="page-header">
        <div>
          <h1 className="page-header-title">Agricultural Overview</h1>
          <p className="page-header-desc">
            Explore crop productivity, historical trends, and model performance across India.
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {onOpenPresentation && (
            <button 
              className="btn-apple-secondary"
              onClick={onOpenPresentation}
              style={{ gap: "6px" }}
            >
              <GraduationCap size={15} color="var(--color-olive)" />
              <span>Presentation Mode</span>
            </button>
          )}

          <button 
            className="btn-apple-secondary"
            onClick={() => setActiveTab("predict")}
          >
            <span>Run Prediction</span>
            <ArrowRight size={14} color="var(--color-olive)" />
          </button>
          <button 
            className="btn-apple-primary"
            onClick={() => setActiveTab("models")}
          >
            <span>Model Leaderboard</span>
          </button>
        </div>
      </div>

      {/* Dual Experience Mode Selection Card */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1.3fr 1fr",
        gap: "16px",
        borderRadius: "var(--radius-lg)",
        backgroundColor: "#FFFFFF",
        border: "1px solid var(--border-subtle)",
        overflow: "hidden",
        boxShadow: "var(--shadow-card)",
      }}>
        <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <span className="status-pill status-pill-brand">Active Experience: Analyst Mode</span>
            <span style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>B.Tech CSET-371</span>
          </div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-forest)", margin: "0 0 6px", letterSpacing: "-0.01em" }}>
            Dual-Audience Agricultural Intelligence
          </h2>
          <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.5, margin: "0 0 16px" }}>
            Switch between the comprehensive research platform (Spark pipelines, HDFS schemas, and ML holdout matrices) and the simplified <strong>Farmer Mode</strong> for ordinary cultivators.
          </p>
          <div>
            <button
              onClick={onSwitchToFarmerMode}
              className="btn-apple-primary"
              style={{ padding: "8px 16px", fontSize: "0.8125rem", gap: "6px" }}
            >
              <Sprout size={16} />
              <span>Switch to Farmer Mode</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        <div style={{
          backgroundImage: "url('/images/healthy_crop_harvest.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center 40%",
          minHeight: "140px",
          position: "relative",
        }}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, #FFFFFF 0%, transparent 60%)" }} />
        </div>
      </div>

      {/* 4 Restrained KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        {kpiItems.map((item, idx) => (
          <div key={idx} className="kpi-card">
            <span className="kpi-card-label">{item.label}</span>
            <span className="kpi-card-value tabular-numbers">{item.value}</span>
            <span className="kpi-card-subtext">{item.subtext}</span>
          </div>
        ))}
      </div>

      {/* Main Analytical Section (2 Column) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(440px, 1fr))", gap: "20px" }}>
        {/* Primary Trend Chart */}
        <div className="apple-card" style={{ padding: "20px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "16px" }}>
            <div>
              <h3 style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--color-forest)" }}>
                National Average Yield Trajectory
              </h3>
              <p style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginTop: "2px" }}>
                1997–2022 Longitudinal trend across all cultivation zones
              </p>
            </div>
            <span className="status-pill status-pill-brand">
              +32.4% Overall Gain
            </span>
          </div>

          <div style={{ height: "230px", width: "100%" }}>
            <Line data={trendChartData} options={trendChartOptions} />
          </div>
        </div>

        {/* Secondary Productivity Chart */}
        <div className="apple-card" style={{ padding: "20px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "16px" }}>
            <div>
              <h3 style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--color-forest)" }}>
                Top States by Agricultural Productivity
              </h3>
              <p style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginTop: "2px" }}>
                Weighted historical yield (Tonnes per Hectare)
              </p>
            </div>
            <button 
              className="btn-apple-subtle" 
              style={{ padding: "2px 6px", fontSize: "0.75rem" }}
              onClick={() => setActiveTab("analytics")}
            >
              <span>View All 34</span>
              <ArrowUpRight size={12} />
            </button>
          </div>

          <div style={{ height: "230px", width: "100%" }}>
            <Bar data={topStatesData} options={topStatesOptions} />
          </div>
        </div>
      </div>

      {/* Compact Secondary Section */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "16px" }}>
        {/* Agricultural Insight */}
        <div className="apple-card" style={{ padding: "20px 24px" }}>
          <div style={{ fontSize: "0.6875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-tertiary)", marginBottom: "8px" }}>
            Key Agronomic Finding
          </div>
          <h4 style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--color-forest)", margin: "0 0 6px" }}>
            High-Yield Clustering in Southern & Northern Irrigated Basins
          </h4>
          <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>
            Longitudinal analysis reveals that southern and northwestern states achieve significantly higher per-hectare productivity due to structured irrigation canal networks and mechanized planting, while rainfed central tracts experience seasonal variability.
          </p>
        </div>

        {/* Model Status Card */}
        <div className="apple-card" style={{ padding: "20px 24px" }}>
          <div style={{ fontSize: "0.6875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-tertiary)", marginBottom: "8px" }}>
            Model Laboratory Status
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px", margin: "0 0 6px" }}>
            <h4 style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--color-forest)", margin: 0 }}>
              Gradient-Boosted Trees
            </h4>
            <span className="status-pill status-pill-brand">R² = 0.8550</span>
          </div>
          <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>
            4 MLlib regression models evaluated on 88,574 holdout records. GBT minimizes residual variance with an RMSE of 5.34 T/Ha with strict target leakage isolation.
          </p>
        </div>
      </div>
    </div>
  );
}
