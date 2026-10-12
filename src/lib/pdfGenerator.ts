import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Invoice, Client, BusinessSettings } from './types';
import * as store from './store';

interface InvoicePDFData {
  invoice: Invoice;
  client: Client;
  settings: BusinessSettings;
}

type RGB = [number, number, number];

// AGS WEBWORKS brand colors
const BRAND = {
  primary: [37, 99, 235] as RGB,
    secondary: [124, 58, 237] as RGB,
  dark: [15, 23, 42] as RGB,
  gray: [100, 116, 139] as RGB,
  lightGray: [226, 232, 240] as RGB,
  white: [255, 255, 255] as RGB,
  green: [16, 185, 129] as RGB,
  red: [239, 68, 68] as RGB,
  amber: [245, 158, 11] as RGB,
  bgLight: [248, 250, 252] as RGB,
};

function formatCurrency(amount: number, currency: string = 'SAR'): string {
  return `${amount.toLocaleString('en-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
}

function getStatusColor(status: string): RGB {
  switch (status) {
    case 'paid': return BRAND.green;
    case 'overdue': return BRAND.red;
    case 'issued': return BRAND.primary;
    case 'partial': return BRAND.amber;
    case 'void': return BRAND.gray;
    default: return BRAND.gray;
  }
}

// Helper to set text color with tuple
function setTextColor(doc: jsPDF, color: RGB) {
  doc.setTextColor(color[0], color[1], color[2]);
}

function setFillColor(doc: jsPDF, color: RGB) {
  doc.setFillColor(color[0], color[1], color[2]);
}

export function generateInvoicePDF(invoiceId: string): void {
  const invoice = store.getInvoices().find(i => i.id === invoiceId);
  if (!invoice) {
    console.error('Invoice not found');
    return;
  }

  const client = store.getClient(invoice.clientId);
  if (!client) {
    console.error('Client not found');
    return;
  }

  const settings = store.getSettings();
  generatePDF({ invoice, client, settings });
}

export function generateMaintenanceInvoicePDF(subscriptionId: string, billingPeriod: string): void {
  const subs = store.getMaintenanceSubscriptions();
  const sub = subs.find(s => s.id === subscriptionId);
  if (!sub) return;

  const client = store.getClient(sub.clientId);
  if (!client) return;

  const settings = store.getSettings();
  const plans = store.getMaintenancePlans();
  const plan = plans.find(p => p.id === sub.planId);
  const price = sub.customPrice || plan?.monthlyPrice || 0;

  const virtualInvoice: Invoice = {
    id: `maint_${subscriptionId}`,
    invoiceNumber: `MNT-${subscriptionId.slice(0, 8).toUpperCase()}`,
    clientId: sub.clientId,
    subscriptionId: sub.id,
    items: [{
      description: `${plan?.name || 'Website Maintenance'} - ${sub.websiteDomain}`,
      quantity: 1,
      unitPrice: price,
      total: price,
    }],
    subtotal: price,
    tax: price * (settings.taxRate / 100),
    total: price * (1 + settings.taxRate / 100),
    status: 'issued',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: sub.nextBillingDate || '',
    notes: `Billing period: ${billingPeriod}\nWebsite: ${sub.websiteDomain}\nPlan: ${plan?.name || 'Maintenance'}`,
    createdAt: new Date().toISOString(),
  };

  generatePDF({ invoice: virtualInvoice, client, settings });
}

function generatePDF({ invoice, client, settings }: InvoicePDFData): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  // ===== HEADER SECTION =====
  setFillColor(doc, BRAND.primary);
  doc.rect(0, 0, pageWidth, 45, 'F');

  // Gradient overlay
  setFillColor(doc, BRAND.secondary);
  doc.setGState(new (doc as any).GState({ opacity: 0.3 }));
  doc.rect(pageWidth / 2, 0, pageWidth / 2, 45, 'F');
  doc.setGState(new (doc as any).GState({ opacity: 1 }));

  // Company logo circle
  setFillColor(doc, BRAND.white);
  doc.circle(margin + 12, 22, 10, 'F');
  setTextColor(doc, BRAND.primary);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('A', margin + 12, 26, { align: 'center' });

  // Company name
  setTextColor(doc, BRAND.white);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(settings.companyName, margin + 28, 18);

  // Tagline
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Web Development & Digital Services', margin + 28, 24);

  // Company details
  doc.setFontSize(7);
  doc.text(settings.companyAddress, margin + 28, 30);
  doc.text(`${settings.companyEmail} | ${settings.companyPhone}`, margin + 28, 35);

  // INVOICE badge
  setFillColor(doc, BRAND.white);
  doc.roundedRect(pageWidth - margin - 50, 10, 50, 25, 3, 3, 'F');
  setTextColor(doc, BRAND.primary);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', pageWidth - margin - 25, 20, { align: 'center' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  setTextColor(doc, BRAND.gray);
  doc.text(invoice.invoiceNumber, pageWidth - margin - 25, 28, { align: 'center' });

  // Status badge
  const statusColor = getStatusColor(invoice.status);
  const statusLabel = invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1);
  setFillColor(doc, statusColor);
  doc.roundedRect(pageWidth - margin - 50, 38, 50, 6, 2, 2, 'F');
  setTextColor(doc, BRAND.white);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text(statusLabel.toUpperCase(), pageWidth - margin - 25, 42.5, { align: 'center' });

  // ===== BILLING DETAILS =====
  let yPos = 58;

  // Bill To
  setFillColor(doc, BRAND.bgLight);
  doc.roundedRect(margin, yPos, contentWidth / 2 - 5, 35, 2, 2, 'F');

  setTextColor(doc, BRAND.gray);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('BILL TO', margin + 5, yPos + 7);

  setTextColor(doc, BRAND.dark);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(client.businessName, margin + 5, yPos + 14);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  setTextColor(doc, BRAND.gray);

  let clientInfoY = yPos + 20;
  if (client.contactPerson) {
    doc.text(`Attn: ${client.contactPerson}`, margin + 5, clientInfoY);
    clientInfoY += 5;
  }
  if (client.email) {
    doc.text(client.email, margin + 5, clientInfoY);
    clientInfoY += 5;
  }
  if (client.phone) {
    doc.text(client.phone, margin + 5, clientInfoY);
    clientInfoY += 5;
  }
  if (client.location) {
    doc.text(client.location, margin + 5, clientInfoY);
  }

  // Invoice details (right)
  const rightX = margin + contentWidth / 2 + 5;
  setFillColor(doc, BRAND.bgLight);
  doc.roundedRect(rightX, yPos, contentWidth / 2 - 5, 35, 2, 2, 'F');

  setTextColor(doc, BRAND.gray);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE DETAILS', rightX + 5, yPos + 7);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  let detailY = yPos + 14;

  setTextColor(doc, BRAND.gray);
  doc.text('Issue Date:', rightX + 5, detailY);
  setTextColor(doc, BRAND.dark);
  doc.setFont('helvetica', 'bold');
  doc.text(invoice.issueDate, rightX + 35, detailY);
  detailY += 6;

  doc.setFont('helvetica', 'normal');
  setTextColor(doc, BRAND.gray);
  doc.text('Due Date:', rightX + 5, detailY);
  setTextColor(doc, invoice.status === 'overdue' ? BRAND.red : BRAND.dark);
  doc.setFont('helvetica', 'bold');
  doc.text(invoice.dueDate || 'N/A', rightX + 35, detailY);
  detailY += 6;

  doc.setFont('helvetica', 'normal');
  setTextColor(doc, BRAND.gray);
  doc.text('Currency:', rightX + 5, detailY);
  setTextColor(doc, BRAND.dark);
  doc.setFont('helvetica', 'bold');
  doc.text(settings.currency, rightX + 35, detailY);

  // ===== ITEMS TABLE =====
  yPos += 45;

  setFillColor(doc, BRAND.dark);
  doc.roundedRect(margin, yPos, contentWidth, 8, 1, 1, 'F');

  setTextColor(doc, BRAND.white);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('#', margin + 3, yPos + 5.5);
  doc.text('Description', margin + 12, yPos + 5.5);
  doc.text('Qty', margin + contentWidth - 55, yPos + 5.5, { align: 'center' });
  doc.text('Unit Price', margin + contentWidth - 38, yPos + 5.5, { align: 'center' });
  doc.text('Total', margin + contentWidth - 5, yPos + 5.5, { align: 'right' });

  yPos += 8;
  doc.setFont('helvetica', 'normal');

  invoice.items.forEach((item, idx) => {
    if (idx % 2 === 0) {
      setFillColor(doc, BRAND.bgLight);
      doc.rect(margin, yPos, contentWidth, 10, 'F');
    }

    setTextColor(doc, BRAND.dark);
    doc.setFontSize(8);
    doc.text(String(idx + 1), margin + 3, yPos + 6);
    doc.text(item.description.slice(0, 50), margin + 12, yPos + 6);
    doc.text(String(item.quantity), margin + contentWidth - 55, yPos + 6, { align: 'center' });
    doc.text(formatCurrency(item.unitPrice, settings.currency), margin + contentWidth - 38, yPos + 6, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrency(item.total, settings.currency), margin + contentWidth - 5, yPos + 6, { align: 'right' });
    doc.setFont('helvetica', 'normal');

    yPos += 10;
  });

  doc.setDrawColor(BRAND.lightGray[0], BRAND.lightGray[1], BRAND.lightGray[2]);
  doc.line(margin, yPos, margin + contentWidth, yPos);
  yPos += 5;

  // ===== TOTALS =====
  const totalsX = margin + contentWidth - 70;
  const totalsWidth = 70;

  setTextColor(doc, BRAND.gray);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal:', totalsX, yPos);
  setTextColor(doc, BRAND.dark);
  doc.setFont('helvetica', 'bold');
  doc.text(formatCurrency(invoice.subtotal, settings.currency), totalsX + totalsWidth, yPos, { align: 'right' });
  yPos += 7;

  doc.setFont('helvetica', 'normal');
  setTextColor(doc, BRAND.gray);
  doc.text(`VAT (${settings.taxRate}%):`, totalsX, yPos);
  setTextColor(doc, BRAND.dark);
  doc.setFont('helvetica', 'bold');
  doc.text(formatCurrency(invoice.tax, settings.currency), totalsX + totalsWidth, yPos, { align: 'right' });
  yPos += 3;

  doc.setDrawColor(BRAND.lightGray[0], BRAND.lightGray[1], BRAND.lightGray[2]);
  doc.line(totalsX, yPos, totalsX + totalsWidth, yPos);
  yPos += 7;

  // Grand total
  setFillColor(doc, BRAND.primary);
  doc.roundedRect(totalsX - 3, yPos - 4, totalsWidth + 6, 12, 2, 2, 'F');
  setTextColor(doc, BRAND.white);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL DUE:', totalsX + 3, yPos + 3);
  doc.text(formatCurrency(invoice.total, settings.currency), totalsX + totalsWidth, yPos + 3, { align: 'right' });

  // ===== PAYMENT INSTRUCTIONS =====
  yPos += 20;

  setFillColor(doc, BRAND.bgLight);
  doc.roundedRect(margin, yPos, contentWidth, 25, 2, 2, 'F');

  setFillColor(doc, BRAND.primary);
  doc.roundedRect(margin, yPos, 3, 25, 1, 1, 'F');

  setTextColor(doc, BRAND.dark);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('PAYMENT INSTRUCTIONS', margin + 8, yPos + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  setTextColor(doc, BRAND.gray);
  doc.text('Bank Transfer to AGS WEBWORKS account.', margin + 8, yPos + 12);
  doc.text('Please include invoice number as payment reference.', margin + 8, yPos + 17);
  doc.text(`Payment due by: ${invoice.dueDate || 'Upon receipt'}`, margin + 8, yPos + 22);

  // ===== NOTES =====
  if (invoice.notes) {
    yPos += 32;
    setTextColor(doc, BRAND.gray);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('NOTES:', margin, yPos);
    doc.setFont('helvetica', 'normal');
    const notesLines = doc.splitTextToSize(invoice.notes, contentWidth);
    doc.text(notesLines.slice(0, 3), margin, yPos + 5);
  }

  // ===== FOOTER =====
  setFillColor(doc, BRAND.dark);
  doc.rect(0, pageHeight - 20, pageWidth, 20, 'F');

  setTextColor(doc, BRAND.white);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Thank you for your business!', margin, pageHeight - 12);
  doc.text(`${settings.companyName} | ${settings.companyEmail} | ${settings.companyPhone}`, margin, pageHeight - 7);

  doc.setFont('helvetica', 'bold');
  doc.text('agswebworks.com', pageWidth - margin, pageHeight - 12, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.text('Dammam / Al Khobar, Saudi Arabia', pageWidth - margin, pageHeight - 7, { align: 'right' });

  // Save
  const filename = `${settings.companyName.replace(/\s+/g, '_')}_Invoice_${invoice.invoiceNumber}.pdf`;
  doc.save(filename);
}

// Payment receipt
export function generatePaymentReceipt(paymentId: string): void {
  const payments = store.getPayments();
  const payment = payments.find(p => p.id === paymentId);
  if (!payment) return;

  const client = store.getClient(payment.clientId);
  if (!client) return;

  const settings = store.getSettings();
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;

  // Header
  setFillColor(doc, BRAND.primary);
  doc.rect(0, 0, pageWidth, 30, 'F');

  setTextColor(doc, BRAND.white);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(settings.companyName, margin, 15);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('PAYMENT RECEIPT', margin, 22);

  let yPos = 45;
  setTextColor(doc, BRAND.dark);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Payment Receipt', margin, yPos);
  yPos += 15;

  const details: [string, string][] = [
    ['Receipt Date:', payment.date],
    ['Client:', client.businessName],
    ['Contact:', client.contactPerson || 'N/A'],
    ['Amount:', formatCurrency(payment.amount, settings.currency)],
    ['Payment Method:', payment.method.replace(/_/g, ' ').toUpperCase()],
    ['Reference:', payment.reference || 'N/A'],
    ['Status:', payment.status.toUpperCase()],
  ];

  doc.setFontSize(9);
  details.forEach(([label, value]) => {
    setTextColor(doc, BRAND.gray);
    doc.setFont('helvetica', 'normal');
    doc.text(label, margin, yPos);
    setTextColor(doc, BRAND.dark);
    doc.setFont('helvetica', 'bold');
    doc.text(value, margin + 40, yPos);
    yPos += 8;
  });

  if (payment.notes) {
    yPos += 5;
    setTextColor(doc, BRAND.gray);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('Notes:', margin, yPos);
    yPos += 5;
    doc.setFont('helvetica', 'normal');
    doc.text(payment.notes, margin, yPos);
  }

  // Footer
  setFillColor(doc, BRAND.dark);
  doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');
  setTextColor(doc, BRAND.white);
  doc.setFontSize(7);
  doc.text(`${settings.companyName} | ${settings.companyEmail}`, margin, pageHeight - 7);
  doc.text('agswebworks.com', pageWidth - margin, pageHeight - 7, { align: 'right' });

  doc.save(`Receipt_${payment.id.slice(0, 8)}.pdf`);
}

// Monthly maintenance report
export function generateMaintenanceReport(): void {
  const settings = store.getSettings();
  const subscriptions = store.getMaintenanceSubscriptions();
  const plans = store.getMaintenancePlans();
  const tickets = store.getMaintenanceTickets();
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  // Header
  setFillColor(doc, BRAND.primary);
  doc.rect(0, 0, pageWidth, 35, 'F');
  setFillColor(doc, BRAND.secondary);
  doc.setGState(new (doc as any).GState({ opacity: 0.3 }));
  doc.rect(pageWidth / 2, 0, pageWidth / 2, 35, 'F');
  doc.setGState(new (doc as any).GState({ opacity: 1 }));

  setTextColor(doc, BRAND.white);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('MAINTENANCE REPORT', margin, 18);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`${settings.companyName} | ${new Date().toLocaleDateString('en-SA', { month: 'long', year: 'numeric' })}`, margin, 26);

  // Stats
  let yPos = 48;
  const activeSubs = subscriptions.filter(s => s.status === 'active');
  const mrr = activeSubs.reduce((s, sub) => {
    const plan = plans.find(p => p.id === sub.planId);
    return s + (sub.customPrice || plan?.monthlyPrice || 0);
  }, 0);
  const openTickets = tickets.filter(t => !['completed', 'closed'].includes(t.status));

  const stats = [
    { label: 'Active Subscriptions', value: String(activeSubs.length) },
    { label: 'Monthly Recurring Revenue', value: formatCurrency(mrr, settings.currency) },
    { label: 'Open Tickets', value: String(openTickets.length) },
    { label: 'Total Subscriptions', value: String(subscriptions.length) },
  ];

  const boxWidth = (contentWidth - 10) / 2;
  stats.forEach((stat, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = margin + col * (boxWidth + 10);
    const y = yPos + row * 22;

    setFillColor(doc, BRAND.bgLight);
    doc.roundedRect(x, y, boxWidth, 18, 2, 2, 'F');
    setFillColor(doc, BRAND.primary);
    doc.roundedRect(x, y, 2, 18, 1, 1, 'F');

    setTextColor(doc, BRAND.gray);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(stat.label, x + 6, y + 7);
    setTextColor(doc, BRAND.dark);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(stat.value, x + 6, y + 14);
  });

  // Subscriptions table
  yPos += 55;
  setTextColor(doc, BRAND.dark);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Active Subscriptions', margin, yPos);
  yPos += 5;

  if (subscriptions.length > 0) {
    autoTable(doc, {
      startY: yPos,
      head: [['Client', 'Website', 'Plan', 'Price/mo', 'Status', 'Next Billing']],
      body: subscriptions.map(sub => {
        const client = store.getClient(sub.clientId);
        const plan = plans.find(p => p.id === sub.planId);
        return [
          client?.businessName || 'Unknown',
          sub.websiteDomain,
          plan?.name || sub.planType,
          formatCurrency(sub.customPrice || plan?.monthlyPrice || 0, settings.currency),
          sub.status.toUpperCase(),
          sub.nextBillingDate || 'N/A',
        ];
      }),
      margin: { left: margin, right: margin },
      styles: { fontSize: 7, cellPadding: 3 },
      headStyles: { fillColor: BRAND.dark, textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: BRAND.bgLight },
    });
  } else {
    setTextColor(doc, BRAND.gray);
    doc.setFontSize(8);
    doc.text('No maintenance subscriptions yet.', margin, yPos + 5);
  }

  // Footer
  setFillColor(doc, BRAND.dark);
  doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');
  setTextColor(doc, BRAND.white);
  doc.setFontSize(7);
  doc.text(`${settings.companyName} | agswebworks.com`, margin, pageHeight - 7);
  doc.text(`Generated: ${new Date().toLocaleString('en-SA', { timeZone: 'Asia/Riyadh' })}`, pageWidth - margin, pageHeight - 7, { align: 'right' });

  doc.save(`Maintenance_Report_${new Date().toISOString().split('T')[0]}.pdf`);
}
