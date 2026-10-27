/**
 * NEXGram — Longitudinal Agricultural Analytics & Crop Rankings
 * Architecture & Implementation: Developed by Aditya Sinha
 * B.Tech CSET-371 Big Data Analytics & Business Intelligence
 */
import React, { useState, useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import { Search, Filter, ChevronDown, ChevronUp } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip
);

export default function AnalyticsTab({ analytics }) {
  const [selectedSeason, setSelectedSeason] = useState("All");
  const [metricView, setMetricView] = useState("yield");
  const [cropSearch, setCropSearch] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const trends = analytics?.yield_trends || [];
  const crops = analytics?.top_crops || [];
  const seasons = analytics?.season_distribution || [];
  const cropTypes = analytics?.crop_types || [];

  // Filtered crops for table
  const filteredCrops = useMemo(() => {
    return crops.filter((c) => {
      const name = c.crop_name || c.Crop || "";
      const matchesSearch = name.toLowerCase().includes(cropSearch.toLowerCase());
      return matchesSearch;
    });
  }, [crops, cropSearch]);

  // Primary Trend Chart
  const trendData = useMemo(() => {
    return {
      labels: trends.map((t) => t.start_year || t.Year || ""),
      datasets: [
        {
          label: metricView === "yield" ? "Average Yield (T/Ha)" : "Cultivated Area (Ha)",
          data: trends.map((t) => (metricView === "yield" ? t.avg_yield || 0 : (t.total_area || 0) / 1000000)),
          borderColor: "#375534",
          backgroundColor: "#E3EED4",
          borderWidth: 2,
          pointRadius: 2,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: "#0F2A1D",
          tension: 0.2,
        },
      ],
    };
  }, [trends, metricView]);

  const trendOptions = {
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
          label: (ctx) => `${metricView === "yield" ? "Yield" : "Area"}: ${ctx.parsed.y.toFixed(2)} ${metricView === "yield" ? "T/Ha" : "M Ha"}`,
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

  // Restrained Muted Earth-Tone Doughnut for Seasons
  const seasonColors = ["#0F2A1D", "#375534", "#6B9071", "#AEC3B0", "#D0DEC9", "#8FA996"];
  const seasonData = useMemo(() => {
    return {
      labels: seasons.map((s) => s.season || s.Season || ""),
      datasets: [
        {
          data: seasons.map((s) => s.record_count || 1),
          backgroundColor: seasonColors.slice(0, seasons.length),
          borderWidth: 1,
          borderColor: "#FFFFFF",
        },
      ],
    };
  }, [seasons]);

  // Crop Category Bar Chart
  const cropTypeData = useMemo(() => {
    const sorted = [...cropTypes].sort((a, b) => (b.count || 0) - (a.count || 0)).slice(0, 6);
    return {
      labels: sorted.map((ct) => ct.crop_type || "Category"),
      datasets: [
        {
          data: sorted.map((ct) => ct.count || ct.avg_yield || 0),
          backgroundColor: "#375534",
          borderRadius: 4,
          barThickness: 18,
        },
      ],
    };
  }, [cropTypes]);

  return (
    <div className="page-container animate-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-header-title">Crop Analytics</h1>
          <p className="page-header-desc">
            Longitudinal crop yield, spatial distribution, and taxonomic breakdown across India.
          </p>
        </div>

        {/* Filter Controls */}
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <div style={{ display: "flex", background: "var(--bg-surface-subtle)", borderRadius: "var(--radius-md)", padding: "2px", border: "1px solid var(--border-subtle)" }}>
            <button
              onClick={() => setMetricView("yield")}
              style={{
                border: "none",
                background: metricView === "yield" ? "#FFFFFF" : "transparent",
                color: metricView === "yield" ? "var(--color-forest)" : "var(--text-secondary)",
                padding: "6px 12px",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.8125rem",
                fontWeight: 500,
                cursor: "pointer",
                boxShadow: metricView === "yield" ? "var(--shadow-sm)" : "none",
              }}
            >
              Yield (T/Ha)
            </button>
            <button
              onClick={() => setMetricView("area")}
              style={{
                border: "none",
                background: metricView === "area" ? "#FFFFFF" : "transparent",
                color: metricView === "area" ? "var(--color-forest)" : "var(--text-secondary)",
                padding: "6px 12px",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.8125rem",
                fontWeight: 500,
                cursor: "pointer",
                boxShadow: metricView === "area" ? "var(--shadow-sm)" : "none",
              }}
            >
              Area (Million Ha)
            </button>
          </div>

          <button
            className="btn-apple-secondary"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            style={{ fontSize: "0.8125rem" }}
          >
            <Filter size={14} color="var(--color-olive)" />
            <span>Filters</span>
            {showAdvancedFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Collapsible Filter Panel */}
      {showAdvancedFilters && (
        <div className="apple-card" style={{ padding: "16px 20px", display: "flex", gap: "20px", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", fontWeight: 500 }}>Season Filter:</span>
            <div style={{ display: "flex", gap: "6px" }}>
              {["All", "Kharif", "Rabi", "Summer", "Whole Year"].map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSeason(s)}
                  className="btn-apple-subtle"
                  style={{
                    backgroundColor: selectedSeason === s ? "var(--color-pale-green)" : "transparent",
                    color: selectedSeason === s ? "var(--color-forest)" : "var(--text-secondary)",
                    fontWeight: selectedSeason === s ? 600 : 400,
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Primary Trend Chart */}
      <div className="apple-card" style={{ padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "16px" }}>
          <div>
            <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--color-forest)" }}>
              {metricView === "yield" ? "National Average Yield Trajectory" : "Total Cultivated Area Evolution"}
            </h3>
            <p style={{ fontSize: "0.8125rem", color: "var(--text-tertiary)", marginTop: "2px" }}>
              1997–2022 Agricultural census data across all 737 districts
            </p>
          </div>
          <span className="status-pill status-pill-neutral">
            25-Year Timeline
          </span>
        </div>

        <div style={{ height: "260px", width: "100%" }}>
          <Line data={trendData} options={trendOptions} />
        </div>
      </div>

      {/* 2-Column Analytical Breakdown */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "20px" }}>
        {/* Season Breakdown Doughnut */}
        <div className="apple-card" style={{ padding: "20px 24px" }}>
          <h3 style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--color-forest)", marginBottom: "4px" }}>
            Cultivation by Season
          </h3>
          <p style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginBottom: "16px" }}>
            Record distribution across agricultural cropping cycles
          </p>

          <div style={{ height: "200px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ height: "180px", width: "180px" }}>
              <Doughnut
                data={seasonData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  cutout: "70%",
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      backgroundColor: "#0F2A1D",
                      titleColor: "#FFFFFF",
                      bodyColor: "#E3EED4",
                      padding: 8,
                      cornerRadius: 6,
                    },
                  },
                }}
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "12px", marginTop: "12px" }}>
            {seasons.slice(0, 4).map((s, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: seasonColors[idx] }} />
                <span>{s.season || s.Season}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Taxonomic Breakdown */}
        <div className="apple-card" style={{ padding: "20px 24px" }}>
          <h3 style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--color-forest)", marginBottom: "4px" }}>
            Leading Crop Categories
          </h3>
          <p style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginBottom: "16px" }}>
            Total analyzed records categorized by agronomic classification
          </p>

          <div style={{ height: "220px", width: "100%" }}>
            <Bar
              data={cropTypeData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: { grid: { display: false }, ticks: { color: "#7D8F81", font: { size: 10 } }, border: { display: false } },
                  y: { grid: { color: "#EEF2EB" }, ticks: { color: "#7D8F81", font: { size: 10 } }, border: { display: false } },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Crop Productivity Table */}
      <div className="apple-card" style={{ padding: "20px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h3 style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--color-forest)" }}>
              Crop Productivity Index
            </h3>
            <p style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginTop: "2px" }}>
              Empirical historical metrics calculated across all monitored states
            </p>
          </div>

          <div style={{ position: "relative", minWidth: "220px" }}>
            <Search size={14} color="var(--text-tertiary)" style={{ position: "absolute", left: 10, top: 11 }} />
            <input
              type="text"
              placeholder="Search crops..."
              value={cropSearch}
              onChange={(e) => setCropSearch(e.target.value)}
              className="apple-input"
              style={{ paddingLeft: "32px", fontSize: "0.8125rem", padding: "7px 12px 7px 32px" }}
            />
          </div>
        </div>

        <div className="apple-table-wrapper">
          <table className="apple-table">
            <thead>
              <tr>
                <th>Crop Name</th>
                <th>Category</th>
                <th style={{ textAlign: "right" }}>Avg Yield (T/Ha)</th>
                <th style={{ textAlign: "right" }}>Total Area (Ha)</th>
                <th style={{ textAlign: "right" }}>Total Production (T)</th>
              </tr>
            </thead>
            <tbody>
              {filteredCrops.slice(0, 10).map((crop, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 500, color: "var(--color-forest)" }}>
                    {crop.crop_name || crop.Crop}
                  </td>
                  <td>
                    <span className="status-pill status-pill-neutral">
                      {crop.crop_type || "Standard"}
                    </span>
                  </td>
                  <td style={{ textAlign: "right", fontWeight: 600 }} className="tabular-numbers">
                    {(crop.avg_yield || 0).toFixed(2)}
                  </td>
                  <td style={{ textAlign: "right", color: "var(--text-secondary)" }} className="tabular-numbers">
                    {Math.round(crop.total_area || 0).toLocaleString()}
                  </td>
                  <td style={{ textAlign: "right", color: "var(--text-secondary)" }} className="tabular-numbers">
                    {Math.round(crop.total_production || 0).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
