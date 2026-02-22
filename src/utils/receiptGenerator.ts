import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface LevyPaymentData {
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
 * Generate and download a professional A4-sized payment receipt
 */
export const generateLevyReceipt = async (paymentData: LevyPaymentData): Promise<void> => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;

  // Colors
  const primaryColor: [number, number, number] = [41, 128, 185]; // Blue
  const secondaryColor: [number, number, number] = [52, 73, 94]; // Dark gray
  const lightGray: [number, number, number] = [236, 240, 241];

  let currentY = margin;

  // Header background
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 50, 'F');

  // Logo placeholder circle (right side)
  doc.setFillColor(255, 255, 255);
  doc.circle(pageWidth - 35, 25, 15, 'F');
  doc.setFontSize(10);
  doc.setTextColor(...primaryColor);
  doc.text('NAPPS', pageWidth - 35, 27, { align: 'center' });

  // Title
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('PAYMENT RECEIPT', margin, 30);

  // Organization name
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('National Association of Proprietors of Private Schools', margin, 40);
  doc.text('Nasarawa State Chapter', margin, 46);

  currentY = 60;

  // Receipt info box
  doc.setFillColor(...lightGray);
  doc.roundedRect(margin, currentY, contentWidth, 25, 3, 3, 'F');

  doc.setFontSize(10);
  doc.setTextColor(...secondaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text('Receipt No:', margin + 5, currentY + 8);
  doc.setFont('helvetica', 'normal');
  doc.text(paymentData.receiptNumber, margin + 35, currentY + 8);

  doc.setFont('helvetica', 'bold');
  doc.text('Date:', margin + 5, currentY + 16);
  doc.setFont('helvetica', 'normal');
  const paymentDate = new Date(paymentData.paidAt).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  doc.text(paymentDate, margin + 35, currentY + 16);

  doc.setFont('helvetica', 'bold');
  doc.text('Reference:', pageWidth / 2 + 5, currentY + 8);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(paymentData.reference, pageWidth / 2 + 30, currentY + 8);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Status:', pageWidth / 2 + 5, currentY + 16);
  doc.setTextColor(39, 174, 96); // Green
  doc.text('PAID', pageWidth / 2 + 30, currentY + 16);

  currentY += 35;

  // Payer Information Section
  doc.setTextColor(...primaryColor);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('PAYER INFORMATION', margin, currentY);

  currentY += 8;

  // Draw a line
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(margin, currentY, pageWidth - margin, currentY);

  currentY += 8;

  // Payer details
  doc.setFontSize(10);
  doc.setTextColor(...secondaryColor);

  const payerDetails = [
    ['Name:', paymentData.memberName],
    ['Email:', paymentData.email],
    ['Phone:', paymentData.phone],
    ['Chapter:', paymentData.chapter],
  ];

  payerDetails.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, margin, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(value, margin + 35, currentY);
    currentY += 7;
  });

  currentY += 5;

  // School Information Section
  doc.setTextColor(...primaryColor);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('SCHOOL INFORMATION', margin, currentY);

  currentY += 8;

  // Draw a line
  doc.setDrawColor(...primaryColor);
  doc.line(margin, currentY, pageWidth - margin, currentY);

  currentY += 8;

  // School details
  doc.setFontSize(10);
  doc.setTextColor(...secondaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text('School Name:', margin, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(paymentData.schoolName, margin + 35, currentY);

  currentY += 10;

  doc.setFont('helvetica', 'bold');
  doc.text('Wards:', margin, currentY);
  doc.setFont('helvetica', 'normal');
  const wardsText = paymentData.wards.join(', ');
  const splitWards = doc.splitTextToSize(wardsText, contentWidth - 40);
  doc.text(splitWards, margin + 35, currentY);

  currentY += splitWards.length * 5 + 10;

  // Payment Details Section
  doc.setTextColor(...primaryColor);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('PAYMENT DETAILS', margin, currentY);

  currentY += 8;

  // Draw a line
  doc.setDrawColor(...primaryColor);
  doc.line(margin, currentY, pageWidth - margin, currentY);

  currentY += 8;

  // Payment table
  doc.setFillColor(...lightGray);
  doc.rect(margin, currentY, contentWidth, 10, 'F');

  doc.setFontSize(10);
  doc.setTextColor(...secondaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text('Description', margin + 5, currentY + 7);
  doc.text('Amount', pageWidth - margin - 40, currentY + 7);

  currentY += 12;

  // Payment row
  doc.setFont('helvetica', 'normal');
  doc.text('NAPPS NASARAWA STATE SECRETARIAT', margin + 5, currentY + 2);
  doc.text('BUILDING LEVY', margin + 5, currentY + 7);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(`₦${(paymentData.amount / 100).toLocaleString()}`, pageWidth - margin - 40, currentY + 5);

  currentY += 12;

  // Draw line
  doc.setDrawColor(...secondaryColor);
  doc.setLineWidth(0.3);
  doc.line(margin, currentY, pageWidth - margin, currentY);

  currentY += 8;

  // Total
  doc.setFillColor(...primaryColor);
  doc.rect(margin, currentY, contentWidth, 12, 'F');

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('TOTAL AMOUNT PAID', margin + 5, currentY + 8);
  doc.setFontSize(14);
  doc.text(`₦${(paymentData.amount / 100).toLocaleString()}`, pageWidth - margin - 40, currentY + 8);

  currentY += 20;

  // Payment method
  if (paymentData.paymentMethod) {
    doc.setFontSize(9);
    doc.setTextColor(...secondaryColor);
    doc.setFont('helvetica', 'normal');
    doc.text(`Payment Method: ${paymentData.paymentMethod.toUpperCase()}`, margin, currentY);
    currentY += 6;
  }

  // Footer
  const footerY = pageHeight - 40;

  // Thank you message
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('Thank you for your payment!', pageWidth / 2, footerY, { align: 'center' });

  // Footer notes
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 100, 100);
  doc.text(
    'This is an official payment receipt generated by NAPPS Nasarawa State.',
    pageWidth / 2,
    footerY + 6,
    { align: 'center' }
  );
  doc.text(
    'For inquiries, please contact: info@nappsnasarawa.com | +234 XXX XXX XXXX',
    pageWidth / 2,
    footerY + 11,
    { align: 'center' }
  );

  // Footer line
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(margin, footerY + 16, pageWidth - margin, footerY + 16);

  // Generated timestamp
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text(
    `Generated on: ${new Date().toLocaleString('en-NG')}`,
    pageWidth / 2,
    footerY + 20,
    { align: 'center' }
  );

  // Save the PDF
  const fileName = `NAPPS_Levy_Receipt_${paymentData.receiptNumber}.pdf`;
  doc.save(fileName);
};

/**
 * Generate receipt for multiple payments (optional feature)
 */
export const generateBulkReceipts = async (payments: LevyPaymentData[]): Promise<void> => {
  for (const payment of payments) {
    await generateLevyReceipt(payment);
    // Small delay to prevent browser from blocking multiple downloads
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
};
