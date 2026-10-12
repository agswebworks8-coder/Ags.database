import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { getPlans, getSubs, getTickets, addSub, addTicket, updateTicket, getClient, getClients, getUsers } from '../lib/store';
import type { Priority } from '../lib/types';

export default function MaintenancePage() {
  const dk = document.documentElement.classList.contains('dark');
  const [tab, setTab] = useState<'overview' | 'subs' | 'tickets' | 'plans'>('overview');
  const plans = getPlans();
  const subs = getSubs();
  const tickets = getTickets();
  const { user } = useAuth();
  const [showSub, setShowSub] = useState(false);
  const [showTkt, setShowTkt] = useState(false);
  const card = `rounded-xl p-5 border ${dk ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`;
  const inp = `w-full px-3 py-2 rounded-lg border text-sm ${dk ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-300'}`;
  const active = subs.filter(s => s.status === 'active');
  const mrr = active.reduce((s, sub) => { const p = plans.find(x => x.id === sub.planId); return s + (sub.customPrice || p?.monthlyPrice || 0); }, 0);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className={`text-2xl font-bold ${dk ? 'text-white' : 'text-gray-900'}`}>Maintenance</h1></div>
        <div className="flex gap-2">
          {user?.role !== 'developer' && <button onClick={() => setShowSub(true)} className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm"><Plus size={16} />Subscription</button>}
          <button onClick={() => setShowTkt(true)} className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg text-sm"><Plus size={16} />Ticket</button>
        </div>
      </div>
      <div className={`flex gap-1 mb-6 p-1 rounded-lg ${dk ? 'bg-slate-800' : 'bg-gray-100'}`}>
        {(['overview', 'subs', 'tickets', 'plans'] as const).map(t => <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2 rounded-md text-sm font-medium capitalize ${tab === t ? 'bg-blue-600 text-white' : dk ? 'text-slate-300' : 'text-gray-600'}`}>{t}</button>)}
      </div>
      {tab === 'overview' && (
        <div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className={card}><p className={`text-xl font-bold ${dk ? 'text-white' : 'text-gray-900'}`}>{active.length}</p><p className={`text-xs ${dk ? 'text-slate-400' : 'text-gray-500'}`}>Active Subs</p></div>
            <div className={card}><p className={`text-xl font-bold ${dk ? 'text-white' : 'text-gray-900'}`}>{mrr.toLocaleString()} SAR</p><p className={`text-xs ${dk ? 'text-slate-400' : 'text-gray-500'}`}>MRR</p></div>
            <div className={card}><p className={`text-xl font-bold ${dk ? 'text-white' : 'text-gray-900'}`}>{tickets.filter(t => !['completed', 'closed'].includes(t.status)).length}</p><p className={`text-xs ${dk ? 'text-slate-400' : 'text-gray-500'}`}>Open Tickets</p></div>
            <div className={card}><p className={`text-xl font-bold ${dk ? 'text-white' : 'text-gray-900'}`}>{subs.length}</p><p className={`text-xs ${dk ? 'text-slate-400' : 'text-gray-500'}`}>Total Subs</p></div>
          </div>
        </div>
      )}
      {tab === 'subs' && (
        <div className={card}>
          {subs.length === 0 ? <p className={`text-center py-8 ${dk ? 'text-slate-400' : 'text-gray-500'}`}>No subscriptions</p> : (
            <table className="w-full text-sm">
              <thead><tr>{['Client', 'Website', 'Plan', 'Price', 'Status'].map(h => <th key={h} className={`text-left py-3 px-2 ${dk ? 'text-slate-300' : 'text-gray-600'}`}>{h}</th>)}</tr></thead>
              <tbody>
                {subs.map(s => {
                  const c = getClient(s.clientId);
                  const p = plans.find(x => x.id === s.planId);
                  return <tr key={s.id}><td className="py-3 px-2">{c?.businessName}</td><td className="py-3 px-2">{s.websiteDomain}</td><td className="py-3 px-2">{p?.name || s.planType}</td><td className="py-3 px-2 font-medium">{(s.customPrice || p?.monthlyPrice || 0).toLocaleString()} SAR</td><td className="py-3 px-2"><span className={`text-xs px-2 py-0.5 rounded-full ${s.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{s.status}</span></td></tr>;
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
      {tab === 'tickets' && (
        <div className="space-y-3">
          {tickets.length === 0 ? <div className={`text-center py-12 rounded-xl border ${dk ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}><p className={dk ? 'text-slate-400' : 'text-gray-500'}>No tickets</p></div> : tickets.map(t => {
            const c = getClient(t.clientId);
            return (
              <div key={t.id} className={card}>
                <div className="flex items-start justify-between">
                  <div><p className={`font-medium ${dk ? 'text-white' : 'text-gray-900'}`}>{t.issueDescription}</p><p className={`text-sm ${dk ? 'text-slate-400' : 'text-gray-500'}`}>{c?.businessName}</p></div>
                  <select value={t.status} onChange={e => { updateTicket(t.id, { status: e.target.value }); }} className={`text-xs px-2 py-1 rounded border ${dk ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-300'}`}>
                    <option value="new">New</option><option value="in_progress">In Progress</option><option value="waiting_client">Waiting</option><option value="completed">Completed</option><option value="closed">Closed</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {tab === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map(p => (
            <div key={p.id} className={card}>
              <h3 className={`font-bold text-lg mb-2 ${dk ? 'text-white' : 'text-gray-900'}`}>{p.name}</h3>
              <p className={`text-2xl font-bold mb-4 ${dk ? 'text-white' : 'text-gray-900'}`}>{p.monthlyPrice > 0 ? `${p.monthlyPrice} SAR/mo` : 'Price not set'}</p>
              <ul className="space-y-2">
                {p.features.map((f, i) => <li key={i} className={`flex items-start gap-2 text-sm ${dk ? 'text-slate-300' : 'text-gray-600'}`}><span className="text-green-500">✓</span>{f}</li>)}
              </ul>
            </div>
          ))}
        </div>
      )}
      {showSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowSub(false)}>
          <div className={`w-full max-w-lg rounded-2xl p-6 ${dk ? 'bg-slate-800' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
            <h2 className={`text-lg font-bold mb-4 ${dk ? 'text-white' : 'text-gray-900'}`}>New Subscription</h2>
            <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.currentTarget); addSub({ clientId: fd.get('client') as string, websiteDomain: fd.get('domain') as string, planId: fd.get('plan') as string, customPrice: Number(fd.get('price') || 0), nextBillingDate: fd.get('billing') as string }); setShowSub(false); }} className="space-y-4">
              <div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Client</label><select name="client" required className={inp}>{getClients().map(c => <option key={c.id} value={c.id}>{c.businessName}</option>)}</select></div>
              <div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Domain</label><input name="domain" className={inp} /></div>
              <div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Plan</label><select name="plan" className={inp}>{plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
              <div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Monthly Price</label><input name="price" type="number" className={inp} /></div>
              <div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Next Billing</label><input name="billing" type="date" className={inp} /></div>
              <button type="submit" className="w-full py-2 rounded-lg bg-blue-600 text-white text-sm">Create</button>
            </form>
          </div>
        </div>
      )}
      {showTkt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowTkt(false)}>
          <div className={`w-full max-w-md rounded-2xl p-6 ${dk ? 'bg-slate-800' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
            <h2 className={`text-lg font-bold mb-4 ${dk ? 'text-white' : 'text-gray-900'}`}>New Ticket</h2>
            <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.currentTarget); addTicket({ clientId: fd.get('client') as string, issueDescription: fd.get('issue') as string, assignedTo: fd.get('assigned') as string, priority: (fd.get('priority') as Priority) || 'medium' }); setShowTkt(false); }} className="space-y-4">
              <div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Client</label><select name="client" required className={inp}>{getClients().map(c => <option key={c.id} value={c.id}>{c.businessName}</option>)}</select></div>
              <div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Issue</label><textarea name="issue" required className={`${inp} h-20 resize-none`} /></div>
              <div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Assigned</label><select name="assigned" className={inp}>{getUsers().map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select></div>
              <button type="submit" className="w-full py-2 rounded-lg bg-purple-600 text-white text-sm">Create</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
