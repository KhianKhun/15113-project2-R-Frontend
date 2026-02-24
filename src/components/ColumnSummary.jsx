export default function ColumnSummary({ schema, summary }) {
  if (!schema.length) {
    return <p className="muted">No columns loaded.</p>;
  }

  const naCount = summary?.na_count || {};

  return (
    <div className="table-wrap">
      <p className="summary-line">
        Rows: <strong>{summary?.rows ?? 0}</strong> | Columns: <strong>{summary?.cols ?? 0}</strong>
      </p>
      <table>
        <thead>
          <tr>
            <th>Column</th>
            <th>Type</th>
            <th>NA</th>
          </tr>
        </thead>
        <tbody>
          {schema.map((column) => (
            <tr key={column.name}>
              <td>{column.name}</td>
              <td>{column.type}</td>
              <td>{naCount[column.name] ?? 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
