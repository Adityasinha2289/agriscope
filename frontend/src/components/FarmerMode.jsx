/**
 * NEXGram — Farmer-First Agricultural Intelligence Experience
 * Architecture & Implementation: Developed by Aditya Sinha
 * B.Tech CSET-371 Big Data Analytics & Business Intelligence
 * All Rights Reserved (c) Aditya Sinha
 */
import React, { useState, useEffect, useMemo } from "react";
import {
  Sprout,
  Calculator,
  GitCompare,
  TrendingUp,
  MapPin,
  Calendar,
  Layers,
  ArrowRight,
  Info,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowLeftRight,
  Globe,
  Sliders,
  HelpCircle,
  Activity,
  Award,
  BarChart2
} from "lucide-react";
import {
  fetchFormOptions,
  predictYield,
  fetchFarmerSummary,
} from "../services/api";

// Bilingual dictionary for complete English / Hindi localization
const TRANSLATIONS = {
  en: {
    brand_tagline: "Agricultural Decision Support",
    switch_to_analyst: "Switch to Analyst Mode",
    nav_home: "Home",
    nav_my_crop: "My Crop",
    nav_predict: "Yield Estimate",
    nav_compare: "Compare",
    hero_title: "Your farm. Better-informed decisions.",
    hero_subtitle: "Explore crop performance, historical productivity, and realistic yield estimates for your region.",
    quick_select_title: "Select your farm details",
    label_state: "State / Union Territory",
    label_district: "District",
    label_crop: "Crop Commodity",
    label_season: "Cropping Season",
    label_area: "Cultivated Land Area",
    unit_acres: "Acres",
    unit_hectares: "Hectares",
    btn_explore_crop: "Explore Crop Trends",
    btn_estimate_yield: "Calculate Yield Estimate",
    btn_compare_regions: "Compare Regions",
    card_historical_yield: "State Average Productivity",
    card_season_guide: "Major Growing Season",
    card_state_coverage: "Districts Surveyed",
    stat_quintals_acre: "Quintals / Acre",
    stat_tonnes_ha: "Tonnes / Hectare",
    stat_quintals: "Quintals Total",
    section_my_crop_title: "Crop Performance & Regional Benchmarks",
    section_my_crop_desc: "Real multi-year historical productivity patterns from official agricultural surveys.",
    section_estimate_title: "Crop Yield Estimator",
    section_estimate_desc: "Get an empirical productivity estimate based on your state, season, and acreage.",
    section_compare_title: "Regional Comparison Tool",
    section_compare_desc: "Compare historical yields for any crop across two different states or regions.",
    label_region_1: "Primary Region",
    label_region_2: "Comparison Region",
    btn_run_comparison: "Compare Productivity",
    result_expected_yield: "Estimated Expected Productivity",
    result_total_harvest: "Estimated Total Harvest",
    confidence_span: "95% Statistical Confidence Span",
    attribution_title: "Key Factors Influencing This Estimate",
    attribution_base: "Crop Baseline Average",
    attribution_state: "State Agro-Climatic Effect",
    attribution_season: "Cropping Season Effect",
    attribution_tech: "Agricultural Technology Trend",
    disclaimer_title: "Farmer Advisory Note",
    disclaimer_text: "This estimate is an empirical decision-support projection derived from multi-decade historical records. Actual farm harvest will naturally vary depending on rainfall distribution, groundwater access, seed quality, soil health, and pest management.",
    tip_title: "Agronomic Practice Tip",
    tip_text: "Rabi season crops systematically exhibit higher yield consistency than rainfed Kharif crops due to controlled irrigation. Timely soil nutrient testing is recommended prior to sowing.",
    loading_data: "Loading verified agricultural data...",
    calculating_estimate: "Calculating yield estimate...",
  },
  hi: {
    brand_tagline: "किसान कृषि सहायता मंच",
    switch_to_analyst: "एनालिस्ट मोड पर जाएं",
    nav_home: "मुख्य पृष्ठ",
    nav_my_crop: "मेरी फसल",
    nav_predict: "अनुमानित उपज",
    nav_compare: "तुलना करें",
    hero_title: "आपकी खेती। बेहतर निर्णय।",
    hero_subtitle: "अपने क्षेत्र की फसल उत्पादकता, ऐतिहासिक रिकॉर्ड और सटीक उपज अनुमान सरलता से देखें।",
    quick_select_title: "अपने खेत और फसल की जानकारी चुनें",
    label_state: "राज्य / केंद्र शासित प्रदेश",
    label_district: "जिला",
    label_crop: "फसल का नाम",
    label_season: "कृषि मौसम (सीजन)",
    label_area: "बोया गया रकबा (खेत का आकार)",
    unit_acres: "एकड़",
    unit_hectares: "हेक्टेयर",
    btn_explore_crop: "फसल विवरण देखें",
    btn_estimate_yield: "उपज का अनुमान लगाएं",
    btn_compare_regions: "क्षेत्रों की तुलना करें",
    card_historical_yield: "राज्य औसत उत्पादकता",
    card_season_guide: "मुख्य बुवाई मौसम",
    card_state_coverage: "सर्वेक्षित जिले",
    stat_quintals_acre: "क्विंटल प्रति एकड़",
    stat_tonnes_ha: "टन प्रति हेक्टेयर",
    stat_quintals: "क्विंटल कुल पैदावार",
    section_my_crop_title: "फसल प्रदर्शन और क्षेत्रीय रिकॉर्ड",
    section_my_crop_desc: "सरकारी कृषि सांख्यिकी पर आधारित बहु-वर्षीय वास्तविक उत्पादकता विश्लेषण।",
    section_estimate_title: "अनुमानित उपज कैलकुलेटर",
    section_estimate_desc: "अपने राज्य, जिले, मौसम और जमीन के आधार पर अनुमानित पैदावार जानें।",
    section_compare_title: "क्षेत्रीय तुलना प्रणाली",
    section_compare_desc: "दो राज्यों या क्षेत्रों में किसी भी फसल की ऐतिहासिक पैदावार की तुलना करें।",
    label_region_1: "पहला क्षेत्र",
    label_region_2: "तुलना हेतु दूसरा क्षेत्र",
    btn_run_comparison: "पैदावार की तुलना करें",
    result_expected_yield: "अनुमानित संभावित उपज",
    result_total_harvest: "कुल अनुमानित पैदावार",
    confidence_span: "95% सांख्यिकीय सीमा (कम से अधिक)",
    attribution_title: "अनुमान को प्रभावित करने वाले मुख्य कारक",
    attribution_base: "फसल का बुनियादी राष्ट्रीय औसत",
    attribution_state: "राज्य की जलवायु व सिंचाई प्रभाव",
    attribution_season: "मौसम व बुवाई समय का असर",
    attribution_tech: "कृषि तकनीक में समय के साथ सुधार",
    disclaimer_title: "किसान सलाह एवं सूचना",
    disclaimer_text: "यह अनुमान कई दशकों के ऐतिहासिक आंकड़ों पर आधारित सांख्यिकीय मार्गदर्शन है। वास्तविक पैदावार मौसम, बारिश, खाद, बीज की गुणवत्ता और कीट नियंत्रण पर निर्भर करेगी। यह कोई निश्चित गारंटी नहीं है।",
    tip_title: "खेती उपयोगी सुझाव",
    tip_text: "रबी की फसलें (गेहूं, चना) मानसूनी खरीफ की तुलना में अधिक स्थिर पैदावार देती हैं। बुवाई से पूर्व मिट्टी की जांच अवश्य कराएं।",
    loading_data: "कृषि डेटा लोड हो रहा है...",
    calculating_estimate: "अनुमान की गणना की जा रही है...",
  },
};

export default function FarmerMode({ onSwitchToAnalyst }) {
  const [lang, setLang] = useState("en"); // 'en' or 'hi'
  const [farmerTab, setFarmerTab] = useState("home"); // home, my_crop, predict, compare

  // Options from API
  const [options, setOptions] = useState({
    states: ["Punjab", "Haryana", "Uttar Pradesh", "Madhya Pradesh", "Tamil Nadu", "Maharashtra"],
    crops: ["Wheat", "Rice", "Sugarcane", "Maize", "Cotton(lint)", "Groundnut", "Gram"],
    seasons: ["Rabi", "Kharif", "Whole Year", "Summer"],
    state_districts: {},
  });

  // Selected State, District, Crop
  const [selectedState, setSelectedState] = useState("Punjab");
  const [selectedDistrict, setSelectedDistrict] = useState("Ludhiana");
  const [selectedCrop, setSelectedCrop] = useState("Wheat");
  const [selectedSeason, setSelectedSeason] = useState("Rabi");

  // Acreage & Unit Toggle
  const [areaValue, setAreaValue] = useState(5.0);
  const [areaUnit, setAreaUnit] = useState("acres"); // 'acres' or 'hectares'

  // Summary data for selected crop
  const [summaryData, setSummaryData] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  // Prediction State
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);

  // Comparison State
  const [compareCrop, setCompareCrop] = useState("Wheat");
  const [compareRegion1, setCompareRegion1] = useState("Punjab");
  const [compareRegion2, setCompareRegion2] = useState("Haryana");
  const [compareData, setCompareData] = useState(null);
  const [compareLoading, setCompareLoading] = useState(false);

  const t = TRANSLATIONS[lang];

  // Load Form Options & Initial Summary
  useEffect(() => {
    async function loadOptions() {
      try {
        const data = await fetchFormOptions();
        if (data && data.states && data.crops) {
          setOptions(data);
          if (data.states.length > 0 && !data.states.includes(selectedState)) {
            setSelectedState(data.states[0]);
          }
        }
      } catch (e) {
        console.error("Failed to load options:", e);
      }
    }
    loadOptions();
  }, []);

  // Sync districts when state changes
  useEffect(() => {
    const districtsForState = options.state_districts?.[selectedState] || [];
    if (districtsForState.length > 0) {
      if (!districtsForState.includes(selectedDistrict)) {
        setSelectedDistrict(districtsForState[0]);
      }
    } else {
      setSelectedDistrict("");
    }
  }, [selectedState, options.state_districts]);

  // Load Farmer Summary whenever Crop or State changes
  useEffect(() => {
    async function loadSummary() {
      setSummaryLoading(true);
      try {
        const sum = await fetchFarmerSummary(selectedCrop, selectedState);
        setSummaryData(sum);
      } catch (e) {
        console.error("Failed to fetch farmer summary:", e);
      } finally {
        setSummaryLoading(false);
      }
    }
    loadSummary();
  }, [selectedCrop, selectedState]);

  // Run Yield Estimate
  async function handlePredictYield() {
    setPredictionLoading(true);
    try {
      // 1 Hectare ≈ 2.47105 Acres
      const areaHectares = areaUnit === "acres" ? areaValue / 2.47105 : areaValue;

      const payload = {
        state_name: selectedState,
        district_name: selectedDistrict || undefined,
        crop_name: selectedCrop,
        season: selectedSeason,
        year: 2024,
        area: Math.max(0.1, Number(areaHectares.toFixed(2))),
        algorithm: "gradient_boosted_trees",
      };

      const res = await predictYield(payload);
      setPredictionResult(res);
      setFarmerTab("predict");
    } catch (e) {
      console.error("Prediction error:", e);
    } finally {
      setPredictionLoading(false);
    }
  }

  // Run Comparison
  async function handleCompare() {
    setCompareLoading(true);
    try {
      const [r1, r2] = await Promise.all([
        fetchFarmerSummary(compareCrop, compareRegion1),
        fetchFarmerSummary(compareCrop, compareRegion2),
      ]);
      setCompareData({ region1: r1, region2: r2 });
    } catch (e) {
      console.error("Compare error:", e);
    } finally {
      setCompareLoading(false);
    }
  }

  // Pre-load comparison on mount or tab change
  useEffect(() => {
    if (farmerTab === "compare" && !compareData) {
      handleCompare();
    }
  }, [farmerTab]);

  // Calculate comparison delta
  const comparisonDelta = useMemo(() => {
    if (!compareData?.region1 || !compareData?.region2) return null;
    const y1 = compareData.region1.state_avg_yield_quintals_per_acre || compareData.region1.national_avg_yield_quintals_per_acre || 0;
    const y2 = compareData.region2.state_avg_yield_quintals_per_acre || compareData.region2.national_avg_yield_quintals_per_acre || 0;
    const diff = y1 - y2;
    const pct = y2 > 0 ? (diff / y2) * 100 : 0;
    return {
      diff: Number(diff.toFixed(2)),
      pct: Number(pct.toFixed(1)),
      higherRegion: diff >= 0 ? compareRegion1 : compareRegion2,
      diffAbs: Number(Math.abs(diff).toFixed(2)),
      pctAbs: Number(Math.abs(pct).toFixed(1)),
    };
  }, [compareData, compareRegion1, compareRegion2]);

  return (
    <div className="farmer-shell">
      {/* Top Utility Bar: Mode Switcher & Language Toggle */}
      <header className="farmer-header">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div className="farmer-brand-badge">
            <Sprout size={18} color="#FFFFFF" />
          </div>
          <div>
            <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--color-forest)", letterSpacing: "-0.015em" }}>
              NEXGram
            </span>
            <span style={{ marginLeft: "10px", fontSize: "0.8125rem", color: "var(--color-olive)", fontWeight: 500 }}>
              {t.brand_tagline}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Segmented Language Toggle: English | हिंदी */}
          <div className="segmented-control">
            <button
              onClick={() => setLang("en")}
              className={`segmented-control-btn ${lang === "en" ? "active" : ""}`}
            >
              English
            </button>
            <button
              onClick={() => setLang("hi")}
              className={`segmented-control-btn ${lang === "hi" ? "active" : ""}`}
            >
              हिंदी
            </button>
          </div>

          {/* Switch to Analyst Mode Button */}
          <button
            onClick={onSwitchToAnalyst}
            className="btn-apple-secondary"
            style={{ padding: "8px 14px", minHeight: "36px", height: "36px", fontSize: "0.8125rem", gap: "6px" }}
          >
            <Activity size={15} color="var(--color-olive)" />
            <span>{t.switch_to_analyst}</span>
          </button>
        </div>
      </header>

      {/* Primary Navigation Tabs */}
      <nav className="farmer-nav">
        {[
          { id: "home", label: t.nav_home, icon: Sprout },
          { id: "my_crop", label: t.nav_my_crop, icon: TrendingUp },
          { id: "predict", label: t.nav_predict, icon: Calculator },
          { id: "compare", label: t.nav_compare, icon: GitCompare },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = farmerTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setFarmerTab(item.id)}
              className={`farmer-nav-btn ${isActive ? "active" : ""}`}
            >
              <Icon size={17} strokeWidth={isActive ? 2.2 : 1.8} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Main Content Area */}
      <main className="farmer-container">
        {/* ================= TAB 1: HOME ================= */}
        {farmerTab === "home" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }} className="animate-in">
            {/* Hero Banner with Authentic Agriculture Photography */}
            <div className="farmer-hero-card">
              <div className="farmer-hero-overlay" />
              <div className="farmer-hero-content">
                <span className="farmer-pill-tag">
                  {lang === "hi" ? "सरल एवं सुगम कृषि मार्गदर्शक" : "Farmer-First Agricultural Guidance"}
                </span>
                <h1 style={{ fontSize: "1.875rem", fontWeight: 700, color: "#FFFFFF", letterSpacing: "-0.02em", margin: "10px 0 8px", lineHeight: 1.25 }}>
                  {t.hero_title}
                </h1>
                <p style={{ fontSize: "0.9375rem", color: "rgba(255, 255, 255, 0.94)", maxWidth: "660px", margin: 0, lineHeight: 1.5 }}>
                  {t.hero_subtitle}
                </p>
              </div>
            </div>

            {/* Quick Selector Card */}
            <div className="apple-card" style={{ padding: "24px 28px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "18px" }}>
                <MapPin size={18} color="var(--color-olive)" />
                <h2 style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--color-forest)", margin: 0 }}>
                  {t.quick_select_title}
                </h2>
              </div>

              <div className="form-grid-4">
                {/* State Selector */}
                <div className="form-group">
                  <label className="form-label">{t.label_state}</label>
                  <select
                    className="form-control"
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                  >
                    {options.states.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                {/* District Selector */}
                <div className="form-group">
                  <label className="form-label">{t.label_district}</label>
                  <select
                    className="form-control"
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                  >
                    {(options.state_districts?.[selectedState] || ["Ludhiana", "Patiala", "Amritsar"]).map((dist) => (
                      <option key={dist} value={dist}>{dist}</option>
                    ))}
                  </select>
                </div>

                {/* Crop Selector */}
                <div className="form-group">
                  <label className="form-label">{t.label_crop}</label>
                  <select
                    className="form-control"
                    value={selectedCrop}
                    onChange={(e) => setSelectedCrop(e.target.value)}
                  >
                    {options.crops.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Season Selector */}
                <div className="form-group">
                  <label className="form-label">{t.label_season}</label>
                  <select
                    className="form-control"
                    value={selectedSeason}
                    onChange={(e) => setSelectedSeason(e.target.value)}
                  >
                    {options.seasons.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Fast Action Buttons */}
              <div style={{ display: "flex", gap: "12px", marginTop: "22px", flexWrap: "wrap" }}>
                <button
                  onClick={handlePredictYield}
                  className="btn-apple-primary"
                >
                  <Calculator size={16} />
                  <span>{t.btn_estimate_yield}</span>
                </button>

                <button
                  onClick={() => setFarmerTab("my_crop")}
                  className="btn-apple-secondary"
                >
                  <TrendingUp size={16} />
                  <span>{t.btn_explore_crop}</span>
                </button>

                <button
                  onClick={() => setFarmerTab("compare")}
                  className="btn-apple-subtle"
                >
                  <GitCompare size={16} />
                  <span>{t.btn_compare_regions}</span>
                </button>
              </div>
            </div>

            {/* Quick Informational KPI Row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
              <div className="kpi-card">
                <span className="kpi-card-label">{t.card_historical_yield}</span>
                <div className="kpi-card-value tabular-numbers">
                  {summaryData?.state_avg_yield_quintals_per_acre || summaryData?.national_avg_yield_quintals_per_acre || "—"}
                  <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--text-secondary)", marginLeft: "6px" }}>
                    {t.stat_quintals_acre}
                  </span>
                </div>
                <div className="kpi-card-subtext">
                  ≈ {summaryData?.state_avg_yield_tonnes_per_ha || summaryData?.national_avg_yield_tonnes_per_ha || "—"} {t.stat_tonnes_ha} in {selectedState}
                </div>
              </div>

              <div className="kpi-card">
                <span className="kpi-card-label">{t.card_season_guide}</span>
                <div className="kpi-card-value" style={{ color: "var(--color-olive)" }}>
                  {selectedSeason || "Rabi"}
                </div>
                <div className="kpi-card-subtext">
                  {selectedCrop} {lang === "hi" ? "की मुख्य पैदावार अवधि" : "Primary harvesting season"}
                </div>
              </div>

              <div className="kpi-card">
                <span className="kpi-card-label">{t.card_state_coverage}</span>
                <div className="kpi-card-value">
                  {(options.state_districts?.[selectedState] || []).length || "—"}
                </div>
                <div className="kpi-card-subtext">
                  {selectedState} {lang === "hi" ? "के जिले डेटा में शामिल" : "districts recorded in survey"}
                </div>
              </div>
            </div>

            {/* Agronomic Practice Tip Box */}
            <div style={{
              padding: "16px 20px",
              borderRadius: "var(--radius-lg)",
              backgroundColor: "var(--color-pale-green)",
              border: "1px solid rgba(55, 85, 52, 0.2)",
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
            }}>
              <CheckCircle2 size={20} color="var(--color-olive)" style={{ flexShrink: 0, marginTop: "2px" }} />
              <div>
                <div style={{ fontWeight: 600, color: "var(--color-forest)", fontSize: "0.875rem" }}>
                  {t.tip_title}
                </div>
                <div style={{ fontSize: "0.8125rem", color: "var(--text-primary)", marginTop: "3px", lineHeight: 1.5 }}>
                  {summaryData?.plain_language_insight || t.tip_text}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: MY CROP ================= */}
        {farmerTab === "my_crop" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }} className="animate-in">
            <div className="page-header" style={{ borderBottom: "none", paddingBottom: 0 }}>
              <div>
                <h1 className="page-header-title">{t.section_my_crop_title}</h1>
                <p className="page-header-desc">{t.section_my_crop_desc}</p>
              </div>
              <button
                onClick={() => setFarmerTab("predict")}
                className="btn-apple-primary"
              >
                <span>{lang === "hi" ? "अनुमानित उपज निकालें" : "Estimate Yield for This Crop"}</span>
                <ArrowRight size={15} />
              </button>
            </div>

            {/* Selected Crop Overview Card */}
            <div className="apple-card" style={{ padding: "24px 28px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "16px", marginBottom: "20px" }}>
                <div>
                  <div style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--color-forest)" }}>
                    {selectedCrop} — {selectedDistrict ? `${selectedDistrict}, ` : ""}{selectedState}
                  </div>
                  <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                    {lang === "hi" ? "आधिकारिक कृषि मंत्रालय सर्वेक्षण डेटा (1997–2022)" : "Official Ministry of Agriculture Longitudinal Records (1997–2022)"}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <span className="status-pill status-pill-brand">
                    {selectedSeason} {lang === "hi" ? "सीजन" : "Season"}
                  </span>
                  {summaryData?.crop_type && (
                    <span className="status-pill status-pill-neutral">
                      {summaryData.crop_type}
                    </span>
                  )}
                </div>
              </div>

              {/* 3-Column Metric Display */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
                {/* State-Specific Benchmark */}
                <div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-tertiary)" }}>
                    {selectedState} {lang === "hi" ? "औसत पैदावार" : "State Benchmark Yield"}
                  </div>
                  <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--color-forest)", marginTop: "4px" }} className="tabular-numbers">
                    {summaryData?.state_avg_yield_quintals_per_acre || "—"}{" "}
                    <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--text-secondary)" }}>
                      {t.stat_quintals_acre}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginTop: "2px" }}>
                    ≈ {summaryData?.state_avg_yield_tonnes_per_ha || "—"} {t.stat_tonnes_ha}
                  </div>
                </div>

                {/* National Benchmark */}
                <div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-tertiary)" }}>
                    {lang === "hi" ? "राष्ट्रीय औसत पैदावार" : "National Crop Benchmark"}
                  </div>
                  <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--color-olive)", marginTop: "4px" }} className="tabular-numbers">
                    {summaryData?.national_avg_yield_quintals_per_acre || "—"}{" "}
                    <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--text-secondary)" }}>
                      {t.stat_quintals_acre}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginTop: "2px" }}>
                    ≈ {summaryData?.national_avg_yield_tonnes_per_ha || "—"} {t.stat_tonnes_ha}
                  </div>
                </div>

                {/* State Productivity Index */}
                <div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-tertiary)" }}>
                    {lang === "hi" ? "राज्य प्रदर्शन सूचकांक" : "State Efficiency Factor"}
                  </div>
                  <div style={{ fontSize: "1.75rem", fontWeight: 700, color: summaryData?.state_efficiency_factor >= 1.0 ? "var(--color-olive)" : "var(--color-forest)", marginTop: "4px" }} className="tabular-numbers">
                    {summaryData?.state_efficiency_factor ? `${(summaryData.state_efficiency_factor * 100).toFixed(0)}%` : "100%"}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginTop: "2px" }}>
                    {summaryData?.state_efficiency_factor >= 1.0
                      ? `${((summaryData.state_efficiency_factor - 1.0) * 100).toFixed(0)}% above national baseline`
                      : `${((1.0 - summaryData.state_efficiency_factor) * 100).toFixed(0)}% below national baseline`}
                  </div>
                </div>
              </div>

              {/* Top Producing Districts in State */}
              {summaryData?.top_districts_detail && summaryData.top_districts_detail.length > 0 && (
                <div style={{ marginTop: "24px" }}>
                  <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-forest)", marginBottom: "12px" }}>
                    {lang === "hi" ? `${selectedState} में प्रमुख उत्पादक जिले:` : `Key Producing Districts in ${selectedState}:`}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px" }}>
                    {summaryData.top_districts_detail.map((dist, idx) => (
                      <div key={idx} style={{
                        padding: "10px 14px",
                        borderRadius: "var(--radius-md)",
                        backgroundColor: "var(--bg-surface-subtle)",
                        border: "1px solid var(--border-subtle)",
                      }}>
                        <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--color-forest)" }}>
                          {dist.district_name}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--color-olive)", marginTop: "2px" }} className="tabular-numbers">
                          {dist.avg_yield_quintals_per_acre} Q/Acre ({dist.avg_yield_tonnes_per_ha} T/Ha)
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Plain language summary */}
              <div style={{ marginTop: "20px", padding: "16px", borderRadius: "var(--radius-md)", backgroundColor: "var(--bg-surface-subtle)", border: "1px solid var(--border-subtle)" }}>
                <div style={{ fontSize: "0.875rem", color: "var(--color-forest)", lineHeight: 1.6 }}>
                  <strong>{lang === "hi" ? "कृषि निष्कर्ष: " : "Agricultural Insight: "}</strong>
                  {summaryData?.plain_language_insight}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: YIELD ESTIMATE ================= */}
        {farmerTab === "predict" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }} className="animate-in">
            <div className="page-header" style={{ borderBottom: "none", paddingBottom: 0 }}>
              <div>
                <h1 className="page-header-title">{t.section_estimate_title}</h1>
                <p className="page-header-desc">{t.section_estimate_desc}</p>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: predictionResult ? "repeat(auto-fit, minmax(360px, 1fr))" : "1fr", gap: "24px", alignItems: "start" }}>
              {/* Form Card */}
              <div className="apple-card" style={{ padding: "24px 28px" }}>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 600, color: "var(--color-forest)", marginBottom: "18px" }}>
                  {lang === "hi" ? "खेत का विवरण भरें" : "Enter Farm Specifications"}
                </h3>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">{t.label_state}</label>
                    <select
                      className="form-control"
                      value={selectedState}
                      onChange={(e) => setSelectedState(e.target.value)}
                    >
                      {options.states.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">{t.label_district}</label>
                    <select
                      className="form-control"
                      value={selectedDistrict}
                      onChange={(e) => setSelectedDistrict(e.target.value)}
                    >
                      {(options.state_districts?.[selectedState] || ["Ludhiana", "Patiala"]).map((dist) => (
                        <option key={dist} value={dist}>{dist}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">{t.label_crop}</label>
                    <select
                      className="form-control"
                      value={selectedCrop}
                      onChange={(e) => setSelectedCrop(e.target.value)}
                    >
                      {options.crops.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">{t.label_season}</label>
                    <select
                      className="form-control"
                      value={selectedSeason}
                      onChange={(e) => setSelectedSeason(e.target.value)}
                    >
                      {options.seasons.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Land Area with Unit Switcher */}
                <div className="form-group" style={{ marginTop: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <label className="form-label" style={{ margin: 0 }}>{t.label_area}</label>
                    <div className="segmented-control">
                      <button
                        type="button"
                        onClick={() => setAreaUnit("acres")}
                        className={`segmented-control-btn ${areaUnit === "acres" ? "active" : ""}`}
                      >
                        {t.unit_acres}
                      </button>
                      <button
                        type="button"
                        onClick={() => setAreaUnit("hectares")}
                        className={`segmented-control-btn ${areaUnit === "hectares" ? "active" : ""}`}
                      >
                        {t.unit_hectares}
                      </button>
                    </div>
                  </div>

                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    className="form-control"
                    value={areaValue}
                    onChange={(e) => setAreaValue(Number(e.target.value))}
                  />
                  <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginTop: "4px" }}>
                    {areaUnit === "acres"
                      ? `≈ ${(areaValue / 2.47105).toFixed(2)} Hectares (1 Hectare ≈ 2.47 Acres)`
                      : `≈ ${(areaValue * 2.47105).toFixed(2)} Acres (1 Acre ≈ 0.40 Hectare)`}
                  </div>
                </div>

                <button
                  onClick={handlePredictYield}
                  disabled={predictionLoading}
                  className="btn-apple-primary"
                  style={{ marginTop: "20px", width: "100%" }}
                >
                  <Calculator size={17} />
                  <span>{predictionLoading ? t.calculating_estimate : t.btn_estimate_yield}</span>
                </button>
              </div>

              {/* Results Card */}
              {predictionResult && (
                <div className="apple-card" style={{ padding: "24px 28px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <span className="status-pill status-pill-brand">
                      {lang === "hi" ? "अनुमानित परिणाम" : "Empirical Estimate"}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
                      Gradient-Boosted Trees (Champion, R²=0.855)
                    </span>
                  </div>

                  <div style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-tertiary)" }}>
                    {t.result_expected_yield}
                  </div>
                  <div style={{ fontSize: "2.25rem", fontWeight: 700, color: "var(--color-forest)", margin: "4px 0" }} className="tabular-numbers">
                    {predictionResult.farmer_conversion?.yield_quintals_per_acre || "—"}
                    <span style={{ fontSize: "0.9375rem", fontWeight: 500, color: "var(--color-olive)", marginLeft: "8px" }}>
                      {t.stat_quintals_acre}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", marginBottom: "16px" }}>
                    ≈ {predictionResult.predicted_yield} {predictionResult.yield_unit}
                  </div>

                  {/* Harvest Volume Card */}
                  <div style={{ padding: "14px 18px", borderRadius: "var(--radius-md)", backgroundColor: "var(--bg-surface-subtle)", border: "1px solid var(--border-subtle)", marginBottom: "16px" }}>
                    <div style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-tertiary)" }}>
                      {t.result_total_harvest} ({areaValue} {areaUnit})
                    </div>
                    <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--color-olive)", marginTop: "2px" }} className="tabular-numbers">
                      {predictionResult.farmer_conversion?.production_quintals || "—"} {t.stat_quintals}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
                      ≈ {predictionResult.estimated_production} Tonnes
                    </div>
                  </div>

                  {/* Statistical Confidence Bounds */}
                  {predictionResult.confidence_interval && (
                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "14px", display: "flex", justifyContent: "space-between" }}>
                      <span>{t.confidence_span}:</span>
                      <strong className="tabular-numbers" style={{ color: "var(--color-forest)" }}>
                        {predictionResult.confidence_interval.lower_bound_95} – {predictionResult.confidence_interval.upper_bound_95} T/Ha
                      </strong>
                    </div>
                  )}

                  {/* Plain Language Summary */}
                  <p style={{ fontSize: "0.8125rem", color: "var(--text-primary)", lineHeight: 1.5, marginBottom: "16px" }}>
                    {predictionResult.farmer_conversion?.plain_language_summary}
                  </p>

                  {/* Advisory Disclaimer */}
                  <div style={{
                    padding: "12px 14px",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border-subtle)",
                    backgroundColor: "var(--bg-surface-subtle)",
                    fontSize: "0.75rem",
                    color: "var(--text-secondary)",
                    lineHeight: 1.45,
                  }}>
                    <strong style={{ color: "var(--color-forest)" }}>{t.disclaimer_title}: </strong>
                    {t.disclaimer_text}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 4: COMPARE ================= */}
        {farmerTab === "compare" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }} className="animate-in">
            <div className="page-header" style={{ borderBottom: "none", paddingBottom: 0 }}>
              <div>
                <h1 className="page-header-title">{t.section_compare_title}</h1>
                <p className="page-header-desc">{t.section_compare_desc}</p>
              </div>
            </div>

            {/* Compare Controls Card */}
            <div className="apple-card" style={{ padding: "24px 28px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", alignItems: "flex-end" }}>
                <div className="form-group">
                  <label className="form-label">{t.label_crop}</label>
                  <select
                    className="form-control"
                    value={compareCrop}
                    onChange={(e) => setCompareCrop(e.target.value)}
                  >
                    {options.crops.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">{t.label_region_1}</label>
                  <select
                    className="form-control"
                    value={compareRegion1}
                    onChange={(e) => setCompareRegion1(e.target.value)}
                  >
                    {options.states.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">{t.label_region_2}</label>
                  <select
                    className="form-control"
                    value={compareRegion2}
                    onChange={(e) => setCompareRegion2(e.target.value)}
                  >
                    {options.states.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleCompare}
                  disabled={compareLoading}
                  className="btn-apple-primary"
                  style={{ minWidth: "180px" }}
                >
                  <ArrowLeftRight size={16} />
                  <span>{compareLoading ? "Comparing..." : t.btn_run_comparison}</span>
                </button>
              </div>

              {compareRegion1 === compareRegion2 && (
                <div style={{ marginTop: "12px", fontSize: "0.8125rem", color: "var(--status-warning-text)", display: "flex", alignItems: "center", gap: "6px" }}>
                  <AlertCircle size={14} />
                  <span>{lang === "hi" ? "कृपया तुलना हेतु दो भिन्न राज्यों का चयन करें।" : "Please select two distinct states for meaningful regional comparison."}</span>
                </div>
              )}
            </div>

            {/* Comparison Display */}
            {compareData && (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {/* 2 Regional Cards Side by Side */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
                  {/* Region 1 Card */}
                  <div className="apple-card" style={{ padding: "24px 28px", borderTop: "4px solid var(--color-olive)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <div style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--color-forest)" }}>
                        {compareRegion1}
                      </div>
                      <span className="status-pill status-pill-brand">
                        {compareData.region1?.state_efficiency_factor ? `${(compareData.region1.state_efficiency_factor * 100).toFixed(0)}% Index` : "Baseline"}
                      </span>
                    </div>
                    <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", marginBottom: "16px" }}>
                      {compareCrop} Historical Productivity
                    </div>

                    <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--color-olive)" }} className="tabular-numbers">
                      {compareData.region1?.state_avg_yield_quintals_per_acre || compareData.region1?.national_avg_yield_quintals_per_acre || "—"}
                      <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--text-secondary)", marginLeft: "6px" }}>
                        {t.stat_quintals_acre}
                      </span>
                    </div>
                    <div style={{ fontSize: "0.8125rem", color: "var(--text-tertiary)", marginTop: "2px" }}>
                      ≈ {compareData.region1?.state_avg_yield_tonnes_per_ha || compareData.region1?.national_avg_yield_tonnes_per_ha || "—"} {t.stat_tonnes_ha}
                    </div>

                    <div style={{ marginTop: "16px", fontSize: "0.8125rem", color: "var(--text-secondary)", borderTop: "1px solid var(--border-subtle)", paddingTop: "12px" }}>
                      <strong>{lang === "hi" ? "अग्रणी जिले:" : "Top Districts:"} </strong>
                      {(compareData.region1?.top_districts_in_state || []).slice(0, 3).join(", ") || "Data Available"}
                    </div>
                  </div>

                  {/* Region 2 Card */}
                  <div className="apple-card" style={{ padding: "24px 28px", borderTop: "4px solid var(--color-sage)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <div style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--color-forest)" }}>
                        {compareRegion2}
                      </div>
                      <span className="status-pill status-pill-neutral">
                        {compareData.region2?.state_efficiency_factor ? `${(compareData.region2.state_efficiency_factor * 100).toFixed(0)}% Index` : "Baseline"}
                      </span>
                    </div>
                    <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", marginBottom: "16px" }}>
                      {compareCrop} Historical Productivity
                    </div>

                    <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--color-forest)" }} className="tabular-numbers">
                      {compareData.region2?.state_avg_yield_quintals_per_acre || compareData.region2?.national_avg_yield_quintals_per_acre || "—"}
                      <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--text-secondary)", marginLeft: "6px" }}>
                        {t.stat_quintals_acre}
                      </span>
                    </div>
                    <div style={{ fontSize: "0.8125rem", color: "var(--text-tertiary)", marginTop: "2px" }}>
                      ≈ {compareData.region2?.state_avg_yield_tonnes_per_ha || compareData.region2?.national_avg_yield_tonnes_per_ha || "—"} {t.stat_tonnes_ha}
                    </div>

                    <div style={{ marginTop: "16px", fontSize: "0.8125rem", color: "var(--text-secondary)", borderTop: "1px solid var(--border-subtle)", paddingTop: "12px" }}>
                      <strong>{lang === "hi" ? "अग्रणी जिले:" : "Top Districts:"} </strong>
                      {(compareData.region2?.top_districts_in_state || []).slice(0, 3).join(", ") || "Data Available"}
                    </div>
                  </div>
                </div>

                {/* Comparative Delta Analysis Card */}
                {comparisonDelta && compareRegion1 !== compareRegion2 && (
                  <div className="apple-card" style={{ padding: "20px 24px", backgroundColor: "var(--bg-surface-subtle)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                      <Award size={18} color="var(--color-olive)" />
                      <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-forest)" }}>
                        {lang === "hi" ? "तुलनात्मक अंतर विश्लेषण" : "Comparative Delta Analysis"}
                      </div>
                    </div>
                    <p style={{ fontSize: "0.875rem", color: "var(--text-primary)", lineHeight: 1.55, margin: 0 }}>
                      {lang === "hi" ? (
                        <>
                          <strong>{comparisonDelta.higherRegion}</strong> में {compareCrop} की उत्पादकता औसतन{" "}
                          <strong>{comparisonDelta.diffAbs} क्विंटल प्रति एकड़ ({comparisonDelta.pctAbs}%)</strong> अधिक है।
                          यह अंतर सिंचाई उपलब्धता, मिट्टी की उर्वरता और क्षेत्रीय कृषि पद्धतियों के प्रभाव को दर्शाता है।
                        </>
                      ) : (
                        <>
                          Historical productivity for {compareCrop} is approximately{" "}
                          <strong>{comparisonDelta.diffAbs} Quintals/Acre ({comparisonDelta.pctAbs}%)</strong> higher in{" "}
                          <strong>{comparisonDelta.higherRegion}</strong> compared to the peer region.
                          This empirical variation reflects differences in canal irrigation intensity, mechanization, and soil fertility profiles.
                        </>
                      )}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Farmer Footer */}
      <footer className="farmer-footer">
        <div style={{ maxWidth: "1240px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <strong>NEXGram</strong> — {t.brand_tagline} • Developed by Aditya Sinha • B.Tech CSET-371
          </div>
          <div style={{ color: "var(--text-tertiary)" }}>
            {lang === "hi"
              ? "डेटा स्रोत: कृषि एवं किसान कल्याण मंत्रालय (भारत सरकार)"
              : "Source: Ministry of Agriculture & Farmers Welfare (Govt. of India)"}
          </div>
        </div>
      </footer>

      <style>{`
        .farmer-shell {
          min-height: 100vh;
          background-color: var(--bg-app);
          display: flex;
          flex-direction: column;
        }

        .farmer-header {
          background-color: #FFFFFF;
          border-bottom: 1px solid var(--border-subtle);
          padding: 12px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 40;
        }

        .farmer-brand-badge {
          width: 34px;
          height: 34px;
          border-radius: var(--radius-md);
          background-color: var(--color-olive);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 1px 3px rgba(15, 42, 29, 0.15);
        }

        .farmer-nav {
          background-color: #FFFFFF;
          border-bottom: 1px solid var(--border-subtle);
          padding: 0 32px;
          display: flex;
          gap: 12px;
          overflow-x: auto;
        }

        .farmer-nav-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 13px 18px;
          border: none;
          background: transparent;
          font-size: 0.9375rem;
          font-weight: 500;
          color: var(--text-secondary);
          border-bottom: 2px solid transparent;
          cursor: pointer;
          transition: all var(--transition-fast);
          white-space: nowrap;
        }

        .farmer-nav-btn:hover {
          color: var(--color-forest);
        }

        .farmer-nav-btn.active {
          color: var(--color-olive);
          font-weight: 600;
          border-bottom-color: var(--color-olive);
        }

        .farmer-container {
          flex: 1;
          max-width: 1240px;
          width: 100%;
          margin: 0 auto;
          padding: 32px 32px 48px;
        }

        .farmer-hero-card {
          position: relative;
          border-radius: var(--radius-xl);
          overflow: hidden;
          background-image: url('/images/indian_farm_landscape.jpg');
          background-size: cover;
          background-position: center 30%;
          min-height: 230px;
          display: flex;
          align-items: flex-end;
          padding: 32px 36px;
          box-shadow: var(--shadow-card);
        }

        .farmer-hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(15, 42, 29, 0.25) 0%, rgba(15, 42, 29, 0.84) 100%);
        }

        .farmer-hero-content {
          position: relative;
          z-index: 2;
        }

        .farmer-pill-tag {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          background-color: rgba(227, 238, 212, 0.95);
          color: var(--color-forest);
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.02em;
        }

        .farmer-footer {
          border-top: 1px solid var(--border-subtle);
          background-color: #FFFFFF;
          padding: 18px 32px;
          font-size: 0.8125rem;
          color: var(--text-secondary);
        }

        @media (max-width: 768px) {
          .farmer-header {
            padding: 12px 16px;
          }
          .farmer-nav {
            padding: 0 12px;
          }
          .farmer-container {
            padding: 20px 16px;
          }
          .farmer-hero-card {
            min-height: 200px;
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
}
