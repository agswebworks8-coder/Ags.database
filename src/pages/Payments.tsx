import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth';
import * as store from '../lib/store';
import type { Payment, Invoice, PaymentMethod, PaymentStatus } from '../lib/types';
import { Plus, X, FileText, Download, CreditCard, DollarSign, TrendingUp, Eye, Printer } from 'lucide-react';
import { generateInvoicePDF, generatePaymentReceipt, generateMaintenanceReport } from '../lib/pdfGenerator';
import InvoicePreview from '../components/InvoicePreview';

export default function Payments() {
  const { user } = useAuth();
  const isDark = document.documentElement.classList.contains('dark');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [activeTab, setActiveTab] = useState<'payments' | 'invoices'>('payments');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    setPayments(store.getPayments());
    setInvoices(store.getInvoices());
  }, []);

  const totalReceived = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const pendingAmount = store.getOrders().reduce((s, o) => s + o.remainingBalance, 0);
  const thisMonth = new Date().toISOString().slice(0, 7);
  const monthTotal = payments.filter(p => p.date.startsWith(thisMonth) && p.status === 'paid').reduce((s, p) => s + p.amount, 0);

  const cardClass = `rounded-xl p-5 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`;
  const inputClass = `w-full px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`;

  const handleAddPayment = (data: Partial<Payment>) => {
    store.addPayment(data);
    setPayments(store.getPayments());
    setShowPaymentForm(false);
  };

  const handleAddInvoice = (data: Partial<Invoice>) => {
    store.addInvoice(data);
    setInvoices(store.getInvoices());
    setShowInvoiceForm(false);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Payments & Invoices</h1>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Financial tracking & billing</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setShowPaymentForm(true)} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
            <Plus size={16} /> Record Payment
          </button>
          <button onClick={() => setShowInvoiceForm(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
            <FileText size={16} /> Create Invoice
          </button>
          <button onClick={() => generateMaintenanceReport()} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">
            <Download size={16} /> Report
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className={cardClass}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10"><DollarSign size={20} className="text-green-500" /></div>
            <div>
              <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{totalReceived.toLocaleString()} SAR</p>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Total Received</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10"><TrendingUp size={20} className="text-blue-500" /></div>
            <div>
              <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{monthTotal.toLocaleString()} SAR</p>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>This Month</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10"><CreditCard size={20} className="text-amber-500" /></div>
            <div>
              <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{pendingAmount.toLocaleString()} SAR</p>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Outstanding</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={`flex gap-1 mb-4 p-1 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-gray-100'}`}>
        <button onClick={() => setActiveTab('payments')} className={`flex-1 py-2 rounded-md text-sm font-medium ${activeTab === 'payments' ? 'bg-blue-600 text-white' : isDark ? 'text-slate-300' : 'text-gray-600'}`}>
          Payments ({payments.length})
        </button>
        <button onClick={() => setActiveTab('invoices')} className={`flex-1 py-2 rounded-md text-sm font-medium ${activeTab === 'invoices' ? 'bg-blue-600 text-white' : isDark ? 'text-slate-300' : 'text-gray-600'}`}>
          Invoices ({invoices.length})
        </button>
      </div>

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div className={cardClass}>
          {payments.length === 0 ? (
            <p className={`text-center py-8 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>No payments recorded yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={isDark ? 'border-b border-slate-700' : 'border-b border-gray-200'}>
                    <th className={`text-left py-3 px-2 font-medium ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>Date</th>
                    <th className={`text-left py-3 px-2 font-medium ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>Client</th>
                    <th className={`text-left py-3 px-2 font-medium ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>Amount</th>
                    <th className={`text-left py-3 px-2 font-medium ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>Method</th>
                    <th className={`text-left py-3 px-2 font-medium ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>Status</th>
                    <th className={`text-left py-3 px-2 font-medium ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>Reference</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-slate-700' : 'divide-gray-100'}`}>
                  {payments.map(p => {
                    const client = store.getClient(p.clientId);
                    return (
                      <tr key={p.id} className={isDark ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'}>
                        <td className={`py-3 px-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>{p.date}</td>
                        <td className={`py-3 px-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{client?.businessName || '-'}</td>
                        <td className="py-3 px-2 font-medium text-green-500">+{p.amount.toLocaleString()} SAR</td>
                        <td className={`py-3 px-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>{p.method.replace(/_/g, ' ')}</td>
                        <td className="py-3 px-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${p.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{p.status}</span>
                        </td>
                        <td className={`py-3 px-2 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{p.reference || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div className={cardClass}>
          {invoices.length === 0 ? (
            <p className={`text-center py-8 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>No invoices created yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={isDark ? 'border-b border-slate-700' : 'border-b border-gray-200'}>
                    <th className={`text-left py-3 px-2 font-medium ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>Invoice #</th>
                    <th className={`text-left py-3 px-2 font-medium ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>Client</th>
                    <th className={`text-left py-3 px-2 font-medium ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>Total</th>
                    <th className={`text-left py-3 px-2 font-medium ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>Status</th>
                    <th className={`text-left py-3 px-2 font-medium ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>Due Date</th>
                    <th className={`text-left py-3 px-2 font-medium ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-slate-700' : 'divide-gray-100'}`}>
                  {invoices.map(inv => {
                    const client = store.getClient(inv.clientId);
                    return (
                      <tr key={inv.id} className={isDark ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'}>
                        <td className={`py-3 px-2 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{inv.invoiceNumber}</td>
                        <td className={`py-3 px-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>{client?.businessName || '-'}</td>
                        <td className={`py-3 px-2 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{inv.total.toLocaleString()} SAR</td>
                        <td className="py-3 px-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            inv.status === 'paid' ? 'bg-green-100 text-green-700' :
                            inv.status === 'overdue' ? 'bg-red-100 text-red-700' :
                            inv.status === 'issued' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>{inv.status}</span>
                        </td>
                        <td className={`py-3 px-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>{inv.dueDate}</td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setPreviewInvoice(inv)}
                              className="text-purple-500 hover:text-purple-600 text-xs flex items-center gap-1 px-2 py-1 rounded hover:bg-purple-50 dark:hover:bg-purple-900/20"
                              title="Preview"
                            >
                              <Eye size={12} />
                            </button>
                            <button
                              onClick={() => generateInvoicePDF(inv.id)}
                              className="text-blue-500 hover:text-blue-600 text-xs flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                              title="Download PDF"
                            >
                              <Download size={12} /> PDF
                            </button>
                            <button
                              onClick={() => generateInvoicePDF(inv.id)}
                              className="text-gray-500 hover:text-gray-700 text-xs p-1 rounded hover:bg-gray-100 dark:hover:bg-slate-700"
                              title="Print"
                            >
                              <Printer size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Payment Form */}
      {showPaymentForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowPaymentForm(false)}>
          <div className={`w-full max-w-md rounded-2xl p-6 ${isDark ? 'bg-slate-800' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Record Payment</h2>
              <button onClick={() => setShowPaymentForm(false)}><X size={18} /></button>
            </div>
            <PaymentForm onSave={handleAddPayment} isDark={isDark} inputClass={inputClass} />
          </div>
        </div>
      )}

      {/* Invoice Form */}
      {showInvoiceForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowInvoiceForm(false)}>
          <div className={`w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-6 ${isDark ? 'bg-slate-800' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Create Invoice</h2>
              <button onClick={() => setShowInvoiceForm(false)}><X size={18} /></button>
            </div>
            <InvoiceForm onSave={handleAddInvoice} isDark={isDark} inputClass={inputClass} />
          </div>
        </div>
      )}

      {/* Invoice Preview */}
      {previewInvoice && (() => {
        const client = store.getClient(previewInvoice.clientId);
        const settings = store.getSettings();
        if (!client) return null;
        return (
          <InvoicePreview
            invoice={previewInvoice}
            client={client}
            settings={settings}
            onClose={() => setPreviewInvoice(null)}
          />
        );
      })()}
    </div>
  );
}

function PaymentForm({ onSave, isDark, inputClass }: { onSave: (d: Partial<Payment>) => void; isDark: boolean; inputClass: string }) {
  const clients = store.getClients();
  const orders = store.getOrders();
  const [form, setForm] = useState<Partial<Payment>>({
    clientId: '', orderId: '', amount: 0, date: new Date().toISOString().split('T')[0],
    method: 'bank_transfer', status: 'paid', reference: '', notes: '', type: 'project_payment',
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="space-y-4">
      <div>
        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Client *</label>
        <select required value={form.clientId} onChange={e => setForm({ ...form, clientId: e.target.value })} className={inputClass}>
          <option value="">Select client</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.businessName}</option>)}
        </select>
      </div>
      <div>
        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Related Order</label>
        <select value={form.orderId || ''} onChange={e => setForm({ ...form, orderId: e.target.value })} className={inputClass}>
          <option value="">None</option>
          {orders.filter(o => o.clientId === form.clientId).map(o => <option key={o.id} value={o.id}>{o.orderNumber}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Amount (SAR) *</label>
          <input required type="number" value={form.amount || ''} onChange={e => setForm({ ...form, amount: Number(e.target.value) })} className={inputClass} />
        </div>
        <div>
          <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Date</label>
          <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className={inputClass} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Method</label>
          <select value={form.method} onChange={e => setForm({ ...form, method: e.target.value as PaymentMethod })} className={inputClass}>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Reference</label>
          <input type="text" value={form.reference || ''} onChange={e => setForm({ ...form, reference: e.target.value })} className={inputClass} />
        </div>
      </div>
      <button type="submit" className="w-full py-2 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700">Record Payment</button>
    </form>
  );
}

function InvoiceForm({ onSave, isDark, inputClass }: { onSave: (d: Partial<Invoice>) => void; isDark: boolean; inputClass: string }) {
  const clients = store.getClients();
  const [form, setForm] = useState<Partial<Invoice>>({
    clientId: '', items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }],
    dueDate: '', notes: '', status: 'draft',
  });

  const addItem = () => {
    setForm({ ...form, items: [...(form.items || []), { description: '', quantity: 1, unitPrice: 0, total: 0 }] });
  };

  const updateItem = (idx: number, field: string, value: string | number) => {
    const items = [...(form.items || [])];
    items[idx] = { ...items[idx], [field]: value };
    items[idx].total = items[idx].quantity * items[idx].unitPrice;
    setForm({ ...form, items });
  };

  const subtotal = (form.items || []).reduce((s, i) => s + i.total, 0);

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave({ ...form, issueDate: new Date().toISOString().split('T')[0] }); }} className="space-y-4">
      <div>
        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Client *</label>
        <select required value={form.clientId} onChange={e => setForm({ ...form, clientId: e.target.value })} className={inputClass}>
          <option value="">Select client</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.businessName}</option>)}
        </select>
      </div>
      <div>
        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Due Date</label>
        <input type="date" value={form.dueDate || ''} onChange={e => setForm({ ...form, dueDate: e.target.value })} className={inputClass} />
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Items</label>
          <button type="button" onClick={addItem} className="text-xs text-blue-500">+ Add Item</button>
        </div>
        {(form.items || []).map((item, idx) => (
          <div key={idx} className="grid grid-cols-12 gap-2 mb-2">
            <input className="col-span-5 px-2 py-1.5 rounded border text-xs" placeholder="Description" value={item.description} onChange={e => updateItem(idx, 'description', e.target.value)} />
            <input className="col-span-2 px-2 py-1.5 rounded border text-xs" type="number" placeholder="Qty" value={item.quantity} onChange={e => updateItem(idx, 'quantity', Number(e.target.value))} />
            <input className="col-span-3 px-2 py-1.5 rounded border text-xs" type="number" placeholder="Price" value={item.unitPrice} onChange={e => updateItem(idx, 'unitPrice', Number(e.target.value))} />
            <span className="col-span-2 text-xs flex items-center justify-end font-medium">{item.total.toLocaleString()}</span>
          </div>
        ))}
        <div className={`text-right text-sm font-bold pt-2 border-t ${isDark ? 'border-slate-600 text-white' : 'border-gray-200'}`}>
          Subtotal: {subtotal.toLocaleString()} SAR
        </div>
      </div>
      <div>
        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Notes</label>
        <textarea value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} className={`${inputClass} h-16 resize-none`} />
      </div>
      <button type="submit" className="w-full py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700">Create Invoice</button>
    </form>
  );
}
