import { useEffect, useMemo, useState } from "react";

const FACTOR_OPS = ["==", "!=", "contains", "startswith", "endswith"];
const NUMERIC_OPS = ["==", "!=", "<", "<=", ">", ">=", "exp", "log", "^", "+"];
const NUMERIC_TYPES = new Set(["integer", "float"]);
const STRICT_NUMERIC_OPS = new Set(["<", "<=", ">", ">=", "exp", "log", "^", "+"]);
const UNARY_MATH_OPS = new Set(["exp", "log"]);

export default function FilterRows({ columns, onApply, disabled }) {
  const [col, setCol] = useState("");
  const [factorOp, setFactorOp] = useState("");
  const [numericOp, setNumericOp] = useState("");
  const [value, setValue] = useState("");
  const [createNewColumn, setCreateNewColumn] = useState(false);
  const [localError, setLocalError] = useState("");

  const columnNames = useMemo(() => columns.map((item) => item.name), [columns]);
  const selectedType = useMemo(
    () => columns.find((item) => item.name === col)?.type || "string",
    [columns, col]
  );

  useEffect(() => {
    if (!columns.length) {
      setCol("");
      return;
    }
    if (!columnNames.includes(col)) {
      setCol(columnNames[0]);
    }
  }, [columns, columnNames, col]);

  useEffect(() => {
    if (!col) {
      setFactorOp("");
      setNumericOp("");
      return;
    }

    if (NUMERIC_TYPES.has(selectedType)) {
      setNumericOp((prev) => prev || "==");
      setFactorOp("");
    } else {
      setFactorOp((prev) => prev || "==");
      setNumericOp("");
    }
  }, [col, selectedType]);

  const op = numericOp || factorOp;
  const isUnaryMath = UNARY_MATH_OPS.has(op);

  useEffect(() => {
    if (isUnaryMath) {
      setValue("NA");
      return;
    }
    if (value === "NA") {
      setValue("");
    }
  }, [isUnaryMath, value]);

  function onFactorOperatorChange(nextValue) {
    setFactorOp(nextValue);
    if (nextValue) {
      setNumericOp("");
    }
  }

  function onNumericOperatorChange(nextValue) {
    setNumericOp(nextValue);
    if (nextValue) {
      setFactorOp("");
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (disabled || !col || !op) {
      return;
    }

    try {
      if (STRICT_NUMERIC_OPS.has(op) && !NUMERIC_TYPES.has(selectedType)) {
        throw new Error(`Operator '${op}' requires a numeric column.`);
      }
      const parsedValue = parseValue({ op, value, selectedType });
      setLocalError("");
      onApply({
        op: "filter_rows",
        args: {
          clauses: [{ col, op, value: parsedValue }],
          create_new_column: createNewColumn
        }
      });
    } catch (error) {
      setLocalError(error.message);
    }
  }

  return (
    <form className="transform-card" onSubmit={handleSubmit}>
      <h3>Filter Rows</h3>
      <label htmlFor="filter-col">Column</label>
      <select
        id="filter-col"
        value={col}
        onChange={(event) => setCol(event.target.value)}
        disabled={disabled || !columns.length}
      >
        {columnNames.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>

      <label htmlFor="filter-op-factor">Operator (factor)</label>
      <select
        id="filter-op-factor"
        value={factorOp}
        onChange={(event) => onFactorOperatorChange(event.target.value)}
        disabled={disabled}
      >
        <option value="">(none)</option>
        {FACTOR_OPS.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>

      <label htmlFor="filter-op-numeric">Operator (numeric)</label>
      <select
        id="filter-op-numeric"
        value={numericOp}
        onChange={(event) => onNumericOperatorChange(event.target.value)}
        disabled={disabled}
      >
        <option value="">(none)</option>
        {NUMERIC_OPS.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>

      <label htmlFor="filter-value">Value</label>
      <input
        id="filter-value"
        type="text"
        placeholder={op === "^" ? "exponent" : op === "+" ? "increment" : isUnaryMath ? "NA (auto)" : "value"}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        disabled={disabled || isUnaryMath}
      />

      <label className="inline-checkbox" htmlFor="filter-create-new-col">
        <input
          id="filter-create-new-col"
          type="checkbox"
          checked={createNewColumn}
          onChange={(event) => setCreateNewColumn(event.target.checked)}
          disabled={disabled}
        />
        Add as new column
      </label>

      {localError && <p className="error-inline">{localError}</p>}

      <button type="submit" disabled={disabled || !columns.length || !op}>
        Apply Filter
      </button>
    </form>
  );
}

function parseValue({ op, value, selectedType }) {
  if (UNARY_MATH_OPS.has(op)) {
    return null;
  }

  if (["<", "<=", ">", ">=", "^", "+"].includes(op)) {
    const n = Number(value);
    if (Number.isNaN(n)) {
      throw new Error("Numeric operators require a numeric value.");
    }
    return n;
  }

  if (NUMERIC_TYPES.has(selectedType) && value !== "" && !["contains", "startswith", "endswith"].includes(op)) {
    const n = Number(value);
    if (!Number.isNaN(n)) {
      return n;
    }
  }

  return value;
}
