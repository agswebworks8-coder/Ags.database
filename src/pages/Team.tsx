import React from 'react';
import { useAuth } from '../lib/auth';
import * as store from '../lib/store';
import { Shield, Code, Calculator, Mail, Calendar } from 'lucide-react';

export default function Team() {
  const { user } = useAuth();
  const isDark = document.documentElement.classList.contains('dark');
  const users = store.getUsers();
  const activityLogs = store.getActivityLogs();

  const roleIcons: Record<string, React.ReactNode> = {
    ceo: <Shield size={20} className="text-purple-500" />,
    developer: <Code size={20} className="text-blue-500" />,
    accountant: <Calculator size={20} className="text-green-500" />,
  };

  const roleLabels: Record<string, string> = {
    ceo: 'CEO & Marketing Manager',
    developer: 'Web Developer',
    accountant: 'Accountant & Order Coordinator',
  };

  const roleDescriptions: Record<string, string> = {
    ceo: 'Full administrative access. Manage clients, orders, payments, team, and all business settings.',
    developer: 'View assigned projects, update development status, add project links, manage technical tasks.',
    accountant: 'Track orders, manage payments and invoices, record expenses, generate reports.',
  };

  const cardClass = `rounded-xl p-6 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`;

  // Get workload for each user
  const getWorkload = (userId: string) => {
    const tasks = store.getTasks().filter(t => t.assignedTo === userId && t.status !== 'completed');
    const orders = store.getOrders().filter(o => o.assignedDeveloper === userId && !['closed', 'delivered', 'payment_completed'].includes(o.status));
    return { tasks: tasks.length, orders: orders.length };
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Team Members</h1>
        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{users.length} team members</p>
      </div>

      {/* Team Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {users.map(u => {
          const workload = getWorkload(u.id);
          return (
            <div key={u.id} className={cardClass}>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
                  {u.name[0]}
                </div>
                <div>
                  <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{u.name}</h3>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{roleLabels[u.role]}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-3">
                {roleIcons[u.role]}
                <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{roleDescriptions[u.role]}</span>
              </div>
              <div className={`flex items-center gap-4 text-sm ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                <span className="flex items-center gap-1"><Mail size={14} /> {u.email}</span>
              </div>
              <div className={`mt-4 pt-4 border-t ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
                <div className="flex justify-between text-sm">
                  <span className={isDark ? 'text-slate-400' : 'text-gray-500'}>Active Tasks</span>
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{workload.tasks}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className={isDark ? 'text-slate-400' : 'text-gray-500'}>Active Projects</span>
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{workload.orders}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Activity Log */}
      <div className={cardClass}>
        <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Activity Log</h3>
        {activityLogs.length === 0 ? (
          <p className={`text-center py-4 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>No activity recorded yet</p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {activityLogs.slice(0, 50).map(log => {
              const logUser = store.getUser(log.userId);
              return (
                <div key={log.id} className={`flex items-start gap-3 p-2 rounded-lg ${isDark ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'}`}>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {logUser?.name?.[0] || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{log.details}</p>
                    <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                      <span>{logUser?.name}</span>
                      <span>•</span>
                      <span>{log.action}</span>
                      <span>•</span>
                      <Calendar size={10} />
                      <span>{new Date(log.createdAt).toLocaleString('en-SA', { timeZone: 'Asia/Riyadh' })}</span>
                    </div>
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
