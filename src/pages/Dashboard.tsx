import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import * as store from '../lib/store';
import {
  Users, ShoppingCart, CheckCircle, CreditCard, TrendingUp,
  TrendingDown, AlertTriangle, Clock, DollarSign, Wrench,
  ArrowUpRight, ArrowDownRight, Activity
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const stats = store.getDashboardStats();
  const isDark = document.documentElement.classList.contains('dark');

  if (!stats || !user) return null;

  const cardClass = `rounded-xl p-5 border transition-all hover:shadow-lg ${
    isDark ? 'bg-slate-800 border-slate-700 hover:border-slate-600' : 'bg-white border-gray-200 hover:border-gray-300'
  }`;

  const formatSAR = (n: number) => `${n.toLocaleString()} SAR`;

  // CEO Dashboard
  if (user.role === 'ceo') {
    return (
      <div className="animate-fade-in">
        <div className="mb-6">
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Welcome back, {user.name} 👋
          </h1>
          <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
            Here's your business overview for today
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className={cardClass}>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Users size={20} className="text-blue-500" />
              </div>
              <span className="text-xs font-medium text-green-500 flex items-center gap-0.5">
                <ArrowUpRight size={12} /> Active
              </span>
            </div>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.totalClients}</p>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Total Clients</p>
          </div>

          <div className={cardClass}>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <ShoppingCart size={20} className="text-purple-500" />
              </div>
              <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{stats.newLeads} leads</span>
            </div>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.activeProjects}</p>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Active Projects</p>
          </div>

          <div className={cardClass}>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <DollarSign size={20} className="text-green-500" />
              </div>
              <span className="text-xs font-medium text-green-500 flex items-center gap-0.5">
                <ArrowUpRight size={12} /> This month
              </span>
            </div>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatSAR(stats.totalPaymentsMonth)}</p>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Revenue This Month</p>
          </div>

          <div className={cardClass}>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <TrendingUp size={20} className="text-emerald-500" />
              </div>
              <span className={`text-xs font-medium ${stats.netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {stats.netProfit >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />} Profit
              </span>
            </div>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatSAR(stats.netProfit)}</p>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Net Profit</p>
          </div>
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className={cardClass}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <CreditCard size={20} className="text-amber-500" />
              </div>
              <div>
                <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatSAR(stats.outstandingBalances)}</p>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Outstanding Balances</p>
              </div>
            </div>
          </div>

          <div className={cardClass}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <TrendingDown size={20} className="text-red-500" />
              </div>
              <div>
                <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatSAR(stats.totalExpenses)}</p>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Total Expenses</p>
              </div>
            </div>
          </div>

          <div className={cardClass}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/10">
                <Wrench size={20} className="text-cyan-500" />
              </div>
              <div>
                <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatSAR(stats.mrr)}</p>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Monthly Recurring Revenue</p>
              </div>
            </div>
          </div>

          <div className={cardClass}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/10">
                <CheckCircle size={20} className="text-indigo-500" />
              </div>
              <div>
                <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.completedProjects}</p>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Completed Projects</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Deadlines */}
          <div className={cardClass}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Upcoming Deadlines</h3>
              <button onClick={() => navigate('/orders')} className="text-sm text-blue-500 hover:text-blue-600">View all</button>
            </div>
            {stats.upcomingDeadlines.length === 0 ? (
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>No upcoming deadlines</p>
            ) : (
              <div className="space-y-3">
                {stats.upcomingDeadlines.map(order => {
                  const client = store.getClient(order.clientId);
                  return (
                    <div key={order.id} className={`flex items-center justify-between p-3 rounded-lg ${isDark ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                      <div>
                        <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{order.orderNumber}</p>
                        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{client?.businessName || 'Unknown'}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        order.priority === 'urgent' ? 'bg-red-500/10 text-red-500' :
                        order.priority === 'high' ? 'bg-amber-500/10 text-amber-500' :
                        'bg-blue-500/10 text-blue-500'
                      }`}>
                        {order.internalDeadline}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className={cardClass}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Recent Activity</h3>
              <Activity size={16} className={isDark ? 'text-slate-400' : 'text-gray-400'} />
            </div>
            {stats.recentActivity.length === 0 ? (
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>No recent activity</p>
            ) : (
              <div className="space-y-3">
                {stats.recentActivity.map(log => {
                  const logUser = store.getUser(log.userId);
                  return (
                    <div key={log.id} className={`flex items-start gap-3 p-2 rounded-lg ${isDark ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'}`}>
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {logUser?.name?.[0] || '?'}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{log.details}</p>
                        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                          {logUser?.name} • {new Date(log.createdAt).toLocaleString('en-SA', { timeZone: 'Asia/Riyadh' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Overdue alerts */}
        {stats.overdueTasks.length > 0 && (
          <div className={`mt-6 p-4 rounded-xl border ${isDark ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={18} className="text-red-500" />
              <h3 className="font-semibold text-red-500">Overdue Tasks ({stats.overdueTasks.length})</h3>
            </div>
            <div className="space-y-2">
              {stats.overdueTasks.slice(0, 5).map(task => (
                <div key={task.id} className={`flex items-center justify-between text-sm ${isDark ? 'text-red-200' : 'text-red-700'}`}>
                  <span>{task.title}</span>
                  <span className="text-xs opacity-70">Due: {task.deadline}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Developer Dashboard
  if (user.role === 'developer') {
    const myTasks = store.getTasks().filter(t => t.assignedTo === user.id);
    const myOrders = store.getOrders();
    const inProgress = myTasks.filter(t => t.status === 'in_progress');
    const reviewTasks = myTasks.filter(t => t.status === 'review');
    const overdue = myTasks.filter(t => t.status !== 'completed' && t.deadline && t.deadline < new Date().toISOString().split('T')[0]);

    return (
      <div className="animate-fade-in">
        <div className="mb-6">
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Hey {user.name} 💻
          </h1>
          <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Your development dashboard</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className={cardClass}>
            <div className="p-2 rounded-lg bg-blue-500/10 mb-3 w-fit">
              <ShoppingCart size={20} className="text-blue-500" />
            </div>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{myOrders.length}</p>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>My Projects</p>
          </div>

          <div className={cardClass}>
            <div className="p-2 rounded-lg bg-amber-500/10 mb-3 w-fit">
              <Clock size={20} className="text-amber-500" />
            </div>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{inProgress.length}</p>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>In Progress</p>
          </div>

          <div className={cardClass}>
            <div className="p-2 rounded-lg bg-purple-500/10 mb-3 w-fit">
              <CheckCircle size={20} className="text-purple-500" />
            </div>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{reviewTasks.length}</p>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Awaiting Review</p>
          </div>

          <div className={cardClass}>
            <div className="p-2 rounded-lg bg-red-500/10 mb-3 w-fit">
              <AlertTriangle size={20} className="text-red-500" />
            </div>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{overdue.length}</p>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Overdue Tasks</p>
          </div>
        </div>

        {/* My Projects */}
        <div className={cardClass}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>My Active Projects</h3>
            <button onClick={() => navigate('/orders')} className="text-sm text-blue-500">View all</button>
          </div>
          {myOrders.filter(o => !['closed', 'delivered', 'payment_completed'].includes(o.status)).length === 0 ? (
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>No active projects assigned</p>
          ) : (
            <div className="space-y-3">
              {myOrders.filter(o => !['closed', 'delivered', 'payment_completed'].includes(o.status)).map(order => {
                const client = store.getClient(order.clientId);
                return (
                  <div key={order.id} className={`flex items-center justify-between p-3 rounded-lg ${isDark ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                    <div>
                      <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{order.orderNumber} — {order.serviceType}</p>
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{client?.businessName || 'Unknown client'}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        order.priority === 'urgent' ? 'bg-red-500/10 text-red-500' :
                        order.priority === 'high' ? 'bg-amber-500/10 text-amber-500' :
                        'bg-blue-500/10 text-blue-500'
                      }`}>
                        {order.status.replace(/_/g, ' ')}
                      </span>
                      {order.internalDeadline && (
                        <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Deadline: {order.internalDeadline}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Accountant Dashboard
  if (user.role === 'accountant') {
    const orders = store.getOrders();
    const payments = store.getPayments();
    const pendingOrders = orders.filter(o => !['closed', 'delivered', 'payment_completed'].includes(o.status));
    const thisMonth = new Date().toISOString().slice(0, 7);
    const monthRevenue = payments.filter(p => p.date.startsWith(thisMonth) && p.status === 'paid').reduce((s, p) => s + p.amount, 0);
    const pendingPayments = orders.reduce((s, o) => s + o.remainingBalance, 0);

    return (
      <div className="animate-fade-in">
        <div className="mb-6">
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Hello {user.name} 📊
          </h1>
          <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Financial overview & order tracking</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className={cardClass}>
            <div className="p-2 rounded-lg bg-green-500/10 mb-3 w-fit">
              <DollarSign size={20} className="text-green-500" />
            </div>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatSAR(monthRevenue)}</p>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Revenue This Month</p>
          </div>

          <div className={cardClass}>
            <div className="p-2 rounded-lg bg-amber-500/10 mb-3 w-fit">
              <CreditCard size={20} className="text-amber-500" />
            </div>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatSAR(pendingPayments)}</p>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Pending Payments</p>
          </div>

          <div className={cardClass}>
            <div className="p-2 rounded-lg bg-blue-500/10 mb-3 w-fit">
              <ShoppingCart size={20} className="text-blue-500" />
            </div>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{pendingOrders.length}</p>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Active Orders</p>
          </div>

          <div className={cardClass}>
            <div className="p-2 rounded-lg bg-cyan-500/10 mb-3 w-fit">
              <Wrench size={20} className="text-cyan-500" />
            </div>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatSAR(stats.mrr)}</p>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Maintenance MRR</p>
          </div>
        </div>

        {/* Recent Payments */}
        <div className={cardClass}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Recent Transactions</h3>
            <button onClick={() => navigate('/payments')} className="text-sm text-blue-500">View all</button>
          </div>
          {payments.length === 0 ? (
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>No transactions recorded yet</p>
          ) : (
            <div className="space-y-2">
              {payments.slice(0, 5).map(payment => {
                const client = store.getClient(payment.clientId);
                return (
                  <div key={payment.id} className={`flex items-center justify-between p-3 rounded-lg ${isDark ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                    <div>
                      <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{client?.businessName || 'Unknown'}</p>
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{payment.date} • {payment.method.replace(/_/g, ' ')}</p>
                    </div>
                    <span className="text-sm font-semibold text-green-500">+{formatSAR(payment.amount)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
