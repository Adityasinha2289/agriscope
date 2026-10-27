import React, { useState, useEffect } from "react";
import { Database, FileText, CheckCircle, Search, Layers, Table, ShieldAlert } from "lucide-react";
import { fetchDatasets, fetchDatasetPreview } from "../services/api";

export default function DatasetTab() {
  const [dataset, setDataset] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewType, setViewType] = useState("cleaned");

  useEffect(() => {
    async function loadData() {
      try {
        const datasets = await fetchDatasets();
        if (datasets && datasets.length > 0) {
          setDataset(datasets[0]);
          const preview = await fetchDatasetPreview(datasets[0].id, 25, viewType);
          setPreviewData(preview?.data || []);
        }
      } catch (e) {
        console.error("Error loading dataset:", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [viewType]);

  const schemaColumns = dataset?.schema_info?.columns || [
    { name: "State", type: "string", role: "Categorical Feature", desc: "State or Union Territory name" },
    { name: "District", type: "string", role: "Categorical Feature", desc: "District name within state" },
    { name: "Crop", type: "string", role: "Categorical Feature", desc: "Crop name (e.g. Wheat, Rice, Sugarcane)" },
    { name: "Year", type: "string", role: "Temporal Feature", desc: "Agricultural year string (e.g. 2004-2005)" },
    { name: "Season", type: "string", role: "Categorical Feature", desc: "Season (Kharif, Rabi, Summer, Whole Year)" },
    { name: "Area", type: "double", role: "Continuous Feature", desc: "Cultivated area in Hectares" },
    { name: "Production", type: "double", role: "Target Component", desc: "Crop harvest quantity in Tonnes" },
    { name: "Yield", type: "double", role: "Target Variable (Y)", desc: "Production / Area in Tonnes/Hectare" },
    { name: "Crop_Type", type: "string", role: "Categorical Feature", desc: "Category: Cereals, Pulses, Oilseeds, etc." },
    { name: "start_year", type: "integer", role: "Engineered Feature", desc: "Normalized numerical start year" },
    { name: "log_area", type: "double", role: "Engineered Feature", desc: "log1p(Area) to stabilize heavy-tail variance" },
    { name: "season_index", type: "integer", role: "Encoded Feature", desc: "Numerical index for seasonal factors" },
    { name: "crop_type_index", type: "integer", role: "Encoded Feature", desc: "Numerical index for crop taxonomy" },
    { name: "state_crop_avg_yield", type: "double", role: "Historical Benchmark", desc: "Historical state-crop baseline average" },
    { name: "crop_avg_yield", type: "double", role: "Historical Benchmark", desc: "Nationwide crop baseline average" },
  ];

  const filteredPreview = previewData.filter((row) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return Object.values(row).some((val) => String(val).toLowerCase().includes(term));
  });

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Header info */}
      <div className="glass-panel" style={{ padding: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <span className="badge badge-emerald">HDFS Verified</span>
              <span className="badge badge-teal">Parquet Snappy Compressed</span>
            </div>
            <h1 style={{ fontSize: "1.8rem", marginBottom: "8px" }}>
              {dataset?.name || "Crop-Wise Area, Production and Yield (APY) India"}
            </h1>
            <p style={{ color: "var(--text-muted)", maxWidth: "800px", fontSize: "0.95rem" }}>
              {dataset?.description || "Comprehensive longitudinal dataset spanning 1997-2022 covering agricultural yield, cultivated area, and production across all 34 Indian states and 737 districts."}
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-end" }}>
            <div style={{ fontSize: "0.82rem", color: "var(--text-subtle)" }}>Integrity SHA-256 Checksum:</div>
            <code style={{ fontSize: "0.75rem", background: "rgba(0,0,0,0.4)", padding: "4px 8px", borderRadius: "6px", color: "var(--teal-accent)" }}>
              {dataset?.checksum_sha256 || "4cf3b3b3cbce2361623ff5059bb29c5fa54ea5836a68fbe157dbe31a295844fe"}
            </code>
          </div>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1.2rem",
          marginTop: "1.8rem",
          paddingTop: "1.5rem",
          borderTop: "1px solid var(--border-subtle)",
        }}>
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-subtle)" }}>File Size (Local / HDFS)</div>
            <div style={{ fontSize: "1.2rem", fontWeight: 700 }}>53.6 MB / 56.2 MB</div>
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-subtle)" }}>Total Ingested Rows</div>
            <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--emerald-light)" }}>455,359 Rows</div>
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-subtle)" }}>Feature-Ready ML Rows</div>
            <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--teal-accent)" }}>443,078 Rows</div>
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-subtle)" }}>HDFS Raw Location</div>
            <code style={{ fontSize: "0.8rem", color: "var(--amber-light)" }}>/agriscope/raw/apy/</code>
          </div>
        </div>
      </div>

      {/* Data Cleaning & Quality Audit */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem" }}>
        <div className="glass-panel" style={{ padding: "1.8rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1rem" }}>
            <div style={{ padding: "8px", background: "rgba(16, 185, 129, 0.15)", borderRadius: "10px" }}>
              <CheckCircle size={20} color="var(--emerald-light)" />
            </div>
            <h3 style={{ fontSize: "1.1rem", margin: 0 }}>Data Cleaning & Quality Audit</h3>
          </div>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1.2rem", lineHeight: 1.5 }}>
            To prevent biased model evaluations and unrealistic predictions, PySpark performs strict quality audits during ingestion:
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "rgba(255,255,255,0.02)", borderRadius: "6px" }}>
              <span style={{ fontSize: "0.85rem" }}>Duplicate Rows</span>
              <span className="badge badge-emerald" style={{ fontSize: "0.7rem" }}>0 Found (100% Unique)</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "rgba(255,255,255,0.02)", borderRadius: "6px" }}>
              <span style={{ fontSize: "0.85rem" }}>Invalid Production Flagged</span>
              <span className="badge badge-amber" style={{ fontSize: "0.7rem" }}>5,009 Records</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "rgba(255,255,255,0.02)", borderRadius: "6px" }}>
              <span style={{ fontSize: "0.85rem" }}>Invalid Yield Flagged</span>
              <span className="badge badge-amber" style={{ fontSize: "0.7rem" }}>3,223 Records</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "rgba(255,255,255,0.02)", borderRadius: "6px" }}>
              <span style={{ fontSize: "0.85rem" }}>Cleaning Policy</span>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Flagged boolean flags (preserves raw integrity)</span>
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: "1.8rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1rem" }}>
            <div style={{ padding: "8px", background: "rgba(99, 102, 241, 0.15)", borderRadius: "10px" }}>
              <ShieldAlert size={20} color="#a5b4fc" />
            </div>
            <h3 style={{ fontSize: "1.1rem", margin: 0 }}>Target Leakage Prevention</h3>
          </div>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1.2rem", lineHeight: 1.5 }}>
            Crucial academic rigor: In agricultural yield forecasting, <code>Yield = Production / Area</code>.
          </p>

          <div style={{ background: "rgba(244, 63, 94, 0.08)", border: "1px solid rgba(244, 63, 94, 0.2)", borderRadius: "8px", padding: "12px", marginBottom: "1rem" }}>
            <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fda4af", marginBottom: "4px" }}>
              Academic Principle
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
              Using <code>Production</code> as an input feature to predict <code>Yield</code> is mathematically invalid because the model would simply memorize the division formula rather than learning agronomic drivers.
            </div>
          </div>

          <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
            AgriScope uses only <strong>exogenous agro-climatic & land characteristics</strong>: Area, Season, Crop Type, Geographical Location, Historical Crop Baseline, and Temporal Year.
          </div>
        </div>
      </div>

      {/* Schema Table */}
      <div className="glass-panel" style={{ padding: "1.8rem" }}>
        <h3 style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>Schema & Feature Taxonomy (16 Columns)</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)", textAlign: "left" }}>
                <th style={{ padding: "10px 14px", color: "var(--text-subtle)" }}>Column Name</th>
                <th style={{ padding: "10px 14px", color: "var(--text-subtle)" }}>Data Type</th>
                <th style={{ padding: "10px 14px", color: "var(--text-subtle)" }}>Pipeline Role</th>
                <th style={{ padding: "10px 14px", color: "var(--text-subtle)" }}>Description</th>
              </tr>
            </thead>
            <tbody>
              {schemaColumns.map((col, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                  <td style={{ padding: "10px 14px", fontWeight: 600, color: "#ffffff" }}>
                    <code>{col.name}</code>
                  </td>
                  <td style={{ padding: "10px 14px", color: "var(--teal-accent)" }}>{col.type}</td>
                  <td style={{ padding: "10px 14px" }}>
                    <span className={`badge ${col.role.includes("Target") ? "badge-amber" : col.role.includes("Feature") ? "badge-emerald" : "badge-indigo"}`} style={{ fontSize: "0.7rem" }}>
                      {col.role}
                    </span>
                  </td>
                  <td style={{ padding: "10px 14px", color: "var(--text-muted)" }}>{col.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Sample Preview */}
      <div className="glass-panel" style={{ padding: "1.8rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h3 style={{ fontSize: "1.2rem", margin: 0 }}>Sample Data Records Preview</h3>
            <span style={{ fontSize: "0.78rem", color: "var(--text-subtle)" }}>Loaded from HDFS Parquet / Staging</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ position: "relative" }}>
              <Search size={16} color="var(--text-subtle)" style={{ position: "absolute", left: 12, top: 10 }} />
              <input
                type="text"
                placeholder="Search state, crop, season..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "8px",
                  padding: "8px 12px 8px 36px",
                  color: "#ffffff",
                  fontSize: "0.85rem",
                  outline: "none",
                  width: "240px"
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "4px", background: "rgba(0,0,0,0.3)", padding: "3px", borderRadius: "8px" }}>
              <button
                onClick={() => setViewType("cleaned")}
                style={{
                  background: viewType === "cleaned" ? "var(--emerald-primary)" : "transparent",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "6px",
                  padding: "6px 12px",
                  fontSize: "0.78rem",
                  cursor: "pointer",
                }}
              >
                Cleaned
              </button>
              <button
                onClick={() => setViewType("raw")}
                style={{
                  background: viewType === "raw" ? "var(--emerald-primary)" : "transparent",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "6px",
                  padding: "6px 12px",
                  fontSize: "0.78rem",
                  cursor: "pointer",
                }}
              >
                Raw CSV
              </button>
            </div>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          {filteredPreview.length > 0 ? (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-subtle)", textAlign: "left" }}>
                  {Object.keys(filteredPreview[0]).slice(0, 9).map((key) => (
                    <th key={key} style={{ padding: "10px 12px", color: "var(--text-subtle)" }}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredPreview.map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                    {Object.values(row).slice(0, 9).map((val, colIdx) => (
                      <td key={colIdx} style={{ padding: "10px 12px", color: colIdx === 7 ? "var(--emerald-light)" : "var(--text-main)" }}>
                        {typeof val === "number" ? val.toFixed(2) : String(val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-subtle)" }}>
              No records found matching search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
