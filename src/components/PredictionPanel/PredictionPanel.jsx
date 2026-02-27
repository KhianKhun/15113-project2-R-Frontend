import { useEffect, useState } from "react";
import { predictRegression } from "../../api/client";

export default function PredictionPanel({ regressionModel, disabled, onPredicted }) {
  const [featureInputs, setFeatureInputs] = useState({});
  const [busyPredict, setBusyPredict] = useState(false);
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    setFeatureInputs({});
    setLocalError("");
  }, [regressionModel?.model_id]);

  function updateFeature(name, value) {
    setFeatureInputs((prev) => ({ ...prev, [name]: value }));
  }

  async function handlePredict(event) {
    event.preventDefault();
    if (disabled || !regressionModel?.model_id) return;

    const payloadValues = {};
    for (const feature of regressionModel.x || []) {
      const raw = featureInputs[feature];
      if (raw === "" || raw === undefined || raw === null) {
        continue;
      }
      const numeric = Number(raw);
      if (Number.isNaN(numeric)) {
        setLocalError(`Feature '${feature}' must be numeric.`);
        return;
      }
      payloadValues[feature] = numeric;
    }

    if (!Object.keys(payloadValues).length) {
      setLocalError("Please provide at least one feature value.");
      return;
    }

    setBusyPredict(true);
    setLocalError("");
    try {
      const result = await predictRegression(regressionModel.model_id, {
        feature_values: payloadValues
      });
      if (onPredicted) {
        onPredicted(result);
      }
    } catch (error) {
      setLocalError(error.message);
    } finally {
      setBusyPredict(false);
    }
  }

  return (
    <form className="transform-card prediction-panel" onSubmit={handlePredict}>
      <h3>Prediction</h3>

      {!regressionModel ? (
        <p className="muted">Fit a regression model first.</p>
      ) : (
        <>
          <p className="muted">
            Active model: <strong>{regressionModel.model_type}</strong>
          </p>
          <p className="muted">
            Response variable: <strong>{regressionModel.y}</strong>
          </p>
          {regressionModel.x.map((featureName) => (
            <div key={featureName} className="prediction-input-row">
              <label htmlFor={`pred-${featureName}`}>{featureName}</label>
              <input
                id={`pred-${featureName}`}
                type="number"
                step="any"
                value={featureInputs[featureName] ?? ""}
                onChange={(e) => updateFeature(featureName, e.target.value)}
                disabled={disabled}
              />
            </div>
          ))}
          <p className="muted">
            To show green guide lines on curve, provide value for plot axis:{" "}
            <strong>{regressionModel.plot_x}</strong>
          </p>
          {localError && <p className="error-inline">{localError}</p>}
          <button type="submit" disabled={disabled || busyPredict}>
            {busyPredict ? "Predicting..." : "Predict"}
          </button>
        </>
      )}
    </form>
  );
}
