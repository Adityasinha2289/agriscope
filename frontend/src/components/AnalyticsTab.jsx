import React, { useState, useEffect } from "react";
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  ArcElement, 
  Title, 
  Tooltip, 
  Legend, 
  Filler 
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import { TrendingUp, BarChart2, PieChart, Sparkles, MapPin, Wheat } from "lucide-react";
import { fetchOverviewAnalytics } from "../services/api";

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  ArcElement, 
  Title, 
  Tooltip, 
  Legend, 
  Filler
);

export default function AnalyticsTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchOverviewAnalytics();
        setData(res);
      } catch (e) {
        console.error("Error loading analytics:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const trends = data?.yield_trends || [];
  const states = data?.top_states || [];
  const crops = data?.top_crops || [];
  const seasons = data?.season_distribution || [];
  const cropTypes = data?.crop_types || [];

  // Line Chart: 25-Year Yield Trend
  const trendChartData = {
    labels: trends.map((t) => t.start_year || t.Year || "Year"),
    datasets: [
      {
        label: "Average Yield (Tonnes/Ha)",
        data: trends.map((t) => t.avg_yield || 0),
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.15)",
        fill: true,
        tension: 0.35,
        borderWidth: 2.5,
        pointBackgroundColor: "#10b981",
        pointRadius: 4,
      },
    ],
  };

  const trendChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: "#94a3b8", font: { family: "Outfit" } } },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.9)",
        titleColor: "#ffffff",
        bodyColor: "#34d399",
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(255, 255, 255, 0.05)" },
        ticks: { color: "#64748b" },
      },
      y: {
        grid: { color: "rgba(255, 255, 255, 0.05)" },
        ticks: { color: "#64748b" },
      },
    },
  };

  // Bar Chart: Top 10 States
  const top10States = states.slice(0, 10);
  const statesChartData = {
    labels: top10States.map((s) => s.state_name || s.State),
    datasets: [
      {
        label: "Avg Yield (Tonnes/Ha)",
        data: top10States.map((s) => s.avg_yield || 0),
        backgroundColor: "rgba(6, 182, 212, 0.7)",
        borderRadius: 6,
      },
    ],
  };

  // Doughnut Chart: Seasons
  const seasonChartData = {
    labels: seasons.map((s) => s.season || s.Season || "Season"),
    datasets: [
      {
        data: seasons.map((s) => s.record_count || 1),
        backgroundColor: [
          "#10b981",
          "#06b6d4",
          "#f59e0b",
          "#6366f1",
          "#ec4899",
          "#8b5cf6",
          "#14b8a6",
        ],
        borderWidth: 0,
      },
    ],
  };

  // Bar Chart: Top Crops
  const top10Crops = crops.filter(c => (c.crop_name || c.Crop) !== "Coconut").slice(0, 10);
  const cropsChartData = {
    labels: top10Crops.map((c) => c.crop_name || c.Crop),
    datasets: [
      {
        label: "Avg Yield (Tonnes/Ha)",
        data: top10Crops.map((c) => c.avg_yield || 0),
        backgroundColor: "rgba(245, 158, 11, 0.75)",
        borderRadius: 6,
      },
    ],
  };

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
          <span className="badge badge-emerald">PySpark Aggregates</span>
          <span className="badge badge-teal">Longitudinal 1997-2022</span>
        </div>
        <h1 style={{ fontSize: "1.8rem", margin: 0 }}>Agricultural Yield Intelligence & Trends</h1>
        <p style={{ color: "var(--text-muted)", marginTop: "6px", fontSize: "0.95rem" }}>
          Pre-computed distributed aggregates calculated over 455,359 historical records in Apache Spark.
        </p>
      </div>

      {/* 25-Year Trend Chart */}
      <div className="glass-panel" style={{ padding: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h3 style={{ fontSize: "1.2rem", margin: 0 }}>25-Year Agricultural Yield Trajectory (1997–2022)</h3>
            <span style={{ fontSize: "0.78rem", color: "var(--text-subtle)" }}>Empirical unweighted average yield across all Indian districts</span>
          </div>
          <span className="badge badge-emerald">+32% Long-Term Yield Expansion</span>
        </div>

        <div style={{ height: "320px", width: "100%" }}>
          <Line data={trendChartData} options={trendChartOptions} />
        </div>
      </div>

      {/* States & Seasons Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: "1.5rem" }}>
        {/* Top States */}
        <div className="glass-panel" style={{ padding: "1.8rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <MapPin size={18} color="var(--teal-accent)" />
              <h3 style={{ fontSize: "1.1rem", margin: 0 }}>State-Wise Yield Leaders</h3>
            </div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-subtle)" }}>Tonnes / Hectare</span>
          </div>

          <div style={{ height: "260px" }}>
            <Bar 
              data={statesChartData} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: { grid: { display: false }, ticks: { color: "#64748b", font: { size: 10 } } },
                  y: { grid: { color: "rgba(255,255,255,0.05)" }, ticks: { color: "#64748b" } }
                }
              }} 
            />
          </div>
        </div>

        {/* Season Distribution */}
        <div className="glass-panel" style={{ padding: "1.8rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <PieChart size={18} color="var(--emerald-light)" />
              <h3 style={{ fontSize: "1.1rem", margin: 0 }}>Agricultural Season Distribution</h3>
            </div>
            <span className="badge badge-emerald">Kharif Dominance</span>
          </div>

          <div style={{ height: "260px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ height: "240px", width: "240px" }}>
              <Doughnut 
                data={seasonChartData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: { 
                    legend: { 
                      position: "bottom", 
                      labels: { color: "#94a3b8", font: { size: 10, family: "Plus Jakarta Sans" } } 
                    } 
                  } 
                }} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Crop Rankings Bar Chart */}
      <div className="glass-panel" style={{ padding: "1.8rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Wheat size={18} color="var(--amber-light)" />
            <h3 style={{ fontSize: "1.1rem", margin: 0 }}>Top Agricultural Crops by Productivity</h3>
          </div>
          <span style={{ fontSize: "0.78rem", color: "var(--text-subtle)" }}>Tonnes per Hectare (Excluding Coconut Tree-count)</span>
        </div>

        <div style={{ height: "260px" }}>
          <Bar 
            data={cropsChartData} 
            options={{ 
              responsive: true, 
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                x: { grid: { display: false }, ticks: { color: "#64748b", font: { size: 10 } } },
                y: { grid: { color: "rgba(255,255,255,0.05)" }, ticks: { color: "#64748b" } }
              }
            }} 
          />
        </div>
      </div>
    </div>
  );
}
