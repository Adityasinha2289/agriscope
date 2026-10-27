import React, { useState, useEffect } from "react";
import { ArrowRight, SlidersHorizontal, Sparkles, CheckCircle2 } from "lucide-react";
import { predictYield, fetchFormOptions } from "../services/api";

export default function PredictionTab() {
  const [options, setOptions] = useState({ states: [], crops: [], seasons: [] });
  const [form, setForm] = useState({
    state_name: "Punjab",
    crop_name: "Wheat",
    season: "Rabi",
    year: 2024,
    area: 100.0,
    algorithm: "gradient_boosted_trees",
  });
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const opts = await fetchFormOptions();
        setOptions(opts || {});
      } catch (e) {
        console.error("Error loading options:", e);
      }
    }
    load();
    handlePredict();
  }, []);

  async function handlePredict(customForm = null) {
    const payload = customForm || form;
    setLoading(true);
    try {
      const res = await predictYield(payload);
      setPrediction(res);
    } catch (e) {
      console.error("Prediction error:", e);
    } finally {
      setLoading(false);
    }
  }

  const presets = [
    { label: "Punjab Wheat (Rabi)", state: "Punjab", crop: "Wheat", season: "Rabi", area: 120 },
    { label: "Tamil Nadu Rice (Kharif)", state: "Tamil Nadu", crop: "Rice", season: "Kharif", area: 80 },
    { label: "UP Sugarcane (Annual)", state: "Uttar Pradesh", crop: "Sugarcane", season: "Whole Year", area: 50 },
    { label: "Maharashtra Cotton", state: "Maharashtra", crop: "Cotton(lint)", season: "Kharif", area: 100 },
  ];

  function applyPreset(preset) {
    const next = {
      ...form,
      state_name: preset.state,
      crop_name: preset.crop,
      season: preset.season,
      area: preset.area,
    };
    setForm(next);
    handlePredict(next);
  }

  return (
    <div className="page-container animate-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-header-title">Yield Prediction</h1>
          <p className="page-header-desc">
            Estimate expected agricultural yield and harvest volume based on historical land characteristics.
          </p>
        </div>

        {/* Quick Scenario Presets */}
        <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginRight: "4px" }}>Presets:</span>
          {presets.map((p, idx) => (
            <button
              key={idx}
              className="btn-apple-subtle"
              onClick={() => applyPreset(p)}
              style={{
                fontSize: "0.75rem",
                padding: "4px 8px",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-sm)",
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "24px" }}>
        {/* Form Panel */}
        <div className="apple-card" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--color-forest)", marginBottom: "16px" }}>
            Scenario Parameters
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* State */}
            <div>
              <label className="apple-label">State or Territory</label>
              <select
                value={form.state_name}
                onChange={(e) => setForm({ ...form, state_name: e.target.value })}
                className="apple-select"
              >
                {options.states.length > 0 ? (
                  options.states.map((s) => <option key={s} value={s}>{s}</option>)
                ) : (
                  ["Punjab", "Haryana", "Uttar Pradesh", "Tamil Nadu", "Maharashtra", "Kerala"].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))
                )}
              </select>
            </div>

            {/* Crop */}
            <div>
              <label className="apple-label">Crop Commodity</label>
              <select
                value={form.crop_name}
                onChange={(e) => setForm({ ...form, crop_name: e.target.value })}
                className="apple-select"
              >
                {options.crops.length > 0 ? (
                  options.crops.map((c) => <option key={c} value={c}>{c}</option>)
                ) : (
                  ["Wheat", "Rice", "Sugarcane", "Maize", "Cotton(lint)", "Potato", "Onion"].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))
                )}
              </select>
            </div>

            {/* Season and Year Row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label className="apple-label">Cropping Season</label>
                <select
                  value={form.season}
                  onChange={(e) => setForm({ ...form, season: e.target.value })}
                  className="apple-select"
                >
                  {options.seasons.length > 0 ? (
                    options.seasons.map((s) => <option key={s} value={s}>{s}</option>)
                  ) : (
                    ["Rabi", "Kharif", "Summer", "Whole Year"].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="apple-label">Target Year</label>
                <input
                  type="number"
                  min="1990"
                  max="2030"
                  value={form.year}
                  onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) || 2024 })}
                  className="apple-input"
                />
              </div>
            </div>

            {/* Cultivated Area */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <label className="apple-label" style={{ margin: 0 }}>Cultivated Area</label>
                <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-olive)" }} className="tabular-numbers">
                  {form.area} Hectares
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="2500"
                step="5"
                value={form.area}
                onChange={(e) => setForm({ ...form, area: parseFloat(e.target.value) })}
                style={{ width: "100%", accentColor: "var(--color-olive)", cursor: "pointer" }}
              />
            </div>

            {/* Algorithm Choice */}
            <div>
              <label className="apple-label">Model Algorithm</label>
              <select
                value={form.algorithm}
                onChange={(e) => setForm({ ...form, algorithm: e.target.value })}
                className="apple-select"
              >
                <option value="gradient_boosted_trees">Gradient-Boosted Trees (Champion, R² = 0.8550)</option>
                <option value="random_forest">Random Forest Regressor (R² = 0.8532)</option>
                <option value="decision_tree">Decision Tree Regressor (R² = 0.8508)</option>
                <option value="linear_regression">Linear Regression (Baseline, R² = 0.7720)</option>
              </select>
            </div>

            {/* Primary Action Button */}
            <button
              className="btn-apple-primary"
              disabled={loading}
              onClick={() => handlePredict()}
              style={{ width: "100%", padding: "10px", marginTop: "8px" }}
            >
              <span>{loading ? "Computing Prediction..." : "Predict Yield"}</span>
            </button>
          </div>
        </div>

        {/* Results Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Main Yield Card */}
          <div className="apple-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="status-pill status-pill-brand">
                Inference Result
              </span>
              <span style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
                Latency: &lt; 35ms
              </span>
            </div>

            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginBottom: "4px" }}>
                Predicted Crop Productivity
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                <span style={{ fontSize: "2.25rem", fontWeight: 600, color: "var(--color-forest)", letterSpacing: "-0.03em" }} className="tabular-numbers">
                  {prediction ? prediction.predicted_yield.toFixed(3) : "—"}
                </span>
                <span style={{ fontSize: "0.9375rem", color: "var(--text-secondary)", fontWeight: 500 }}>
                  Tonnes / Hectare
                </span>
              </div>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              padding: "12px 14px",
              backgroundColor: "var(--bg-surface-subtle)",
              borderRadius: "var(--radius-md)",
            }}>
              <div>
                <div style={{ fontSize: "0.6875rem", color: "var(--text-tertiary)" }}>Total Harvest Volume</div>
                <div style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--color-forest)", marginTop: "2px" }} className="tabular-numbers">
                  {prediction ? prediction.estimated_production.toLocaleString() : "—"}{" "}
                  <span style={{ fontSize: "0.75rem", fontWeight: 400 }}>Tonnes</span>
                </div>
              </div>

              <div>
                <div style={{ fontSize: "0.6875rem", color: "var(--text-tertiary)" }}>95% Confidence Interval</div>
                <div style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--color-olive)", marginTop: "2px" }} className="tabular-numbers">
                  {prediction?.confidence_interval ? (
                    `${prediction.confidence_interval.lower_bound_95} – ${prediction.confidence_interval.upper_bound_95}`
                  ) : "—"}{" "}
                  <span style={{ fontSize: "0.75rem", fontWeight: 400 }}>T/Ha</span>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Contribution Breakdown */}
          <div className="apple-card" style={{ padding: "20px 24px" }}>
            <h4 style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-forest)", marginBottom: "12px" }}>
              Feature Attribution Breakdown
            </h4>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {prediction?.feature_contributions ? (
                Object.entries(prediction.feature_contributions).map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8125rem" }}>
                    <span style={{ color: "var(--text-secondary)" }}>{k}</span>
                    <span style={{ fontWeight: 600, color: v >= 0 ? "var(--color-olive)" : "#a3453b" }} className="tabular-numbers">
                      {v >= 0 ? `+${v.toFixed(3)}` : v.toFixed(3)} T/Ha
                    </span>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: "0.8125rem", color: "var(--text-tertiary)" }}>Computing feature attribution...</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
