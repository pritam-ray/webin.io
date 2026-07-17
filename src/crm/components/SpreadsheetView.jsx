import { useState, useEffect, useRef, useMemo } from 'react';
import { useCrm } from '../context/CrmContext';
import { ArrowLeft, Plus, Trash2, Download, CloudLightning, Save, HelpCircle, Upload, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Filter, X, Check, Square, CheckSquare, XCircle } from 'lucide-react';
import { parseExcelOrCsv } from '../utils/excelParser';

export default function SpreadsheetView({ sheetId, onBack }) {
  const { sheets, updateSheet, addToast, logCrmActivity, currentUser } = useCrm();
  const isAdmin = currentUser?.roles?.includes('admin');
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

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);

  // Column filter states
  const [columnFilters, setColumnFilters] = useState({}); // { colId: Set<allowedValues> }
  const [filterOpenCol, setFilterOpenCol] = useState(null); // which col filter dropdown is open
  const [filterSearch, setFilterSearch] = useState({}); // { colId: searchString }
  const filterDropdownRef = useRef(null);

  // Row selection states
  const [selectedRows, setSelectedRows] = useState(new Set());

  // Export dropdown state
  const [exportOpen, setExportOpen] = useState(false);
  const exportDropdownRef = useRef(null);

  // Initialize sheet data
  useEffect(() => {
    if (sheet) {
      setColumns(sheet.columns || []);
      setRows(sheet.rows || []);
      setCurrentPage(1);
      setColumnFilters({});
      setFilterOpenCol(null);
      setFilterSearch({});
      setSelectedRows(new Set());
    }
  }, [sheetId]);

  // Close filter dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(e.target)) {
        setFilterOpenCol(null);
      }
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(e.target)) {
        setExportOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Computed: filtered rows based on active column filters
  const filteredRows = useMemo(() => {
    const activeFilters = Object.entries(columnFilters).filter(([_, values]) => values.size > 0);
    if (activeFilters.length === 0) return rows;

    return rows.filter(row => {
      return activeFilters.every(([colId, allowedValues]) => {
        const cellVal = (row[colId] || '').toString().trim();
        // empty cells: allow if '' is in the allowed set or if '(Empty)' is in the allowed set
        if (cellVal === '') return allowedValues.has('__EMPTY__');
        return allowedValues.has(cellVal);
      });
    });
  }, [rows, columnFilters]);

  const hasActiveFilters = Object.values(columnFilters).some(s => s.size > 0);
  const selectedCount = selectedRows.size;

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

    // Clear filters so user can see the newly added row
    setColumnFilters({});

    // Navigate to the last page to show the new row
    const newTotalPages = Math.ceil(updatedRows.length / pageSize);
    setCurrentPage(newTotalPages || 1);

    triggerAutoSave(columns, updatedRows);
    logCrmActivity(null, 'Spreadsheet Row Added', `Added a new row to list "${sheet.title}"`);
  };

  const deleteRow = (absoluteRowIndex) => {
    if (!isAdmin) {
      addToast('Only administrators can delete rows/leads', 'error');
      return;
    }
    const updatedRows = rows.filter((_, idx) => idx !== absoluteRowIndex);
    setRows(updatedRows);

    // Remove from selection if selected
    const deletedRowId = rows[absoluteRowIndex]?.id;
    if (deletedRowId && selectedRows.has(deletedRowId)) {
      setSelectedRows(prev => {
        const next = new Set(prev);
        next.delete(deletedRowId);
        return next;
      });
    }

    // Adjust page index if out of bounds after deletion
    const newFilteredLen = updatedRows.length; // re-filter will happen via useMemo
    const newTotalPages = Math.ceil(newFilteredLen / pageSize);
    if (currentPage > newTotalPages) {
      setCurrentPage(Math.max(newTotalPages, 1));
    }

    triggerAutoSave(columns, updatedRows);
    logCrmActivity(null, 'Spreadsheet Row Deleted', `Deleted row ${absoluteRowIndex + 1} from list "${sheet.title}"`);
  };

  // --- Column Operations ---
  const addColumn = (e) => {
    e.preventDefault();
    if (!newColName.trim()) return;

    const colId = `col_${newColName.trim().toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now().toString().slice(-4)}`;
    
    if (columns.some(col => col.label.toLowerCase() === newColName.toLowerCase())) {
      addToast('A column with this name already exists', 'error');
      return;
    }

    const newCol = { id: colId, label: newColName.trim(), type: 'text' };
    const updatedCols = [...columns, newCol];
    const updatedRows = rows.map(row => ({ ...row, [colId]: '' }));

    setColumns(updatedCols);
    setRows(updatedRows);
    setNewColName('');
    triggerAutoSave(updatedCols, updatedRows);
    addToast(`Column "${newCol.label}" added`, 'success');
    logCrmActivity(null, 'Spreadsheet Column Added', `Added column "${newCol.label}" to list "${sheet.title}"`);
  };

  const deleteColumn = (colId, colLabel) => {
    if (!isAdmin) {
      addToast('Only administrators can delete columns', 'error');
      return;
    }
    if (confirm(`Are you sure you want to delete the column "${colLabel}"? All cell data in this column will be lost.`)) {
      const updatedCols = columns.filter(col => col.id !== colId);
      const updatedRows = rows.map(row => {
        const copy = { ...row };
        delete copy[colId];
        return copy;
      });

      // Remove any filter on the deleted column
      setColumnFilters(prev => {
        const next = { ...prev };
        delete next[colId];
        return next;
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
        const newCols = [...columns];
        parsed.columns.forEach(pCol => {
          if (!newCols.some(col => col.label.toLowerCase() === pCol.label.toLowerCase())) {
            newCols.push(pCol);
          }
        });

        const mappedRows = parsed.rows.map(pRow => {
          const rowObj = { id: pRow.id };
          newCols.forEach(col => {
            const matchingImportCol = parsed.columns.find(pc => pc.label.toLowerCase() === col.label.toLowerCase());
            rowObj[col.id] = matchingImportCol ? (pRow[matchingImportCol.id] || '') : '';
          });
          return rowObj;
        });

        const updatedRows = [...rows, ...mappedRows];
        setColumns(newCols);
        setRows(updatedRows);
        setCurrentPage(1);
        setColumnFilters({});
        setSelectedRows(new Set());
        triggerAutoSave(newCols, updatedRows);
        addToast(`Appended ${parsed.rows.length} rows successfully`, 'success');
        logCrmActivity(null, 'Spreadsheet Appended', `Appended ${parsed.rows.length} rows to list "${sheet.title}"`);
      } else {
        const proceed = confirm(`Are you sure you want to REPLACE the entire list "${sheet.title}" with this file? All current columns and rows will be permanently deleted.`);
        if (proceed) {
          setColumns(parsed.columns);
          setRows(parsed.rows);
          setCurrentPage(1);
          setColumnFilters({});
          setSelectedRows(new Set());
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

  // --- Filter Operations ---
  const getUniqueValuesForColumn = (colId) => {
    const values = new Set();
    rows.forEach(row => {
      const val = (row[colId] || '').toString().trim();
      if (val === '') {
        values.add('__EMPTY__');
      } else {
        values.add(val);
      }
    });
    return Array.from(values).sort((a, b) => {
      if (a === '__EMPTY__') return 1;
      if (b === '__EMPTY__') return -1;
      return a.localeCompare(b, undefined, { sensitivity: 'base' });
    });
  };

  const toggleFilterValue = (colId, value) => {
    setColumnFilters(prev => {
      const current = prev[colId] ? new Set(prev[colId]) : new Set();
      if (current.has(value)) {
        current.delete(value);
      } else {
        current.add(value);
      }
      // If all values are selected, clear the filter (means "show all")
      const allVals = getUniqueValuesForColumn(colId);
      if (current.size === allVals.length) {
        const next = { ...prev };
        delete next[colId];
        return next;
      }
      return { ...prev, [colId]: current };
    });
    setCurrentPage(1);
  };

  const selectAllFilterValues = (colId) => {
    // "Select All" means no filter active — show everything
    setColumnFilters(prev => {
      const next = { ...prev };
      delete next[colId];
      return next;
    });
    setCurrentPage(1);
  };

  const clearAllFilterValues = (colId) => {
    // "Clear All" means filter to an empty set — show nothing
    setColumnFilters(prev => ({ ...prev, [colId]: new Set() }));
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setColumnFilters({});
    setCurrentPage(1);
  };

  const isColumnFiltered = (colId) => {
    return columnFilters[colId] && columnFilters[colId].size > 0;
  };

  // --- Selection Operations ---
  const toggleRowSelection = (rowId) => {
    setSelectedRows(prev => {
      const next = new Set(prev);
      if (next.has(rowId)) {
        next.delete(rowId);
      } else {
        next.add(rowId);
      }
      return next;
    });
  };

  const toggleSelectAllVisible = (paginatedRows) => {
    const allVisible = paginatedRows.every(r => selectedRows.has(r.id));
    setSelectedRows(prev => {
      const next = new Set(prev);
      if (allVisible) {
        paginatedRows.forEach(r => next.delete(r.id));
      } else {
        paginatedRows.forEach(r => next.add(r.id));
      }
      return next;
    });
  };

  const clearSelection = () => {
    setSelectedRows(new Set());
  };

  // --- CSV Export ---
  const generateCsv = (exportRows, suffix) => {
    if (exportRows.length === 0) {
      addToast('No data to export', 'error');
      return;
    }

    const headers = columns.map(col => `"${col.label.replace(/"/g, '""')}"`).join(',');
    const csvRows = exportRows.map(row => {
      return columns.map(col => {
        const val = row[col.id] || '';
        return `"${val.toString().replace(/"/g, '""')}"`;
      }).join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...csvRows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${sheet.title.replace(/\s+/g, '_')}_${suffix}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setExportOpen(false);
  };

  const exportAll = () => {
    generateCsv(rows, 'all_export');
    logCrmActivity(null, 'Spreadsheet Exported', `Exported all ${rows.length} rows from "${sheet.title}"`);
  };

  const exportFiltered = () => {
    generateCsv(filteredRows, 'filtered_export');
    logCrmActivity(null, 'Spreadsheet Exported', `Exported ${filteredRows.length} filtered rows from "${sheet.title}"`);
  };

  const exportSelected = () => {
    const selRows = rows.filter(r => selectedRows.has(r.id));
    generateCsv(selRows, 'selected_export');
    logCrmActivity(null, 'Spreadsheet Exported', `Exported ${selRows.length} selected rows from "${sheet.title}"`);
  };

  // --- Filter Dropdown Component ---
  const FilterDropdown = ({ colId }) => {
    const allValues = getUniqueValuesForColumn(colId);
    const searchTerm = (filterSearch[colId] || '').toLowerCase();
    const displayValues = searchTerm
      ? allValues.filter(v => v === '__EMPTY__' ? '(empty)'.includes(searchTerm) : v.toLowerCase().includes(searchTerm))
      : allValues;

    const activeFilter = columnFilters[colId];
    // If no filter active, all are "checked"
    const isChecked = (val) => {
      if (!activeFilter) return true;
      return activeFilter.has(val);
    };

    return (
      <div
        ref={filterDropdownRef}
        onClick={e => e.stopPropagation()}
        style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          marginTop: 4,
          zIndex: 100,
          background: 'var(--crm-bg-card)',
          border: '1px solid var(--crm-border)',
          borderRadius: 'var(--crm-radius)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
          width: 260,
          maxHeight: 360,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Search */}
        <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--crm-border)' }}>
          <input
            type="text"
            className="crm-input"
            placeholder="Search values..."
            value={filterSearch[colId] || ''}
            onChange={e => setFilterSearch(prev => ({ ...prev, [colId]: e.target.value }))}
            autoFocus
            style={{ padding: '6px 10px', fontSize: '0.8rem', width: '100%' }}
          />
        </div>

        {/* Select All / Clear All */}
        <div style={{ display: 'flex', gap: 6, padding: '8px 12px', borderBottom: '1px solid var(--crm-border)' }}>
          <button
            className="crm-btn crm-btn-secondary crm-btn-sm"
            onClick={() => selectAllFilterValues(colId)}
            style={{ flex: 1, fontSize: '0.75rem', padding: '4px 8px' }}
          >
            Select All
          </button>
          <button
            className="crm-btn crm-btn-secondary crm-btn-sm"
            onClick={() => clearAllFilterValues(colId)}
            style={{ flex: 1, fontSize: '0.75rem', padding: '4px 8px' }}
          >
            Clear All
          </button>
        </div>

        {/* Values List */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '4px 0' }}>
          {displayValues.length === 0 ? (
            <div style={{ padding: '12px', textAlign: 'center', color: 'var(--crm-text-muted)', fontSize: '0.8rem' }}>
              No matching values
            </div>
          ) : (
            displayValues.map(val => (
              <label
                key={val}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 12px',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  color: 'var(--crm-text)',
                  transition: 'background 0.15s',
                  userSelect: 'none'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--crm-bg-elevated)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <input
                  type="checkbox"
                  checked={isChecked(val)}
                  onChange={() => toggleFilterValue(colId, val)}
                  style={{ accentColor: 'var(--crm-accent)', width: 15, height: 15, cursor: 'pointer' }}
                />
                <span style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontStyle: val === '__EMPTY__' ? 'italic' : 'normal',
                  color: val === '__EMPTY__' ? 'var(--crm-text-muted)' : 'var(--crm-text)'
                }}>
                  {val === '__EMPTY__' ? '(Empty)' : val}
                </span>
              </label>
            ))
          )}
        </div>

        {/* Apply / Close */}
        <div style={{ padding: '8px 12px', borderTop: '1px solid var(--crm-border)', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            className="crm-btn crm-btn-primary crm-btn-sm"
            onClick={() => setFilterOpenCol(null)}
            style={{ fontSize: '0.78rem', padding: '5px 14px' }}
          >
            Done
          </button>
        </div>
      </div>
    );
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

          {/* Export Dropdown */}
          <div style={{ position: 'relative' }} ref={exportDropdownRef}>
            <button className="crm-btn crm-btn-secondary crm-btn-sm" onClick={() => setExportOpen(!exportOpen)}>
              <Download size={14} /> Export ▾
            </button>
            {exportOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: 4,
                zIndex: 100,
                background: 'var(--crm-bg-card)',
                border: '1px solid var(--crm-border)',
                borderRadius: 'var(--crm-radius)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
                minWidth: 220,
                overflow: 'hidden'
              }}>
                <button
                  onClick={exportAll}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                    padding: '10px 16px', border: 'none', background: 'none',
                    color: 'var(--crm-text)', fontSize: '0.85rem', cursor: 'pointer',
                    textAlign: 'left', transition: 'background 0.15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--crm-bg-elevated)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <Download size={14} />
                  <div>
                    <div style={{ fontWeight: 600 }}>Export All</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--crm-text-muted)', marginTop: 2 }}>{rows.length} rows</div>
                  </div>
                </button>

                {hasActiveFilters && (
                  <button
                    onClick={exportFiltered}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                      padding: '10px 16px', border: 'none', background: 'none',
                      color: 'var(--crm-text)', fontSize: '0.85rem', cursor: 'pointer',
                      textAlign: 'left', borderTop: '1px solid var(--crm-border)',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--crm-bg-elevated)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <Filter size={14} style={{ color: 'var(--crm-accent)' }} />
                    <div>
                      <div style={{ fontWeight: 600 }}>Export Filtered</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--crm-text-muted)', marginTop: 2 }}>{filteredRows.length} matching rows</div>
                    </div>
                  </button>
                )}

                <button
                  onClick={exportSelected}
                  disabled={selectedCount === 0}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                    padding: '10px 16px', border: 'none', background: 'none',
                    color: selectedCount === 0 ? 'var(--crm-text-muted)' : 'var(--crm-text)',
                    fontSize: '0.85rem',
                    cursor: selectedCount === 0 ? 'not-allowed' : 'pointer',
                    textAlign: 'left', borderTop: '1px solid var(--crm-border)',
                    opacity: selectedCount === 0 ? 0.5 : 1,
                    transition: 'background 0.15s'
                  }}
                  onMouseEnter={e => { if (selectedCount > 0) e.currentTarget.style.background = 'var(--crm-bg-elevated)'; }}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <CheckSquare size={14} style={{ color: selectedCount > 0 ? '#22c55e' : 'var(--crm-text-muted)' }} />
                  <div>
                    <div style={{ fontWeight: 600 }}>Export Selected</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--crm-text-muted)', marginTop: 2 }}>
                      {selectedCount === 0 ? 'No rows selected' : `${selectedCount} rows selected`}
                    </div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Editor Grid Area */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, border: '1px solid var(--crm-border)', borderRadius: 'var(--crm-radius)', background: 'var(--crm-bg-card)', overflow: 'hidden' }}>
        
        {/* Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--crm-border)', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
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

            {hasActiveFilters && (
              <button
                className="crm-btn crm-btn-secondary crm-btn-sm"
                onClick={clearAllFilters}
                style={{ color: 'var(--crm-accent)' }}
              >
                <XCircle size={14} /> Clear Filters
              </button>
            )}

            {selectedCount > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 4 }}>
                <span style={{
                  fontSize: '0.8rem',
                  color: '#22c55e',
                  fontWeight: 600,
                  background: 'rgba(34, 197, 94, 0.1)',
                  padding: '4px 10px',
                  borderRadius: 'var(--crm-radius)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4
                }}>
                  <CheckSquare size={13} /> {selectedCount} selected
                </span>
                <button
                  className="crm-btn crm-btn-ghost crm-btn-sm"
                  onClick={clearSelection}
                  style={{ padding: '4px 8px', fontSize: '0.78rem', color: 'var(--crm-text-muted)' }}
                >
                  Clear
                </button>
              </div>
            )}

            {!hasActiveFilters && selectedCount === 0 && (
              <span style={{ fontSize: '0.78rem', color: 'var(--crm-text-muted)', display: 'flex', alignItems: 'center', marginLeft: 8 }}>
                💡 Double-click any cell to edit · Use column filters to narrow data
              </span>
            )}
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
        {(() => {
          const totalPages = Math.ceil(filteredRows.length / pageSize);
          const startIndex = (currentPage - 1) * pageSize;
          const endIndex = Math.min(startIndex + pageSize, filteredRows.length);
          const paginatedRows = filteredRows.slice(startIndex, endIndex);
          const allVisibleSelected = paginatedRows.length > 0 && paginatedRows.every(r => selectedRows.has(r.id));
          const someVisibleSelected = paginatedRows.some(r => selectedRows.has(r.id));

          return (
            <>
              <div style={{ overflow: 'auto', flex: 1 }}>
                <table className="crm-table" style={{ borderCollapse: 'separate', borderSpacing: 0, width: 'max-content', minWidth: '100%' }}>
                  <thead>
                    <tr style={{ background: 'var(--crm-bg-elevated)' }}>
                      {/* Checkbox header */}
                      <th style={{
                        width: 40,
                        textAlign: 'center',
                        borderRight: '1px solid var(--crm-border)',
                        position: 'sticky',
                        left: 0,
                        zIndex: 11,
                        background: 'var(--crm-bg-elevated)',
                        padding: '10px 8px',
                        cursor: 'pointer'
                      }}
                        onClick={() => toggleSelectAllVisible(paginatedRows)}
                        title={allVisibleSelected ? 'Deselect all visible' : 'Select all visible'}
                      >
                        {allVisibleSelected ? (
                          <CheckSquare size={16} style={{ color: '#22c55e' }} />
                        ) : someVisibleSelected ? (
                          <div style={{ width: 16, height: 16, border: '2px solid var(--crm-text-muted)', borderRadius: 3, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(34, 197, 94, 0.15)' }}>
                            <div style={{ width: 8, height: 2, background: '#22c55e', borderRadius: 1 }} />
                          </div>
                        ) : (
                          <Square size={16} style={{ color: 'var(--crm-text-muted)' }} />
                        )}
                      </th>

                      {/* Actions Header */}
                      <th style={{ width: 44, textAlign: 'center', borderRight: '1px solid var(--crm-border)', position: 'sticky', left: 40, zIndex: 10, background: 'var(--crm-bg-elevated)' }}></th>
                      
                      {/* Column Headers */}
                      {columns.map((col) => (
                        <th key={col.id} style={{ minWidth: 150, padding: '10px 14px', borderRight: '1px solid var(--crm-border)', borderBottom: '1px solid var(--crm-border)', position: 'relative' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontWeight: 600, color: 'var(--crm-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{col.label}</span>
                            
                            <div style={{ display: 'flex', gap: 2, alignItems: 'center', flexShrink: 0 }}>
                              {/* Filter Button */}
                              <button
                                type="button"
                                className="crm-btn-ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFilterOpenCol(prev => prev === col.id ? null : col.id);
                                }}
                                style={{
                                  padding: 3,
                                  borderRadius: 4,
                                  display: 'inline-flex',
                                  color: isColumnFiltered(col.id) ? 'var(--crm-accent)' : 'var(--crm-text-muted)',
                                  background: isColumnFiltered(col.id) ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                                  transition: 'all 0.15s'
                                }}
                                title={`Filter by "${col.label}"`}
                              >
                                <Filter size={13} />
                              </button>

                              {/* Delete Column button */}
                              {col.id !== 'col_name' && isAdmin && (
                                <button
                                  type="button"
                                  className="crm-btn-ghost"
                                  onClick={() => deleteColumn(col.id, col.label)}
                                  style={{ padding: 3, borderRadius: 4, display: 'inline-flex', color: 'var(--crm-text-muted)' }}
                                  title={`Delete column "${col.label}"`}
                                >
                                  <Trash2 size={12} />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Filter Dropdown */}
                          {filterOpenCol === col.id && <FilterDropdown colId={col.id} />}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRows.length === 0 ? (
                      <tr>
                        <td colSpan={columns.length + 2} style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--crm-text-muted)' }}>
                          {hasActiveFilters ? (
                            <div>
                              <Filter size={28} style={{ marginBottom: 8, color: 'var(--crm-text-muted)' }} />
                              <p style={{ fontWeight: 600, marginBottom: 4, color: 'var(--crm-text)' }}>No rows match active filters</p>
                              <p style={{ fontSize: '0.82rem' }}>Adjust your column filters or <button onClick={clearAllFilters} style={{ background: 'none', border: 'none', color: 'var(--crm-accent)', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.82rem' }}>clear all filters</button></p>
                            </div>
                          ) : (
                            <div>
                              <p style={{ fontWeight: 600, marginBottom: 4, color: 'var(--crm-text)' }}>No data in this spreadsheet yet</p>
                              <p style={{ fontSize: '0.82rem' }}>Click "Add Row" to start adding data or import from an Excel file</p>
                            </div>
                          )}
                        </td>
                      </tr>
                    ) : (
                      paginatedRows.map((row, pageRowIndex) => {
                        // Find the absolute index in the raw rows array (for editing/deleting)
                        const absoluteRowIndex = rows.findIndex(r => r.id === row.id);
                        const isSelected = selectedRows.has(row.id);

                        return (
                          <tr key={row.id} style={{ background: isSelected ? 'rgba(99, 102, 241, 0.06)' : 'transparent' }}>
                            {/* Row Checkbox */}
                            <td style={{
                              textAlign: 'center',
                              borderRight: '1px solid var(--crm-border)',
                              borderBottom: '1px solid var(--crm-border)',
                              position: 'sticky',
                              left: 0,
                              zIndex: 9,
                              background: isSelected ? 'rgba(99, 102, 241, 0.08)' : 'var(--crm-bg-card)',
                              padding: 8,
                              cursor: 'pointer'
                            }}
                              onClick={() => toggleRowSelection(row.id)}
                            >
                              {isSelected ? (
                                <CheckSquare size={15} style={{ color: '#22c55e' }} />
                              ) : (
                                <Square size={15} style={{ color: 'var(--crm-text-muted)' }} />
                              )}
                            </td>

                            {/* Row Delete Action */}
                            <td style={{ 
                              textAlign: 'center', 
                              borderRight: '1px solid var(--crm-border)', 
                              borderBottom: '1px solid var(--crm-border)',
                              position: 'sticky', 
                              left: 40, 
                              zIndex: 9, 
                              background: isSelected ? 'rgba(99, 102, 241, 0.08)' : 'var(--crm-bg-card)', 
                              padding: 8 
                            }}>
                              {isAdmin && (
                                <button
                                  className="crm-btn crm-btn-ghost crm-btn-sm"
                                  onClick={() => deleteRow(absoluteRowIndex)}
                                  style={{ padding: 4, color: 'var(--crm-red)', display: 'inline-flex' }}
                                  title="Delete row"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </td>

                            {/* Row Cells */}
                            {columns.map(col => {
                              const isEditing = editingCell?.rowIndex === absoluteRowIndex && editingCell?.colId === col.id;
                              const cellValue = row[col.id] || '';

                              return (
                                <td
                                  key={col.id}
                                  onDoubleClick={() => startEditing(absoluteRowIndex, col.id, cellValue)}
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
                                      onChange={e => handleCellChange(absoluteRowIndex, col.id, e.target.value)}
                                      onBlur={() => finishEditing(absoluteRowIndex, col.id, cellValue)}
                                      onKeyDown={e => {
                                        if (e.key === 'Enter') finishEditing(absoluteRowIndex, col.id, cellValue);
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
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Footer */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: '12px 24px', 
                borderTop: '1px solid var(--crm-border)', 
                background: 'var(--crm-bg-elevated)',
                gap: 16,
                flexWrap: 'wrap'
              }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--crm-text-secondary)' }}>
                  Showing <strong style={{ color: 'var(--crm-text)' }}>{filteredRows.length === 0 ? 0 : startIndex + 1}</strong> to <strong style={{ color: 'var(--crm-text)' }}>{endIndex}</strong> of <strong style={{ color: 'var(--crm-text)' }}>{filteredRows.length}</strong> rows
                  {hasActiveFilters && <span style={{ color: 'var(--crm-accent)', marginLeft: 6 }}>(filtered from {rows.length})</span>}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button 
                    className="crm-btn crm-btn-secondary crm-btn-sm" 
                    onClick={() => setCurrentPage(1)} 
                    disabled={currentPage === 1}
                    style={{ padding: '6px 8px' }}
                    title="First Page"
                  >
                    <ChevronsLeft size={16} />
                  </button>
                  <button 
                    className="crm-btn crm-btn-secondary crm-btn-sm" 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                    disabled={currentPage === 1}
                    style={{ padding: '6px 8px' }}
                    title="Previous Page"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  
                  <span style={{ fontSize: '0.85rem', color: 'var(--crm-text-secondary)', padding: '0 8px' }}>
                    Page <strong style={{ color: 'var(--crm-text)' }}>{currentPage}</strong> of <strong style={{ color: 'var(--crm-text)' }}>{totalPages || 1}</strong>
                  </span>

                  <button 
                    className="crm-btn crm-btn-secondary crm-btn-sm" 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                    disabled={currentPage === totalPages || totalPages === 0}
                    style={{ padding: '6px 8px' }}
                    title="Next Page"
                  >
                    <ChevronRight size={16} />
                  </button>
                  <button 
                    className="crm-btn crm-btn-secondary crm-btn-sm" 
                    onClick={() => setCurrentPage(totalPages)} 
                    disabled={currentPage === totalPages || totalPages === 0}
                    style={{ padding: '6px 8px' }}
                    title="Last Page"
                  >
                    <ChevronsRight size={16} />
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--crm-text-secondary)' }}>
                  <span>Rows per page:</span>
                  <select
                    value={pageSize}
                    onChange={e => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="crm-input"
                    style={{ padding: '4px 8px', fontSize: '0.8rem', width: 80, height: 'auto' }}
                  >
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value={250}>250</option>
                    <option value={500}>500</option>
                  </select>
                </div>
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
}
