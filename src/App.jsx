import { useState } from "react";
import { downloadDatasetCsv, fetchPreview, renderPlot, transformDataset, uploadDataset } from "./api/client";
import ColumnSummary from "./components/ColumnSummary";
import DataPreviewTable from "./components/DataPreviewTable";
import PlotPanel from "./components/PlotPanel/PlotPanel";
import UploadPanel from "./components/UploadPanel";
import DropNA from "./components/TransformPanel/DropNA";
import FilterRows from "./components/TransformPanel/FilterRows";

export default function App() {
  const PREVIEW_LIMIT = 50;
  const [dataset, setDataset] = useState(null);
  const [history, setHistory] = useState([]);
  const [busyUpload, setBusyUpload] = useState(false);
  const [busyTransform, setBusyTransform] = useState(false);
  const [busyDownload, setBusyDownload] = useState(false);
  const [busyPlot, setBusyPlot] = useState(false);
  const [plotBlob, setPlotBlob] = useState(null);
  const [plotUrl, setPlotUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleUpload(file) {
    setBusyUpload(true);
    setErrorMessage("");
    try {
      const result = await uploadDataset(file);
      if (plotUrl) {
        window.URL.revokeObjectURL(plotUrl);
      }
      setPlotBlob(null);
      setPlotUrl("");
      setDataset(result);
      setHistory([]);
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
      if (plotUrl) {
        window.URL.revokeObjectURL(plotUrl);
      }
      setPlotBlob(null);
      setPlotUrl("");
      setDataset(result);
      setHistory((prev) => [...prev, currentId]);
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
      if (plotUrl) {
        window.URL.revokeObjectURL(plotUrl);
      }
      setPlotBlob(null);
      setPlotUrl("");
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

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Project 2 Data Studio</h1>
        <p>UI-driven whitelist analysis pipeline (no arbitrary code execution).</p>
      </header>

      <UploadPanel onUpload={handleUpload} busy={busyUpload} />

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
          </div>
        </div>
      )}

      {errorMessage && <div className="error-box">{errorMessage}</div>}

      <main className="app-grid">
        <section className="panel">
          <h2>Data Preview</h2>
          <p className="muted">Fixed preview window. Showing first {PREVIEW_LIMIT} rows of current dataset.</p>
          <DataPreviewTable preview={dataset?.preview || []} schema={dataset?.schema || []} />
          <div className="plot-viewer">
            <h2>Plot Preview</h2>
            {plotUrl ? (
              <img className="plot-image" src={plotUrl} alt="Rendered plot preview" />
            ) : (
              <p className="muted">Render a plot from the right panel.</p>
            )}
          </div>
        </section>

        <aside className="panel side-panel">
          <h2>Columns</h2>
          <ColumnSummary schema={dataset?.schema || []} summary={dataset?.summary || null} />

          <h2>Transforms</h2>
          <DropNA
            columns={dataset?.schema || []}
            onApply={applyOperation}
            disabled={!dataset || busyTransform}
          />
          <FilterRows
            columns={dataset?.schema || []}
            onApply={applyOperation}
            disabled={!dataset || busyTransform}
          />

          <h2>Plots</h2>
          <PlotPanel
            columns={dataset?.schema || []}
            disabled={!dataset || busyPlot || busyTransform || busyUpload}
            onRender={handleRenderPlot}
          />
        </aside>
      </main>
    </div>
  );
}
