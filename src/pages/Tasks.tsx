import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth';
import * as store from '../lib/store';
import type { Task, TaskStatus, Priority } from '../lib/types';
import { Plus, X, Edit2, Trash2, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const statusLabels: Record<TaskStatus, string> = {
  todo: 'To Do', in_progress: 'In Progress', waiting: 'Waiting', review: 'Review', completed: 'Completed'
};
const statusColors: Record<TaskStatus, string> = {
  todo: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  waiting: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  review: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};
const priorityColors: Record<Priority, string> = {
  low: 'bg-gray-100 text-gray-600', medium: 'bg-blue-100 text-blue-600',
  high: 'bg-amber-100 text-amber-600', urgent: 'bg-red-100 text-red-600',
};

export default function Tasks() {
  const { user } = useAuth();
  const isDark = document.documentElement.classList.contains('dark');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => { setTasks(store.getTasks()); }, []);

  const filtered = tasks.filter(t => statusFilter === 'all' || t.status === statusFilter);
  const today = new Date().toISOString().split('T')[0];
  const overdue = filtered.filter(t => t.status !== 'completed' && t.deadline && t.deadline < today);

  const handleSave = (data: Partial<Task>) => {
    if (editingTask) store.updateTask(editingTask.id, data);
    else store.addTask(data);
    setTasks(store.getTasks());
    setShowForm(false);
    setEditingTask(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this task?')) {
      store.deleteTask(id);
      setTasks(store.getTasks());
    }
  };

  const handleStatusChange = (id: string, status: TaskStatus) => {
    store.updateTask(id, { status });
    setTasks(store.getTasks());
  };

  const users = store.getUsers();
  const clients = store.getClients();
  const orders = store.getOrders();
  const canAssign = user?.role === 'ceo';

  const cardClass = `rounded-xl p-4 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`;

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Tasks & Assignments</h1>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{tasks.length} tasks • {overdue.length} overdue</p>
        </div>
        <button onClick={() => { setEditingTask(null); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm shadow-lg shadow-blue-600/25">
          <Plus size={16} /> New Task
        </button>
      </div>

      {/* Overdue Alert */}
      {overdue.length > 0 && (
        <div className={`mb-6 p-4 rounded-xl border ${isDark ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-red-500" />
            <span className="text-sm font-medium text-red-500">{overdue.length} Overdue Tasks</span>
          </div>
          <div className="space-y-1">
            {overdue.slice(0, 3).map(t => (
              <p key={t.id} className={`text-sm ${isDark ? 'text-red-200' : 'text-red-700'}`}>• {t.title} (Due: {t.deadline})</p>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button onClick={() => setStatusFilter('all')} className={`px-3 py-1.5 rounded-lg text-sm ${statusFilter === 'all' ? 'bg-blue-600 text-white' : isDark ? 'bg-slate-800 text-slate-300' : 'bg-gray-100 text-gray-600'}`}>All</button>
        {Object.entries(statusLabels).map(([k, v]) => (
          <button key={k} onClick={() => setStatusFilter(k)} className={`px-3 py-1.5 rounded-lg text-sm ${statusFilter === k ? 'bg-blue-600 text-white' : isDark ? 'bg-slate-800 text-slate-300' : 'bg-gray-100 text-gray-600'}`}>{v}</button>
        ))}
      </div>

      {/* Task List */}
      {filtered.length === 0 ? (
        <div className={`text-center py-12 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
          <p className={`${isDark ? 'text-slate-400' : 'text-gray-500'}`}>No tasks found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(task => {
            const assignee = store.getUser(task.assignedTo);
            const client = task.clientId ? store.getClient(task.clientId) : null;
            const isOverdue = task.status !== 'completed' && task.deadline && task.deadline < today;
            return (
              <div key={task.id} className={`${cardClass} ${isOverdue ? 'border-red-300 dark:border-red-500/30' : ''}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'} ${task.status === 'completed' ? 'line-through opacity-60' : ''}`}>{task.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[task.priority]}`}>{task.priority}</span>
                      {isOverdue && <span className="text-xs text-red-500 font-medium">⚠ Overdue</span>}
                    </div>
                    {task.description && <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{task.description}</p>}
                    <div className={`flex items-center gap-4 mt-2 text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                      {assignee && <span>→ {assignee.name}</span>}
                      {client && <span>📁 {client.businessName}</span>}
                      {task.deadline && <span className="flex items-center gap-1"><Clock size={12} /> {task.deadline}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                      className={`text-xs px-2 py-1 rounded-lg border ${statusColors[task.status]} ${isDark ? 'border-slate-600' : 'border-gray-200'}`}
                    >
                      {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                    {(canAssign || task.createdBy === user?.id) && (
                      <div className="flex gap-1">
                        <button onClick={() => { setEditingTask(task); setShowForm(true); }} className={`p-1 rounded ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}>
                          <Edit2 size={14} className={isDark ? 'text-slate-400' : 'text-gray-500'} />
                        </button>
                        {canAssign && (
                          <button onClick={() => handleDelete(task.id)} className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20">
                            <Trash2 size={14} className="text-red-500" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Task Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => { setShowForm(false); setEditingTask(null); }}>
          <div className={`w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-6 ${isDark ? 'bg-slate-800' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{editingTask ? 'Edit Task' : 'New Task'}</h2>
              <button onClick={() => { setShowForm(false); setEditingTask(null); }}><X size={18} /></button>
            </div>
            <TaskFormInner
              task={editingTask}
              onSave={handleSave}
              isDark={isDark}
              users={users}
              clients={clients}
              orders={orders}
              canAssign={!!canAssign}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function TaskFormInner({ task, onSave, isDark, users, clients, orders, canAssign }: {
  task: Task | null; onSave: (d: Partial<Task>) => void; isDark: boolean;
  users: { id: string; name: string }[]; clients: { id: string; businessName: string }[];
  orders: { id: string; orderNumber: string }[]; canAssign: boolean;
}) {
  const [form, setForm] = useState<Partial<Task>>(task || {
    title: '', description: '', assignedTo: '', priority: 'medium', clientId: '',
    orderId: '', startDate: new Date().toISOString().split('T')[0], deadline: '',
    status: 'todo', comments: '',
  });

  const inputClass = `w-full px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`;

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="space-y-4">
      <div>
        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Title *</label>
        <input required type="text" value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} className={inputClass} />
      </div>
      <div>
        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Description</label>
        <textarea value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} className={`${inputClass} h-20 resize-none`} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Assigned To</label>
          <select value={form.assignedTo || ''} onChange={e => setForm({ ...form, assignedTo: e.target.value })} className={inputClass}>
            <option value="">Select member</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>
        <div>
          <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Priority</label>
          <select value={form.priority || 'medium'} onChange={e => setForm({ ...form, priority: e.target.value as Priority })} className={inputClass}>
            <option value="low">Low</option><option value="medium">Medium</option>
            <option value="high">High</option><option value="urgent">Urgent</option>
          </select>
        </div>
        <div>
          <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Start Date</label>
          <input type="date" value={form.startDate || ''} onChange={e => setForm({ ...form, startDate: e.target.value })} className={inputClass} />
        </div>
        <div>
          <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Deadline</label>
          <input type="date" value={form.deadline || ''} onChange={e => setForm({ ...form, deadline: e.target.value })} className={inputClass} />
        </div>
        <div>
          <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Related Client</label>
          <select value={form.clientId || ''} onChange={e => setForm({ ...form, clientId: e.target.value })} className={inputClass}>
            <option value="">None</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.businessName}</option>)}
          </select>
        </div>
        <div>
          <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Related Order</label>
          <select value={form.orderId || ''} onChange={e => setForm({ ...form, orderId: e.target.value })} className={inputClass}>
            <option value="">None</option>
            {orders.map(o => <option key={o.id} value={o.id}>{o.orderNumber}</option>)}
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={() => onSave(form)} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700">
          {task ? 'Update' : 'Create'} Task
        </button>
      </div>
    </form>
  );
}
