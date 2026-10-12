import React from 'react';
import { Download } from 'lucide-react';
import { getPayments, getExpenses, getOrders, getClients, getClient, getUsers, getTasks } from '../lib/store';
import { exportCSV } from '../lib/store';

export default function ReportsPage() {
  const dk = document.documentElement.classList.contains('dark');
  const pmts = getPayments().filter(p => p.status === 'paid');
  const exp = getExpenses().filter(e => e.status !== 'rejected');
  const ords = getOrders();
  const rev = pmts.reduce((s, p) => s + p.amount, 0);
  const tot = exp.reduce((s, e) => s + e.amount, 0);
  const card = `rounded-xl p-6 border ${dk ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`;
  const byStatus = ords.reduce((a, o) => { a[o.status] = (a[o.status] || 0) + 1; return a; }, {} as Record<string, number>);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className={`text-2xl font-bold ${dk ? 'text-white' : 'text-gray-900'}`}>Reports</h1>
        <button onClick={() => exportCSV(pmts.map(p => ({ date: p.date, amount: p.amount, client: getClient(p.clientId)?.businessName || '' })), 'report')} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm"><Download size={16} />Export CSV</button>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className={card}><p className="text-xl font-bold text-green-500">{rev.toLocaleString()} SAR</p><p className={`text-xs ${dk ? 'text-slate-400' : 'text-gray-500'}`}>Revenue</p></div>
        <div className={card}><p className="text-xl font-bold text-red-500">{tot.toLocaleString()} SAR</p><p className={`text-xs ${dk ? 'text-slate-400' : 'text-gray-500'}`}>Expenses</p></div>
        <div className={card}><p className={`text-xl font-bold ${rev - tot >= 0 ? 'text-green-500' : 'text-red-500'}`}>{(rev - tot).toLocaleString()} SAR</p><p className={`text-xs ${dk ? 'text-slate-400' : 'text-gray-500'}`}>Profit</p></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={card}>
          <h3 className={`font-semibold mb-4 ${dk ? 'text-white' : 'text-gray-900'}`}>Orders by Status</h3>
          {Object.keys(byStatus).length === 0 ? <p className={`text-sm ${dk ? 'text-slate-400' : 'text-gray-500'}`}>No data</p> : (
            <div className="space-y-2">
              {Object.entries(byStatus).map(([s, c]) => (
                <div key={s} className="flex items-center gap-3">
                  <span className={`text-sm w-32 truncate ${dk ? 'text-slate-300' : 'text-gray-600'}`}>{s.replace(/_/g, ' ')}</span>
                  <div className="flex-1 h-6 rounded-full bg-gray-200 dark:bg-slate-700 overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full flex items-center justify-end pr-2" style={{ width: `${(c / ords.length) * 100}%` }}>
                      <span className="text-xs text-white">{c}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className={card}>
          <h3 className={`font-semibold mb-4 ${dk ? 'text-white' : 'text-gray-900'}`}>Team Workload</h3>
          <div className="space-y-3">
            {getUsers().map(u => {
              const t = getTasks().filter(x => x.assignedTo === u.id && x.status !== 'completed').length;
              const o = getOrders().filter(x => x.assignedDeveloper === u.id && !['closed', 'delivered', 'payment_completed'].includes(x.status)).length;
              return (
                <div key={u.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">{u.name[0]}</div>
                  <div className="flex-1"><p className={`text-sm font-medium ${dk ? 'text-white' : 'text-gray-900'}`}>{u.name}</p><p className={`text-xs ${dk ? 'text-slate-400' : 'text-gray-500'}`}>{t} tasks • {o} projects</p></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
