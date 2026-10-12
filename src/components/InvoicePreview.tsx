import React from 'react';
import type { Invoice, Client, BusinessSettings } from '../lib/types';
import { X, Download, Printer, Eye } from 'lucide-react';
import { generateInvoicePDF } from '../lib/pdfGenerator';

interface InvoicePreviewProps {
  invoice: Invoice;
  client: Client;
  settings: BusinessSettings;
  onClose: () => void;
}

export default function InvoicePreview({ invoice, client, settings, onClose }: InvoicePreviewProps) {
  const formatCurrency = (amount: number) =>
    `${amount.toLocaleString('en-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${settings.currency}`;

  const statusColors: Record<string, string> = {
    paid: 'bg-green-100 text-green-700 border-green-200',
    overdue: 'bg-red-100 text-red-700 border-red-200',
    issued: 'bg-blue-100 text-blue-700 border-blue-200',
    partial: 'bg-amber-100 text-amber-700 border-amber-200',
    draft: 'bg-gray-100 text-gray-700 border-gray-200',
    void: 'bg-gray-100 text-gray-500 border-gray-200',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-3xl max-h-[95vh] overflow-y-auto bg-white rounded-2xl shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Toolbar */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-white border-b border-gray-200 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <Eye size={20} className="text-blue-500" />
            <h2 className="text-lg font-bold text-gray-900">Invoice Preview</h2>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColors[invoice.status] || statusColors.draft}`}>
              {invoice.status.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => generateInvoicePDF(invoice.id)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              <Download size={14} /> Download PDF
            </button>
            <button
              onClick={() => { generateInvoicePDF(invoice.id); }}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
            >
              <Printer size={14} /> Print
            </button>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="p-8">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-2xl">A</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold">{settings.companyName}</h1>
                  <p className="text-blue-100 text-sm">Web Development & Digital Services</p>
                  <p className="text-blue-200 text-xs mt-1">{settings.companyAddress}</p>
                  <p className="text-blue-200 text-xs">{settings.companyEmail} | {settings.companyPhone}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                  <p className="text-xs text-blue-100">INVOICE</p>
                  <p className="text-lg font-bold">{invoice.invoiceNumber}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bill To & Details */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs font-bold text-gray-400 uppercase mb-2">Bill To</p>
              <p className="text-lg font-bold text-gray-900">{client.businessName}</p>
              {client.contactPerson && <p className="text-sm text-gray-600">Attn: {client.contactPerson}</p>}
              {client.email && <p className="text-sm text-gray-600">{client.email}</p>}
              {client.phone && <p className="text-sm text-gray-600">{client.phone}</p>}
              {client.location && <p className="text-sm text-gray-600">{client.location}</p>}
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs font-bold text-gray-400 uppercase mb-2">Invoice Details</p>
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Issue Date:</span>
                  <span className="font-medium text-gray-900">{invoice.issueDate}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Due Date:</span>
                  <span className={`font-medium ${invoice.status === 'overdue' ? 'text-red-600' : 'text-gray-900'}`}>{invoice.dueDate || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Currency:</span>
                  <span className="font-medium text-gray-900">{settings.currency}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-800 text-white">
                  <th className="text-left py-3 px-4 text-xs font-medium rounded-tl-lg">#</th>
                  <th className="text-left py-3 px-4 text-xs font-medium">Description</th>
                  <th className="text-center py-3 px-4 text-xs font-medium">Qty</th>
                  <th className="text-center py-3 px-4 text-xs font-medium">Unit Price</th>
                  <th className="text-right py-3 px-4 text-xs font-medium rounded-tr-lg">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : ''}>
                    <td className="py-3 px-4 text-sm text-gray-900">{idx + 1}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{item.description}</td>
                    <td className="py-3 px-4 text-sm text-gray-900 text-center">{item.quantity}</td>
                    <td className="py-3 px-4 text-sm text-gray-900 text-center">{formatCurrency(item.unitPrice)}</td>
                    <td className="py-3 px-4 text-sm font-bold text-gray-900 text-right">{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-72">
              <div className="flex justify-between py-2 text-sm">
                <span className="text-gray-500">Subtotal:</span>
                <span className="font-medium text-gray-900">{formatCurrency(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between py-2 text-sm">
                <span className="text-gray-500">VAT ({settings.taxRate}%):</span>
                <span className="font-medium text-gray-900">{formatCurrency(invoice.tax)}</span>
              </div>
              <div className="border-t border-gray-200 my-2"></div>
              <div className="flex justify-between py-3 bg-blue-600 text-white rounded-lg px-4">
                <span className="font-bold">TOTAL DUE:</span>
                <span className="font-bold">{formatCurrency(invoice.total)}</span>
              </div>
            </div>
          </div>

          {/* Payment Instructions */}
          <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500 mb-6">
            <p className="text-sm font-bold text-gray-900 mb-1">Payment Instructions</p>
            <p className="text-xs text-gray-600">Bank Transfer to AGS WEBWORKS account.</p>
            <p className="text-xs text-gray-600">Please include invoice number as payment reference.</p>
            <p className="text-xs text-gray-600">Payment due by: {invoice.dueDate || 'Upon receipt'}</p>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="mb-6">
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">Notes</p>
              <p className="text-sm text-gray-600 whitespace-pre-line">{invoice.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="bg-slate-800 rounded-lg p-4 text-white text-center">
            <p className="text-sm font-medium">Thank you for your business!</p>
            <p className="text-xs text-slate-300 mt-1">{settings.companyName} | {settings.companyEmail} | agswebworks.com</p>
            <p className="text-xs text-slate-400 mt-0.5">Dammam / Al Khobar, Saudi Arabia</p>
          </div>
        </div>
      </div>
    </div>
  );
}
