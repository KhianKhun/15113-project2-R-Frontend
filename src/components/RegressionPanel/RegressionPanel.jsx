import { useEffect, useMemo, useState } from "react";
import { fitRegression, renderRegressionCurve } from "../../api/client";

const MODEL_OPTIONS = [
  { value: "linear", label: "Linear Regression" },
  { value: "polynomial", label: "Polynomial Regression (1+x+...+x^p)" },
  { value: "kernel_smoother", label: "Kernel Smoother" },
  { value: "knn_smoother", label: "KNN Smoother" },
  { value: "spline_smoother", label: "Spline Smoother" },
  { value: "additive_model", label: "Additive Model" },
  { value: "logistic_regression", label: "Logistic Regression" }
];

const SINGLE_X_MODELS = new Set(["polynomial", "kernel_smoother", "knn_smoother", "spline_smoother"]);

export default function RegressionPanel({
  datasetId,
  columns,
  disabled,
  onCurveRendered,
  onModelFitted
}) {
  const [modelType, setModelType] = useState("linear");
  const [targetCol, setTargetCol] = useState("");
  const [features, setFeatures] = useState([]);
  const [plotX, setPlotX] = useState("");
  const [degree, setDegree] = useState("2");
  const [bandwidth, setBandwidth] = useState("1.0");
  const [kNeighbors, setKNeighbors] = useState("15");
  const [smoothS, setSmoothS] = useState("");
  const [nKnots, setNKnots] = useState("6");
  const [ridgeAlpha, setRidgeAlpha] = useState("1.0");
  const [cValue, setCValue] = useState("1.0");
  const [maxIter, setMaxIter] = useState("1000");
  const [fitResult, setFitResult] = useState(null);
  const [busyFit, setBusyFit] = useState(false);
  const [busyCurve, setBusyCurve] = useState(false);
  const [localError, setLocalError] = useState("");

  const numericColumns = useMemo(
    () => columns.filter((c) => c.type === "integer" || c.type === "float").map((c) => c.name),
    [columns]
  );
  const allColumns = useMemo(() => columns.map((c) => c.name), [columns]);
  const targetChoices = modelType === "logistic_regression" ? allColumns : numericColumns;
  const featureChoices = numericColumns.filter((c) => c !== targetCol);
  const singleXOnly = SINGLE_X_MODELS.has(modelType);

  useEffect(() => {
    setFeatures((prev) => prev.filter((name) => featureChoices.includes(name)));
  }, [targetCol, columns, modelType]); // keep selected features valid when target/schema/model changes

  useEffect(() => {
    if (singleXOnly) {
      setFeatures((prev) => (prev.length > 1 ? [prev[0]] : prev));
    }
  }, [singleXOnly]);

  useEffect(() => {
    if (plotX && !features.includes(plotX)) {
      setPlotX("");
    }
  }, [plotX, features]);

  function toggleFeature(name) {
    setFeatures((prev) => {
      if (singleXOnly) {
        return prev.includes(name) ? [] : [name];
      }
      return prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name];
    });
  }

  async function handleFit(event) {
    event.preventDefault();
    if (disabled || !datasetId) return;

    if (!targetCol) return setLocalError("Please select y variable first.");
    if (!features.length) return setLocalError("Please select at least one x feature.");
    if (singleXOnly && features.length !== 1) return setLocalError("This model requires exactly one x feature.");

    const payload = {
      model_type: modelType,
      y: targetCol,
      x: features,
      plot_x: plotX || features[0],
      params: buildParams({
        modelType,
        degree,
        bandwidth,
        kNeighbors,
        smoothS,
        nKnots,
        ridgeAlpha,
        cValue,
        maxIter
      })
    };

    setBusyFit(true);
    setLocalError("");
    try {
      const result = await fitRegression(datasetId, payload);
      setFitResult(result);
      if (onModelFitted) {
        onModelFitted(result);
      }
    } catch (error) {
      setLocalError(error.message);
    } finally {
      setBusyFit(false);
    }
  }

  async function handleRenderCurve() {
    if (!fitResult?.model_id || disabled) return;
    setBusyCurve(true);
    setLocalError("");
    try {
      const blob = await renderRegressionCurve(fitResult.model_id);
      if (onCurveRendered) {
        onCurveRendered(blob, fitResult.model_id);
      }
    } catch (error) {
      setLocalError(error.message);
    } finally {
      setBusyCurve(false);
    }
  }

  return (
    <form className="transform-card regression-panel" onSubmit={handleFit}>
      <h3>Regression</h3>

      <label htmlFor="reg-model-type">Model Type</label>
      <select id="reg-model-type" value={modelType} onChange={(e) => setModelType(e.target.value)} disabled={disabled}>
        {MODEL_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <label htmlFor="reg-target">Y Variable</label>
      <select id="reg-target" value={targetCol} onChange={(e) => setTargetCol(e.target.value)} disabled={disabled}>
        <option value="">(Select y)</option>
        {targetChoices.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>

      <label>X Variables</label>
      <div className="var-pick-list">
        {featureChoices.map((name) => (
          <label className="var-pick-item" key={name}>
            <input type="checkbox" checked={features.includes(name)} onChange={() => toggleFeature(name)} disabled={disabled} />
            <span>{name}</span>
          </label>
        ))}
      </div>

      <label htmlFor="reg-plot-x">Curve X Axis</label>
      <select id="reg-plot-x" value={plotX} onChange={(e) => setPlotX(e.target.value)} disabled={disabled}>
        <option value="">(Use first selected x)</option>
        {features.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>

      {modelType === "polynomial" && (
        <>
          <label htmlFor="reg-degree">Degree p</label>
          <input id="reg-degree" type="number" min="1" max="10" value={degree} onChange={(e) => setDegree(e.target.value)} />
        </>
      )}

      {modelType === "kernel_smoother" && (
        <>
          <label htmlFor="reg-bandwidth">Bandwidth</label>
          <input
            id="reg-bandwidth"
            type="number"
            step="0.01"
            min="0.001"
            value={bandwidth}
            onChange={(e) => setBandwidth(e.target.value)}
          />
        </>
      )}

      {modelType === "knn_smoother" && (
        <>
          <label htmlFor="reg-knn">K Neighbors</label>
          <input id="reg-knn" type="number" min="1" value={kNeighbors} onChange={(e) => setKNeighbors(e.target.value)} />
        </>
      )}

      {modelType === "spline_smoother" && (
        <>
          <label htmlFor="reg-smooth-s">Spline s (optional)</label>
          <input
            id="reg-smooth-s"
            type="number"
            step="0.1"
            placeholder="auto if empty"
            value={smoothS}
            onChange={(e) => setSmoothS(e.target.value)}
          />
        </>
      )}

      {modelType === "additive_model" && (
        <>
          <label htmlFor="reg-nknots">n_knots</label>
          <input id="reg-nknots" type="number" min="3" max="20" value={nKnots} onChange={(e) => setNKnots(e.target.value)} />
          <label htmlFor="reg-ridge-alpha">ridge_alpha</label>
          <input
            id="reg-ridge-alpha"
            type="number"
            min="0.000001"
            step="0.1"
            value={ridgeAlpha}
            onChange={(e) => setRidgeAlpha(e.target.value)}
          />
        </>
      )}

      {modelType === "logistic_regression" && (
        <>
          <label htmlFor="reg-c">C</label>
          <input id="reg-c" type="number" min="0.000001" step="0.1" value={cValue} onChange={(e) => setCValue(e.target.value)} />
          <label htmlFor="reg-max-iter">max_iter</label>
          <input id="reg-max-iter" type="number" min="100" value={maxIter} onChange={(e) => setMaxIter(e.target.value)} />
        </>
      )}

      {localError && <p className="error-inline">{localError}</p>}

      <button type="submit" disabled={disabled || busyFit}>
        {busyFit ? "Fitting..." : "Fit Model"}
      </button>

      {fitResult && (
        <div className="fit-result-box">
          <p>
            <strong>Model ID:</strong> {fitResult.model_id}
          </p>
          <p className="muted">{fitResult.message}</p>
          <div className="metric-list">
            {Object.entries(fitResult.metrics).map(([k, v]) => (
              <span key={k} className="metric-chip">
                {k}: {Number(v).toFixed(4)}
              </span>
            ))}
          </div>
          <button type="button" onClick={handleRenderCurve} disabled={busyCurve}>
            {busyCurve ? "Rendering..." : "Draw Fitted Curve"}
          </button>
          <p className="muted">Curve preview appears on the left panel.</p>
        </div>
      )}
    </form>
  );
}

function buildParams({
  modelType,
  degree,
  bandwidth,
  kNeighbors,
  smoothS,
  nKnots,
  ridgeAlpha,
  cValue,
  maxIter
}) {
  if (modelType === "polynomial") {
    return { degree: Number(degree || 2) };
  }
  if (modelType === "kernel_smoother") {
    return { bandwidth: Number(bandwidth || 1.0) };
  }
  if (modelType === "knn_smoother") {
    return { n_neighbors: Number(kNeighbors || 15) };
  }
  if (modelType === "spline_smoother") {
    return smoothS === "" ? {} : { s: Number(smoothS) };
  }
  if (modelType === "additive_model") {
    return {
      n_knots: Number(nKnots || 6),
      ridge_alpha: Number(ridgeAlpha || 1.0)
    };
  }
  if (modelType === "logistic_regression") {
    return {
      c: Number(cValue || 1.0),
      max_iter: Number(maxIter || 1000)
    };
  }
  return {};
}
