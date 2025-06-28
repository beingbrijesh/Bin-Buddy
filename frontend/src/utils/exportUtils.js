/**
 * Convert array of objects to CSV string
 * @param {Array<Object>} data - Array of data objects
 * @returns {string} CSV string representation of data
 */
const objectsToCSV = (data) => {
  if (!data || !data.length) {
    return '';
  }

  // Get headers from the first object
  const headers = Object.keys(data[0]);
  
  // Create header row
  const headerRow = headers.join(',');
  
  // Create data rows
  const dataRows = data.map(row => {
    return headers.map(header => {
      // Handle undefined or null values
      const value = row[header] === null || row[header] === undefined ? '' : row[header];
      
      // If value contains comma, quotes, or newlines, wrap in quotes
      const needsQuotes = typeof value === 'string' && (
        value.includes(',') || 
        value.includes('"') || 
        value.includes('\n') || 
        value.includes('\r')
      );
      
      if (needsQuotes) {
        // Escape quotes by doubling them
        return `"${value.replace(/"/g, '""')}"`;
      }
      
      return value;
    }).join(',');
  });
  
  // Combine header and data rows
  return [headerRow, ...dataRows].join('\n');
};

/**
 * Export data array to downloadable CSV file
 * @param {Array<Object>} data - Array of data objects to export
 * @param {string} filename - Name of file without extension
 */
export const exportToCSV = (data, filename = 'export') => {
  if (!data || !data.length) {
    console.warn('No data to export');
    return;
  }
  
  // Convert data to CSV
  const csvString = objectsToCSV(data);
  
  // Create blob and download link
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  // Set link properties
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  // Add to document, trigger click, and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up URL object
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 100);
};

/**
 * Format date for inclusion in CSV exports
 * @param {Date|string} date - Date object or string to format
 * @param {string} format - Optional format specification
 * @returns {string} Formatted date string
 */
export const formatDateForExport = (date, format = 'yyyy-MM-dd') => {
  if (!date) return '';
  
  try {
    const d = new Date(date);
    
    if (isNaN(d.getTime())) {
      return '';
    }
    
    // Simple date formatter for common formats
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    
    switch (format) {
      case 'yyyy-MM-dd':
        return `${year}-${month}-${day}`;
      case 'dd/MM/yyyy':
        return `${day}/${month}/${year}`;
      case 'MM/dd/yyyy':
        return `${month}/${day}/${year}`;
      case 'yyyy-MM-dd HH:mm':
        return `${year}-${month}-${day} ${hours}:${minutes}`;
      default:
        return `${year}-${month}-${day}`;
    }
  } catch (error) {
    console.error('Error formatting date for export:', error);
    return '';
  }
}; 