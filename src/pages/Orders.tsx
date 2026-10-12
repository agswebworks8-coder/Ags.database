import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { getOrders, addOrder, getClient, getClients } from '../lib/store';
import type { Order, Priority } from '../lib/types';

export default function OrdersPage() {
  const dk = document.documentElement.classList.contains('dark');
  const ords = getOrders();
  const [show, setShow] = useState(false);
  const { user } = useAuth();
  const canEdit = user?.role === 'ceo' || user?.role === 'accountant';
  const inp = `w-full px-3 py-2 rounded-lg border text-sm ${dk ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-300'}`;
  const statusLabels: Record<string, string> = { lead_received: 'Lead', contacted: 'Contacted', quotation_sent: 'Quoted', confirmed: 'Confirmed', in_progress: 'In Progress', internal_review: 'Review', client_review: 'Client Review', revisions: 'Revisions', ready_delivery: 'Ready', delivered: 'Delivered', payment_completed: 'Paid', closed: 'Closed' };
  const save = (d: Partial<Order>) => { addOrder(d); setShow(false); };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className={`text-2xl font-bold ${dk ? 'text-white' : 'text-gray-900'}`}>Orders</h1><p className={`text-sm ${dk ? 'text-slate-400' : 'text-gray-500'}`}>{ords.length} total</p></div>
        {canEdit && <button onClick={() => setShow(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"><Plus size={16} />New Order</button>}
      </div>
      {ords.length === 0 ? <div className={`text-center py-12 rounded-xl border ${dk ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}><p className={dk ? 'text-slate-400' : 'text-gray-500'}>No orders</p></div> : (
        <div className={`rounded-xl border overflow-hidden ${dk ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
          <table className="w-full text-sm">
            <thead className={dk ? 'bg-slate-700/50' : 'bg-gray-50'}>
              <tr>{['Order', 'Client', 'Service', 'Price', 'Status', 'Deadline'].map(h => <th key={h} className={`text-left px-4 py-3 font-medium ${dk ? 'text-slate-300' : 'text-gray-600'}`}>{h}</th>)}</tr>
            </thead>
            <tbody className={`divide-y ${dk ? 'divide-slate-700' : 'divide-gray-100'}`}>
              {ords.map(o => {
                const c = getClient(o.clientId);
                return (
                  <tr key={o.id} className={dk ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'}>
                    <td className="px-4 py-3 font-medium">{o.orderNumber}</td>
                    <td className="px-4 py-3">{c?.businessName || '-'}</td>
                    <td className="px-4 py-3">{o.serviceType}</td>
                    <td className="px-4 py-3 font-medium">{o.price.toLocaleString()} SAR</td>
                    <td className="px-4 py-3"><span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">{statusLabels[o.status] || o.status}</span></td>
                    <td className="px-4 py-3">{o.internalDeadline || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShow(false)}>
          <div className={`w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-6 ${dk ? 'bg-slate-800' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
            <h2 className={`text-lg font-bold mb-4 ${dk ? 'text-white' : 'text-gray-900'}`}>New Order</h2>
            <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.currentTarget); save({ clientId: fd.get('clientId') as string, serviceType: fd.get('serviceType') as string, price: Number(fd.get('price')), advancePayment: Number(fd.get('advance') || 0), internalDeadline: fd.get('deadline') as string, priority: (fd.get('priority') as Priority) || 'medium' }); }} className="space-y-4">
              <div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Client *</label>
                <select name="clientId" required className={inp}><option value="">Select</option>{getClients().map(c => <option key={c.id} value={c.id}>{c.businessName}</option>)}</select>
              </div>
              <div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Service *</label>
                <select name="serviceType" required className={inp}><option value="">Select</option><option>Business Website</option><option>Restaurant Website</option><option>Website Redesign</option><option>Maintenance</option><option>Google Business</option><option>Landing Page</option><option>Other</option></select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Price (SAR)</label><input name="price" type="number" defaultValue={0} className={inp} /></div>
                <div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Advance</label><input name="advance" type="number" defaultValue={0} className={inp} /></div>
              </div>
              <div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Deadline</label><input name="deadline" type="date" className={inp} /></div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShow(false)} className={`px-4 py-2 rounded-lg text-sm ${dk ? 'text-slate-300 hover:bg-slate-700' : 'hover:bg-gray-100'}`}>Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
