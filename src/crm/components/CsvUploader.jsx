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
        
        // Debug: log the columns found so we can troubleshoot mapping issues
        console.log('[CRM Lead Import] Sheet:', sheet.name, 'Columns:', sheet.columns.map(c => c.label));

        const mappedLeads = sheet.rows.map(row => {
          const leadObj = { name: '', phone: '', email: '', company: '', city: '', notes: '' };

          // Build a lookup of all column values for this row
          const colValues = {};
          sheet.columns.forEach(col => {
            const cellVal = row[col.id] ? row[col.id].toString().trim() : '';
            colValues[col.id] = cellVal;
          });

          // Score each column against each lead field to find the best match
          // Higher score = better match. We pick the highest-scoring column for each field.
          const fieldScores = { name: [], phone: [], email: [], company: [], city: [], notes: [] };

          sheet.columns.forEach(col => {
            const label = col.label.toLowerCase().trim();
            const val = colValues[col.id];
            if (!val) return; // skip empty cells

            // ─── NAME matching ───
            if (label === 'name' || label === 'lead name' || label === 'contact name' || label === 'full name' || label === 'customer name' || label === 'client name') {
              fieldScores.name.push({ id: col.id, score: 10 });
            } else if (label === 'first name' || label === 'firstname') {
              fieldScores.name.push({ id: col.id, score: 8 });
            } else if (
              (label.includes('name') && !label.includes('company') && !label.includes('firm') && !label.includes('business') && !label.includes('file') && !label.includes('sheet'))
            ) {
              // Generic name match, but deprioritized for director names  
              const score = label.includes('director') ? 3 : 5;
              fieldScores.name.push({ id: col.id, score });
            }

            // ─── PHONE matching ───
            if (label === 'phone' || label === 'phones' || label === 'mobile' || label === 'phone number' || label === 'mobile number' || label === 'cell' || label === 'telephone') {
              fieldScores.phone.push({ id: col.id, score: 10 });
            } else if (label === 'phone no' || label === 'mobile no' || label === 'phone_no' || label === 'mobile_no' || label === 'contact number' || label === 'contact no' || label === 'contact_no' || label === 'tel' || label === 'tel no') {
              fieldScores.phone.push({ id: col.id, score: 9 });
            } else if (label.includes('phone') || label.includes('mobile') || label.includes('cell') || label.includes('whatsapp') || label.includes('telephone')) {
              fieldScores.phone.push({ id: col.id, score: 6 });
            } else if (
              (label.includes('contact') && (label.includes('no') || label.includes('num'))) ||
              (label.includes('number') && !label.includes('cin') && !label.includes('registration') && !label.includes('gst') && !label.includes('pan') && !label.includes('serial') && !label.includes('sr') && !label.includes('s.no') && !label.includes('sno') && !label.includes('sl'))
            ) {
              fieldScores.phone.push({ id: col.id, score: 4 });
            }

            // ─── EMAIL matching ───
            if (label === 'email' || label === 'emails' || label === 'email id' || label === 'email_id' || label === 'emailid' || label === 'e-mail' || label === 'mail') {
              fieldScores.email.push({ id: col.id, score: 10 });
            } else if (label === 'email address' || label === 'email_address') {
              fieldScores.email.push({ id: col.id, score: 9 });
            } else if (label.includes('email') || label.includes('e-mail') || label.includes('mail')) {
              fieldScores.email.push({ id: col.id, score: 5 });
            } else if (!val.includes(' ') && val.includes('@') && val.includes('.')) {
              // Fallback: cell looks like an email address even if column name doesn't say so
              fieldScores.email.push({ id: col.id, score: 2 });
            }

            // ─── COMPANY matching ───
            if (label === 'company' || label === 'company name' || label === 'company_name' || label === 'firm' || label === 'firm name' || label === 'firm_name' || label === 'organization') {
              fieldScores.company.push({ id: col.id, score: 10 });
            } else if (
              (label.includes('company') || label.includes('org') || label.includes('firm') || label.includes('business')) &&
              !label.includes('activity') && !label.includes('type') && !label.includes('class') && !label.includes('category') && !label.includes('status')
            ) {
              fieldScores.company.push({ id: col.id, score: 5 });
            }

            // ─── CITY matching ───
            if (label === 'city' || label === 'location' || label === 'place' || label === 'district' || label === 'town') {
              fieldScores.city.push({ id: col.id, score: 10 });
            } else if (label.includes('city') || label.includes('location') || label.includes('district')) {
              fieldScores.city.push({ id: col.id, score: 5 });
            } else if (label === 'state' || label === 'address') {
              fieldScores.city.push({ id: col.id, score: 2 });
            }

            // ─── NOTES matching ───
            if (label === 'notes' || label === 'note' || label === 'remarks' || label === 'remark' || label === 'comments' || label === 'comment') {
              fieldScores.notes.push({ id: col.id, score: 10 });
            } else if (label.includes('note') || label.includes('remark') || label.includes('comment') || label.includes('description')) {
              fieldScores.notes.push({ id: col.id, score: 5 });
            } else if (label.includes('activity') && !label.includes('code') && !label.includes('class')) {
              fieldScores.notes.push({ id: col.id, score: 3 });
            }
          });

          // For each field, pick the column with the highest score
          const usedColIds = new Set();
          ['name', 'email', 'phone', 'company', 'city', 'notes'].forEach(field => {
            const candidates = fieldScores[field]
              .filter(c => !usedColIds.has(c.id)) // don't reuse a column for multiple fields
              .sort((a, b) => b.score - a.score);
            if (candidates.length > 0) {
              leadObj[field] = colValues[candidates[0].id];
              usedColIds.add(candidates[0].id);
            }
          });

          // Clean sentinel/placeholder values commonly found in scraped datasets
          const sentinels = ['no_email', 'no_contact', 'no_phone', 'no_linkedin', 'n/a', 'na', 'none', 'null', 'undefined', '-', '--', '---'];
          Object.keys(leadObj).forEach(key => {
            if (sentinels.includes(leadObj[key].toLowerCase())) {
              leadObj[key] = '';
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
