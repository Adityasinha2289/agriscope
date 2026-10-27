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
import { ArrowUpRight, ArrowRight } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Filler
);

export default function OverviewTab({ analytics, setActiveTab }) {
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
          borderColor: "#375534",
          backgroundColor: "rgba(227, 238, 212, 0.4)",
          borderWidth: 2,
          fill: true,
          tension: 0.25,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointHoverBackgroundColor: "#0F2A1D",
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
        titleColor: "#FFFFFF",
        bodyColor: "#E3EED4",
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: (context) => `Avg Yield: ${context.parsed.y.toFixed(2)} T/Ha`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#7D8F81", font: { size: 11 } },
        border: { display: false },
      },
      y: {
        grid: { color: "#EEF2EB" },
        ticks: { color: "#7D8F81", font: { size: 11 } },
        border: { display: false },
      },
    },
  };

  // Secondary Chart: Leading 7 States
  const topStates = useMemo(() => states.slice(0, 7), [states]);
  const statesChartData = useMemo(() => {
    return {
      labels: topStates.map((s) => s.state_name || s.State || ""),
      datasets: [
        {
          data: topStates.map((s) => s.avg_yield || 0),
          backgroundColor: "#6B9071",
          borderRadius: 4,
          barThickness: 16,
        },
      ],
    };
  }, [topStates]);

  const statesChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#0F2A1D",
        titleColor: "#FFFFFF",
        bodyColor: "#E3EED4",
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: (context) => `Productivity: ${context.parsed.y.toFixed(1)} T/Ha`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#7D8F81", font: { size: 11 } },
        border: { display: false },
      },
      y: {
        grid: { color: "#EEF2EB" },
        ticks: { color: "#7D8F81", font: { size: 11 } },
        border: { display: false },
      },
    },
  };

  return (
    <div className="page-container animate-in">
      {/* Top Section */}
      <div className="page-header">
        <div>
          <h1 className="page-header-title">Agricultural Overview</h1>
          <p className="page-header-desc">
            Explore crop productivity, historical trends, and model performance across India.
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
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
              onClick={() => setActiveTab("analytics")}
              style={{ fontSize: "0.75rem", padding: "4px 8px" }}
            >
              <span>View All 34</span>
              <ArrowUpRight size={12} />
            </button>
          </div>

          <div style={{ height: "230px", width: "100%" }}>
            <Bar data={statesChartData} options={statesChartOptions} />
          </div>
        </div>
      </div>

      {/* Concise Agricultural Insight Panel */}
      <div className="apple-card" style={{ padding: "20px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--color-olive)", marginBottom: "6px" }}>
              Key Agronomic Finding
            </div>
            <div style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--color-forest)", marginBottom: "4px" }}>
              High-Yield Clustering in Southern & Northern Irrigated Basins
            </div>
            <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              Longitudinal analysis reveals that southern and northwestern states achieve significantly higher per-hectare productivity due to structured irrigation canal networks and mechanized planting, while rainfed central tracts experience seasonal variability.
            </p>
          </div>

          <div style={{ borderLeft: "1px solid var(--border-subtle)", paddingLeft: "24px" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--color-olive)", marginBottom: "6px" }}>
              Model Laboratory Status
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "4px" }}>
              <span style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--color-forest)" }}>
                Gradient-Boosted Trees
              </span>
              <span className="status-pill status-pill-success">
                R² = 0.8550
              </span>
            </div>
            <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              4 MLlib regression models evaluated on 88,574 holdout records. GBT minimizes residual variance with an RMSE of 5.34 T/Ha with strict target leakage isolation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
