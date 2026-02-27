import { useMemo, useState } from "react";

const PLOT_TYPES = [
  { value: "histogram", label: "Histogram" },
  { value: "scatter", label: "Scatter Plot" },
  { value: "boxplot", label: "Boxplot" },
  { value: "line", label: "Line Plot" },
  { value: "bar", label: "Bar Plot" }
];

export default function PlotPanel({ columns, disabled, onRender }) {
  const [plotType, setPlotType] = useState("histogram");
  const [selectedVars, setSelectedVars] = useState([]);
  const [x, setX] = useState("");
  const [y, setY] = useState("");
  const [colorBy, setColorBy] = useState("");
  const [shapeBy, setShapeBy] = useState("");
  const [binwidth, setBinwidth] = useState("");
  const [alpha, setAlpha] = useState("0.75");
  const [lineWidth, setLineWidth] = useState("1.8");
  const [agg, setAgg] = useState("count");
  const [localError, setLocalError] = useState("");

  const names = useMemo(() => columns.map((c) => c.name), [columns]);

  function toggleVar(name) {
    setSelectedVars((prev) => (prev.includes(name) ? prev.filter((xv) => xv !== name) : [...prev, name]));
  }

  function submit(event) {
    event.preventDefault();
    if (disabled) return;

    const payload = {
      plot_type: plotType,
      columns: selectedVars,
      x: x || null,
      y: y || null,
      color_by: colorBy || null,
      shape_by: shapeBy || null,
      params: {}
    };

    if (plotType === "histogram") {
      if (!selectedVars.length) return setLocalError("Histogram requires at least one selected variable.");
      if (binwidth) payload.params.binwidth = Number(binwidth);
      payload.params.alpha = Number(alpha || 0.45);
    } else if (plotType === "scatter") {
      if (!x || !y) return setLocalError("Scatter plot requires both x and y.");
      payload.params.alpha = Number(alpha || 0.75);
    } else if (plotType === "boxplot") {
      if (!(selectedVars.length || (x && y))) {
        return setLocalError("Boxplot requires selected variables or both x and y.");
      }
    } else if (plotType === "line") {
      if (!selectedVars.length) return setLocalError("Line plot requires at least one y variable.");
      payload.params.alpha = Number(alpha || 0.9);
      payload.params.linewidth = Number(lineWidth || 1.8);
    } else if (plotType === "bar") {
      if (!x) return setLocalError("Bar plot requires x.");
      payload.params.agg = agg;
    }

    setLocalError("");
    onRender(payload);
  }

  return (
    <form className="transform-card plot-panel" onSubmit={submit}>
      <h3>Plot Studio</h3>

      <label htmlFor="plot-type">Plot Type</label>
      <select id="plot-type" value={plotType} onChange={(e) => setPlotType(e.target.value)} disabled={disabled}>
        {PLOT_TYPES.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>

      <label>Variables (multi-select)</label>
      <div className="var-pick-list">
        {names.map((name) => (
          <label key={name} className="var-pick-item">
            <input
              type="checkbox"
              checked={selectedVars.includes(name)}
              onChange={() => toggleVar(name)}
              disabled={disabled}
            />
            <span>{name}</span>
          </label>
        ))}
      </div>

      {(plotType === "scatter" || plotType === "boxplot" || plotType === "line" || plotType === "bar") && (
        <>
          <label htmlFor="plot-x">X</label>
          <select id="plot-x" value={x} onChange={(e) => setX(e.target.value)} disabled={disabled}>
            <option value="">(None)</option>
            {names.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </>
      )}

      {(plotType === "scatter" || plotType === "boxplot") && (
        <>
          <label htmlFor="plot-y">Y</label>
          <select id="plot-y" value={y} onChange={(e) => setY(e.target.value)} disabled={disabled}>
            <option value="">(None)</option>
            {names.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </>
      )}

      {plotType === "scatter" && (
        <>
          <label htmlFor="plot-color">Color By (optional)</label>
          <select id="plot-color" value={colorBy} onChange={(e) => setColorBy(e.target.value)} disabled={disabled}>
            <option value="">(None)</option>
            {names.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>

          <label htmlFor="plot-shape">Shape By (factor only, optional)</label>
          <select id="plot-shape" value={shapeBy} onChange={(e) => setShapeBy(e.target.value)} disabled={disabled}>
            <option value="">(None)</option>
            {names.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </>
      )}

      {plotType === "histogram" && (
        <>
          <label htmlFor="plot-binwidth">Binwidth (optional)</label>
          <input
            id="plot-binwidth"
            type="number"
            step="any"
            value={binwidth}
            onChange={(e) => setBinwidth(e.target.value)}
            disabled={disabled}
          />
        </>
      )}

      {(plotType === "scatter" || plotType === "line" || plotType === "histogram") && (
        <>
          <label htmlFor="plot-alpha">Alpha</label>
          <input
            id="plot-alpha"
            type="number"
            step="0.05"
            min="0.05"
            max="1"
            value={alpha}
            onChange={(e) => setAlpha(e.target.value)}
            disabled={disabled}
          />
        </>
      )}

      {plotType === "line" && (
        <>
          <label htmlFor="plot-linewidth">Line Width</label>
          <input
            id="plot-linewidth"
            type="number"
            step="0.1"
            min="0.4"
            max="6"
            value={lineWidth}
            onChange={(e) => setLineWidth(e.target.value)}
            disabled={disabled}
          />
        </>
      )}

      {plotType === "bar" && (
        <>
          <label htmlFor="plot-agg">Aggregation</label>
          <select id="plot-agg" value={agg} onChange={(e) => setAgg(e.target.value)} disabled={disabled}>
            <option value="count">count</option>
            <option value="mean">mean</option>
            <option value="sum">sum</option>
          </select>
        </>
      )}

      {localError && <p className="error-inline">{localError}</p>}
      <button type="submit" disabled={disabled}>
        Render Plot
      </button>
    </form>
  );
}

