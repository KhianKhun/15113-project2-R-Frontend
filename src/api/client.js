const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

function resolveUrl(path) {
  return API_BASE ? `${API_BASE}${path}` : path;
}

async function request(path, options = {}) {
  const response = await fetch(resolveUrl(path), options);
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const rawMessage = payload?.detail || payload?.message || `Request failed (${response.status})`;
    const message = typeof rawMessage === "string" ? rawMessage : JSON.stringify(rawMessage);
    throw new Error(message);
  }

  return payload;
}

export async function uploadDataset(file) {
  const formData = new FormData();
  formData.append("file", file);

  return request("/api/datasets/upload", {
    method: "POST",
    body: formData
  });
}

export async function fetchPreview(datasetId, limit = 50) {
  return request(`/api/datasets/${encodeURIComponent(datasetId)}/preview?limit=${limit}`);
}

export async function transformDataset(datasetId, operations) {
  return request(`/api/datasets/${encodeURIComponent(datasetId)}/transform`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ operations })
  });
}

export async function downloadDatasetCsv(datasetId) {
  const response = await fetch(resolveUrl(`/api/datasets/${encodeURIComponent(datasetId)}/download`));

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const rawMessage = payload?.detail || payload?.message || `Request failed (${response.status})`;
    const message = typeof rawMessage === "string" ? rawMessage : JSON.stringify(rawMessage);
    throw new Error(message);
  }

  return response.blob();
}

export async function renderPlot(datasetId, plotPayload) {
  const response = await fetch(resolveUrl(`/api/datasets/${encodeURIComponent(datasetId)}/plots/render`), {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(plotPayload)
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const rawMessage = payload?.detail || payload?.message || `Request failed (${response.status})`;
    const message = typeof rawMessage === "string" ? rawMessage : JSON.stringify(rawMessage);
    throw new Error(message);
  }

  return response.blob();
}

export async function fitRegression(datasetId, regressionPayload) {
  return request(`/api/datasets/${encodeURIComponent(datasetId)}/regressions/fit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(regressionPayload)
  });
}

export async function renderRegressionCurve(modelId) {
  const response = await fetch(resolveUrl(`/api/regressions/${encodeURIComponent(modelId)}/curve`));

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const rawMessage = payload?.detail || payload?.message || `Request failed (${response.status})`;
    const message = typeof rawMessage === "string" ? rawMessage : JSON.stringify(rawMessage);
    throw new Error(message);
  }

  return response.blob();
}

export async function predictRegression(modelId, predictionPayload) {
  return request(`/api/regressions/${encodeURIComponent(modelId)}/predict`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(predictionPayload)
  });
}
