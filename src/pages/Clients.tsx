import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { getClients, addClient, updateClient, getClient } from '../lib/store';
import type { Client, ClientStatus } from '../lib/types';

export default function ClientsPage() {
  const dk = document.documentElement.classList.contains('dark');
  const [cls, setCls] = useState(getClients());
  const [show, setShow] = useState(false);
  const [edit, setEdit] = useState<Client | null>(null);
  const { user } = useAuth();
  const canEdit = user?.role === 'ceo' || user?.role === 'accountant';
  const inp = `w-full px-3 py-2 rounded-lg border text-sm ${dk ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`;
  const save = (d: Partial<Client>) => { if (edit) updateClient(edit.id, d); else addClient(d); setCls(getClients()); setShow(false); setEdit(null); };
  const statusColors: Record<string, string> = { lead: 'bg-gray-100 text-gray-700', contacted: 'bg-blue-100 text-blue-700', interested: 'bg-purple-100 text-purple-700', negotiation: 'bg-amber-100 text-amber-700', won: 'bg-green-100 text-green-700', active: 'bg-emerald-100 text-emerald-700', lost: 'bg-red-100 text-red-700' };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className={`text-2xl font-bold ${dk ? 'text-white' : 'text-gray-900'}`}>Clients</h1><p className={`text-sm ${dk ? 'text-slate-400' : 'text-gray-500'}`}>{cls.length} total</p></div>
        {canEdit && <button onClick={() => { setEdit(null); setShow(true); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"><Plus size={16} />Add Client</button>}
      </div>
      {cls.length === 0 ? <div className={`text-center py-12 rounded-xl border ${dk ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}><p className={dk ? 'text-slate-400' : 'text-gray-500'}>No clients yet</p></div> : (
        <div className="space-y-3">
          {cls.map(c => (
            <div key={c.id} className={`p-4 rounded-xl border ${dk ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">{c.businessName[0]?.toUpperCase()}</div>
                  <div><h3 className={`font-medium ${dk ? 'text-white' : 'text-gray-900'}`}>{c.businessName}</h3><p className={`text-sm ${dk ? 'text-slate-400' : 'text-gray-500'}`}>{c.contactPerson} • {c.category}</p></div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[c.status] || 'bg-gray-100 text-gray-700'}`}>{c.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShow(false)}>
          <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 ${dk ? 'bg-slate-800' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
            <h2 className={`text-lg font-bold mb-4 ${dk ? 'text-white' : 'text-gray-900'}`}>{edit ? 'Edit' : 'Add'} Client</h2>
            <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.currentTarget); save({ businessName: fd.get('businessName') as string, category: fd.get('category') as string, contactPerson: fd.get('contactPerson') as string, phone: fd.get('phone') as string, email: fd.get('email') as string, location: fd.get('location') as string, status: (fd.get('status') as ClientStatus) || 'lead' }); }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Business Name *</label><input name="businessName" required defaultValue={edit?.businessName} className={inp} /></div>
                <div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Category</label><input name="category" defaultValue={edit?.category} className={inp} /></div>
                <div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Contact</label><input name="contactPerson" defaultValue={edit?.contactPerson} className={inp} /></div>
                <div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Phone</label><input name="phone" defaultValue={edit?.phone} className={inp} /></div>
                <div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Email</label><input name="email" type="email" defaultValue={edit?.email} className={inp} /></div>
                <div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Location</label><input name="location" defaultValue={edit?.location} className={inp} /></div>
                <div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Status</label>
                  <select name="status" defaultValue={edit?.status || 'lead'} className={inp}>
                    <option value="lead">Lead</option><option value="contacted">Contacted</option><option value="interested">Interested</option><option value="negotiation">Negotiation</option><option value="won">Won</option><option value="active">Active</option><option value="lost">Lost</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShow(false)} className={`px-4 py-2 rounded-lg text-sm ${dk ? 'text-slate-300 hover:bg-slate-700' : 'text-gray-600 hover:bg-gray-100'}`}>Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
