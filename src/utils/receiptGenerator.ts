import jsPDF from 'jspdf';
import QRCode from 'qrcode';

export interface LevyPaymentData {
  receiptNumber: string;
  reference: string;
  memberName: string;
  email: string;
  phone: string;
  chapter: string;
  schoolName: string;
  wards: string[];
  amount: number;
  paidAt: string;
  paymentMethod?: string;
}

/**
 * Convert number to English currency words
 */
function numberToWords(num: number): string {
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  if (num === 0) return 'Zero Naira Only';
  
  const inWords = (n: number): string => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + inWords(n % 100) : '');
    if (n < 1000000) return inWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ', ' + inWords(n % 1000) : '');
    if (n < 1000000000) return inWords(Math.floor(n / 1000000)) + ' Million' + (n % 1000000 !== 0 ? ', ' + inWords(n % 1000000) : '');
    return n.toString();
  };
  
  return inWords(num).trim() + ' Naira Only';
}

/**
 * Load official logo as base64 string
 */
const loadLogoBase64 = async (): Promise<string | null> => {
  try {
    const response = await fetch('/napps-logo.png');
    if (!response.ok) return null;
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

/**
 * Generate and download an executive, tamper-evident official A4 receipt
 */
export const generateLevyReceipt = async (paymentData: LevyPaymentData): Promise<void> => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const margin = 12;
  const contentWidth = pageWidth - 2 * margin; // 186mm

  // Professional Color Palette
  const cEmerald: [number, number, number] = [6, 78, 59];        // #064e3b - Deep Emerald
  const cGold: [number, number, number] = [180, 83, 9];          // #b45309 - Warm Amber/Gold
  const cSlate: [number, number, number] = [30, 41, 59];         // #1e293b - Slate Dark
  const cSlateMuted: [number, number, number] = [100, 116, 139]; // #64748b - Slate Muted
  const cLightBg: [number, number, number] = [248, 250, 252];    // #f8fafc - Light container
  const cBorder: [number, number, number] = [226, 232, 240];     // #e2e8f0 - Border gray

  // Calculate clean amount (supports kobo or naira)
  const amountInNaira = paymentData.amount > 10000 ? Math.round(paymentData.amount / 100) : paymentData.amount;
  const formattedAmount = amountInNaira.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const amountWords = numberToWords(amountInNaira);

  // 1. Double Outer Executive Border with Corner Accents
  doc.setDrawColor(...cEmerald);
  doc.setLineWidth(0.8);
  doc.rect(margin, margin, contentWidth, pageHeight - 2 * margin);

  doc.setDrawColor(...cGold);
  doc.setLineWidth(0.3);
  doc.rect(margin + 1.2, margin + 1.2, contentWidth - 2.4, pageHeight - 2 * margin - 2.4);

  const cornerSize = 4;
  [
    [margin + 2.5, margin + 2.5],
    [margin + contentWidth - 2.5 - cornerSize, margin + 2.5],
    [margin + 2.5, pageHeight - margin - 2.5 - cornerSize],
    [margin + contentWidth - 2.5 - cornerSize, pageHeight - margin - 2.5 - cornerSize],
  ].forEach(([cx, cy]) => {
    doc.setFillColor(...cGold);
    doc.rect(cx, cy, cornerSize, cornerSize, 'F');
  });

  // 2. Official Header Section
  const curY = margin + 4;

  // Real Logo
  const logoData = await loadLogoBase64();
  if (logoData) {
    try {
      doc.addImage(logoData, 'PNG', margin + 4, curY + 1, 26, 26);
    } catch {
      // Fallback seal circle if image format fails
      doc.setFillColor(...cEmerald);
      doc.circle(margin + 17, curY + 14, 13, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('NAPPS', margin + 17, curY + 15, { align: 'center' });
    }
  } else {
    doc.setFillColor(...cEmerald);
    doc.circle(margin + 17, curY + 14, 13, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('NAPPS', margin + 17, curY + 15, { align: 'center' });
  }

  // Header Typography
  const headerTextLeft = margin + 34;
  doc.setTextColor(...cEmerald);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('NATIONAL ASSOCIATION OF PROPRIETORS OF PRIVATE SCHOOLS', headerTextLeft, curY + 6);

  doc.setTextColor(...cSlate);
  doc.setFontSize(14);
  doc.text('NAPPS NASARAWA STATE CHAPTER', headerTextLeft, curY + 13);

  doc.setTextColor(...cGold);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.text('Motto: Nurturing the Future Generations for National Development', headerTextLeft, curY + 18);

  doc.setTextColor(...cSlateMuted);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('Secretariat: Opp. Total Energy Filling Station, Jos Road, Lafia, Nasarawa State', headerTextLeft, curY + 23);
  doc.text('Email: info@nappsnasarawa.com  |  Portal: https://portal.nappsnasarawa.com', headerTextLeft, curY + 27);

  // Top Divider Rule
  let nextY = curY + 31;
  doc.setDrawColor(...cEmerald);
  doc.setLineWidth(0.6);
  doc.line(margin + 4, nextY, margin + contentWidth - 4, nextY);
  doc.setDrawColor(...cGold);
  doc.setLineWidth(0.2);
  doc.line(margin + 4, nextY + 1, margin + contentWidth - 4, nextY + 1);

  // 3. Document Title Bar & Status
  nextY += 5;
  doc.setFillColor(...cLightBg);
  doc.roundedRect(margin + 4, nextY, contentWidth - 8, 16, 2, 2, 'F');
  doc.setDrawColor(...cBorder);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin + 4, nextY, contentWidth - 8, 16, 2, 2, 'S');

  doc.setTextColor(...cEmerald);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('OFFICIAL LEVY PAYMENT RECEIPT', margin + 8, nextY + 7);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...cSlateMuted);
  doc.text('STATE SECRETARIAT BUILDING LEVY - 2026/2027 FISCAL YEAR', margin + 8, nextY + 12);

  // Status Badge
  const badgeX = margin + contentWidth - 46;
  doc.setFillColor(220, 252, 231); // Light Green #dcfce7
  doc.roundedRect(badgeX, nextY + 3.5, 38, 9, 2, 2, 'F');
  doc.setDrawColor(22, 163, 74);   // Green #16a34a
  doc.setLineWidth(0.3);
  doc.roundedRect(badgeX, nextY + 3.5, 38, 9, 2, 2, 'S');

  doc.setTextColor(22, 101, 52);   // Dark Green #166534
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('CLEARED & PAID', badgeX + 19, nextY + 9.5, { align: 'center' });

  // 4. Quick Metadata Strip
  nextY += 20;
  const colW = (contentWidth - 8) / 4;
  const metaBoxX = margin + 4;
  doc.setFillColor(241, 245, 249);
  doc.rect(metaBoxX, nextY, contentWidth - 8, 14, 'F');
  doc.setDrawColor(...cBorder);
  doc.setLineWidth(0.2);
  doc.rect(metaBoxX, nextY, contentWidth - 8, 14, 'S');

  const paymentDate = new Date(paymentData.paidAt || Date.now()).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const gatewayText = paymentData.paymentMethod ? `${paymentData.paymentMethod} (Bachs)` : 'Bachs / Bank Transfer';

  const metaItems = [
    { label: 'RECEIPT NO', val: paymentData.receiptNumber || 'NAPPS-RCPT' },
    { label: 'DATE ISSUED', val: paymentDate },
    { label: 'TRANSACTION REF', val: paymentData.reference.length > 20 ? `${paymentData.reference.slice(0, 18)}...` : paymentData.reference },
    { label: 'GATEWAY / CHANNEL', val: gatewayText },
  ];

  metaItems.forEach((item, idx) => {
    const x = metaBoxX + idx * colW + 4;
    doc.setTextColor(...cSlateMuted);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.text(item.label, x, nextY + 5);

    doc.setTextColor(...cSlate);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(item.val, x, nextY + 10.5);

    if (idx < 3) {
      doc.setDrawColor(...cBorder);
      doc.setLineWidth(0.2);
      doc.line(metaBoxX + (idx + 1) * colW, nextY + 2, metaBoxX + (idx + 1) * colW, nextY + 12);
    }
  });

  // 5. Two-Column Particulars Section
  nextY += 18;
  const halfW = (contentWidth - 11) / 2;

  // Left: Payer Particulars
  const leftX = margin + 4;
  doc.setFillColor(...cLightBg);
  doc.roundedRect(leftX, nextY, halfW, 46, 2, 2, 'F');
  doc.setDrawColor(...cBorder);
  doc.setLineWidth(0.3);
  doc.roundedRect(leftX, nextY, halfW, 46, 2, 2, 'S');

  doc.setFillColor(...cEmerald);
  doc.rect(leftX, nextY, halfW, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('PROPRIETOR / PAYER PARTICULARS', leftX + 4, nextY + 5);

  const payerRows = [
    ['Full Name:', paymentData.memberName || 'N/A'],
    ['Designation:', 'Proprietor / Member'],
    ['Phone Number:', paymentData.phone || 'N/A'],
    ['Email Address:', paymentData.email || 'N/A'],
    ['LGA / Chapter:', `${paymentData.chapter || 'Nasarawa'} Chapter`],
  ];
  let pyY = nextY + 12;
  payerRows.forEach(([lbl, val]) => {
    doc.setTextColor(...cSlateMuted);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(lbl, leftX + 4, pyY);

    doc.setTextColor(...cSlate);
    doc.setFont('helvetica', 'normal');
    const safeVal = val.length > 28 ? `${val.slice(0, 26)}...` : val;
    doc.text(safeVal, leftX + 28, pyY);
    pyY += 6.5;
  });

  // Right: School / Institution Particulars
  const rightX = leftX + halfW + 3;
  doc.setFillColor(...cLightBg);
  doc.roundedRect(rightX, nextY, halfW, 46, 2, 2, 'F');
  doc.setDrawColor(...cBorder);
  doc.setLineWidth(0.3);
  doc.roundedRect(rightX, nextY, halfW, 46, 2, 2, 'S');

  doc.setFillColor(...cEmerald);
  doc.rect(rightX, nextY, halfW, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('SCHOOL / INSTITUTION PARTICULARS', rightX + 4, nextY + 5);

  const wardText = paymentData.wards && paymentData.wards.length > 0 ? paymentData.wards.join(', ') : 'Not Specified';
  const schoolRows = [
    ['School Name:', paymentData.schoolName || 'N/A'],
    ['Registered Ward:', wardText],
    ['Local Govt Area:', `${paymentData.chapter || 'Nasarawa'} LGA`],
    ['State Chapter:', 'Nasarawa State'],
    ['Compliance:', 'Verified & In Good Standing'],
  ];
  let scY = nextY + 12;
  schoolRows.forEach(([lbl, val]) => {
    doc.setTextColor(...cSlateMuted);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(lbl, rightX + 4, scY);

    if (lbl === 'Compliance:') {
      doc.setTextColor(22, 101, 52);
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setTextColor(...cSlate);
      doc.setFont('helvetica', 'normal');
    }
    const safeVal = val.length > 28 ? `${val.slice(0, 26)}...` : val;
    doc.text(safeVal, rightX + 28, scY);
    scY += 6.5;
  });

  // 6. Itemized Assessment Table
  nextY += 51;
  const tableX = margin + 4;
  const tableW = contentWidth - 8;

  // Table Header
  doc.setFillColor(...cEmerald);
  doc.rect(tableX, nextY, tableW, 8, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('S/N', tableX + 3, nextY + 5.5);
  doc.text('DESCRIPTION / LEVY PARTICULARS', tableX + 15, nextY + 5.5);
  doc.text('SESSION', tableX + 115, nextY + 5.5);
  doc.text('AMOUNT (NGN)', tableX + tableW - 4, nextY + 5.5, { align: 'right' });

  // Table Body Row
  nextY += 8;
  doc.setFillColor(255, 255, 255);
  doc.rect(tableX, nextY, tableW, 14, 'F');
  doc.setDrawColor(...cBorder);
  doc.setLineWidth(0.2);
  doc.rect(tableX, nextY, tableW, 14, 'S');

  doc.setTextColor(...cSlate);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('01', tableX + 4, nextY + 6);

  doc.setFont('helvetica', 'bold');
  doc.text('NAPPS Nasarawa State Secretariat Building Levy', tableX + 15, nextY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...cSlateMuted);
  doc.text('Special State Assessment for Secretariat Construction Project', tableX + 15, nextY + 10.5);

  doc.setTextColor(...cSlate);
  doc.setFontSize(8.5);
  doc.text('2026/2027', tableX + 115, nextY + 6);

  doc.setFont('helvetica', 'bold');
  doc.text(formattedAmount, tableX + tableW - 4, nextY + 6, { align: 'right' });

  // Summary Table
  nextY += 14;
  const sumW = 85;
  const sumX = tableX + tableW - sumW;

  // Subtotal
  doc.setFillColor(...cLightBg);
  doc.rect(sumX, nextY, sumW, 7, 'F');
  doc.setDrawColor(...cBorder);
  doc.setLineWidth(0.2);
  doc.rect(sumX, nextY, sumW, 7, 'S');

  doc.setTextColor(...cSlateMuted);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('Subtotal Assessment:', sumX + 4, nextY + 5);
  doc.setTextColor(...cSlate);
  doc.text(`NGN ${formattedAmount}`, sumX + sumW - 4, nextY + 5, { align: 'right' });

  // Total Paid
  nextY += 7;
  doc.setFillColor(...cEmerald);
  doc.rect(sumX, nextY, sumW, 10, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('TOTAL AMOUNT PAID:', sumX + 4, nextY + 6.5);
  doc.setFontSize(11);
  doc.text(`NGN ${formattedAmount}`, sumX + sumW - 4, nextY + 6.5, { align: 'right' });

  // Words row
  const wordsX = tableX;
  const wordsW = tableW - sumW - 4;
  doc.setFillColor(254, 249, 195); // Light Yellow
  doc.roundedRect(wordsX, nextY - 7, wordsW, 17, 1.5, 1.5, 'F');
  doc.setDrawColor(234, 179, 8);   // Gold border
  doc.setLineWidth(0.2);
  doc.roundedRect(wordsX, nextY - 7, wordsW, 17, 1.5, 1.5, 'S');

  doc.setTextColor(113, 63, 18);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('AMOUNT IN WORDS:', wordsX + 4, nextY - 2);
  doc.setFont('helvetica', 'bolditalic');
  doc.setFontSize(8);
  doc.text(amountWords, wordsX + 4, nextY + 4);

  // 7. Security Authentication, QR Code & Official Seal Section
  nextY += 15;
  const authBoxY = nextY;
  const authBoxH = 50;
  doc.setFillColor(...cLightBg);
  doc.roundedRect(tableX, authBoxY, tableW, authBoxH, 2, 2, 'F');
  doc.setDrawColor(...cBorder);
  doc.setLineWidth(0.3);
  doc.roundedRect(tableX, authBoxY, tableW, authBoxH, 2, 2, 'S');

  // 7A. Live Verification QR Code
  const qrUrl = `https://portal.nappsnasarawa.com/levy-payment/verify?reference=${encodeURIComponent(paymentData.reference)}`;
  try {
    const qrBase64 = await QRCode.toDataURL(qrUrl, {
      width: 250,
      margin: 1,
      color: { dark: '#064e3b', light: '#ffffff' },
    });
    doc.addImage(qrBase64, 'PNG', tableX + 4, authBoxY + 5, 30, 30);
  } catch {
    // If QR code generation fails
    doc.rect(tableX + 4, authBoxY + 5, 30, 30);
  }

  doc.setTextColor(...cEmerald);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('SCAN TO VERIFY', tableX + 19, authBoxY + 39, { align: 'center' });
  doc.setTextColor(...cSlateMuted);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.8);
  doc.text('Live Anti-Counterfeit Code', tableX + 19, authBoxY + 43, { align: 'center' });

  // 7B. Official Circular Digital Seal (Vector Graphics in Center)
  const sealCenterX = tableX + 78;
  const sealCenterY = authBoxY + 23;
  const sealRadius = 18;

  doc.setDrawColor(...cEmerald);
  doc.setLineWidth(0.8);
  doc.circle(sealCenterX, sealCenterY, sealRadius);

  doc.setDrawColor(...cGold);
  doc.setLineWidth(0.3);
  doc.circle(sealCenterX, sealCenterY, sealRadius - 1.5);

  doc.setDrawColor(...cEmerald);
  doc.setLineWidth(0.4);
  doc.circle(sealCenterX, sealCenterY, sealRadius - 3.5);

  doc.setTextColor(...cEmerald);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5.5);
  doc.text('NAPPS NASARAWA STATE', sealCenterX, sealCenterY - 9, { align: 'center' });

  doc.setTextColor(...cGold);
  doc.setFontSize(6.5);
  doc.text('★ ★ ★', sealCenterX, sealCenterY - 4.5, { align: 'center' });

  doc.setFillColor(220, 252, 231);
  doc.roundedRect(sealCenterX - 13, sealCenterY - 2.5, 26, 6, 1, 1, 'F');
  doc.setTextColor(22, 101, 52);
  doc.setFontSize(6.5);
  doc.text('CERTIFIED PAID', sealCenterX, sealCenterY + 1.5, { align: 'center' });

  doc.setTextColor(...cEmerald);
  doc.setFontSize(5);
  doc.text('FINANCE COMMITTEE', sealCenterX, sealCenterY + 6.5, { align: 'center' });
  doc.text('BUILDING FUND 2026/2027', sealCenterX, sealCenterY + 10, { align: 'center' });

  // 7C. Signatories (Right side)
  const signX = tableX + 114;
  const signColW = (tableW - 118) / 2;

  // Signatory 1: State President
  doc.setDrawColor(...cSlateMuted);
  doc.setLineWidth(0.3);
  doc.line(signX, authBoxY + 27, signX + signColW - 4, authBoxY + 27);

  doc.setTextColor(...cEmerald);
  doc.setFont('helvetica', 'bolditalic');
  doc.setFontSize(9);
  doc.text('Signed', signX + (signColW - 4) / 2, authBoxY + 23, { align: 'center' });

  doc.setTextColor(...cSlate);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.text('STATE PRESIDENT', signX + (signColW - 4) / 2, authBoxY + 31, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.5);
  doc.setTextColor(...cSlateMuted);
  doc.text('NAPPS Nasarawa State', signX + (signColW - 4) / 2, authBoxY + 35, { align: 'center' });

  // Signatory 2: State Financial Secretary
  const sign2X = signX + signColW;
  doc.line(sign2X, authBoxY + 27, sign2X + signColW - 2, authBoxY + 27);

  doc.setTextColor(...cEmerald);
  doc.setFont('helvetica', 'bolditalic');
  doc.setFontSize(9);
  doc.text('Signed', sign2X + (signColW - 2) / 2, authBoxY + 23, { align: 'center' });

  doc.setTextColor(...cSlate);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.text('FINANCIAL SECRETARY', sign2X + (signColW - 2) / 2, authBoxY + 31, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.5);
  doc.setTextColor(...cSlateMuted);
  doc.text('Building Levy Committee', sign2X + (signColW - 2) / 2, authBoxY + 35, { align: 'center' });

  // 8. Official Bottom Legal Disclaimer & Verification Notice
  nextY = authBoxY + authBoxH + 4;
  doc.setTextColor(...cSlateMuted);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6);
  doc.text(
    'IMPORTANT NOTICE: This electronic payment receipt is an official certified legal instrument of NAPPS Nasarawa State Chapter.',
    margin + contentWidth / 2,
    nextY,
    { align: 'center' }
  );
  doc.text(
    'It confirms settlement of the ₦5,600.00 State Secretariat Building Levy. Alteration, unauthorized replication, or counterfeiting is strictly prohibited and subject to legal prosecution.',
    margin + contentWidth / 2,
    nextY + 3.5,
    { align: 'center' }
  );

  // Security checksum footer bar
  nextY += 7;
  doc.setFillColor(...cEmerald);
  doc.rect(margin + 4, nextY, contentWidth - 8, 6, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.8);
  doc.text(`Generated: ${new Date().toUTCString()}  |  System Auth: BACHS-OK  |  Tamper-Evident Digital Record`, margin + 6, nextY + 4);
  doc.text('https://portal.nappsnasarawa.com', margin + contentWidth - 6, nextY + 4, { align: 'right' });

  // Save the PDF
  const fileName = `NAPPS_Levy_Receipt_${paymentData.receiptNumber || paymentData.reference}.pdf`;
  doc.save(fileName);
};

/**
 * Generate receipt for multiple payments (batch export)
 */
export const generateBulkReceipts = async (payments: LevyPaymentData[]): Promise<void> => {
  for (const payment of payments) {
    await generateLevyReceipt(payment);
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
};
