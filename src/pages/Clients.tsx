import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth';
import * as store from '../lib/store';
import type { Client, ClientStatus } from '../lib/types';
import { Plus, Search, Filter, Edit2, Trash2, X, ExternalLink, Phone, Mail, MapPin } from 'lucide-react';

const statusColors: Record<ClientStatus, string> = {
  lead: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  contacted: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  interested: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  negotiation: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  won: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  lost: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const statusLabels: Record<ClientStatus, string> = {
  lead: 'Lead', contacted: 'Contacted', interested: 'Interested',
  negotiation: 'Negotiation', won: 'Won', active: 'Active Client', lost: 'Lost',
};

export default function Clients() {
  const { user } = useAuth();
  const isDark = document.documentElement.classList.contains('dark');
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  useEffect(() => {
    setClients(store.getClients());
  }, []);

  const filtered = clients.filter(c => {
    const matchSearch = search === '' || 
      c.businessName.toLowerCase().includes(search.toLowerCase()) ||
      c.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleSave = (data: Partial<Client>) => {
    if (editingClient) {
      store.updateClient(editingClient.id, data);
    } else {
      store.addClient(data);
    }
    setClients(store.getClients());
    setShowForm(false);
    setEditingClient(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this client?')) {
      store.deleteClient(id);
      setClients(store.getClients());
      setSelectedClient(null);
    }
  };

  const canEdit = user?.role === 'ceo' || user?.role === 'accountant';

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Clients Database</h1>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{clients.length} total clients</p>
        </div>
        {canEdit && (
          <button
            onClick={() => { setEditingClient(null); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/25"
          >
            <Plus size={18} /> Add Client
          </button>
        )}
      </div>

      {/* Filters */}
      <div className={`flex flex-col sm:flex-row gap-3 mb-6 p-4 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
        <div className="relative flex-1">
          <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clients..."
            className={`w-full pl-9 pr-4 py-2 rounded-lg border text-sm ${
              isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-gray-50 border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={`px-3 py-2 rounded-lg border text-sm ${
            isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-300'
          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
        >
          <option value="all">All Status</option>
          {Object.entries(statusLabels).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {/* Client List */}
      {filtered.length === 0 ? (
        <div className={`text-center py-12 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
          <p className={`text-lg ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
            {search || statusFilter !== 'all' ? 'No clients match your filters' : 'No clients yet'}
          </p>
          {!search && statusFilter === 'all' && canEdit && (
            <button onClick={() => setShowForm(true)} className="mt-3 text-blue-500 hover:text-blue-600 text-sm">
              Add your first client →
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map(client => (
            <div
              key={client.id}
              className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
                isDark ? 'bg-slate-800 border-slate-700 hover:border-slate-600' : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedClient(client)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                    {client.businessName[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{client.businessName}</h3>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{client.contactPerson} • {client.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[client.status]}`}>
                    {statusLabels[client.status]}
                  </span>
                  {canEdit && (
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => { setEditingClient(client); setShowForm(true); }} className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}>
                        <Edit2 size={14} className={isDark ? 'text-slate-400' : 'text-gray-500'} />
                      </button>
                      {user?.role === 'ceo' && (
                        <button onClick={() => handleDelete(client.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                          <Trash2 size={14} className="text-red-500" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className={`mt-3 flex flex-wrap gap-4 text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                {client.phone && <span className="flex items-center gap-1"><Phone size={12} /> {client.phone}</span>}
                {client.email && <span className="flex items-center gap-1"><Mail size={12} /> {client.email}</span>}
                {client.location && <span className="flex items-center gap-1"><MapPin size={12} /> {client.location}</span>}
                {client.agreedPrice > 0 && <span className="font-medium text-green-500">{client.agreedPrice.toLocaleString()} SAR</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Client Detail Modal */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setSelectedClient(null)}>
          <div className={`w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl p-6 ${isDark ? 'bg-slate-800' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedClient.businessName}</h2>
              <button onClick={() => setSelectedClient(null)} className={`p-1 rounded-lg ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}>
                <X size={18} className={isDark ? 'text-slate-400' : 'text-gray-500'} />
              </button>
            </div>
            <div className="space-y-3">
              {[
                ['Contact Person', selectedClient.contactPerson],
                ['Phone', selectedClient.phone],
                ['WhatsApp', selectedClient.whatsapp],
                ['Email', selectedClient.email],
                ['Location', selectedClient.location],
                ['Category', selectedClient.category],
                ['Service Requested', selectedClient.serviceRequested],
                ['Quoted Price', selectedClient.quotedPrice ? `${selectedClient.quotedPrice.toLocaleString()} SAR` : ''],
                ['Agreed Price', selectedClient.agreedPrice ? `${selectedClient.agreedPrice.toLocaleString()} SAR` : ''],
                ['Lead Source', selectedClient.leadSource],
                ['Status', statusLabels[selectedClient.status]],
                ['Website', selectedClient.websiteUrl],
                ['Social Media', selectedClient.socialMedia],
                ['Notes', selectedClient.notes],
              ].filter(([, v]) => v).map(([label, value]) => (
                <div key={label} className="flex justify-between">
                  <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{label}</span>
                  <span className={`text-sm font-medium text-right max-w-[60%] ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <ClientForm
          client={editingClient}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditingClient(null); }}
          isDark={isDark}
          users={store.getUsers()}
        />
      )}
    </div>
  );
}

function ClientForm({ client, onSave, onClose, isDark, users }: {
  client: Client | null;
  onSave: (data: Partial<Client>) => void;
  onClose: () => void;
  isDark: boolean;
  users: { id: string; name: string }[];
}) {
  const [form, setForm] = useState<Partial<Client>>(client || {
    businessName: '', category: '', contactPerson: '', phone: '', whatsapp: '',
    email: '', location: '', googleMapsLink: '', websiteUrl: '', socialMedia: '',
    serviceRequested: '', quotedPrice: 0, agreedPrice: 0, leadSource: '',
    assignedTo: users[0]?.id || '', status: 'lead' as ClientStatus, notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  const inputClass = `w-full px-3 py-2 rounded-lg border text-sm ${
    isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-gray-50 border-gray-300'
  } focus:outline-none focus:ring-2 focus:ring-blue-500`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 ${isDark ? 'bg-slate-800' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {client ? 'Edit Client' : 'Add New Client'}
          </h2>
          <button onClick={onClose} className={`p-1 rounded-lg ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Business Name *</label>
              <input type="text" required value={form.businessName || ''} onChange={e => setForm({ ...form, businessName: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Category</label>
              <input type="text" value={form.category || ''} onChange={e => setForm({ ...form, category: e.target.value })} className={inputClass} placeholder="e.g. Restaurant, Retail" />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Contact Person</label>
              <input type="text" value={form.contactPerson || ''} onChange={e => setForm({ ...form, contactPerson: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Phone</label>
              <input type="text" value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>WhatsApp</label>
              <input type="text" value={form.whatsapp || ''} onChange={e => setForm({ ...form, whatsapp: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Email</label>
              <input type="email" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Location</label>
              <input type="text" value={form.location || ''} onChange={e => setForm({ ...form, location: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Website URL</label>
              <input type="url" value={form.websiteUrl || ''} onChange={e => setForm({ ...form, websiteUrl: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Service Requested</label>
              <select value={form.serviceRequested || ''} onChange={e => setForm({ ...form, serviceRequested: e.target.value })} className={inputClass}>
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
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Status</label>
              <select value={form.status || 'lead'} onChange={e => setForm({ ...form, status: e.target.value as ClientStatus })} className={inputClass}>
                {Object.entries(statusLabels).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Quoted Price (SAR)</label>
              <input type="number" value={form.quotedPrice || 0} onChange={e => setForm({ ...form, quotedPrice: Number(e.target.value) })} className={inputClass} />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Agreed Price (SAR)</label>
              <input type="number" value={form.agreedPrice || 0} onChange={e => setForm({ ...form, agreedPrice: Number(e.target.value) })} className={inputClass} />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Lead Source</label>
              <input type="text" value={form.leadSource || ''} onChange={e => setForm({ ...form, leadSource: e.target.value })} className={inputClass} placeholder="e.g. Instagram, Referral" />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Assigned To</label>
              <select value={form.assignedTo || ''} onChange={e => setForm({ ...form, assignedTo: e.target.value })} className={inputClass}>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Notes</label>
            <textarea value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} className={`${inputClass} h-20 resize-none`} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className={`px-4 py-2 rounded-lg text-sm ${isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-gray-600 hover:bg-gray-100'}`}>
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700">
              {client ? 'Update Client' : 'Add Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
