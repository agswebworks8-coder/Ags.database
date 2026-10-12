import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth';
import * as store from '../lib/store';
import type { Order, OrderStatus, Priority } from '../lib/types';
import { Plus, X, LayoutGrid, List, Calendar, ExternalLink, Edit2 } from 'lucide-react';

const statusFlow: { key: OrderStatus; label: string }[] = [
  { key: 'lead_received', label: 'Lead Received' },
  { key: 'contacted', label: 'Contacted' },
  { key: 'quotation_sent', label: 'Quotation Sent' },
  { key: 'confirmed', label: 'Order Confirmed' },
  { key: 'in_progress', label: 'In Development' },
  { key: 'internal_review', label: 'Internal Review' },
  { key: 'client_review', label: 'Client Review' },
  { key: 'revisions', label: 'Revisions' },
  { key: 'ready_delivery', label: 'Ready for Delivery' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'payment_completed', label: 'Payment Completed' },
  { key: 'closed', label: 'Closed' },
];

const statusColors: Record<string, string> = {
  lead_received: 'bg-gray-100 text-gray-700',
  contacted: 'bg-blue-100 text-blue-700',
  quotation_sent: 'bg-indigo-100 text-indigo-700',
  confirmed: 'bg-cyan-100 text-cyan-700',
  in_progress: 'bg-amber-100 text-amber-700',
  internal_review: 'bg-purple-100 text-purple-700',
  client_review: 'bg-violet-100 text-violet-700',
  revisions: 'bg-orange-100 text-orange-700',
  ready_delivery: 'bg-teal-100 text-teal-700',
  delivered: 'bg-green-100 text-green-700',
  payment_completed: 'bg-emerald-100 text-emerald-700',
  closed: 'bg-slate-100 text-slate-700',
};

const priorityColors: Record<Priority, string> = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-blue-100 text-blue-600',
  high: 'bg-amber-100 text-amber-600',
  urgent: 'bg-red-100 text-red-600',
};

export default function Orders() {
  const { user } = useAuth();
  const isDark = document.documentElement.classList.contains('dark');
  const [orders, setOrders] = useState<Order[]>([]);
  const [view, setView] = useState<'table' | 'kanban'>('table');
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setOrders(store.getOrders());
  }, []);

  const filtered = orders.filter(o => {
    const client = store.getClient(o.clientId);
    const matchSearch = search === '' ||
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.serviceType.toLowerCase().includes(search.toLowerCase()) ||
      client?.businessName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleSave = (data: Partial<Order>) => {
    if (editingOrder) {
      store.updateOrder(editingOrder.id, data);
    } else {
      store.addOrder(data);
    }
    setOrders(store.getOrders());
    setShowForm(false);
    setEditingOrder(null);
  };

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    store.updateOrder(orderId, { status: newStatus });
    setOrders(store.getOrders());
  };

  const canEdit = user?.role === 'ceo' || user?.role === 'accountant';
  const canUpdateDev = user?.role === 'developer';
  const clients = store.getClients();
  const users = store.getUsers();

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Orders & Projects</h1>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{orders.length} total orders</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex rounded-lg border ${isDark ? 'border-slate-600' : 'border-gray-300'}`}>
            <button onClick={() => setView('table')} className={`px-3 py-1.5 text-sm rounded-l-lg ${view === 'table' ? 'bg-blue-600 text-white' : isDark ? 'text-slate-300' : 'text-gray-600'}`}>
              <List size={16} />
            </button>
            <button onClick={() => setView('kanban')} className={`px-3 py-1.5 text-sm rounded-r-lg ${view === 'kanban' ? 'bg-blue-600 text-white' : isDark ? 'text-slate-300' : 'text-gray-600'}`}>
              <LayoutGrid size={16} />
            </button>
          </div>
          {canEdit && (
            <button onClick={() => { setEditingOrder(null); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm shadow-lg shadow-blue-600/25">
              <Plus size={16} /> New Order
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className={`flex flex-wrap gap-3 mb-6 p-4 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search orders..."
          className={`flex-1 min-w-[200px] px-3 py-2 rounded-lg border text-sm ${
            isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-300'
          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={`px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-300'}`}
        >
          <option value="all">All Status</option>
          {statusFlow.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
      </div>

      {/* Table View */}
      {view === 'table' && (
        <div className={`rounded-xl border overflow-hidden ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className={isDark ? 'bg-slate-700/50' : 'bg-gray-50'}>
                <tr>
                  <th className={`text-left px-4 py-3 font-medium ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>Order</th>
                  <th className={`text-left px-4 py-3 font-medium ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>Client</th>
                  <th className={`text-left px-4 py-3 font-medium ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>Service</th>
                  <th className={`text-left px-4 py-3 font-medium ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>Price</th>
                  <th className={`text-left px-4 py-3 font-medium ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>Status</th>
                  <th className={`text-left px-4 py-3 font-medium ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>Priority</th>
                  <th className={`text-left px-4 py-3 font-medium ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>Deadline</th>
                  {(canEdit || canUpdateDev) && <th className={`text-left px-4 py-3 font-medium ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>Actions</th>}
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-700' : 'divide-gray-100'}`}>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-8 text-slate-400">No orders found</td></tr>
                ) : filtered.map(order => {
                  const client = store.getClient(order.clientId);
                  const dev = store.getUser(order.assignedDeveloper);
                  return (
                    <tr key={order.id} className={`${isDark ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'} transition-colors`}>
                      <td className="px-4 py-3">
                        <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{order.orderNumber}</span>
                        {dev && <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{dev.name}</p>}
                      </td>
                      <td className={`px-4 py-3 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>{client?.businessName || '-'}</td>
                      <td className={`px-4 py-3 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>{order.serviceType}</td>
                      <td className={`px-4 py-3 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{order.price.toLocaleString()} SAR</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[order.status]}`}>
                          {statusFlow.find(s => s.key === order.status)?.label || order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${priorityColors[order.priority]}`}>
                          {order.priority}
                        </span>
                      </td>
                      <td className={`px-4 py-3 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>{order.internalDeadline || '-'}</td>
                      {(canEdit || canUpdateDev) && (
                        <td className="px-4 py-3">
                          <button onClick={() => { setEditingOrder(order); setShowForm(true); }} className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-slate-600' : 'hover:bg-gray-100'}`}>
                            <Edit2 size={14} className={isDark ? 'text-slate-400' : 'text-gray-500'} />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Kanban View */}
      {view === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {statusFlow.filter(s => ['confirmed', 'in_progress', 'internal_review', 'client_review', 'revisions', 'ready_delivery', 'delivered'].includes(s.key)).map(status => {
            const statusOrders = filtered.filter(o => o.status === status.key);
            return (
              <div key={status.key} className={`min-w-[280px] flex-shrink-0 rounded-xl p-3 ${isDark ? 'bg-slate-800/50' : 'bg-gray-100'}`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{status.label}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-gray-200 text-gray-600'}`}>
                    {statusOrders.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {statusOrders.map(order => {
                    const client = store.getClient(order.clientId);
                    return (
                      <div
                        key={order.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                          isDark ? 'bg-slate-800 border-slate-700 hover:border-slate-600' : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => { setEditingOrder(order); setShowForm(true); }}
                      >
                        <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{order.orderNumber}</p>
                        <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{client?.businessName || 'Unknown'}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className={`text-xs px-1.5 py-0.5 rounded ${priorityColors[order.priority]}`}>{order.priority}</span>
                          {order.internalDeadline && (
                            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{order.internalDeadline}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Order Form Modal */}
      {showForm && (
        <OrderForm
          order={editingOrder}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditingOrder(null); }}
          isDark={isDark}
          clients={clients}
          users={users}
          canEdit={!!canEdit}
        />
      )}
    </div>
  );
}

function OrderForm({ order, onSave, onClose, isDark, clients, users, canEdit }: {
  order: Order | null;
  onSave: (data: Partial<Order>) => void;
  onClose: () => void;
  isDark: boolean;
  clients: { id: string; businessName: string }[];
  users: { id: string; name: string; role: string }[];
  canEdit: boolean;
}) {
  const [form, setForm] = useState<Partial<Order>>(order || {
    clientId: '', serviceType: '', description: '', assignedDeveloper: '',
    assignedCoordinator: 'usr_addan', price: 0, advancePayment: 0,
    startDate: new Date().toISOString().split('T')[0], internalDeadline: '',
    deliveryDate: '', priority: 'medium' as Priority, status: 'lead_received' as OrderStatus,
    notes: '', previewUrl: '', liveUrl: '', repositoryUrl: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  const inputClass = `w-full px-3 py-2 rounded-lg border text-sm ${
    isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-300'
  } focus:outline-none focus:ring-2 focus:ring-blue-500`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 ${isDark ? 'bg-slate-800' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {order ? `Edit ${order.orderNumber}` : 'New Order'}
          </h2>
          <button onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Client *</label>
              <select required value={form.clientId || ''} onChange={e => setForm({ ...form, clientId: e.target.value })} className={inputClass}>
                <option value="">Select client</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.businessName}</option>)}
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Service Type *</label>
              <select required value={form.serviceType || ''} onChange={e => setForm({ ...form, serviceType: e.target.value })} className={inputClass}>
                <option value="">Select service</option>
                <option>Business Website Development</option>
                <option>Restaurant Website Development</option>
                <option>Website Redesign</option>
                <option>Website Maintenance</option>
                <option>Google Business Profile Setup</option>
                <option>Promotional Video Editing</option>
                <option>Landing Page</option>
                <option>Hosting & Deployment</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Assigned Developer</label>
              <select value={form.assignedDeveloper || ''} onChange={e => setForm({ ...form, assignedDeveloper: e.target.value })} className={inputClass}>
                <option value="">Select developer</option>
                {users.filter(u => u.role === 'developer').map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Priority</label>
              <select value={form.priority || 'medium'} onChange={e => setForm({ ...form, priority: e.target.value as Priority })} className={inputClass}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Price (SAR)</label>
              <input type="number" value={form.price || 0} onChange={e => setForm({ ...form, price: Number(e.target.value) })} className={inputClass} />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Advance Payment (SAR)</label>
              <input type="number" value={form.advancePayment || 0} onChange={e => setForm({ ...form, advancePayment: Number(e.target.value) })} className={inputClass} />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Start Date</label>
              <input type="date" value={form.startDate || ''} onChange={e => setForm({ ...form, startDate: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Internal Deadline</label>
              <input type="date" value={form.internalDeadline || ''} onChange={e => setForm({ ...form, internalDeadline: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Client Delivery Date</label>
              <input type="date" value={form.deliveryDate || ''} onChange={e => setForm({ ...form, deliveryDate: e.target.value })} className={inputClass} />
            </div>
            {canEdit && (
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Status</label>
                <select value={form.status || 'lead_received'} onChange={e => setForm({ ...form, status: e.target.value as OrderStatus })} className={inputClass}>
                  {statusFlow.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                </select>
              </div>
            )}
          </div>

          {/* Developer fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Preview URL</label>
              <input type="url" value={form.previewUrl || ''} onChange={e => setForm({ ...form, previewUrl: e.target.value })} className={inputClass} placeholder="https://preview..." />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Live URL</label>
              <input type="url" value={form.liveUrl || ''} onChange={e => setForm({ ...form, liveUrl: e.target.value })} className={inputClass} placeholder="https://..." />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Description</label>
            <textarea value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} className={`${inputClass} h-20 resize-none`} />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Notes</label>
            <textarea value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} className={`${inputClass} h-16 resize-none`} />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className={`px-4 py-2 rounded-lg text-sm ${isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-gray-600 hover:bg-gray-100'}`}>Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700">
              {order ? 'Update Order' : 'Create Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
