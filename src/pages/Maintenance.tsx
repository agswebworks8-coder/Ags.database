import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth';
import * as store from '../lib/store';
import type { MaintenancePlan, MaintenanceSubscription, MaintenanceTicket, SubscriptionStatus, MaintenancePlanType, Priority } from '../lib/types';
import { Plus, X, Wrench, DollarSign, Users, Clock, AlertTriangle, Edit2, FileText, Download } from 'lucide-react';
import { generateMaintenanceInvoicePDF, generateMaintenanceReport } from '../lib/pdfGenerator';

export default function Maintenance() {
  const { user } = useAuth();
  const isDark = document.documentElement.classList.contains('dark');
  const [activeTab, setActiveTab] = useState<'overview' | 'subscriptions' | 'tickets' | 'plans'>('overview');
  const [plans, setPlans] = useState<MaintenancePlan[]>([]);
  const [subscriptions, setSubscriptions] = useState<MaintenanceSubscription[]>([]);
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [showSubForm, setShowSubForm] = useState(false);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [showPlanEdit, setShowPlanEdit] = useState<MaintenancePlan | null>(null);

  useEffect(() => {
    setPlans(store.getMaintenancePlans());
    setSubscriptions(store.getMaintenanceSubscriptions());
    setTickets(store.getMaintenanceTickets());
  }, []);

  const activeSubs = subscriptions.filter(s => s.status === 'active');
  const mrr = activeSubs.reduce((s, sub) => {
    const plan = plans.find(p => p.id === sub.planId);
    return s + (sub.customPrice || plan?.monthlyPrice || 0);
  }, 0);
  const overdueSubs = subscriptions.filter(s => s.status === 'overdue' || s.status === 'payment_due');
  const openTickets = tickets.filter(t => !['completed', 'closed'].includes(t.status));

  const cardClass = `rounded-xl p-5 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`;
  const inputClass = `w-full px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`;

  const statusLabels: Record<SubscriptionStatus, string> = {
    pending: 'Pending', active: 'Active', payment_due: 'Payment Due',
    overdue: 'Overdue', paused: 'Paused', cancelled: 'Cancelled', expired: 'Expired'
  };
  const statusColors: Record<SubscriptionStatus, string> = {
    pending: 'bg-gray-100 text-gray-700', active: 'bg-green-100 text-green-700',
    payment_due: 'bg-amber-100 text-amber-700', overdue: 'bg-red-100 text-red-700',
    paused: 'bg-blue-100 text-blue-700', cancelled: 'bg-gray-100 text-gray-500', expired: 'bg-gray-100 text-gray-500',
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Website Maintenance</h1>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Manage subscriptions, billing, and support</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {user?.role !== 'developer' && (
            <button onClick={() => setShowSubForm(true)} className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
              <Plus size={16} /> New Subscription
            </button>
          )}
          <button onClick={() => setShowTicketForm(true)} className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">
            <Plus size={16} /> New Ticket
          </button>
          <button onClick={() => generateMaintenanceReport()} className="flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm">
            <Download size={16} /> Report PDF
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className={`flex gap-1 mb-6 p-1 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-gray-100'}`}>
        {(['overview', 'subscriptions', 'tickets', 'plans'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-2 rounded-md text-sm font-medium capitalize ${activeTab === tab ? 'bg-blue-600 text-white' : isDark ? 'text-slate-300' : 'text-gray-600'}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className={cardClass}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/10"><Wrench size={20} className="text-cyan-500" /></div>
                <div>
                  <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{activeSubs.length}</p>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Active Subscriptions</p>
                </div>
              </div>
            </div>
            <div className={cardClass}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10"><DollarSign size={20} className="text-green-500" /></div>
                <div>
                  <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{mrr.toLocaleString()} SAR</p>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Monthly Recurring Revenue</p>
                </div>
              </div>
            </div>
            <div className={cardClass}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10"><AlertTriangle size={20} className="text-amber-500" /></div>
                <div>
                  <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{overdueSubs.length}</p>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Overdue / Due</p>
                </div>
              </div>
            </div>
            <div className={cardClass}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10"><FileText size={20} className="text-purple-500" /></div>
                <div>
                  <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{openTickets.length}</p>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Open Tickets</p>
                </div>
              </div>
            </div>
          </div>

          {/* Plan Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={cardClass}>
              <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Plan Distribution</h3>
              <div className="space-y-3">
                {plans.map(plan => {
                  const count = subscriptions.filter(s => s.planId === plan.id && s.status === 'active').length;
                  return (
                    <div key={plan.id} className="flex items-center justify-between">
                      <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>{plan.name}</span>
                      <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-700'}`}>{count} clients</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className={cardClass}>
              <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Recent Tickets</h3>
              {tickets.length === 0 ? (
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>No maintenance tickets</p>
              ) : (
                <div className="space-y-2">
                  {tickets.slice(0, 5).map(ticket => {
                    const client = store.getClient(ticket.clientId);
                    return (
                      <div key={ticket.id} className={`flex items-center justify-between p-2 rounded-lg ${isDark ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                        <div>
                          <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{ticket.issueDescription.slice(0, 40)}...</p>
                          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{client?.businessName}</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          ticket.status === 'completed' ? 'bg-green-100 text-green-700' :
                          ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>{ticket.status.replace(/_/g, ' ')}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Subscriptions Tab */}
      {activeTab === 'subscriptions' && (
        <div className={cardClass}>
          {subscriptions.length === 0 ? (
            <p className={`text-center py-8 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>No maintenance subscriptions yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={isDark ? 'border-b border-slate-700' : 'border-b border-gray-200'}>
                    <th className={`text-left py-3 px-2 font-medium ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>Client</th>
                    <th className={`text-left py-3 px-2 font-medium ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>Website</th>
                    <th className={`text-left py-3 px-2 font-medium ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>Plan</th>
                    <th className={`text-left py-3 px-2 font-medium ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>Price/mo</th>
                    <th className={`text-left py-3 px-2 font-medium ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>Status</th>
                    <th className={`text-left py-3 px-2 font-medium ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>Next Billing</th>
                    <th className={`text-left py-3 px-2 font-medium ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>Action</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-slate-700' : 'divide-gray-100'}`}>
                  {subscriptions.map(sub => {
                    const client = store.getClient(sub.clientId);
                    const plan = plans.find(p => p.id === sub.planId);
                    return (
                      <tr key={sub.id} className={isDark ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'}>
                        <td className={`py-3 px-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{client?.businessName || '-'}</td>
                        <td className={`py-3 px-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>{sub.websiteDomain}</td>
                        <td className={`py-3 px-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>{plan?.name || sub.planType}</td>
                        <td className={`py-3 px-2 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{(sub.customPrice || plan?.monthlyPrice || 0).toLocaleString()} SAR</td>
                        <td className="py-3 px-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[sub.status]}`}>{statusLabels[sub.status]}</span>
                        </td>
                        <td className={`py-3 px-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>{sub.nextBillingDate || '-'}</td>
                        <td className="py-3 px-2">
                          <button
                            onClick={() => generateMaintenanceInvoicePDF(sub.id, sub.nextBillingDate || new Date().toISOString().split('T')[0])}
                            className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          >
                            <Download size={12} /> Invoice
                          </button>
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

      {/* Tickets Tab */}
      {activeTab === 'tickets' && (
        <div className="space-y-3">
          {tickets.length === 0 ? (
            <div className={`text-center py-12 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
              <p className={isDark ? 'text-slate-400' : 'text-gray-500'}>No maintenance tickets</p>
            </div>
          ) : (
            tickets.map(ticket => {
              const client = store.getClient(ticket.clientId);
              const assignee = store.getUser(ticket.assignedTo);
              return (
                <div key={ticket.id} className={cardClass}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{ticket.issueDescription}</p>
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{client?.businessName} • {assignee?.name || 'Unassigned'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        ticket.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                        ticket.priority === 'high' ? 'bg-amber-100 text-amber-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>{ticket.priority}</span>
                      <select
                        value={ticket.status}
                        onChange={(e) => { store.updateMaintenanceTicket(ticket.id, { status: e.target.value as any }); setTickets(store.getMaintenanceTickets()); }}
                        className={`text-xs px-2 py-1 rounded border ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-300'}`}
                      >
                        <option value="new">New</option>
                        <option value="in_progress">In Progress</option>
                        <option value="waiting_client">Waiting Client</option>
                        <option value="completed">Completed</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Plans Tab */}
      {activeTab === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map(plan => (
            <div key={plan.id} className={cardClass}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{plan.name}</h3>
                {user?.role === 'ceo' && (
                  <button onClick={() => setShowPlanEdit(plan)} className="text-blue-500 hover:text-blue-600">
                    <Edit2 size={16} />
                  </button>
                )}
              </div>
              <p className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {plan.monthlyPrice > 0 ? `${plan.monthlyPrice} SAR/mo` : 'Price not set'}
              </p>
              <ul className="space-y-2">
                {plan.features.map((f, i) => (
                  <li key={i} className={`flex items-start gap-2 text-sm ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                    <span className="text-green-500 mt-0.5">✓</span> {f}
                  </li>
                ))}
              </ul>
              <div className={`mt-4 pt-4 border-t ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
                <div className="flex justify-between text-sm">
                  <span className={isDark ? 'text-slate-400' : 'text-gray-500'}>Max Updates/mo</span>
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>{plan.maxUpdates}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className={isDark ? 'text-slate-400' : 'text-gray-500'}>Max Support Tickets/mo</span>
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>{plan.maxSupportTickets}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Subscription Form */}
      {showSubForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowSubForm(false)}>
          <div className={`w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-6 ${isDark ? 'bg-slate-800' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>New Maintenance Subscription</h2>
              <button onClick={() => setShowSubForm(false)}><X size={18} /></button>
            </div>
            <SubscriptionForm
              onSave={(data) => {
                store.addMaintenanceSubscription(data);
                setSubscriptions(store.getMaintenanceSubscriptions());
                setShowSubForm(false);
              }}
              isDark={isDark}
              inputClass={inputClass}
              plans={plans}
              clients={store.getClients()}
              users={store.getUsers()}
            />
          </div>
        </div>
      )}

      {/* Ticket Form */}
      {showTicketForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowTicketForm(false)}>
          <div className={`w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-6 ${isDark ? 'bg-slate-800' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>New Maintenance Ticket</h2>
              <button onClick={() => setShowTicketForm(false)}><X size={18} /></button>
            </div>
            <TicketForm
              onSave={(data) => {
                store.addMaintenanceTicket(data);
                setTickets(store.getMaintenanceTickets());
                setShowTicketForm(false);
              }}
              isDark={isDark}
              inputClass={inputClass}
              subscriptions={subscriptions}
              clients={store.getClients()}
              users={store.getUsers()}
            />
          </div>
        </div>
      )}

      {/* Plan Edit Form */}
      {showPlanEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowPlanEdit(null)}>
          <div className={`w-full max-w-md rounded-2xl p-6 ${isDark ? 'bg-slate-800' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Edit Plan</h2>
              <button onClick={() => setShowPlanEdit(null)}><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Monthly Price (SAR)</label>
                <input type="number" value={showPlanEdit.monthlyPrice} onChange={e => setShowPlanEdit({ ...showPlanEdit, monthlyPrice: Number(e.target.value) })} className={inputClass} />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Max Updates/Month</label>
                <input type="number" value={showPlanEdit.maxUpdates} onChange={e => setShowPlanEdit({ ...showPlanEdit, maxUpdates: Number(e.target.value) })} className={inputClass} />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Max Support Tickets/Month</label>
                <input type="number" value={showPlanEdit.maxSupportTickets} onChange={e => setShowPlanEdit({ ...showPlanEdit, maxSupportTickets: Number(e.target.value) })} className={inputClass} />
              </div>
              <button onClick={() => { store.updateMaintenancePlan(showPlanEdit.id, showPlanEdit); setPlans(store.getMaintenancePlans()); setShowPlanEdit(null); }} className="w-full py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700">
                Save Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SubscriptionForm({ onSave, isDark, inputClass, plans, clients, users }: {
  onSave: (d: Partial<MaintenanceSubscription>) => void; isDark: boolean; inputClass: string;
  plans: MaintenancePlan[]; clients: { id: string; businessName: string }[]; users: { id: string; name: string }[];
}) {
  const [form, setForm] = useState<Partial<MaintenanceSubscription>>({
    clientId: '', websiteDomain: '', websiteUrl: '', planId: plans[0]?.id || '',
    planType: 'value', customPrice: 0, startDate: new Date().toISOString().split('T')[0],
    nextBillingDate: '', status: 'active', assignedTo: '', contractNotes: '',
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
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Website Domain</label>
          <input type="text" value={form.websiteDomain || ''} onChange={e => setForm({ ...form, websiteDomain: e.target.value })} className={inputClass} placeholder="example.com" />
        </div>
        <div>
          <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Website URL</label>
          <input type="url" value={form.websiteUrl || ''} onChange={e => setForm({ ...form, websiteUrl: e.target.value })} className={inputClass} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Plan</label>
          <select value={form.planId} onChange={e => {
            const plan = plans.find(p => p.id === e.target.value);
            setForm({ ...form, planId: e.target.value, planType: plan?.type || 'value', customPrice: plan?.monthlyPrice || 0 });
          }} className={inputClass}>
            {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Monthly Price (SAR)</label>
          <input type="number" value={form.customPrice || 0} onChange={e => setForm({ ...form, customPrice: Number(e.target.value) })} className={inputClass} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Next Billing Date</label>
          <input type="date" value={form.nextBillingDate || ''} onChange={e => setForm({ ...form, nextBillingDate: e.target.value })} className={inputClass} />
        </div>
        <div>
          <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Assigned To</label>
          <select value={form.assignedTo || ''} onChange={e => setForm({ ...form, assignedTo: e.target.value })} className={inputClass}>
            <option value="">Select member</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>
      </div>
      <button type="submit" className="w-full py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700">Create Subscription</button>
    </form>
  );
}

function TicketForm({ onSave, isDark, inputClass, subscriptions, clients, users }: {
  onSave: (d: Partial<MaintenanceTicket>) => void; isDark: boolean; inputClass: string;
  subscriptions: MaintenanceSubscription[]; clients: { id: string; businessName: string }[]; users: { id: string; name: string }[];
}) {
  const [form, setForm] = useState<Partial<MaintenanceTicket>>({
    clientId: '', subscriptionId: '', issueDescription: '', priority: 'medium',
    assignedTo: '', requestDate: new Date().toISOString().split('T')[0],
    expectedCompletion: '', status: 'new', notes: '',
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
        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Issue Description *</label>
        <textarea required value={form.issueDescription || ''} onChange={e => setForm({ ...form, issueDescription: e.target.value })} className={`${inputClass} h-20 resize-none`} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Priority</label>
          <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as Priority })} className={inputClass}>
            <option value="low">Low</option><option value="medium">Medium</option>
            <option value="high">High</option><option value="urgent">Urgent</option>
          </select>
        </div>
        <div>
          <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Assigned To</label>
          <select value={form.assignedTo || ''} onChange={e => setForm({ ...form, assignedTo: e.target.value })} className={inputClass}>
            <option value="">Select member</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>
        <div>
          <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Expected Completion</label>
          <input type="date" value={form.expectedCompletion || ''} onChange={e => setForm({ ...form, expectedCompletion: e.target.value })} className={inputClass} />
        </div>
      </div>
      <button type="submit" className="w-full py-2 rounded-lg bg-purple-600 text-white text-sm hover:bg-purple-700">Create Ticket</button>
    </form>
  );
}
