import { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, AlertTriangle, CheckCircle } from 'lucide-react';
import { parseCsv, deduplicateLeads } from '../utils/dedup';
import { useCrm } from '../context/CrmContext';

export default function CsvUploader({ onImportComplete }) {
  const { leads, addLeadsBulk } = useCrm();
  const [dragOver, setDragOver] = useState(false);
  const [parsed, setParsed] = useState(null);
  const [dedupResult, setDedupResult] = useState(null);
  const [importing, setImporting] = useState(false);
  const fileRef = useRef(null);

  const handleFile = (file) => {
    if (!file || !file.name.endsWith('.csv')) {
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const parsedLeads = parseCsv(text);
      setParsed(parsedLeads);

      // Run dedup
      const result = deduplicateLeads(parsedLeads, leads);
      setDedupResult(result);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleImport = async () => {
    if (!dedupResult?.clean?.length) return;
    setImporting(true);
    await addLeadsBulk(dedupResult.clean);
    setImporting(false);
    setParsed(null);
    setDedupResult(null);
    onImportComplete?.();
  };

  return (
    <div>
      <div
        className={`crm-csv-dropzone ${dragOver ? 'dragover' : ''}`}
        onClick={() => fileRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <Upload />
        <h4>Upload CSV File</h4>
        <p>Drag & drop your CSV file here, or click to browse</p>
        <p style={{ marginTop: 8, fontSize: '0.75rem', color: 'var(--crm-text-muted)' }}>
          Expected columns: Name, Phone, Email, Company, City, Notes
        </p>
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          style={{ display: 'none' }}
          onChange={e => handleFile(e.target.files[0])}
        />
      </div>

      {dedupResult && (
        <div className="crm-csv-preview">
          <div className="crm-csv-summary">
            <div className="crm-csv-summary-item" style={{ background: 'rgba(34,197,94,0.1)', color: 'var(--crm-green)' }}>
              <CheckCircle size={16} />
              {dedupResult.clean.length} clean leads
            </div>
            {dedupResult.duplicates.length > 0 && (
              <div className="crm-csv-summary-item" style={{ background: 'rgba(249,115,22,0.1)', color: 'var(--crm-orange)' }}>
                <AlertTriangle size={16} />
                {dedupResult.duplicates.length} duplicates skipped
              </div>
            )}
            <div className="crm-csv-summary-item" style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--crm-blue)' }}>
              <FileSpreadsheet size={16} />
              {parsed?.length} total in CSV
            </div>
          </div>

          {dedupResult.clean.length > 0 && (
            <>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 12 }}>
                Preview ({Math.min(dedupResult.clean.length, 5)} of {dedupResult.clean.length})
              </h4>
              <div className="crm-table-container" style={{ border: '1px solid var(--crm-border)', borderRadius: 'var(--crm-radius)' }}>
                <table className="crm-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Phone</th>
                      <th>Email</th>
                      <th>Company</th>
                      <th>City</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dedupResult.clean.slice(0, 5).map((lead, i) => (
                      <tr key={i}>
                        <td>{lead.name}</td>
                        <td>{lead.phone}</td>
                        <td>{lead.email}</td>
                        <td>{lead.company}</td>
                        <td>{lead.city}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
                <button
                  className="crm-btn crm-btn-primary"
                  onClick={handleImport}
                  disabled={importing}
                >
                  {importing ? 'Importing...' : `Import ${dedupResult.clean.length} Leads`}
                </button>
                <button
                  className="crm-btn crm-btn-secondary"
                  onClick={() => { setParsed(null); setDedupResult(null); }}
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
