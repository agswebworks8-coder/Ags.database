import React from 'react';
import { Users, ShoppingCart, DollarSign, TrendingUp } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { stats, getClient, getUser, getTasks, getOrders, getPayments } from '../lib/store';

export default function DashboardPage() {
  const { user } = useAuth();
  const s = stats();
  const dk = document.documentElement.classList.contains('dark');
  if (!s || !user) return null;

  const card = `rounded-xl p-5 border transition-all hover:shadow-lg ${dk ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`;
  const fmt = (n: number) => `${n.toLocaleString()} SAR`;

  if (user.role === 'ceo') return (
    <div className="animate-fade-in">
      <h1 className={`text-2xl font-bold mb-1 ${dk ? 'text-white' : 'text-gray-900'}`}>Welcome back, {user.name} 👋</h1>
      <p className={`text-sm mb-6 ${dk ? 'text-slate-400' : 'text-gray-500'}`}>Business overview</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { icon: Users, color: 'blue', label: 'Total Clients', value: s.tc, sub: `${s.nl} leads` },
          { icon: ShoppingCart, color: 'purple', label: 'Active Projects', value: s.ap, sub: `${s.cp} completed` },
          { icon: DollarSign, color: 'green', label: 'Revenue (Month)', value: fmt(s.tpm), sub: 'This month' },
          { icon: TrendingUp, color: 'emerald', label: 'Net Profit', value: fmt(s.np), sub: s.np >= 0 ? 'Profitable' : 'Loss' },
        ].map((c, i) => (
          <div key={i} className={card}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-${c.color}-500/10`}><c.icon size={20} className={`text-${c.color}-500`} /></div>
              <div>
                <p className={`text-xl font-bold ${dk ? 'text-white' : 'text-gray-900'}`}>{c.value}</p>
                <p className={`text-xs ${dk ? 'text-slate-400' : 'text-gray-500'}`}>{c.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={card}>
          <h3 className={`font-semibold mb-4 ${dk ? 'text-white' : 'text-gray-900'}`}>Upcoming Deadlines</h3>
          {s.ud.length === 0 ? <p className={`text-sm ${dk ? 'text-slate-400' : 'text-gray-500'}`}>No deadlines</p> : (
            <div className="space-y-2">
              {s.ud.map(o => {
                const c = getClient(o.clientId);
                return (
                  <div key={o.id} className={`flex items-center justify-between p-3 rounded-lg ${dk ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                    <div>
                      <p className={`text-sm font-medium ${dk ? 'text-white' : 'text-gray-900'}`}>{o.orderNumber}</p>
                      <p className={`text-xs ${dk ? 'text-slate-400' : 'text-gray-500'}`}>{c?.businessName}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-500">{o.internalDeadline}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className={card}>
          <h3 className={`font-semibold mb-4 ${dk ? 'text-white' : 'text-gray-900'}`}>Recent Activity</h3>
          {s.ra.length === 0 ? <p className={`text-sm ${dk ? 'text-slate-400' : 'text-gray-500'}`}>No activity</p> : (
            <div className="space-y-2">
              {s.ra.map(l => {
                const u = getUser(l.userId);
                return (
                  <div key={l.id} className={`flex items-start gap-3 p-2 rounded-lg ${dk ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'}`}>
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{u?.name?.[0]}</div>
                    <div>
                      <p className={`text-sm ${dk ? 'text-white' : 'text-gray-900'}`}>{l.details}</p>
                      <p className={`text-xs ${dk ? 'text-slate-400' : 'text-gray-500'}`}>{u?.name} • {new Date(l.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (user.role === 'developer') {
    const myTasks = getTasks().filter(t => t.assignedTo === user.id);
    const myOrders = getOrders();
    return (
      <div className="animate-fade-in">
        <h1 className={`text-2xl font-bold mb-6 ${dk ? 'text-white' : 'text-gray-900'}`}>Hey {user.name} 💻</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={card}><p className={`text-2xl font-bold ${dk ? 'text-white' : 'text-gray-900'}`}>{myOrders.length}</p><p className={`text-sm ${dk ? 'text-slate-400' : 'text-gray-500'}`}>My Projects</p></div>
          <div className={card}><p className={`text-2xl font-bold ${dk ? 'text-white' : 'text-gray-900'}`}>{myTasks.filter(t => t.status === 'in_progress').length}</p><p className={`text-sm ${dk ? 'text-slate-400' : 'text-gray-500'}`}>In Progress</p></div>
          <div className={card}><p className={`text-2xl font-bold ${dk ? 'text-white' : 'text-gray-900'}`}>{myTasks.filter(t => t.status === 'review').length}</p><p className={`text-sm ${dk ? 'text-slate-400' : 'text-gray-500'}`}>Review</p></div>
          <div className={card}><p className={`text-2xl font-bold ${dk ? 'text-white' : 'text-gray-900'}`}>{s.ot.length}</p><p className={`text-sm ${dk ? 'text-slate-400' : 'text-gray-500'}`}>Overdue</p></div>
        </div>
      </div>
    );
  }

  // Accountant
  const pmts = getPayments();
  const ords = getOrders();
  const m = new Date().toISOString().slice(0, 7);
  const mr = pmts.filter(p => p.date.startsWith(m) && p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  return (
    <div className="animate-fade-in">
      <h1 className={`text-2xl font-bold mb-6 ${dk ? 'text-white' : 'text-gray-900'}`}>Hello {user.name} 📊</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={card}><p className={`text-2xl font-bold ${dk ? 'text-white' : 'text-gray-900'}`}>{fmt(mr)}</p><p className={`text-sm ${dk ? 'text-slate-400' : 'text-gray-500'}`}>Revenue (Month)</p></div>
        <div className={card}><p className={`text-2xl font-bold ${dk ? 'text-white' : 'text-gray-900'}`}>{fmt(ords.reduce((s, o) => s + o.remainingBalance, 0))}</p><p className={`text-sm ${dk ? 'text-slate-400' : 'text-gray-500'}`}>Pending</p></div>
        <div className={card}><p className={`text-2xl font-bold ${dk ? 'text-white' : 'text-gray-900'}`}>{ords.filter(o => !['closed', 'delivered', 'payment_completed'].includes(o.status)).length}</p><p className={`text-sm ${dk ? 'text-slate-400' : 'text-gray-500'}`}>Active Orders</p></div>
        <div className={card}><p className={`text-2xl font-bold ${dk ? 'text-white' : 'text-gray-900'}`}>{fmt(s.mrr)}</p><p className={`text-sm ${dk ? 'text-slate-400' : 'text-gray-500'}`}>MRR</p></div>
      </div>
    </div>
  );
}
