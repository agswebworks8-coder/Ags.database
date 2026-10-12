import React, { useState } from 'react';
import { Plus, Download } from 'lucide-react';
import { getPayments, addPayment, updatePayment, getInvoices, addInvoice, getOrders, getClient, getClients } from '../lib/store';
import { genPDF } from '../lib/pdf';
import type { PaymentMethod } from '../lib/types';

export default function PaymentsPage() {
  const dk = document.documentElement.classList.contains('dark');
  const [pmts, setPmts] = useState(getPayments());
  const [invs, setInvs] = useState(getInvoices());
  const [tab, setTab] = useState<'payments' | 'invoices'>('payments');
  const [showP, setShowP] = useState(false);
  const [showI, setShowI] = useState(false);
  const inp = `w-full px-3 py-2 rounded-lg border text-sm ${dk ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-300'}`;
  const card = `rounded-xl p-5 border ${dk ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`;
  const total = pmts.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className={`text-2xl font-bold ${dk ? 'text-white' : 'text-gray-900'}`}>Payments & Invoices</h1></div>
        <div className="flex gap-2">
          <button onClick={() => setShowP(true)} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm"><Plus size={16} />Payment</button>
          <button onClick={() => setShowI(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"><Plus size={16} />Invoice</button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className={card}><p className={`text-xl font-bold ${dk ? 'text-white' : 'text-gray-900'}`}>{total.toLocaleString()} SAR</p><p className={`text-xs ${dk ? 'text-slate-400' : 'text-gray-500'}`}>Total Received</p></div>
        <div className={card}><p className={`text-xl font-bold ${dk ? 'text-white' : 'text-gray-900'}`}>{getOrders().reduce((s, o) => s + o.remainingBalance, 0).toLocaleString()} SAR</p><p className={`text-xs ${dk ? 'text-slate-400' : 'text-gray-500'}`}>Outstanding</p></div>
        <div className={card}><p className={`text-xl font-bold ${dk ? 'text-white' : 'text-gray-900'}`}>{invs.length}</p><p className={`text-xs ${dk ? 'text-slate-400' : 'text-gray-500'}`}>Invoices</p></div>
      </div>
      <div className={`flex gap-1 mb-4 p-1 rounded-lg ${dk ? 'bg-slate-800' : 'bg-gray-100'}`}>
        <button onClick={() => setTab('payments')} className={`flex-1 py-2 rounded-md text-sm ${tab === 'payments' ? 'bg-blue-600 text-white' : dk ? 'text-slate-300' : 'text-gray-600'}`}>Payments</button>
        <button onClick={() => setTab('invoices')} className={`flex-1 py-2 rounded-md text-sm ${tab === 'invoices' ? 'bg-blue-600 text-white' : dk ? 'text-slate-300' : 'text-gray-600'}`}>Invoices</button>
      </div>
      {tab === 'payments' ? (
        <div className={card}>
          {pmts.length === 0 ? <p className={`text-center py-8 ${dk ? 'text-slate-400' : 'text-gray-500'}`}>No payments</p> : (
            <table className="w-full text-sm">
              <thead><tr>{['Date', 'Client', 'Amount', 'Method', 'Status', 'Action'].map(h => <th key={h} className={`text-left py-3 px-2 ${dk ? 'text-slate-300' : 'text-gray-600'}`}>{h}</th>)}</tr></thead>
              <tbody>
                {pmts.map(p => {
                  const c = getClient(p.clientId);
                  const statusColor = p.status === 'paid' ? 'bg-green-100 text-green-700' : p.status === 'pending' ? 'bg-amber-100 text-amber-700' : p.status === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700';
                  return (
                    <tr key={p.id} className={dk ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'}>
                      <td className="py-3 px-2">{p.date}</td>
                      <td className="py-3 px-2">{c?.businessName}</td>
                      <td className={`py-3 px-2 font-medium ${p.status === 'paid' ? 'text-green-500' : 'text-amber-500'}`}>{p.status === 'paid' ? '+' : ''}{p.amount.toLocaleString()} SAR</td>
                      <td className="py-3 px-2">{p.method.replace(/_/g, ' ')}</td>
                      <td className="py-3 px-2"><span className={`text-xs px-2 py-0.5 rounded-full ${statusColor}`}>{p.status}</span></td>
                      <td className="py-3 px-2">
                        <select value={p.status} onChange={e => { updatePayment(p.id, { status: e.target.value }); setPmts(getPayments()); }} className={`text-xs px-2 py-1 rounded border ${dk ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-300'}`}>
                          <option value="paid">Paid</option><option value="pending">Pending</option><option value="overdue">Overdue</option><option value="refunded">Refunded</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <div className={card}>
          {invs.length === 0 ? <p className={`text-center py-8 ${dk ? 'text-slate-400' : 'text-gray-500'}`}>No invoices</p> : (
            <table className="w-full text-sm">
              <thead><tr>{['Invoice', 'Client', 'Total', 'Status', 'Due', ''].map(h => <th key={h} className={`text-left py-3 px-2 ${dk ? 'text-slate-300' : 'text-gray-600'}`}>{h}</th>)}</tr></thead>
              <tbody>
                {invs.map(inv => {
                  const c = getClient(inv.clientId);
                  return (
                    <tr key={inv.id}>
                      <td className="py-3 px-2 font-medium">{inv.invoiceNumber}</td>
                      <td className="py-3 px-2">{c?.businessName}</td>
                      <td className="py-3 px-2 font-medium">{inv.total.toLocaleString()} SAR</td>
                      <td className="py-3 px-2"><span className={`text-xs px-2 py-0.5 rounded-full ${inv.status === 'paid' ? 'bg-green-100 text-green-700' : inv.status === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{inv.status}</span></td>
                      <td className="py-3 px-2">{inv.dueDate}</td>
                      <td className="py-3 px-2"><button onClick={() => genPDF(inv.id)} className="text-xs text-blue-500 flex items-center gap-1"><Download size={12} />PDF</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
      {showP && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowP(false)}>
          <div className={`w-full max-w-md rounded-2xl p-6 ${dk ? 'bg-slate-800' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
            <h2 className={`text-lg font-bold mb-4 ${dk ? 'text-white' : 'text-gray-900'}`}>Record Payment</h2>
            <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.currentTarget); addPayment({ clientId: fd.get('client') as string, amount: Number(fd.get('amount')), method: (fd.get('method') as PaymentMethod) || 'bank_transfer', reference: fd.get('ref') as string }); setPmts(getPayments()); setShowP(false); }} className="space-y-4">
              <div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Client</label>
                <select name="client" required className={inp}>{getClients().map(c => <option key={c.id} value={c.id}>{c.businessName}</option>)}</select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Amount</label><input name="amount" type="number" required className={inp} /></div>
                <div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Method</label>
                  <select name="method" className={inp}><option value="bank_transfer">Bank</option><option value="cash">Cash</option><option value="card">Card</option></select>
                </div>
              </div>
              <div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Reference</label><input name="ref" className={inp} /></div>
              <button type="submit" className="w-full py-2 rounded-lg bg-green-600 text-white text-sm">Record</button>
            </form>
          </div>
        </div>
      )}
      {showI && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowI(false)}>
          <div className={`w-full max-w-lg rounded-2xl p-6 ${dk ? 'bg-slate-800' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
            <h2 className={`text-lg font-bold mb-4 ${dk ? 'text-white' : 'text-gray-900'}`}>Create Invoice</h2>
            <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.currentTarget); const desc = fd.get('desc') as string; const qty = Number(fd.get('qty') || 1); const price = Number(fd.get('price') || 0); addInvoice({ clientId: fd.get('client') as string, items: [{ description: desc, quantity: qty, unitPrice: price, total: qty * price }], dueDate: fd.get('due') as string }); setInvs(getInvoices()); setShowI(false); }} className="space-y-4">
              <div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Client</label>
                <select name="client" required className={inp}>{getClients().map(c => <option key={c.id} value={c.id}>{c.businessName}</option>)}</select>
              </div>
              <div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Description</label><input name="desc" required className={inp} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Qty</label><input name="qty" type="number" defaultValue={1} className={inp} /></div>
                <div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Unit Price</label><input name="price" type="number" defaultValue={0} className={inp} /></div>
              </div>
              <div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Due Date</label><input name="due" type="date" className={inp} /></div>
              <button type="submit" className="w-full py-2 rounded-lg bg-blue-600 text-white text-sm">Create</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
