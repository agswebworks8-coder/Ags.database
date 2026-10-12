import React, { useState } from 'react';
import { useAuth } from '../lib/auth';
import * as store from '../lib/store';
import { BarChart3, Download, TrendingUp, Users, ShoppingCart, DollarSign, FileText } from 'lucide-react';
import { generateMaintenanceReport } from '../lib/pdfGenerator';

export default function Reports() {
  const { user } = useAuth();
  const isDark = document.documentElement.classList.contains('dark');
  const [dateFrom, setDateFrom] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);

  const payments = store.getPayments().filter(p => p.status === 'paid');
  const expenses = store.getExpenses().filter(e => e.status !== 'rejected');
  const orders = store.getOrders();
  const clients = store.getClients();

  const filteredPayments = payments.filter(p => p.date >= dateFrom && p.date <= dateTo);
  const filteredExpenses = expenses.filter(e => e.date >= dateFrom && e.date <= dateTo);

  const totalRevenue = filteredPayments.reduce((s, p) => s + p.amount, 0);
  const totalExpenses = filteredExpenses.reduce((s, e) => s + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;

  const ordersByStatus = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const revenueByService = orders.reduce((acc, o) => {
    acc[o.serviceType] = (acc[o.serviceType] || 0) + o.price;
    return acc;
  }, {} as Record<string, number>);

  const clientsByStatus = clients.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const cardClass = `rounded-xl p-6 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`;

  const handleExport = () => {
    const data = filteredPayments.map(p => ({
      date: p.date, amount: p.amount, method: p.method, client: store.getClient(p.clientId)?.businessName || '',
    }));
    store.exportCSV(data, `payments_report_${dateFrom}_${dateTo}`);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Reports & Analytics</h1>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Business performance insights</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
            <Download size={16} /> Export CSV
          </button>
          <button onClick={() => generateMaintenanceReport()} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">
            <FileText size={16} /> PDF Report
          </button>
        </div>
      </div>

      {/* Date Filter */}
      <div className={`flex flex-wrap items-center gap-4 mb-6 p-4 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
        <label className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>From:</label>
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className={`px-3 py-1.5 rounded-lg border text-sm ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-300'}`} />
        <label className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>To:</label>
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className={`px-3 py-1.5 rounded-lg border text-sm ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-300'}`} />
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className={cardClass}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10"><DollarSign size={20} className="text-green-500" /></div>
            <div>
              <p className={`text-xl font-bold text-green-500`}>{totalRevenue.toLocaleString()} SAR</p>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Revenue</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10"><TrendingUp size={20} className="text-red-500" /></div>
            <div>
              <p className={`text-xl font-bold text-red-500`}>{totalExpenses.toLocaleString()} SAR</p>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Expenses</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10"><BarChart3 size={20} className="text-blue-500" /></div>
            <div>
              <p className={`text-xl font-bold ${netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>{netProfit.toLocaleString()} SAR</p>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Net Profit</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts / Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders by Status */}
        <div className={cardClass}>
          <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Orders by Status</h3>
          {Object.keys(ordersByStatus).length === 0 ? (
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>No orders yet</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(ordersByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center gap-3">
                  <span className={`text-sm w-32 truncate ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>{status.replace(/_/g, ' ')}</span>
                  <div className="flex-1 h-6 rounded-full bg-gray-200 dark:bg-slate-700 overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full flex items-center justify-end pr-2" style={{ width: `${(count / orders.length) * 100}%` }}>
                      <span className="text-xs text-white font-medium">{count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Revenue by Service */}
        <div className={cardClass}>
          <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Revenue by Service</h3>
          {Object.keys(revenueByService).length === 0 ? (
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>No revenue data</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(revenueByService).sort((a, b) => b[1] - a[1]).map(([service, amount]) => (
                <div key={service} className="flex items-center justify-between">
                  <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>{service}</span>
                  <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{amount.toLocaleString()} SAR</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Clients by Status */}
        <div className={cardClass}>
          <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Clients Pipeline</h3>
          {Object.keys(clientsByStatus).length === 0 ? (
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>No clients yet</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(clientsByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className={`text-sm capitalize ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>{status}</span>
                  <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-700'}`}>{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Team Workload */}
        <div className={cardClass}>
          <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Team Workload</h3>
          <div className="space-y-3">
            {store.getUsers().map(u => {
              const userTasks = store.getTasks().filter(t => t.assignedTo === u.id && t.status !== 'completed').length;
              const userOrders = store.getOrders().filter(o => o.assignedDeveloper === u.id && !['closed', 'delivered', 'payment_completed'].includes(o.status)).length;
              return (
                <div key={u.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                    {u.name[0]}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{u.name}</p>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{userTasks} tasks • {userOrders} projects</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
