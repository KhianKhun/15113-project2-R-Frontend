import { useState } from "react";

export default function DropNA({ columns, onApply, disabled }) {
  const [subsetText, setSubsetText] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    if (disabled) {
      return;
    }

    const subset = subsetText
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    onApply({
      op: "drop_na_rows",
      args: subset.length ? { subset } : {}
    });
  }

  return (
    <form className="transform-card" onSubmit={handleSubmit}>
      <h3>Drop NA Rows</h3>
      <p className="muted">Leave blank to drop rows with NA in any column.</p>
      <label htmlFor="dropna-subset">Subset columns (comma separated)</label>
      <input
        id="dropna-subset"
        type="text"
        placeholder={columns.map((column) => column.name).join(", ")}
        value={subsetText}
        onChange={(event) => setSubsetText(event.target.value)}
        disabled={disabled}
      />
      <button type="submit" disabled={disabled}>
        Apply DropNA
      </button>
    </form>
  );
}
