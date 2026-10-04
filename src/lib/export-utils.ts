import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * jsPDF's built-in Helvetica only encodes Latin-1. Anything above U+00FF
 * (notably the Naira sign) silently drops or renders as a glyph blob, so we
 * map the characters we actually use to safe equivalents before drawing.
 */
const PDF_CHAR_MAP: Record<string, string> = {
  '\u20A6': 'NGN ',
  '\u2022': '|',
  '\u2013': '-',
  '\u2014': '-',
  '\u2018': "'",
  '\u2019': "'",
  '\u201C': '"',
  '\u201D': '"',
  '\u2026': '...',
  '\u00A0': ' ',
};

export function sanitizePdfText(value: unknown): string {
  if (value === null || value === undefined) return '';
  const raw =
    value instanceof Date
      ? value.toLocaleDateString('en-NG')
      : typeof value === 'object'
        ? JSON.stringify(value)
        : String(value);

  let out = '';
  for (const ch of raw) {
    const mapped = PDF_CHAR_MAP[ch];
    if (mapped !== undefined) {
      out += mapped;
    } else if ((ch.codePointAt(0) ?? 0) <= 0xff) {
      out += ch;
    }
  }
  return out;
}

/** Sanitises a filename for download across Windows/macOS browsers. */
function safeFilename(name: string, ext: 'csv' | 'pdf'): string {
  const base = name
    .replace(new RegExp(`\\.${ext}$`, 'i'), '')
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
  const date = new Date().toISOString().split('T')[0];
  return `${base || `NAPPS_Export`}_${date}.${ext}`;
}

/**
 * Cleanly exports any dataset to a formatted CSV file and triggers download.
 * `columnMapping` maps row keys -> display headers (also limits column order).
 */
export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  columnMapping?: Record<string, string>
) {
  if (!data || data.length === 0) {
    throw new Error('No data available to export');
  }

  const keys = columnMapping ? Object.keys(columnMapping) : Object.keys(data[0]);
  const headers = columnMapping ? Object.values(columnMapping) : keys;

  const escapeCSV = (val: unknown): string => {
    if (val === null || val === undefined) return '';
    if (val instanceof Date) return val.toLocaleDateString('en-NG');
    if (Array.isArray(val)) {
      return escapeCSV(
        val
          .map((v) =>
            v && typeof v === 'object'
              ? ((v as Record<string, unknown>).name as string | undefined) ??
                ((v as Record<string, unknown>).schoolName as string | undefined) ??
                ''
              : v
          )
          .join('; ')
      );
    }
    if (typeof val === 'object') {
      const obj = val as Record<string, unknown>;
      if (typeof obj.name === 'string') return escapeCSV(obj.name);
      if (typeof obj.schoolName === 'string') return escapeCSV(obj.schoolName);
      return JSON.stringify(obj).replace(/"/g, '""');
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
        let curr: unknown = row;
        for (const p of parts) {
          curr = curr ? (curr as Record<string, unknown>)[p] : undefined;
        }
        return escapeCSV(curr);
      }
      return escapeCSV(row[key]);
    });
    csvRows.push(values.join(','));
  }

  const csvString = '\uFEFF' + csvRows.join('\r\n'); // UTF-8 BOM for Excel
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', safeFilename(filename, 'csv'));
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

const EMERALD: [number, number, number] = [6, 78, 59];
const AMBER: [number, number, number] = [217, 119, 6];

/** Numbers/currency cells are right-aligned automatically. */
function isNumericCell(value: unknown): boolean {
  if (typeof value === 'number') return Number.isFinite(value);
  if (typeof value !== 'string') return false;
  const cleaned = value.replace(/(NGN|\u20A6|%|,|\s)/gi, '').trim();
  if (cleaned === '' || !/^[-+]?\d+(\.\d+)?$/.test(cleaned)) return false;
  return true;
}

/**
 * Generates an executive, branded PDF report from table rows.
 * Branded header is repeated on every page, footer carries an accurate
 * "Page X of Y", numeric columns are right-aligned and a totals row can be
 * appended with a highlighted style.
 */
export function exportTableToPDF(options: {
  title: string;
  subtitle?: string;
  headers: string[];
  rows: (string | number)[][];
  filename: string;
  orientation?: 'portrait' | 'landscape';
  /** Explicit column widths in points (missing entries stay auto). */
  columnWidths?: (number | 'auto')[];
  /** Bold, highlighted summary row appended to the table body. */
  totalsRow?: (string | number)[];
  /** Left-hand text in the footer, e.g. a confidentiality note. */
  footerNote?: string;
}) {
  const { title, subtitle, headers, rows, filename, orientation = 'landscape' } = options;

  const doc = new jsPDF({
    orientation,
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const generatedStamp = `Generated ${new Date().toLocaleString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })}`;

  const subText = `${subtitle ? subtitle + ' | ' : ''}${generatedStamp} | Records: ${rows.length}`;

  const safeHeaders = headers.map(sanitizePdfText);
  const safeRows = rows.map((r) => r.map(sanitizePdfText));
  const safeTotals = options.totalsRow ? options.totalsRow.map(sanitizePdfText) : undefined;

  // Right-align columns that are numeric (based on the body rows only).
  const rightAligned = new Set<number>();
  safeRows.forEach((row) =>
    row.forEach((cell, i) => {
      if (isNumericCell(cell)) rightAligned.add(i);
    })
  );
  // Never right-align a column that also holds prose (S/N aside).
  rightAligned.forEach((i) => {
    const textual = safeRows.filter((r) => r[i] && !isNumericCell(r[i])).length;
    const numeric = safeRows.filter((r) => isNumericCell(r[i])).length;
    if (textual > numeric) rightAligned.delete(i);
  });

  const columnStyles: Record<number, { halign: 'left' | 'right' | 'center'; cellWidth?: number }> = {};
  rightAligned.forEach((i) => {
    columnStyles[i] = { halign: 'right' };
  });
  options.columnWidths?.forEach((w, i) => {
    columnStyles[i] = { ...(columnStyles[i] || {}), halign: columnStyles[i]?.halign || 'left', cellWidth: w };
  });

  const bodyRowOffset = safeRows.length;

  autoTable(doc, {
    head: [safeHeaders],
    body: safeTotals ? [...safeRows, safeTotals] : safeRows,
    startY: 118,
    theme: 'grid',
    styles: {
      fontSize: 8.5,
      cellPadding: 6,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.5,
      overflow: 'linebreak',
      font: 'helvetica',
      valign: 'middle',
    },
    headStyles: {
      fillColor: EMERALD,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      lineWidth: 0.5,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles,
    showHead: 'everyPage',
    margin: { left: 30, right: 30, bottom: 46, top: 118 },
    didParseCell: (data) => {
      if (safeTotals && data.section === 'body' && data.row.index === bodyRowOffset) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [255, 251, 235];
        data.cell.styles.textColor = EMERALD;
        data.cell.styles.lineWidth = 0.5;
        data.cell.styles.lineColor = AMBER;
      }
    },
    didDrawPage: () => {
      // Institutional banner — repeated on every page
      doc.setFillColor(...EMERALD);
      doc.rect(0, 0, pageWidth, 56, 'F');
      doc.setFillColor(...AMBER);
      doc.rect(0, 56, pageWidth, 4, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(15);
      doc.text('NAPPS NASARAWA STATE CHAPTER', 30, 30);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(209, 250, 229);
      doc.text('Nigeria Association of Proprietors of Private Schools | Official Administrative Registry', 30, 45);

      // Report title + subtitle
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42);
      doc.text(sanitizePdfText(title), 30, 84);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text(subText, 30, 100);

      doc.setTextColor(148, 163, 184);
      doc.text('CONFIDENTIAL', pageWidth - 30, 100, { align: 'right' });
    },
  });

  // Footer drawn after the table exists so "Page X of Y" is accurate.
  const totalPages = doc.getNumberOfPages();
  const footerLeft = sanitizePdfText(options.footerNote) || 'Confidential | NAPPS Nasarawa State Portal';
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(30, pageHeight - 34, pageWidth - 30, pageHeight - 34);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(footerLeft, 30, pageHeight - 20);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - 30, pageHeight - 20, { align: 'right' });
  }

  doc.save(safeFilename(filename, 'pdf'));
}
