import React, { useState, useEffect } from "react";
import { Sliders, Sparkles, TrendingUp, Layers, HelpCircle, Check, ArrowRight, BarChart } from "lucide-react";
import confetti from "canvas-confetti";
import { predictYield, fetchFormOptions } from "../services/api";

export default function PredictionTab() {
  const [options, setOptions] = useState({ states: [], crops: [], seasons: [], algorithms: [] });
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
        const res = await fetchFormOptions();
        setOptions(res || {});
      } catch (e) {
        console.error("Error loading options:", e);
      }
    }
    load();
    // Run initial prediction
    handlePredict();
  }, []);

  async function handlePredict(customForm = null) {
    const payload = customForm || form;
    setLoading(true);
    try {
      const res = await predictYield(payload);
      setPrediction(res);
      // Trigger subtle confetti
      try {
        confetti({
          particleCount: 35,
          spread: 60,
          origin: { y: 0.7 },
          colors: ["#10B981", "#06B6D4", "#F59E0B"],
        });
      } catch (err) {}
    } catch (e) {
      console.error("Prediction error:", e);
    } finally {
      setLoading(false);
    }
  }

  const presets = [
    { name: "Punjab Wheat (Rabi)", state: "Punjab", crop: "Wheat", season: "Rabi", area: 150 },
    { name: "Tamil Nadu Rice (Kharif)", state: "Tamil Nadu", crop: "Rice", season: "Kharif", area: 80 },
    { name: "UP Sugarcane (Commercial)", state: "Uttar Pradesh", crop: "Sugarcane", season: "Whole Year", area: 50 },
    { name: "Maharashtra Cotton (Rainfed)", state: "Maharashtra", crop: "Cotton(lint)", season: "Kharif", area: 120 },
    { name: "Kerala Banana (Plantation)", state: "Kerala", crop: "Banana", season: "Whole Year", area: 40 },
  ];

  function applyPreset(preset) {
    const newForm = {
      ...form,
      state_name: preset.state,
      crop_name: preset.crop,
      season: preset.season,
      area: preset.area,
    };
    setForm(newForm);
    handlePredict(newForm);
  }

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
          <span className="badge badge-emerald">Real-Time Inference</span>
          <span className="badge badge-amber">PySpark MLlib Pipeline</span>
        </div>
        <h1 style={{ fontSize: "1.8rem", margin: 0 }}>Interactive Crop Yield Prediction Sandbox</h1>
        <p style={{ color: "var(--text-muted)", marginTop: "6px", fontSize: "0.95rem" }}>
          Simulate agricultural scenarios with trained machine learning models. Evaluate yields, production estimates, and 95% confidence intervals.
        </p>
      </div>

      {/* Preset Quick Selectors */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
        <span style={{ fontSize: "0.82rem", color: "var(--text-subtle)", fontWeight: 600 }}>Quick Scenarios:</span>
        {presets.map((p, idx) => (
          <button
            key={idx}
            onClick={() => applyPreset(p)}
            style={{
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "20px",
              padding: "6px 14px",
              fontSize: "0.78rem",
              color: "var(--text-main)",
              cursor: "pointer",
              transition: "all var(--transition-fast)",
            }}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Main Grid: Form + Hero Result */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "2rem" }}>
        {/* Input Parameters Form */}
        <div className="glass-panel" style={{ padding: "2rem" }}>
          <h3 style={{ fontSize: "1.2rem", marginBottom: "1.4rem", display: "flex", alignItems: "center", gap: "8px" }}>
            <Sliders size={18} color="var(--emerald-light)" />
            <span>Scenario Parameters</span>
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
            {/* State */}
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", color: "var(--text-subtle)", marginBottom: "6px" }}>
                Select State / Territory
              </label>
              <select
                value={form.state_name}
                onChange={(e) => setForm({ ...form, state_name: e.target.value })}
                style={{
                  width: "100%",
                  background: "rgba(0, 0, 0, 0.4)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  color: "#ffffff",
                  fontSize: "0.9rem",
                  outline: "none",
                }}
              >
                {options.states.length > 0 ? (
                  options.states.map((s) => <option key={s} value={s}>{s}</option>)
                ) : (
                  ["Punjab", "Haryana", "Uttar Pradesh", "Tamil Nadu", "Maharashtra", "Kerala", "Gujarat"].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))
                )}
              </select>
            </div>

            {/* Crop */}
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", color: "var(--text-subtle)", marginBottom: "6px" }}>
                Select Agricultural Crop
              </label>
              <select
                value={form.crop_name}
                onChange={(e) => setForm({ ...form, crop_name: e.target.value })}
                style={{
                  width: "100%",
                  background: "rgba(0, 0, 0, 0.4)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  color: "#ffffff",
                  fontSize: "0.9rem",
                  outline: "none",
                }}
              >
                {options.crops.length > 0 ? (
                  options.crops.map((c) => <option key={c} value={c}>{c}</option>)
                ) : (
                  ["Wheat", "Rice", "Sugarcane", "Maize", "Cotton(lint)", "Potato", "Onion", "Banana"].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))
                )}
              </select>
            </div>

            {/* Season & Year */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", color: "var(--text-subtle)", marginBottom: "6px" }}>
                  Season
                </label>
                <select
                  value={form.season}
                  onChange={(e) => setForm({ ...form, season: e.target.value })}
                  style={{
                    width: "100%",
                    background: "rgba(0, 0, 0, 0.4)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "8px",
                    padding: "10px 14px",
                    color: "#ffffff",
                    fontSize: "0.9rem",
                    outline: "none",
                  }}
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
                <label style={{ display: "block", fontSize: "0.82rem", color: "var(--text-subtle)", marginBottom: "6px" }}>
                  Target Year
                </label>
                <input
                  type="number"
                  min="1990"
                  max="2030"
                  value={form.year}
                  onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) || 2024 })}
                  style={{
                    width: "100%",
                    background: "rgba(0, 0, 0, 0.4)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "8px",
                    padding: "10px 14px",
                    color: "#ffffff",
                    fontSize: "0.9rem",
                    outline: "none",
                  }}
                />
              </div>
            </div>

            {/* Cultivated Area */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <label style={{ fontSize: "0.82rem", color: "var(--text-subtle)" }}>Cultivated Land Area (Hectares)</label>
                <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--emerald-light)" }}>{form.area} Ha</span>
              </div>
              <input
                type="range"
                min="1"
                max="5000"
                step="5"
                value={form.area}
                onChange={(e) => setForm({ ...form, area: parseFloat(e.target.value) })}
                style={{ width: "100%", accentColor: "var(--emerald-primary)", cursor: "pointer" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "var(--text-subtle)", marginTop: "4px" }}>
                <span>1 Ha (Smallholder)</span>
                <span>500 Ha (Commercial)</span>
                <span>5,000 Ha (District Scale)</span>
              </div>
            </div>

            {/* Model Algorithm */}
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", color: "var(--text-subtle)", marginBottom: "6px" }}>
                Machine Learning Algorithm
              </label>
              <select
                value={form.algorithm}
                onChange={(e) => setForm({ ...form, algorithm: e.target.value })}
                style={{
                  width: "100%",
                  background: "rgba(0, 0, 0, 0.4)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  color: "#ffffff",
                  fontSize: "0.9rem",
                  outline: "none",
                }}
              >
                <option value="gradient_boosted_trees">Gradient-Boosted Trees (Champion R²=0.855)</option>
                <option value="random_forest">Random Forest Regressor (R²=0.853)</option>
                <option value="decision_tree">Decision Tree Regressor (R²=0.851)</option>
                <option value="linear_regression">Linear Regression (R²=0.772)</option>
              </select>
            </div>

            {/* Submit Button */}
            <button
              className="btn-primary"
              disabled={loading}
              onClick={() => handlePredict()}
              style={{ width: "100%", justifyContent: "center", marginTop: "1rem", padding: "12px" }}
            >
              <Sparkles size={18} />
              <span>{loading ? "Computing Prediction..." : "Run Yield Intelligence Model"}</span>
            </button>
          </div>
        </div>

        {/* Prediction Hero Output */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Main Hero Metric Card */}
          <div className="glass-panel" style={{
            padding: "2.2rem",
            background: "linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.08) 100%)",
            border: "1px solid rgba(16, 185, 129, 0.35)",
            position: "relative",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <span className="badge badge-emerald">Model Prediction Output</span>
              <span style={{ fontSize: "0.78rem", color: "var(--text-subtle)" }}>Inference: &lt; 35ms</span>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ fontSize: "0.85rem", color: "var(--text-subtle)", marginBottom: "4px" }}>
                Estimated Crop Yield
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
                <span style={{ fontSize: "3.4rem", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.03em" }}>
                  {prediction ? prediction.predicted_yield.toFixed(3) : "—"}
                </span>
                <span style={{ fontSize: "1.1rem", color: "var(--emerald-light)", fontWeight: 600 }}>
                  Tonnes / Hectare
                </span>
              </div>
            </div>

            {/* Total Production Estimation */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
              padding: "1rem",
              background: "rgba(0, 0, 0, 0.35)",
              borderRadius: "12px",
              border: "1px solid var(--border-subtle)",
            }}>
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-subtle)", marginBottom: "4px" }}>Total Estimated Production</div>
                <div style={{ fontSize: "1.35rem", fontWeight: 700, color: "#ffffff" }}>
                  {prediction ? prediction.estimated_production.toLocaleString() : "—"} <span style={{ fontSize: "0.85rem", fontWeight: 400 }}>Tonnes</span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-subtle)", marginBottom: "4px" }}>95% Confidence Interval</div>
                <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--teal-accent)" }}>
                  {prediction?.confidence_interval ? (
                    `${prediction.confidence_interval.lower_bound_95} – ${prediction.confidence_interval.upper_bound_95}`
                  ) : "—"} <span style={{ fontSize: "0.75rem", fontWeight: 400 }}>T/Ha</span>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Contribution Waterfall */}
          <div className="glass-panel" style={{ padding: "1.8rem" }}>
            <h4 style={{ fontSize: "1.05rem", marginBottom: "1rem", color: "#ffffff" }}>Feature Contribution Breakdown</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {prediction?.feature_contributions ? (
                Object.entries(prediction.feature_contributions).map(([key, val]) => (
                  <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem" }}>
                    <span style={{ color: "var(--text-muted)" }}>{key}</span>
                    <span style={{ fontWeight: 600, color: val >= 0 ? "var(--emerald-light)" : "#f43f5e" }}>
                      {val >= 0 ? `+${val.toFixed(3)}` : val.toFixed(3)} T/Ha
                    </span>
                  </div>
                ))
              ) : (
                <div style={{ color: "var(--text-subtle)", fontSize: "0.85rem" }}>Loading feature contributions...</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
