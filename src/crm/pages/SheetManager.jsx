import { useState, useRef } from 'react';
import { useCrm } from '../context/CrmContext';
import { FileSpreadsheet, Plus, Trash2, Calendar, User, Database, ArrowRight, Upload } from 'lucide-react';
import SpreadsheetView from '../components/SpreadsheetView';
import { parseExcelOrCsv } from '../utils/excelParser';

export default function SheetManager() {
  const { sheets, createSheet, deleteSheet, loadingSheets, sheetsError, addToast } = useCrm();
  const [newTitle, setNewTitle] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [activeSheetId, setActiveSheetId] = useState(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const result = await createSheet(newTitle.trim());
    if (!result.error) {
      setNewTitle('');
      setShowAdd(false);
      if (result.data) {
        setActiveSheetId(result.data.id);
      }
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);

    try {
      const { columns, rows } = await parseExcelOrCsv(file);
      // Strip extension
      const fileName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      const formattedTitle = fileName.replace(/[_-]/g, ' ').trim();
      
      const result = await createSheet(formattedTitle, columns, rows);
      if (!result.error && result.data) {
        setActiveSheetId(result.data.id);
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (e, sheetId, title) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete the spreadsheet "${title}"? This action cannot be undone.`)) {
      await deleteSheet(sheetId);
    }
  };

  // 1. Check if Supabase migration is required
  if (sheetsError === 'table_missing') {
    return (
      <div className="crm-content">
        <div className="crm-page-header">
          <div>
            <h1>Client Lists (Excel)</h1>
            <p>Error loading spreadsheets</p>
          </div>
        </div>

        <div className="crm-card" style={{ borderLeft: '4px solid var(--crm-red)', background: 'rgba(239, 68, 68, 0.05)' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--crm-red)' }}>
            <Database size={20} /> Supabase Database Update Required
          </h3>
          <p style={{ color: 'var(--crm-text-secondary)', fontSize: '0.88rem', lineHeight: 1.6 }}>
            The <code>crm_sheets</code> table is missing from your Supabase database. To enable Excel-like spreadsheet lists, please copy and run the SQL schema migration in your Supabase Dashboard:
          </p>

          <pre style={{
            background: 'var(--crm-bg-input)',
            border: '1px solid var(--crm-border)',
            padding: '16px',
            borderRadius: 'var(--crm-radius-sm)',
            overflowX: 'auto',
            fontSize: '0.8rem',
            color: 'var(--crm-text)',
            fontFamily: 'monospace',
            maxHeight: '200px',
            marginTop: '16px'
          }}>
{`CREATE TABLE crm_sheets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  columns JSONB NOT NULL DEFAULT '[]'::jsonb,
  rows JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_by UUID REFERENCES crm_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE crm_sheets ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trigger_sheets_updated_at
  BEFORE UPDATE ON crm_sheets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE POLICY "Allow all for crm_sheets" 
  ON crm_sheets FOR ALL 
  USING (true) WITH CHECK (true);`}
          </pre>

          <p style={{ fontSize: '0.82rem', color: 'var(--crm-text-muted)', marginTop: '12px' }}>
            Go to <strong>Supabase Project → SQL Editor → New Query</strong>, paste the script above, and click <strong>Run</strong>. Then refresh this page!
          </p>
        </div>
      </div>
    );
  }

  // 2. Render active Spreadsheet View if selected
  if (activeSheetId) {
    return (
      <div className="crm-content">
        <SpreadsheetView
          sheetId={activeSheetId}
          onBack={() => setActiveSheetId(null)}
        />
      </div>
    );
  }

  return (
    <div className="crm-content">
      <div className="crm-page-header">
        <div>
          <h1>Client Lists (Excel)</h1>
          <p>Create, manage, and share client spreadsheets inside the team</p>
        </div>

        <div className="crm-page-actions" style={{ display: 'flex', gap: 10 }}>
          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".xlsx,.xls,.csv"
            style={{ display: 'none' }}
          />
          <button className="crm-btn crm-btn-secondary" onClick={() => fileInputRef.current?.click()} disabled={importing}>
            <Upload size={16} /> {importing ? 'Importing...' : 'Import Excel / CSV'}
          </button>
          <button className="crm-btn crm-btn-primary" onClick={() => setShowAdd(!showAdd)}>
            <Plus size={16} /> Create List
          </button>
        </div>
      </div>

      {showAdd && (
        <form onSubmit={handleSubmit} className="crm-card" style={{ marginBottom: 24, background: 'var(--crm-bg-elevated)' }}>
          <h3 style={{ marginTop: 0 }}>New Spreadsheet List</h3>
          <div className="crm-form-group">
            <label>Title</label>
            <input
              type="text"
              className="crm-input"
              placeholder="e.g. Q3 Web Leads, Startup Contacts"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" className="crm-btn crm-btn-primary crm-btn-sm" disabled={!newTitle.trim()}>
              Create Spreadsheet
            </button>
            <button type="button" className="crm-btn crm-btn-secondary crm-btn-sm" onClick={() => setShowAdd(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {loadingSheets ? (
        <div className="crm-loading">
          <span className="crm-loading-dot" />
          <span className="crm-loading-dot" />
          <span className="crm-loading-dot" />
        </div>
      ) : sheets.length === 0 ? (
        <div className="crm-empty">
          <FileSpreadsheet size={48} />
          <h3>No spreadsheets created</h3>
          <p>Create your first client list sheet to handle team sharing.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {sheets.map(s => {
            const rowCount = s.rows?.length || 0;
            const colCount = s.columns?.length || 0;

            return (
              <div
                key={s.id}
                className="crm-card"
                onClick={() => setActiveSheetId(s.id)}
                style={{
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '160px',
                  position: 'relative'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--crm-text)' }}>
                      {s.title}
                    </h3>
                    <button
                      className="crm-btn crm-btn-ghost"
                      onClick={(e) => handleDelete(e, s.id, s.title)}
                      style={{ padding: 4, color: 'var(--crm-text-muted)' }}
                      title="Delete List"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--crm-text-secondary)', marginTop: 8 }}>
                    {rowCount} rows · {colCount} columns
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--crm-border)', paddingTop: 12, marginTop: 16 }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--crm-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Calendar size={12} /> {new Date(s.created_at).toLocaleDateString()}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--crm-accent)', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                    Open Editor <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
