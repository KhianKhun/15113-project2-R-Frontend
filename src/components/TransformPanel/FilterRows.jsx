import { useEffect, useMemo, useState } from "react";

const OPS = ["==", "!=", "<", "<=", ">", ">=", "contains", "startswith", "endswith", "is_in"];
const NUMERIC_TYPES = new Set(["integer", "float"]);

export default function FilterRows({ columns, onApply, disabled }) {
  const [logic, setLogic] = useState("AND");
  const [col, setCol] = useState("");
  const [op, setOp] = useState("==");
  const [value, setValue] = useState("");
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

  function handleSubmit(event) {
    event.preventDefault();
    if (disabled || !col) {
      return;
    }

    try {
      const parsedValue = parseValue({ op, value, selectedType });
      setLocalError("");
      onApply({
        op: "filter_rows",
        args: {
          logic,
          clauses: [{ col, op, value: parsedValue }]
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

      <label htmlFor="filter-op">Operator</label>
      <select id="filter-op" value={op} onChange={(event) => setOp(event.target.value)} disabled={disabled}>
        {OPS.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>

      <label htmlFor="filter-value">Value</label>
      <input
        id="filter-value"
        type="text"
        placeholder={op === "is_in" ? "a,b,c" : "value"}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        disabled={disabled}
      />

      <label htmlFor="filter-logic">Logic</label>
      <select
        id="filter-logic"
        value={logic}
        onChange={(event) => setLogic(event.target.value)}
        disabled={disabled}
      >
        <option value="AND">AND</option>
        <option value="OR">OR</option>
      </select>

      {localError && <p className="error-inline">{localError}</p>}

      <button type="submit" disabled={disabled || !columns.length}>
        Apply Filter
      </button>
    </form>
  );
}

function parseValue({ op, value, selectedType }) {
  if (op === "is_in") {
    const items = value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    if (!items.length) {
      throw new Error("is_in requires at least one value.");
    }
    if (NUMERIC_TYPES.has(selectedType)) {
      return items.map((item) => {
        const n = Number(item);
        return Number.isNaN(n) ? item : n;
      });
    }
    return items;
  }

  if (["<", "<=", ">", ">="].includes(op)) {
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
