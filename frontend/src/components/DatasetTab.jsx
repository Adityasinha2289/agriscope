/**
 * NEXGram — Dataset Exploration & Distributed Parquet Profiling
 * Architecture & Implementation: Developed by Aditya Sinha
 * B.Tech CSET-371 Big Data Analytics & Business Intelligence
 */
import React, { useState, useEffect, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight, ShieldCheck, Database, FileText } from "lucide-react";
import { fetchDatasets, fetchDatasetPreview } from "../services/api";

export default function DatasetTab() {
  const [dataset, setDataset] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState("preview"); // 'preview' | 'schema'
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 15;

  useEffect(() => {
    async function load() {
      try {
        const datasets = await fetchDatasets();
        if (datasets && datasets.length > 0) {
          setDataset(datasets[0]);
          const preview = await fetchDatasetPreview(datasets[0].id, 100, "cleaned");
          setPreviewData(preview?.data || []);
        }
      } catch (e) {
        console.error("Error loading dataset:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const schemaColumns = dataset?.schema_info?.columns || [
    { name: "State", type: "string", role: "Categorical Feature", desc: "State or Union Territory name" },
    { name: "District", type: "string", role: "Categorical Feature", desc: "District administrative unit" },
    { name: "Crop", type: "string", role: "Categorical Feature", desc: "Monitored agricultural crop commodity" },
    { name: "Year", type: "string", role: "Temporal Feature", desc: "Agricultural timeline year (e.g. 2004-2005)" },
    { name: "Season", type: "string", role: "Categorical Feature", desc: "Cropping season (Kharif, Rabi, Summer, Whole Year)" },
    { name: "Area", type: "double", role: "Continuous Feature", desc: "Cultivated land area in Hectares" },
    { name: "Production", type: "double", role: "Target Component", desc: "Crop harvest quantity in Tonnes" },
    { name: "Yield", type: "double", role: "Target Variable", desc: "Crop productivity in Tonnes per Hectare" },
    { name: "Crop_Type", type: "string", role: "Categorical Feature", desc: "Classification: Cereals, Pulses, Oilseeds, Spices" },
    { name: "start_year", type: "integer", role: "Derived Feature", desc: "Numerical start year for trend analysis" },
    { name: "log_area", type: "double", role: "Engineered Feature", desc: "Natural log transform log1p(Area)" },
    { name: "season_index", type: "integer", role: "Encoded Feature", desc: "Encoded numerical seasonal factor" },
    { name: "crop_type_index", type: "integer", role: "Encoded Feature", desc: "Encoded taxonomic category index" },
    { name: "state_crop_avg_yield", type: "double", role: "Historical Benchmark", desc: "Historical state-crop baseline average" },
    { name: "crop_avg_yield", type: "double", role: "Historical Benchmark", desc: "Nationwide historical crop baseline" },
  ];

  const filteredRows = useMemo(() => {
    if (!search) return previewData;
    const q = search.toLowerCase();
    return previewData.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(q))
    );
  }, [previewData, search]);

  const totalPages = Math.ceil(filteredRows.length / pageSize) || 1;
  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, page, pageSize]);

  return (
    <div className="page-container animate-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-header-title">Agricultural Dataset</h1>
          <p className="page-header-desc">
            Primary repository of 455,359 historical agricultural records staged in Hadoop HDFS.
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: "flex", background: "var(--bg-surface-subtle)", borderRadius: "var(--radius-md)", padding: "2px", border: "1px solid var(--border-subtle)" }}>
          <button
            onClick={() => setActiveSubTab("preview")}
            style={{
              border: "none",
              background: activeSubTab === "preview" ? "#FFFFFF" : "transparent",
              color: activeSubTab === "preview" ? "var(--color-forest)" : "var(--text-secondary)",
              padding: "6px 14px",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.8125rem",
              fontWeight: 500,
              cursor: "pointer",
              boxShadow: activeSubTab === "preview" ? "var(--shadow-sm)" : "none",
            }}
          >
            Data Preview
          </button>
          <button
            onClick={() => setActiveSubTab("schema")}
            style={{
              border: "none",
              background: activeSubTab === "schema" ? "#FFFFFF" : "transparent",
              color: activeSubTab === "schema" ? "var(--color-forest)" : "var(--text-secondary)",
              padding: "6px 14px",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.8125rem",
              fontWeight: 500,
              cursor: "pointer",
              boxShadow: activeSubTab === "schema" ? "var(--shadow-sm)" : "none",
            }}
          >
            Schema & Quality Audit
          </button>
        </div>
      </div>

      {/* Dataset Provenance Card */}
      <div className="apple-card" style={{ padding: "20px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginBottom: "4px" }}>Dataset Name</div>
            <div style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--color-forest)" }}>
              {dataset?.name || "Crop-Wise Area, Production and Yield (APY)"}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "2px" }}>
              Indian National Agricultural Census
            </div>
          </div>

          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginBottom: "4px" }}>Ingested & Cleaned Scale</div>
            <div style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--color-forest)" }} className="tabular-numbers">
              455,359 Records (56.2 MB)
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "2px" }}>
              443,078 Feature-Ready Rows
            </div>
          </div>

          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginBottom: "4px" }}>HDFS Staging Path</div>
            <code style={{ fontSize: "0.75rem", color: "var(--color-olive)" }}>
              /agriscope/processed/cleaned
            </code>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "2px" }}>
              Snappy-compressed Parquet
            </div>
          </div>

          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginBottom: "4px" }}>SHA-256 Checksum</div>
            <code style={{ fontSize: "0.6875rem", color: "var(--text-secondary)", wordBreak: "break-all" }}>
              4cf3b3b3cbce2361623ff5059bb29c5fa54ea5836a68fbe157dbe31a295844fe
            </code>
          </div>
        </div>
      </div>

      {/* Tab 1: Data Preview */}
      {activeSubTab === "preview" && (
        <div className="apple-card" style={{ padding: "20px 24px" }}>
          {/* Table Toolbar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
            <div style={{ position: "relative", minWidth: "240px" }}>
              <Search size={14} color="var(--text-tertiary)" style={{ position: "absolute", left: 10, top: 11 }} />
              <input
                type="text"
                placeholder="Filter by state, district, or crop..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="apple-input"
                style={{ paddingLeft: "32px", fontSize: "0.8125rem", padding: "7px 12px 7px 32px" }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
              <span className="tabular-numbers">
                Showing {Math.min((page - 1) * pageSize + 1, filteredRows.length)}–{Math.min(page * pageSize, filteredRows.length)} of {filteredRows.length}
              </span>
              <div style={{ display: "flex", gap: "4px" }}>
                <button
                  className="btn-apple-secondary"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  style={{ padding: "4px 8px" }}
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  className="btn-apple-secondary"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  style={{ padding: "4px 8px" }}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="apple-table-wrapper">
            {paginatedRows.length > 0 ? (
              <table className="apple-table">
                <thead>
                  <tr>
                    <th>State</th>
                    <th>District</th>
                    <th>Crop</th>
                    <th>Season</th>
                    <th>Year</th>
                    <th style={{ textAlign: "right" }}>Area (Ha)</th>
                    <th style={{ textAlign: "right" }}>Production (T)</th>
                    <th style={{ textAlign: "right" }}>Yield (T/Ha)</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRows.map((row, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 500, color: "var(--color-forest)" }}>{row.State || row.state_name}</td>
                      <td>{row.District || row.district_name}</td>
                      <td>{row.Crop || row.crop_name}</td>
                      <td>{row.Season || row.season}</td>
                      <td className="tabular-numbers">{row.Year || row.year}</td>
                      <td style={{ textAlign: "right" }} className="tabular-numbers">
                        {typeof row.Area === "number" ? Math.round(row.Area).toLocaleString() : row.Area}
                      </td>
                      <td style={{ textAlign: "right" }} className="tabular-numbers">
                        {typeof row.Production === "number" ? Math.round(row.Production).toLocaleString() : row.Production}
                      </td>
                      <td style={{ textAlign: "right", fontWeight: 600, color: "var(--color-forest)" }} className="tabular-numbers">
                        {typeof row.Yield === "number" ? row.Yield.toFixed(2) : row.Yield}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: "40px", textAlign: "center", color: "var(--text-tertiary)", fontSize: "0.875rem" }}>
                No records matching your search query.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Schema & Quality Audit */}
      {activeSubTab === "schema" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Quality Summary */}
          <div className="apple-card" style={{ padding: "20px 24px" }}>
            <h3 style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--color-forest)", marginBottom: "12px" }}>
              Data Quality & Audit Diagnostics
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
              <div style={{ padding: "14px", background: "var(--bg-surface-subtle)", borderRadius: "var(--radius-md)" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>Duplicate Records</div>
                <div style={{ fontSize: "1.125rem", fontWeight: 600, color: "#235c2e", marginTop: "2px" }}>
                  0 Duplicates (100% Unique)
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "4px" }}>
                  Verified across compound keys
                </div>
              </div>

              <div style={{ padding: "14px", background: "var(--bg-surface-subtle)", borderRadius: "var(--radius-md)" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>Flagged Production Records</div>
                <div style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--color-forest)", marginTop: "2px" }} className="tabular-numbers">
                  5,009 Records (1.1%)
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "4px" }}>
                  Non-destructively flagged (Production ≤ 0 on positive area)
                </div>
              </div>

              <div style={{ padding: "14px", background: "var(--bg-surface-subtle)", borderRadius: "var(--radius-md)" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>Flagged Yield Outliers</div>
                <div style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--color-forest)", marginTop: "2px" }} className="tabular-numbers">
                  3,223 Records (0.7%)
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "4px" }}>
                  Yield ≤ 0 or non-finite values flagged
                </div>
              </div>
            </div>
          </div>

          {/* Schema Table */}
          <div className="apple-card" style={{ padding: "20px 24px" }}>
            <h3 style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--color-forest)", marginBottom: "16px" }}>
              Column Schema & Pipeline Role Specifications
            </h3>
            <div className="apple-table-wrapper">
              <table className="apple-table">
                <thead>
                  <tr>
                    <th>Column</th>
                    <th>Data Type</th>
                    <th>Pipeline Role</th>
                    <th>Specification</th>
                  </tr>
                </thead>
                <tbody>
                  {schemaColumns.map((col, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600, color: "var(--color-forest)" }}>
                        <code>{col.name}</code>
                      </td>
                      <td style={{ color: "var(--color-olive)", fontFamily: "var(--font-mono)", fontSize: "0.8125rem" }}>
                        {col.type}
                      </td>
                      <td>
                        <span className={`status-pill ${col.role.includes("Target") ? "status-pill-brand" : "status-pill-neutral"}`}>
                          {col.role}
                        </span>
                      </td>
                      <td style={{ color: "var(--text-secondary)" }}>
                        {col.desc}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
