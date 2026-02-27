import { useState } from "react";
import {
  downloadDatasetCsv,
  fetchPreview,
  renderPlot,
  renderRegressionCurve,
  transformDataset,
  uploadDataset
} from "./api/client";
import ColumnSummary from "./components/ColumnSummary";
import DataPreviewTable from "./components/DataPreviewTable";
import PlotPanel from "./components/PlotPanel/PlotPanel";
import PredictionPanel from "./components/PredictionPanel/PredictionPanel";
import RegressionPanel from "./components/RegressionPanel/RegressionPanel";
import UploadPanel from "./components/UploadPanel";
import DropNA from "./components/TransformPanel/DropNA";
import FilterRows from "./components/TransformPanel/FilterRows";

const DEFAULT_PANEL_OPEN = {
  columns: true,
  transforms: true,
  plots: false,
  regression: false,
  prediction: false,
  dataPreview: true,
  plotPreview: true,
  regressionPreview: true,
  predictionPreview: true
};

export default function App() {
  const PREVIEW_LIMIT = 50;
  const [dataset, setDataset] = useState(null);
  const [history, setHistory] = useState([]);
  const [uploadResetToken, setUploadResetToken] = useState(0);
  const [busyUpload, setBusyUpload] = useState(false);
  const [busyTransform, setBusyTransform] = useState(false);
  const [busyDownload, setBusyDownload] = useState(false);
  const [busyPlot, setBusyPlot] = useState(false);
  const [plotBlob, setPlotBlob] = useState(null);
  const [plotUrl, setPlotUrl] = useState("");
  const [regressionCurveBlob, setRegressionCurveBlob] = useState(null);
  const [regressionCurveUrl, setRegressionCurveUrl] = useState("");
  const [regressionCurveModelId, setRegressionCurveModelId] = useState("");
  const [activeRegressionModel, setActiveRegressionModel] = useState(null);
  const [predictionResult, setPredictionResult] = useState(null);
  const [panelOpen, setPanelOpen] = useState(DEFAULT_PANEL_OPEN);
  const [errorMessage, setErrorMessage] = useState("");

  function clearRenderedVisuals() {
    if (plotUrl) {
      window.URL.revokeObjectURL(plotUrl);
    }
    if (regressionCurveUrl) {
      window.URL.revokeObjectURL(regressionCurveUrl);
    }
    setPlotBlob(null);
    setPlotUrl("");
    setRegressionCurveBlob(null);
    setRegressionCurveUrl("");
    setRegressionCurveModelId("");
    setActiveRegressionModel(null);
    setPredictionResult(null);
  }

  function toggleSection(sectionKey) {
    setPanelOpen((prev) => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
  }

  async function handleUpload(file) {
    setBusyUpload(true);
    setErrorMessage("");
    try {
      const result = await uploadDataset(file);
      clearRenderedVisuals();
      setDataset(result);
      setHistory([]);
      setPanelOpen(DEFAULT_PANEL_OPEN);
      setUploadResetToken((prev) => prev + 1);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setBusyUpload(false);
    }
  }

  async function applyOperation(operation) {
    if (!dataset?.dataset_id) {
      setErrorMessage("Please upload a dataset first.");
      return;
    }

    setBusyTransform(true);
    setErrorMessage("");
    try {
      const currentId = dataset.dataset_id;
      const result = await transformDataset(dataset.dataset_id, [operation]);
      setDataset(result);
      if (result.dataset_id !== currentId) {
        clearRenderedVisuals();
        setHistory((prev) => [...prev, currentId]);
      }
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setBusyTransform(false);
    }
  }

  async function handleUndo() {
    if (!history.length || !dataset?.dataset_id) {
      return;
    }

    const previousId = history[history.length - 1];

    setBusyTransform(true);
    setErrorMessage("");
    try {
      const restored = await fetchPreview(previousId, PREVIEW_LIMIT);
      clearRenderedVisuals();
      setDataset(restored);
      setHistory((prev) => prev.slice(0, -1));
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setBusyTransform(false);
    }
  }

  async function handleDownload() {
    if (!dataset?.dataset_id) {
      return;
    }

    setBusyDownload(true);
    setErrorMessage("");
    try {
      const blob = await downloadDatasetCsv(dataset.dataset_id);
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `dataset_${dataset.dataset_id.slice(0, 8)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(objectUrl);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setBusyDownload(false);
    }
  }

  async function handleRenderPlot(payload) {
    if (!dataset?.dataset_id) {
      setErrorMessage("Please upload a dataset first.");
      return;
    }

    setBusyPlot(true);
    setErrorMessage("");
    try {
      const blob = await renderPlot(dataset.dataset_id, payload);
      if (plotUrl) {
        window.URL.revokeObjectURL(plotUrl);
      }
      setPlotBlob(blob);
      setPlotUrl(window.URL.createObjectURL(blob));
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setBusyPlot(false);
    }
  }

  function handleDownloadPlot() {
    if (!plotBlob || !plotUrl || !dataset?.dataset_id) {
      return;
    }
    const link = document.createElement("a");
    link.href = plotUrl;
    link.download = `plot_${dataset.dataset_id.slice(0, 8)}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  function handleRegressionCurveRendered(blob, modelId) {
    if (regressionCurveUrl) {
      window.URL.revokeObjectURL(regressionCurveUrl);
    }
    setRegressionCurveBlob(blob);
    setRegressionCurveUrl(window.URL.createObjectURL(blob));
    setRegressionCurveModelId(modelId || "");
  }

  function handleRegressionModelFitted(fitResult) {
    setActiveRegressionModel(fitResult || null);
    setPredictionResult(null);
  }

  async function handlePredictionResult(result) {
    setPredictionResult(result);
    if (regressionCurveModelId && regressionCurveModelId === result.model_id) {
      try {
        const updatedCurveBlob = await renderRegressionCurve(result.model_id);
        if (regressionCurveUrl) {
          window.URL.revokeObjectURL(regressionCurveUrl);
        }
        setRegressionCurveBlob(updatedCurveBlob);
        setRegressionCurveUrl(window.URL.createObjectURL(updatedCurveBlob));
      } catch (error) {
        setErrorMessage(error.message);
      }
    }
  }

  function handleDownloadRegressionCurve() {
    if (!regressionCurveBlob || !regressionCurveUrl) {
      return;
    }
    const link = document.createElement("a");
    link.href = regressionCurveUrl;
    const suffix = regressionCurveModelId ? regressionCurveModelId.slice(0, 8) : "curve";
    link.download = `regression_curve_${suffix}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Project 2 Data Studio</h1>
        <p>UI-driven whitelist analysis pipeline (no arbitrary code execution).</p>
      </header>

      <UploadPanel key={`upload-${uploadResetToken}`} onUpload={handleUpload} busy={busyUpload} />

      {dataset && (
        <div className="dataset-meta">
          <p className="dataset-id">
            Current dataset id: <code>{dataset.dataset_id}</code>
          </p>
          <div className="dataset-actions">
            <button
              type="button"
              onClick={handleUndo}
              disabled={busyTransform || busyUpload || history.length === 0}
            >
              Undo Last Transform
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={busyDownload || busyTransform || busyUpload}
            >
              {busyDownload ? "Downloading..." : "Download Current CSV"}
            </button>
            <button
              type="button"
              onClick={handleDownloadPlot}
              disabled={!plotBlob || busyPlot}
            >
              Download Plot PNG
            </button>
            <button
              type="button"
              onClick={handleDownloadRegressionCurve}
              disabled={!regressionCurveBlob}
            >
              Download Regression Curve PNG
            </button>
          </div>
        </div>
      )}

      {errorMessage && <div className="error-box">{errorMessage}</div>}

      <main className="app-grid">
        <section className="panel">
          <section className="accordion-section left-accordion">
            <button type="button" className="section-toggle" onClick={() => toggleSection("dataPreview")}>
              <span>Data Preview</span>
              <span>{panelOpen.dataPreview ? "-" : "+"}</span>
            </button>
            {panelOpen.dataPreview && (
              <>
                <p className="muted">Fixed preview window. Showing first {PREVIEW_LIMIT} rows of current dataset.</p>
                <DataPreviewTable preview={dataset?.preview || []} schema={dataset?.schema || []} />
              </>
            )}
          </section>

          <section className="accordion-section left-accordion">
            <button type="button" className="section-toggle" onClick={() => toggleSection("plotPreview")}>
              <span>Plot Preview</span>
              <span>{panelOpen.plotPreview ? "-" : "+"}</span>
            </button>
            {panelOpen.plotPreview &&
              (plotUrl ? (
                <img className="plot-image" src={plotUrl} alt="Rendered plot preview" />
              ) : (
                <p className="muted">Render a plot from the right panel.</p>
              ))}
          </section>

          <section className="accordion-section left-accordion">
            <button type="button" className="section-toggle" onClick={() => toggleSection("regressionPreview")}>
              <span>Regression Curve Preview</span>
              <span>{panelOpen.regressionPreview ? "-" : "+"}</span>
            </button>
            {panelOpen.regressionPreview &&
              (regressionCurveUrl ? (
                <img className="regression-image" src={regressionCurveUrl} alt="Regression fitted curve preview" />
              ) : (
                <p className="muted">Fit a regression model, then click Draw Fitted Curve.</p>
              ))}
          </section>

          <section className="accordion-section left-accordion">
            <button type="button" className="section-toggle" onClick={() => toggleSection("predictionPreview")}>
              <span>Prediction Result</span>
              <span>{panelOpen.predictionPreview ? "-" : "+"}</span>
            </button>
            {panelOpen.predictionPreview && (
              <div className="prediction-result-box">
                {!predictionResult ? (
                  <p className="muted">No prediction yet.</p>
                ) : (
                  <>
                    <p>
                      <strong>Model:</strong> {predictionResult.model_type}
                    </p>
                    <p>
                      <strong>Response ({predictionResult.y}):</strong> {Number(predictionResult.prediction).toFixed(6)}
                    </p>
                    {predictionResult.predicted_class && (
                      <p>
                        <strong>Predicted Class:</strong> {predictionResult.predicted_class}
                      </p>
                    )}
                    {predictionResult.positive_class_probability !== null &&
                      predictionResult.positive_class_probability !== undefined && (
                        <p>
                          <strong>Positive Class Probability:</strong>{" "}
                          {Number(predictionResult.positive_class_probability).toFixed(6)}
                        </p>
                      )}
                    <p>
                      <strong>Curve Overlay:</strong>{" "}
                      {predictionResult.plot_x_in_inputs ? "Enabled" : "Skipped (plot_x not provided)"}
                    </p>
                    <p className="muted">{predictionResult.message}</p>
                  </>
                )}
              </div>
            )}
          </section>
        </section>

        <aside className="panel side-panel">
          <section className="accordion-section">
            <button type="button" className="section-toggle" onClick={() => toggleSection("columns")}>
              <span>Columns</span>
              <span>{panelOpen.columns ? "-" : "+"}</span>
            </button>
            {panelOpen.columns && <ColumnSummary schema={dataset?.schema || []} summary={dataset?.summary || null} />}
          </section>

          <section className="accordion-section">
            <button type="button" className="section-toggle" onClick={() => toggleSection("transforms")}>
              <span>Transforms</span>
              <span>{panelOpen.transforms ? "-" : "+"}</span>
            </button>
            {panelOpen.transforms && (
              <>
                <DropNA
                  key={`dropna-${uploadResetToken}`}
                  columns={dataset?.schema || []}
                  onApply={applyOperation}
                  disabled={!dataset || busyTransform}
                />
                <FilterRows
                  key={`filter-${uploadResetToken}`}
                  columns={dataset?.schema || []}
                  onApply={applyOperation}
                  disabled={!dataset || busyTransform}
                />
              </>
            )}
          </section>

          <section className="accordion-section">
            <button type="button" className="section-toggle" onClick={() => toggleSection("plots")}>
              <span>Plots</span>
              <span>{panelOpen.plots ? "-" : "+"}</span>
            </button>
            {panelOpen.plots && (
              <PlotPanel
                key={`plot-${uploadResetToken}`}
                columns={dataset?.schema || []}
                disabled={!dataset || busyPlot || busyTransform || busyUpload}
                onRender={handleRenderPlot}
              />
            )}
          </section>

          <section className="accordion-section">
            <button type="button" className="section-toggle" onClick={() => toggleSection("regression")}>
              <span>Regression</span>
              <span>{panelOpen.regression ? "-" : "+"}</span>
            </button>
            {panelOpen.regression && (
              <RegressionPanel
                key={dataset?.dataset_id || "regression-empty"}
                datasetId={dataset?.dataset_id || ""}
                columns={dataset?.schema || []}
                disabled={!dataset || busyTransform || busyUpload}
                onCurveRendered={handleRegressionCurveRendered}
                onModelFitted={handleRegressionModelFitted}
              />
            )}
          </section>

          <section className="accordion-section">
            <button type="button" className="section-toggle" onClick={() => toggleSection("prediction")}>
              <span>Prediction</span>
              <span>{panelOpen.prediction ? "-" : "+"}</span>
            </button>
            {panelOpen.prediction && (
              <PredictionPanel
                key={`prediction-${uploadResetToken}`}
                regressionModel={activeRegressionModel}
                disabled={!dataset || busyTransform || busyUpload}
                onPredicted={handlePredictionResult}
              />
            )}
          </section>
        </aside>
      </main>
    </div>
  );
}
