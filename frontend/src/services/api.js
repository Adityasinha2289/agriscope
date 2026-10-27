/**
 * NEXGram API Client Service
 * Architecture & Implementation: Developed by Aditya Sinha
 * B.Tech CSET-371 Big Data Analytics & Business Intelligence
 * All Rights Reserved (c) Aditya Sinha
 */
const API_BASE = "http://localhost:8000/api/v1";

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health/`);
  return res.json();
}

export async function fetchDatasets() {
  const res = await fetch(`${API_BASE}/datasets/`);
  return res.json();
}

export async function fetchDatasetPreview(datasetId, limit = 20, viewType = "cleaned") {
  const res = await fetch(`${API_BASE}/datasets/${datasetId}/preview?limit=${limit}&view_type=${viewType}`);
  return res.json();
}

export async function fetchJobs(limit = 20) {
  const res = await fetch(`${API_BASE}/jobs/?limit=${limit}`);
  return res.json();
}

export async function fetchJobLogs(jobId) {
  const res = await fetch(`${API_BASE}/jobs/${jobId}/logs`);
  return res.json();
}

export async function triggerJob(jobType, datasetId = "apy-primary") {
  const res = await fetch(`${API_BASE}/jobs/trigger`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ job_type: jobType, dataset_id: datasetId }),
  });
  return res.json();
}

export async function fetchModelComparison() {
  const res = await fetch(`${API_BASE}/models/comparison`);
  return res.json();
}

export async function fetchAllModels() {
  const res = await fetch(`${API_BASE}/models/`);
  return res.json();
}

export async function predictYield(payload) {
  const res = await fetch(`${API_BASE}/predictions/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function batchPredictYield(items, algorithm = "gradient_boosted_trees") {
  const res = await fetch(`${API_BASE}/predictions/batch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items, algorithm }),
  });
  return res.json();
}

export async function fetchOverviewAnalytics() {
  const res = await fetch(`${API_BASE}/analytics/overview`);
  return res.json();
}

export async function fetchFormOptions() {
  const res = await fetch(`${API_BASE}/analytics/metadata/options`);
  return res.json();
}

export async function fetchClusteringResults() {
  const res = await fetch(`${API_BASE}/clusters/`);
  return res.json();
}

export async function fetchDistricts(state = null) {
  const url = state
    ? `${API_BASE}/analytics/districts?state=${encodeURIComponent(state)}`
    : `${API_BASE}/analytics/districts`;
  const res = await fetch(url);
  return res.json();
}

export async function fetchFarmerSummary(crop, state = null) {
  const url = state
    ? `${API_BASE}/analytics/farmer-summary?crop=${encodeURIComponent(crop)}&state=${encodeURIComponent(state)}`
    : `${API_BASE}/analytics/farmer-summary?crop=${encodeURIComponent(crop)}`;
  const res = await fetch(url);
  return res.json();
}

