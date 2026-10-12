import jsPDF from 'jspdf';
import * as store from './store';

export function genPDF(invId: string) {
  const inv = store.getInvoices().find(i => i.id === invId);
  if (!inv) return;
  const cl = store.getClient(inv.clientId);
  if (!cl) return;
  const s = store.getSettings();
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const m = 20;
  const cw = pw - m * 2;

  // Header gradient
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, pw, 45, 'F');
  doc.setFillColor(124, 58, 237);
  doc.setGState(new (doc as any).GState({ opacity: 0.3 }));
  doc.rect(pw / 2, 0, pw / 2, 45, 'F');
  doc.setGState(new (doc as any).GState({ opacity: 1 }));

  // Logo circle
  doc.setFillColor(255, 255, 255);
  doc.circle(m + 12, 22, 10, 'F');
  doc.setTextColor(37, 99, 235);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('AGS', m + 12, 21, { align: 'center' });
  doc.setFontSize(4);
  doc.text('WEBWORKS', m + 12, 25, { align: 'center' });

  // Company info
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text(s.companyName, m + 28, 18);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Web Development & Digital Services', m + 28, 24);
  doc.setFontSize(7);
  doc.text(s.companyAddress, m + 28, 30);
  doc.text(`${s.companyEmail} | ${s.companyPhone}`, m + 28, 35);

  // Invoice badge
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(pw - m - 50, 10, 50, 25, 3, 3, 'F');
  doc.setTextColor(37, 99, 235);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', pw - m - 25, 20, { align: 'center' });
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(inv.invoiceNumber, pw - m - 25, 28, { align: 'center' });

  // Bill To
  let y = 58;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(m, y, cw / 2 - 5, 35, 2, 2, 'F');
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('BILL TO', m + 5, y + 7);
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.text(cl.businessName, m + 5, y + 14);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  let cy = y + 20;
  if (cl.contactPerson) { doc.text(`Attn: ${cl.contactPerson}`, m + 5, cy); cy += 5; }
  if (cl.email) { doc.text(cl.email, m + 5, cy); cy += 5; }
  if (cl.phone) { doc.text(cl.phone, m + 5, cy); cy += 5; }
  if (cl.location) doc.text(cl.location, m + 5, cy);

  // Details
  const rx = m + cw / 2 + 5;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(rx, y, cw / 2 - 5, 35, 2, 2, 'F');
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('DETAILS', rx + 5, y + 7);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  let dy = y + 14;
  doc.text('Issue:', rx + 5, dy);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(inv.issueDate, rx + 30, dy);
  dy += 6;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Due:', rx + 5, dy);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(inv.dueDate || 'N/A', rx + 30, dy);
  dy += 6;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Currency:', rx + 5, dy);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(s.currency, rx + 30, dy);

  // Items table
  y += 45;
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(m, y, cw, 8, 1, 1, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('#', m + 3, y + 5.5);
  doc.text('Description', m + 12, y + 5.5);
  doc.text('Qty', m + cw - 55, y + 5.5, { align: 'center' });
  doc.text('Price', m + cw - 38, y + 5.5, { align: 'center' });
  doc.text('Total', m + cw - 5, y + 5.5, { align: 'right' });
  y += 8;
  inv.items.forEach((item, idx) => {
    if (idx % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(m, y, cw, 10, 'F');
    }
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(String(idx + 1), m + 3, y + 6);
    doc.text(item.description.slice(0, 50), m + 12, y + 6);
    doc.text(String(item.quantity), m + cw - 55, y + 6, { align: 'center' });
    doc.text(`${item.unitPrice.toFixed(2)}`, m + cw - 38, y + 6, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.text(`${item.total.toFixed(2)} ${s.currency}`, m + cw - 5, y + 6, { align: 'right' });
    y += 10;
  });

  // Totals
  y += 5;
  const tx = m + cw - 70;
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal:', tx, y);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(`${inv.subtotal.toFixed(2)} ${s.currency}`, tx + 67, y, { align: 'right' });
  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`VAT (${s.taxRate}%):`, tx, y);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(`${inv.tax.toFixed(2)} ${s.currency}`, tx + 67, y, { align: 'right' });
  y += 10;
  doc.setFillColor(37, 99, 235);
  doc.roundedRect(tx - 3, y - 4, 73, 12, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text('TOTAL DUE:', tx + 3, y + 3);
  doc.text(`${inv.total.toFixed(2)} ${s.currency}`, tx + 67, y + 3, { align: 'right' });

  // Payment instructions
  y += 20;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(m, y, cw, 20, 2, 2, 'F');
  doc.setFillColor(37, 99, 235);
  doc.roundedRect(m, y, 3, 20, 1, 1, 'F');
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('PAYMENT', m + 8, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Bank Transfer to AGS WEBWORKS. Include invoice # as reference.', m + 8, y + 12);
  doc.text(`Due by: ${inv.dueDate || 'Upon receipt'}`, m + 8, y + 17);

  // Footer
  doc.setFillColor(15, 23, 42);
  doc.rect(0, ph - 20, pw, 20, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.text('Thank you for your business!', m, ph - 12);
  doc.text(`${s.companyName} | ${s.companyEmail} | ${s.companyPhone}`, m, ph - 7);
  doc.setFont('helvetica', 'bold');
  doc.text('agswebworks.com', pw - m, ph - 12, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.text('Dammam / Al Khobar, Saudi Arabia', pw - m, ph - 7, { align: 'right' });

  doc.save(`${s.companyName.replace(/\s+/g, '_')}_${inv.invoiceNumber}.pdf`);
}
