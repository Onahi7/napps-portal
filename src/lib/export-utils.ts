import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Cleanly exports any dataset to a formatted CSV file and triggers download
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  columnMapping?: Record<string, string>
) {
  if (!data || data.length === 0) {
    throw new Error('No data available to export');
  }

  const keys = columnMapping ? Object.keys(columnMapping) : Object.keys(data[0]);
  const headers = columnMapping ? Object.values(columnMapping) : keys;

  const escapeCSV = (val: any): string => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'object') {
      if (val instanceof Date) return val.toLocaleDateString();
      if (val.name) return escapeCSV(val.name);
      return JSON.stringify(val).replace(/"/g, '""');
    }
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csvRows: string[] = [];
  csvRows.push(headers.map(escapeCSV).join(','));

  for (const row of data) {
    const values = keys.map((key) => {
      // Support nested paths like 'school.name'
      if (key.includes('.')) {
        const parts = key.split('.');
        let curr: any = row;
        for (const p of parts) {
          curr = curr ? curr[p] : undefined;
        }
        return escapeCSV(curr);
      }
      return escapeCSV(row[key]);
    });
    csvRows.push(values.join(','));
  }

  const csvString = '\uFEFF' + csvRows.join('\r\n'); // Add UTF-8 BOM for Excel compatibility
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename.replace(/\.csv$/, '')}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates an executive, branded PDF report from table rows
 */
export function exportTableToPDF(options: {
  title: string;
  subtitle?: string;
  headers: string[];
  rows: (string | number)[][];
  filename: string;
  orientation?: 'portrait' | 'landscape';
}) {
  const { title, subtitle, headers, rows, filename, orientation = 'landscape' } = options;

  const doc = new jsPDF({
    orientation,
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Top Institutional Header Bar
  doc.setFillColor(6, 78, 59); // Deep Emerald #064e3b
  doc.rect(0, 0, pageWidth, 56, 'F');

  // Gold accent line
  doc.setFillColor(217, 119, 6); // Warm Amber #d97706
  doc.rect(0, 56, pageWidth, 4, 'F');

  // Header Title
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text('NAPPS NASARAWA STATE CHAPTER', 30, 30);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(209, 250, 229);
  doc.text('Nigeria Association of Proprietors of Private Schools | Official Administrative Registry', 30, 46);

  // Document Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(title, 30, 85);

  // Subtitle / Date
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  const subText = subtitle 
    ? `${subtitle} | Generated on ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`
    : `Generated on ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} | Records Count: ${rows.length}`;
  doc.text(subText, 30, 100);

  // Table
  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 112,
    theme: 'grid',
    styles: {
      fontSize: 8.5,
      cellPadding: 6,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.5,
    },
    headStyles: {
      fillColor: [6, 78, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 30, right: 30, bottom: 40 },
    didDrawPage: (data) => {
      // Footer on every page
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Confidential &bull; NAPPS Nasarawa State Portal &bull; Page ${data.pageNumber} of ${doc.getNumberOfPages()}`,
        30,
        pageHeight - 20
      );
    },
  });

  doc.save(`${filename.replace(/\.pdf$/, '')}_${new Date().toISOString().split('T')[0]}.pdf`);
}
