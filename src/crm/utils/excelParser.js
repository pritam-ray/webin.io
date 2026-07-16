import * as XLSX from 'xlsx';

/**
 * Parses an Excel (.xlsx, .xls) or CSV file and returns columns and rows for all sheet tabs
 * @param {File} file 
 * @returns {Promise<Array<{name: string, columns: Array, rows: Array}>>}
 */
export const parseExcelOrCsv = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target.result;
        // Read file using SheetJS
        const workbook = XLSX.read(data, { type: 'binary' });
        
        const parsedSheets = [];
        
        workbook.SheetNames.forEach(sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          // Convert to JSON 2D Array
          const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          // Skip completely empty sheets
          if (json.length === 0) return;
          
          // Extract headers from the first row
          const rawHeaders = json[0];
          const columns = rawHeaders.map((header, idx) => {
            const label = header ? header.toString().trim() : `Column ${idx + 1}`;
            // Generate unique and safe column ID
            const id = `col_${label.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${idx}`;
            return { id, label, type: 'text' };
          });
          
          // Extract data rows
          const rows = [];
          for (let i = 1; i < json.length; i++) {
            const rawRow = json[i];
            if (!rawRow || rawRow.length === 0 || rawRow.every(cell => cell === null || cell === undefined || cell === '')) {
              continue;
            }
            
            const rowObj = { id: `r-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}` };
            columns.forEach((col, idx) => {
              const val = rawRow[idx];
              rowObj[col.id] = val !== undefined && val !== null ? val.toString().trim() : '';
            });
            rows.push(rowObj);
          }
          
          parsedSheets.push({
            name: sheetName,
            columns,
            rows
          });
        });
        
        if (parsedSheets.length === 0) {
          reject(new Error('The spreadsheet is empty. Please upload a file with headers and data.'));
          return;
        }
        
        resolve(parsedSheets);
      } catch (err) {
        reject(new Error(`Failed to parse file: ${err.message}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file.'));
    };
    
    reader.readAsBinaryString(file);
  });
};
