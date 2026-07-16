import { useState, useEffect, useRef } from 'react';
import { useCrm } from '../context/CrmContext';
import { ArrowLeft, Plus, Trash2, Download, CloudLightning, Save, HelpCircle, Upload } from 'lucide-react';
import { parseExcelOrCsv } from '../utils/excelParser';

export default function SpreadsheetView({ sheetId, onBack }) {
  const { sheets, updateSheet, addToast, logCrmActivity } = useCrm();
  const sheet = sheets.find(s => s.id === sheetId);

  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [newColName, setNewColName] = useState('');
  const [editingCell, setEditingCell] = useState(null); // { rowIndex, colId }
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved' | 'saving' | 'error'
  const autoSaveTimeout = useRef(null);
  const originalCellValue = useRef('');
  const appendFileInputRef = useRef(null);
  const [importing, setImporting] = useState(false);

  // Initialize sheet data
  useEffect(() => {
    if (sheet) {
      setColumns(sheet.columns || []);
      setRows(sheet.rows || []);
    }
  }, [sheetId]);

  // Debounced Auto-Save
  const triggerAutoSave = (newCols, newRows) => {
    setSaveStatus('saving');
    if (autoSaveTimeout.current) {
      clearTimeout(autoSaveTimeout.current);
    }

    autoSaveTimeout.current = setTimeout(async () => {
      const result = await updateSheet(sheetId, newCols, newRows);
      if (result.success) {
        setSaveStatus('saved');
      } else {
        setSaveStatus('error');
      }
    }, 1000);
  };

  if (!sheet) {
    return (
      <div className="crm-empty">
        <h3>Spreadsheet not found</h3>
        <button className="crm-btn crm-btn-secondary" onClick={onBack}>
          <ArrowLeft size={16} /> Back to list
        </button>
      </div>
    );
  }

  // --- Row Operations ---
  const addRow = () => {
    const newRowId = `r-${Date.now()}`;
    const newRow = { id: newRowId };
    columns.forEach(col => {
      newRow[col.id] = '';
    });
    const updatedRows = [...rows, newRow];
    setRows(updatedRows);
    triggerAutoSave(columns, updatedRows);
    logCrmActivity(null, 'Spreadsheet Row Added', `Added a new row to list "${sheet.title}"`);
  };

  const deleteRow = (rowIndex) => {
    const updatedRows = rows.filter((_, idx) => idx !== rowIndex);
    setRows(updatedRows);
    triggerAutoSave(columns, updatedRows);
    logCrmActivity(null, 'Spreadsheet Row Deleted', `Deleted row ${rowIndex + 1} from list "${sheet.title}"`);
  };

  // --- Column Operations ---
  const addColumn = (e) => {
    e.preventDefault();
    if (!newColName.trim()) return;

    // Create safe ID
    const colId = `col_${newColName.trim().toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now().toString().slice(-4)}`;
    
    // Check duplication
    if (columns.some(col => col.label.toLowerCase() === newColName.toLowerCase())) {
      addToast('A column with this name already exists', 'error');
      return;
    }

    const newCol = { id: colId, label: newColName.trim(), type: 'text' };
    const updatedCols = [...columns, newCol];
    
    // Update rows to include new column field
    const updatedRows = rows.map(row => ({ ...row, [colId]: '' }));

    setColumns(updatedCols);
    setRows(updatedRows);
    setNewColName('');
    triggerAutoSave(updatedCols, updatedRows);
    addToast(`Column "${newCol.label}" added`, 'success');
    logCrmActivity(null, 'Spreadsheet Column Added', `Added column "${newCol.label}" to list "${sheet.title}"`);
  };

  const deleteColumn = (colId, colLabel) => {
    if (confirm(`Are you sure you want to delete the column "${colLabel}"? All cell data in this column will be lost.`)) {
      const updatedCols = columns.filter(col => col.id !== colId);
      const updatedRows = rows.map(row => {
        const copy = { ...row };
        delete copy[colId];
        return copy;
      });

      setColumns(updatedCols);
      setRows(updatedRows);
      triggerAutoSave(updatedCols, updatedRows);
      addToast(`Column "${colLabel}" removed`, 'info');
      logCrmActivity(null, 'Spreadsheet Column Deleted', `Deleted column "${colLabel}" from list "${sheet.title}"`);
    }
  };

  // --- Cell Operations ---
  const startEditing = (rowIndex, colId, currentVal) => {
    originalCellValue.current = currentVal || '';
    setEditingCell({ rowIndex, colId });
  };

  const finishEditing = (rowIndex, colId, finalVal) => {
    setEditingCell(null);
    if (originalCellValue.current !== finalVal) {
      const col = columns.find(c => c.id === colId);
      logCrmActivity(
        null,
        'Spreadsheet Cell Edited',
        `In list "${sheet.title}", edited row ${rowIndex + 1} column "${col?.label || 'Unknown'}" from "${originalCellValue.current}" to "${finalVal}"`
      );
    }
  };

  const handleCellChange = (rowIndex, colId, value) => {
    const updatedRows = rows.map((row, idx) => {
      if (idx === rowIndex) {
        return { ...row, [colId]: value };
      }
      return row;
    });
    setRows(updatedRows);
    triggerAutoSave(columns, updatedRows);
  };

  const handleAppendOrReplaceImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);

    try {
      const parsed = await parseExcelOrCsv(file);
      const action = confirm(
        `Excel parsed successfully!\nFound ${parsed.columns.length} columns and ${parsed.rows.length} rows.\n\n` +
        `• Click OK to APPEND these rows to the end of your current list.\n` +
        `• Click CANCEL to REPLACE the entire list with this file's contents.`
      );

      if (action) {
        // --- APPEND DATA ---
        // Add missing columns
        const newCols = [...columns];
        parsed.columns.forEach(pCol => {
          if (!newCols.some(col => col.label.toLowerCase() === pCol.label.toLowerCase())) {
            newCols.push(pCol);
          }
        });

        // Add new rows, matching columns and keeping old rows
        const mappedRows = parsed.rows.map(pRow => {
          const rowObj = { id: pRow.id };
          newCols.forEach(col => {
            // Match by column label (case-insensitive)
            const matchingImportCol = parsed.columns.find(pc => pc.label.toLowerCase() === col.label.toLowerCase());
            rowObj[col.id] = matchingImportCol ? (pRow[matchingImportCol.id] || '') : '';
          });
          return rowObj;
        });

        const updatedRows = [...rows, ...mappedRows];
        setColumns(newCols);
        setRows(updatedRows);
        triggerAutoSave(newCols, updatedRows);
        addToast(`Appended ${parsed.rows.length} rows successfully`, 'success');
        logCrmActivity(null, 'Spreadsheet Appended', `Appended ${parsed.rows.length} rows to list "${sheet.title}"`);
      } else {
        // --- REPLACE DATA ---
        const proceed = confirm(`Are you sure you want to REPLACE the entire list "${sheet.title}" with this file? All current columns and rows will be permanently deleted.`);
        if (proceed) {
          setColumns(parsed.columns);
          setRows(parsed.rows);
          triggerAutoSave(parsed.columns, parsed.rows);
          addToast('Spreadsheet replaced with imported data', 'success');
          logCrmActivity(null, 'Spreadsheet Replaced', `Replaced all data in "${sheet.title}" with imported file`);
        }
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setImporting(false);
      if (appendFileInputRef.current) appendFileInputRef.current.value = '';
    }
  };

  // --- CSV Export ---
  const exportToCsv = () => {
    if (rows.length === 0) {
      addToast('No data to export', 'error');
      return;
    }

    const headers = columns.map(col => `"${col.label.replace(/"/g, '""')}"`).join(',');
    const csvRows = rows.map(row => {
      return columns.map(col => {
        const val = row[col.id] || '';
        return `"${val.toString().replace(/"/g, '""')}"`;
      }).join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...csvRows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${sheet.title.replace(/\s+/g, '_')}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 16, overflow: 'hidden' }}>
      {/* Header bar */}
      <div className="crm-page-header" style={{ marginBottom: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button className="crm-btn crm-btn-secondary crm-btn-sm" onClick={onBack} title="Back to Lists">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 style={{ fontSize: '1.4rem' }}>{sheet.title}</h1>
            <p style={{ marginTop: 2 }}>Excel-like spreadsheet editor</p>
          </div>
        </div>

        <div className="crm-page-actions">
          <span style={{ fontSize: '0.8rem', color: 'var(--crm-text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
            {saveStatus === 'saved' && (
              <span className="crm-text-green" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <CloudLightning size={14} /> Auto-saved to Cloud
              </span>
            )}
            {saveStatus === 'saving' && (
              <span className="crm-text-yellow" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Save size={14} /> Saving changes...
              </span>
            )}
            {saveStatus === 'error' && (
              <span className="crm-text-red" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <HelpCircle size={14} /> Save failed
              </span>
            )}
          </span>

          <button className="crm-btn crm-btn-secondary crm-btn-sm" onClick={exportToCsv}>
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* Editor Grid Area */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, border: '1px solid var(--crm-border)', borderRadius: 'var(--crm-radius)', background: 'var(--crm-bg-card)', overflow: 'hidden' }}>
        
        {/* Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--crm-border)', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button className="crm-btn crm-btn-primary crm-btn-sm" onClick={addRow}>
              <Plus size={14} /> Add Row
            </button>
            <input
              type="file"
              ref={appendFileInputRef}
              onChange={handleAppendOrReplaceImport}
              accept=".xlsx,.xls,.csv"
              style={{ display: 'none' }}
            />
            <button className="crm-btn crm-btn-secondary crm-btn-sm" onClick={() => appendFileInputRef.current?.click()} disabled={importing}>
              <Upload size={14} /> {importing ? 'Importing...' : 'Import Data'}
            </button>
            <span style={{ fontSize: '0.78rem', color: 'var(--crm-text-muted)', display: 'flex', alignItems: 'center', marginLeft: 8 }}>
              💡 Double-click any cell to edit details inline
            </span>
          </div>

          <form onSubmit={addColumn} style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              className="crm-input"
              placeholder="New column name"
              value={newColName}
              onChange={e => setNewColName(e.target.value)}
              style={{ padding: '6px 12px', fontSize: '0.8rem', width: 160 }}
            />
            <button type="submit" className="crm-btn crm-btn-secondary crm-btn-sm" disabled={!newColName.trim()}>
              Add Column
            </button>
          </form>
        </div>

        {/* Spreadsheet table wrapper */}
        <div style={{ overflow: 'auto', flex: 1 }}>
          <table className="crm-table" style={{ borderCollapse: 'separate', borderSpacing: 0, width: 'max-content', minWidth: '100%' }}>
            <thead>
              <tr style={{ background: 'var(--crm-bg-elevated)' }}>
                {/* Actions Header */}
                <th style={{ width: 44, textAlign: 'center', borderRight: '1px solid var(--crm-border)', position: 'sticky', left: 0, zIndex: 10, background: 'var(--crm-bg-elevated)' }}></th>
                
                {/* Column Headers */}
                {columns.map((col, idx) => (
                  <th key={col.id} style={{ minWidth: 150, padding: '10px 14px', borderRight: '1px solid var(--crm-border)', borderBottom: '1px solid var(--crm-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 600, color: 'var(--crm-text)' }}>{col.label}</span>
                      
                      {/* Delete Column button - prevent delete for Name column to avoid blank sheet */}
                      {col.id !== 'col_name' && (
                        <button
                          type="button"
                          className="crm-btn-ghost"
                          onClick={() => deleteColumn(col.id, col.label)}
                          style={{ padding: 2, borderRadius: 4, display: 'inline-flex', alignSelf: 'center', color: 'var(--crm-text-muted)' }}
                          title={`Delete column "${col.label}"`}
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={row.id}>
                  {/* Row Delete Action */}
                  <td style={{ 
                    textAlign: 'center', 
                    borderRight: '1px solid var(--crm-border)', 
                    borderBottom: '1px solid var(--crm-border)',
                    position: 'sticky', 
                    left: 0, 
                    zIndex: 9, 
                    background: 'var(--crm-bg-card)', 
                    padding: 8 
                  }}>
                    <button
                      className="crm-btn crm-btn-ghost crm-btn-sm"
                      onClick={() => deleteRow(rowIndex)}
                      style={{ padding: 4, color: 'var(--crm-red)', display: 'inline-flex' }}
                      title="Delete row"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>

                  {/* Row Cells */}
                  {columns.map(col => {
                    const isEditing = editingCell?.rowIndex === rowIndex && editingCell?.colId === col.id;
                    const cellValue = row[col.id] || '';

                    return (
                      <td
                        key={col.id}
                        onDoubleClick={() => startEditing(rowIndex, col.id, cellValue)}
                        style={{
                          borderRight: '1px solid var(--crm-border)',
                          borderBottom: '1px solid var(--crm-border)',
                          padding: isEditing ? '0' : '10px 14px',
                          background: isEditing ? 'var(--crm-bg-input)' : 'transparent',
                          minWidth: 150,
                          verticalAlign: 'middle',
                          position: 'relative'
                        }}
                      >
                        {isEditing ? (
                          <input
                            type="text"
                            value={cellValue}
                            onChange={e => handleCellChange(rowIndex, col.id, e.target.value)}
                            onBlur={() => finishEditing(rowIndex, col.id, cellValue)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') finishEditing(rowIndex, col.id, cellValue);
                            }}
                            className="crm-input"
                            autoFocus
                            style={{
                              border: 'none',
                              background: 'transparent',
                              padding: '10px 14px',
                              borderRadius: 0,
                              height: '100%',
                              width: '100%'
                            }}
                          />
                        ) : (
                          <div style={{ minHeight: 20, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                            {cellValue || <span style={{ color: 'var(--crm-text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>empty</span>}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
