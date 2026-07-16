import { useState, useRef } from 'react';
import { useCrm } from '../context/CrmContext';
import { FileSpreadsheet, Plus, Trash2, Calendar, User, Database, ArrowRight, Upload, X, CheckSquare, Square, Share2, Search, Edit, Check } from 'lucide-react';
import SpreadsheetView from '../components/SpreadsheetView';
import { parseExcelOrCsv } from '../utils/excelParser';

export default function SheetManager() {
  const { sheets, createSheet, updateSheetTitle, deleteSheet, shareSheet, currentUser, users, loadingSheets, sheetsError, addToast } = useCrm();
  const [newTitle, setNewTitle] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [activeSheetId, setActiveSheetId] = useState(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

  // Multi-sheet import states
  const [showImportModal, setShowImportModal] = useState(false);
  const [importSheets, setImportSheets] = useState([]);
  const [importBaseName, setImportBaseName] = useState('');

  // Sheet sharing states
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharingSheet, setSharingSheet] = useState(null);
  const [sharedUsers, setSharedUsers] = useState([]);
  const [shareSearch, setShareSearch] = useState('');

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [ownershipFilter, setOwnershipFilter] = useState('all');
  const [creatorFilter, setCreatorFilter] = useState('all');

  // Rename states
  const [editingSheetId, setEditingSheetId] = useState(null);
  const [editTitleVal, setEditTitleVal] = useState('');

  const handleStartEditTitle = (e, sheet) => {
    e.stopPropagation();
    setEditingSheetId(sheet.id);
    setEditTitleVal(sheet.title);
  };

  const handleCancelEditTitle = () => {
    setEditingSheetId(null);
    setEditTitleVal('');
  };

  const handleSaveTitle = async (sheetId) => {
    if (!editTitleVal.trim()) {
      handleCancelEditTitle();
      return;
    }

    const targetSheet = sheets.find(s => s.id === sheetId);
    if (!targetSheet) return;

    if (targetSheet.title === editTitleVal.trim()) {
      handleCancelEditTitle();
      return;
    }

    const result = await updateSheetTitle(sheetId, editTitleVal.trim());
    if (result.success) {
      addToast('Spreadsheet renamed successfully', 'success');
    }
    handleCancelEditTitle();
  };

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
      const parsedSheets = await parseExcelOrCsv(file);
      const fileName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      const formattedBaseName = fileName.replace(/[_-]/g, ' ').trim();

      if (parsedSheets.length === 1) {
        const { columns, rows, name } = parsedSheets[0];
        const finalTitle = name === 'Sheet1' ? formattedBaseName : `${formattedBaseName} - ${name}`;
        const result = await createSheet(finalTitle, columns, rows);
        if (!result.error && result.data) {
          setActiveSheetId(result.data.id);
        }
      } else {
        // Multi-sheet workbook: open tab selector dialog
        setImportBaseName(formattedBaseName);
        setImportSheets(parsedSheets.map(s => ({ ...s, selected: true })));
        setShowImportModal(true);
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const executeMultiImport = async () => {
    const selected = importSheets.filter(s => s.selected);
    if (selected.length === 0) {
      addToast('Please select at least one sheet tab to import', 'error');
      return;
    }

    setImporting(true);
    setShowImportModal(false);

    let lastCreatedId = null;

    try {
      for (const sheet of selected) {
        const title = `${importBaseName} - ${sheet.name}`;
        const result = await createSheet(title, sheet.columns, sheet.rows);
        if (!result.error && result.data) {
          lastCreatedId = result.data.id;
        }
      }
      addToast(`Imported ${selected.length} sheets successfully`, 'success');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setImporting(false);
      if (lastCreatedId) {
        setActiveSheetId(lastCreatedId);
      }
    }
  };

  const handleDelete = async (e, sheetId, title) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete the spreadsheet "${title}"? This action cannot be undone.`)) {
      await deleteSheet(sheetId);
    }
  };

  const handleOpenShareModal = (e, sheet) => {
    e.stopPropagation();
    setSharingSheet(sheet);
    setSharedUsers(sheet.shared_with || []);
    setShareSearch('');
    setShowShareModal(true);
  };

  const toggleUserShare = (userId) => {
    setSharedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleShareSubmit = async () => {
    if (!sharingSheet) return;
    const { success } = await shareSheet(sharingSheet.id, sharedUsers);
    if (success) {
      setShowShareModal(false);
      setSharingSheet(null);
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
      <div className="crm-content" style={{ maxWidth: 'none', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '24px 32px 16px 32px' }}>
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
      ) : (() => {
        const filteredSheets = sheets.filter(s => {
          const matchesSearch = s.title.toLowerCase().includes(searchTerm.toLowerCase());
          
          let matchesOwnership = true;
          if (ownershipFilter === 'mine') {
            matchesOwnership = s.created_by === currentUser?.id;
          } else if (ownershipFilter === 'shared') {
            matchesOwnership = s.created_by !== currentUser?.id;
          }

          let matchesCreator = true;
          if (creatorFilter !== 'all') {
            matchesCreator = s.created_by === creatorFilter;
          }

          return matchesSearch && matchesOwnership && matchesCreator;
        });

        return (
          <>
            {/* Search & Filters Toolbar */}
            <div style={{
              display: 'flex',
              gap: 12,
              marginBottom: 24,
              alignItems: 'center',
              flexWrap: 'wrap',
              background: 'var(--crm-bg-card)',
              border: '1px solid var(--crm-border)',
              padding: '12px 16px',
              borderRadius: 'var(--crm-radius)',
              flexShrink: 0
            }}>
              {/* Search input */}
              <div className="crm-table-search" style={{ flex: 1, minWidth: '200px', margin: 0 }}>
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search client lists..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{ width: '100%', paddingLeft: '36px' }}
                />
              </div>

              {/* Ownership Filter Buttons */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button
                  onClick={() => setOwnershipFilter('all')}
                  className={`crm-btn crm-btn-sm ${ownershipFilter === 'all' ? 'crm-btn-primary' : 'crm-btn-secondary'}`}
                  type="button"
                  style={{ padding: '6px 12px' }}
                >
                  All Lists
                </button>
                <button
                  onClick={() => setOwnershipFilter('mine')}
                  className={`crm-btn crm-btn-sm ${ownershipFilter === 'mine' ? 'crm-btn-primary' : 'crm-btn-secondary'}`}
                  type="button"
                  style={{ padding: '6px 12px' }}
                >
                  My Lists
                </button>
                <button
                  onClick={() => setOwnershipFilter('shared')}
                  className={`crm-btn crm-btn-sm ${ownershipFilter === 'shared' ? 'crm-btn-primary' : 'crm-btn-secondary'}`}
                  type="button"
                  style={{ padding: '6px 12px' }}
                >
                  Shared with Me
                </button>
              </div>

              {/* Creator Filter Dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--crm-text-secondary)' }}>Created by:</span>
                <select
                  value={creatorFilter}
                  onChange={e => setCreatorFilter(e.target.value)}
                  className="crm-select"
                  style={{ padding: '6px 32px 6px 12px', fontSize: '0.8rem', width: '160px', height: 'auto', backgroundPosition: 'right 8px center' }}
                >
                  <option value="all">All Members</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {filteredSheets.length === 0 ? (
              <div className="crm-empty" style={{ padding: '40px 20px' }}>
                <Search size={40} style={{ color: 'var(--crm-text-muted)', marginBottom: 12 }} />
                <h3>No matching spreadsheets</h3>
                <p>Try modifying your search or filter selections</p>
                <button 
                  className="crm-btn crm-btn-secondary crm-btn-sm" 
                  style={{ marginTop: 12 }}
                  onClick={() => {
                    setSearchTerm('');
                    setOwnershipFilter('all');
                    setCreatorFilter('all');
                  }}
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
                {filteredSheets.map(s => {
                  const rowCount = s.rows?.length || 0;
                  const colCount = s.columns?.length || 0;
                  const creator = users.find(u => u.id === s.created_by);
                  const creatorName = creator ? creator.name : 'Unknown Creator';

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
                          {editingSheetId === s.id ? (
                            <div onClick={(e) => e.stopPropagation()} style={{ flex: 1, display: 'flex', gap: 4, alignItems: 'center' }}>
                              <input
                                type="text"
                                className="crm-input"
                                value={editTitleVal}
                                onChange={(e) => setEditTitleVal(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveTitle(s.id);
                                  if (e.key === 'Escape') handleCancelEditTitle();
                                }}
                                autoFocus
                                style={{ padding: '4px 8px', fontSize: '0.9rem', height: 'auto', flex: 1 }}
                              />
                              <button
                                type="button"
                                className="crm-btn crm-btn-ghost"
                                onClick={() => handleSaveTitle(s.id)}
                                style={{ padding: 6, color: 'var(--crm-green)' }}
                                title="Save Title"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                type="button"
                                className="crm-btn crm-btn-ghost"
                                onClick={handleCancelEditTitle}
                                style={{ padding: 6, color: 'var(--crm-red)' }}
                                title="Cancel"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <>
                              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--crm-text)' }}>
                                {s.title}
                              </h3>
                              <div style={{ display: 'flex', gap: 2 }}>
                                {(currentUser?.id === s.created_by || currentUser?.roles?.includes('admin')) && (
                                  <>
                                    <button
                                      className="crm-btn crm-btn-ghost"
                                      onClick={(e) => handleStartEditTitle(e, s)}
                                      style={{ padding: 4, color: 'var(--crm-text-muted)' }}
                                      title="Rename List"
                                    >
                                      <Edit size={16} />
                                    </button>
                                    <button
                                      className="crm-btn crm-btn-ghost"
                                      onClick={(e) => handleOpenShareModal(e, s)}
                                      style={{ padding: 4, color: 'var(--crm-text-muted)' }}
                                      title="Share List"
                                    >
                                      <Share2 size={16} />
                                    </button>
                                  </>
                                )}
                                <button
                                  className="crm-btn crm-btn-ghost"
                                  onClick={(e) => handleDelete(e, s.id, s.title)}
                                  style={{ padding: 4, color: 'var(--crm-text-muted)' }}
                                  title="Delete List"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--crm-text-secondary)', marginTop: 8 }}>
                          {rowCount} rows · {colCount} columns
                        </p>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--crm-border)', paddingTop: 12, marginTop: 16 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--crm-text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <User size={12} style={{ color: 'var(--crm-accent)' }} /> Created by: <strong style={{ color: 'var(--crm-text)' }}>{creatorName}</strong>
                          </span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--crm-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Calendar size={12} /> {new Date(s.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.78rem', color: 'var(--crm-accent)', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                          Open Editor <ArrowRight size={14} />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        );
      })()}

      {/* Multi-sheet Import Modal */}
      {showImportModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'var(--crm-bg-elevated)',
            border: '1px solid var(--crm-border)',
            borderRadius: 'var(--crm-radius)',
            width: '100%',
            maxWidth: '520px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 16
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--crm-border)', paddingBottom: 12 }}>
              <h3 style={{ margin: 0, color: 'var(--crm-text)' }}>Select Excel Sheet Tabs to Import</h3>
              <button className="crm-btn-ghost" onClick={() => setShowImportModal(false)} style={{ color: 'var(--crm-text-muted)', padding: 4 }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--crm-text-secondary)' }}>
              We found multiple sheets in <strong>{importBaseName}</strong>. Select the tabs you want to import as separate client lists:
            </p>

            <div style={{ display: 'flex', gap: 12, fontSize: '0.78rem' }}>
              <button
                type="button"
                className="crm-btn-link"
                onClick={() => setImportSheets(prev => prev.map(s => ({ ...s, selected: true })))}
                style={{ color: 'var(--crm-accent)', padding: 0 }}
              >
                Select All
              </button>
              <span style={{ color: 'var(--crm-text-muted)' }}>|</span>
              <button
                type="button"
                className="crm-btn-link"
                onClick={() => setImportSheets(prev => prev.map(s => ({ ...s, selected: false })))}
                style={{ color: 'var(--crm-text-muted)', padding: 0 }}
              >
                Clear All
              </button>
            </div>

            <div style={{
              maxHeight: '220px',
              overflowY: 'auto',
              border: '1px solid var(--crm-border)',
              borderRadius: 6,
              background: 'var(--crm-bg-card)'
            }}>
              {importSheets.map((sheetOpt, index) => (
                <div
                  key={index}
                  onClick={() => setImportSheets(prev => prev.map((s, i) => i === index ? { ...s, selected: !s.selected } : s))}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderBottom: index < importSheets.length - 1 ? '1px solid var(--crm-border)' : 'none',
                    cursor: 'pointer',
                    background: sheetOpt.selected ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
                    transition: 'background 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {sheetOpt.selected ? (
                      <CheckSquare size={18} style={{ color: 'var(--crm-accent)' }} />
                    ) : (
                      <Square size={18} style={{ color: 'var(--crm-text-muted)' }} />
                    )}
                    <span style={{ fontWeight: sheetOpt.selected ? 600 : 400, color: 'var(--crm-text)' }}>{sheetOpt.name}</span>
                  </div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--crm-text-muted)' }}>
                    {sheetOpt.rows.length} rows · {sheetOpt.columns.length} columns
                  </span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
              <button className="crm-btn crm-btn-secondary crm-btn-sm" onClick={() => setShowImportModal(false)}>
                Cancel
              </button>
              <button
                className="crm-btn crm-btn-primary crm-btn-sm"
                onClick={executeMultiImport}
                disabled={importSheets.every(s => !s.selected)}
              >
                Import Selected ({importSheets.filter(s => s.selected).length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share List Modal */}
      {showShareModal && sharingSheet && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'var(--crm-bg-elevated)',
            border: '1px solid var(--crm-border)',
            borderRadius: 'var(--crm-radius)',
            width: '100%',
            maxWidth: '460px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 16
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--crm-border)', paddingBottom: 12 }}>
              <h3 style={{ margin: 0, color: 'var(--crm-text)' }}>Share "{sharingSheet.title}"</h3>
              <button className="crm-btn-ghost" onClick={() => setShowShareModal(false)} style={{ color: 'var(--crm-text-muted)', padding: 4 }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--crm-text-secondary)' }}>
              Choose which team members can view and collaborate on this client list:
            </p>

            <div className="crm-table-search" style={{ margin: 0 }}>
              <Search size={16} />
              <input
                type="text"
                placeholder="Search team members..."
                value={shareSearch}
                onChange={e => setShareSearch(e.target.value)}
                style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--crm-text)', outline: 'none' }}
              />
            </div>

            <div style={{
              maxHeight: '200px',
              overflowY: 'auto',
              border: '1px solid var(--crm-border)',
              borderRadius: 6,
              background: 'var(--crm-bg-card)'
            }}>
              {users
                .filter(u => u.id !== currentUser?.id)
                .filter(u => {
                  const q = shareSearch.toLowerCase();
                  return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
                })
                .map((member) => {
                  const isShared = sharedUsers.includes(member.id);
                  const userInitials = member.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';
                  return (
                    <div
                      key={member.id}
                      onClick={() => toggleUserShare(member.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        borderBottom: '1px solid var(--crm-border)',
                        cursor: 'pointer',
                        background: isShared ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
                        transition: 'background 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {isShared ? (
                          <CheckSquare size={18} style={{ color: 'var(--crm-accent)' }} />
                        ) : (
                          <Square size={18} style={{ color: 'var(--crm-text-muted)' }} />
                        )}
                        <div style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: 'var(--crm-border)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          color: 'var(--crm-text)'
                        }}>
                          {userInitials}
                        </div>
                        <div>
                          <span style={{ fontWeight: isShared ? 600 : 400, color: 'var(--crm-text)', fontSize: '0.9rem', display: 'block' }}>{member.name}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--crm-text-muted)', display: 'block' }}>{member.email}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {member.roles?.map(r => (
                          <span
                            key={r}
                            style={{
                              fontSize: '0.62rem',
                              padding: '2px 6px',
                              borderRadius: 4,
                              background: 'var(--crm-border)',
                              color: 'var(--crm-text-secondary)',
                              fontWeight: 600,
                              textTransform: 'uppercase'
                            }}
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              {users.filter(u => u.id !== currentUser?.id).length === 0 && (
                <div style={{ padding: 24, textAlign: 'center', color: 'var(--crm-text-muted)', fontSize: '0.85rem' }}>
                  No other team members found.
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
              <button className="crm-btn crm-btn-secondary crm-btn-sm" onClick={() => setShowShareModal(false)}>
                Cancel
              </button>
              <button
                className="crm-btn crm-btn-primary crm-btn-sm"
                onClick={handleShareSubmit}
              >
                Save Sharing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
