import { useState } from "react";

export default function UploadPanel({ onUpload, busy }) {
  const [selectedFile, setSelectedFile] = useState(null);

  function handleSubmit(event) {
    event.preventDefault();
    if (!selectedFile || busy) {
      return;
    }
    onUpload(selectedFile);
  }

  return (
    <form className="upload-panel" onSubmit={handleSubmit}>
      <label htmlFor="csv-upload">CSV file:</label>
      <input
        id="csv-upload"
        type="file"
        accept=".csv,text/csv"
        onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
      />
      <button type="submit" disabled={!selectedFile || busy}>
        {busy ? "Uploading..." : "Upload CSV"}
      </button>
    </form>
  );
}
