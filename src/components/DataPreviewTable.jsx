export default function DataPreviewTable({ preview, schema }) {
  const columns =
    schema.length > 0 ? schema.map((item) => item.name) : preview[0] ? Object.keys(preview[0]) : [];

  if (columns.length === 0) {
    return <p className="muted">Upload a CSV file to see preview rows.</p>;
  }

  return (
    <div className="table-wrap preview-table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {preview.length === 0 && (
            <tr>
              <td colSpan={columns.length}>No rows to display.</td>
            </tr>
          )}
          {preview.map((row, index) => (
            <tr key={index}>
              {columns.map((column) => (
                <td key={`${index}-${column}`}>{formatValue(row[column])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatValue(value) {
  if (value === null || value === undefined) {
    return "";
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
}
