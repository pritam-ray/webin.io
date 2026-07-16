import { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, AlertTriangle, CheckCircle } from 'lucide-react';
import { deduplicateLeads } from '../utils/dedup';
import { useCrm } from '../context/CrmContext';
import { parseExcelOrCsv } from '../utils/excelParser';

export default function CsvUploader({ onImportComplete }) {
  const { leads, addLeadsBulk, addToast } = useCrm();
  const [dragOver, setDragOver] = useState(false);
  const [parsed, setParsed] = useState(null);
  const [dedupResult, setDedupResult] = useState(null);
  const [importing, setImporting] = useState(false);
  const fileRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    const isCsv = file.name.endsWith('.csv');
    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
    if (!isCsv && !isExcel) {
      addToast('Please upload a CSV or Excel (.xlsx, .xls) file', 'error');
      return;
    }

    try {
      const sheetsData = await parseExcelOrCsv(file);
      if (sheetsData.length > 0) {
        // Filter out system and summary sheets (like Overview or Audit Log)
        const sheetsToProcess = sheetsData.filter(s => 
          s.name !== 'Overview' && 
          s.name !== 'System Audit Log' && 
          s.name !== 'Audit Log' && 
          s.name !== 'Summary'
        );
        
        // Pick the sheet with the most rows, fallback to the first sheet
        const sheet = sheetsToProcess.sort((a, b) => b.rows.length - a.rows.length)[0] || sheetsData[0];
        
        const mappedLeads = sheet.rows.map(row => {
          const leadObj = { name: '', phone: '', email: '', company: '', city: '', notes: '' };
          sheet.columns.forEach(col => {
            const colLabel = col.label.toLowerCase().trim();
            const cellVal = row[col.id] ? row[col.id].toString().trim() : '';
            
            // Name matching: prioritize primary lead name, prevent director name collision
            if (
              (colLabel === 'name' || colLabel.includes('lead name') || colLabel.includes('contact name') || colLabel === 'contact') && 
              !colLabel.includes('director') && 
              !colLabel.includes('company') && 
              !colLabel.includes('business')
            ) {
              leadObj.name = cellVal;
            }
            else if (colLabel.includes('name') && !leadObj.name && !colLabel.includes('director') && !colLabel.includes('company') && !colLabel.includes('business')) {
              leadObj.name = cellVal;
            }

            // Phone matching
            if (colLabel.includes('phone') || colLabel.includes('mobile') || colLabel.includes('contact') || colLabel.includes('number')) {
              leadObj.phone = cellVal;
            }

            // Email matching
            if (colLabel.includes('email') || colLabel.includes('mail') || colLabel === 'email id') {
              leadObj.email = cellVal;
            }

            // Company matching: prioritize company name over business description
            if (colLabel === 'company name' || colLabel === 'company' || colLabel === 'firm name' || colLabel === 'firm') {
              leadObj.company = cellVal;
            }
            else if ((colLabel.includes('company') || colLabel.includes('org') || colLabel.includes('business')) && !leadObj.company && !colLabel.includes('activity') && !colLabel.includes('type')) {
              leadObj.company = cellVal;
            }

            // City matching
            if (colLabel.includes('city') || colLabel.includes('location') || colLabel === 'place' || colLabel === 'district') {
              leadObj.city = cellVal;
            }

            // Notes / Activity description matching
            if (colLabel.includes('note') || colLabel.includes('remark') || colLabel.includes('comment') || colLabel.includes('description') || colLabel.includes('activity')) {
              leadObj.notes = cellVal;
            }
          });
          return leadObj;
        });

        // Filter out empty rows
        const validLeads = mappedLeads.filter(l => l.name || l.phone || l.email);
        setParsed(validLeads);
        const result = deduplicateLeads(validLeads, leads);
        setDedupResult(result);
      } else {
        addToast('No data found in the file', 'error');
      }
    } catch (err) {
      addToast(`Error parsing file: ${err.message}`, 'error');
    }
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
        <h4>Upload CSV or Excel File</h4>
        <p>Drag & drop your CSV or Excel (.xlsx, .xls) file here, or click to browse</p>
        <p style={{ marginTop: 8, fontSize: '0.75rem', color: 'var(--crm-text-muted)' }}>
          Expected columns: Name, Phone, Email, Company, City, Notes
        </p>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.xlsx,.xls"
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
              {parsed?.length} total in file
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
