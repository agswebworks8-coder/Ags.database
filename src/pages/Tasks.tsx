import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { getTasks, addTask, updateTask, getUser, getUsers } from '../lib/store';
import type { Task, TaskStatus, Priority } from '../lib/types';

export default function TasksPage() {
  const dk = document.documentElement.classList.contains('dark');
  const [tsk, setTsk] = useState(getTasks());
  const [show, setShow] = useState(false);
  const inp = `w-full px-3 py-2 rounded-lg border text-sm ${dk ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-300'}`;
  const save = (d: Partial<Task>) => { addTask(d); setTsk(getTasks()); setShow(false); };
  const today = new Date().toISOString().split('T')[0];
  const statusColors: Record<string, string> = { todo: 'bg-gray-100 text-gray-700', in_progress: 'bg-blue-100 text-blue-700', waiting: 'bg-amber-100 text-amber-700', review: 'bg-purple-100 text-purple-700', completed: 'bg-green-100 text-green-700' };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className={`text-2xl font-bold ${dk ? 'text-white' : 'text-gray-900'}`}>Tasks</h1><p className={`text-sm ${dk ? 'text-slate-400' : 'text-gray-500'}`}>{tsk.length} tasks</p></div>
        <button onClick={() => setShow(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"><Plus size={16} />New Task</button>
      </div>
      <div className="space-y-3">
        {tsk.map(t => {
          const a = getUser(t.assignedTo);
          const od = t.status !== 'completed' && t.deadline && t.deadline < today;
          return (
            <div key={t.id} className={`p-4 rounded-xl border ${dk ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} ${od ? 'border-red-300' : ''}`}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className={`font-medium ${dk ? 'text-white' : 'text-gray-900'} ${t.status === 'completed' ? 'line-through opacity-60' : ''}`}>{t.title}</h3>
                  {t.description && <p className={`text-sm mt-1 ${dk ? 'text-slate-400' : 'text-gray-500'}`}>{t.description}</p>}
                  <div className={`flex gap-4 mt-2 text-xs ${dk ? 'text-slate-400' : 'text-gray-500'}`}>
                    {a && <span>→ {a.name}</span>}
                    {t.deadline && <span>📅 {t.deadline}</span>}
                    {od && <span className="text-red-500 font-medium">⚠ Overdue</span>}
                  </div>
                </div>
                <select value={t.status} onChange={e => { updateTask(t.id, { status: e.target.value as TaskStatus }); setTsk(getTasks()); }} className={`text-xs px-2 py-1 rounded-lg border ${statusColors[t.status]}`}>
                  <option value="todo">To Do</option><option value="in_progress">In Progress</option><option value="waiting">Waiting</option><option value="review">Review</option><option value="completed">Completed</option>
                </select>
              </div>
            </div>
          );
        })}
      </div>
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShow(false)}>
          <div className={`w-full max-w-md rounded-2xl p-6 ${dk ? 'bg-slate-800' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
            <h2 className={`text-lg font-bold mb-4 ${dk ? 'text-white' : 'text-gray-900'}`}>New Task</h2>
            <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.currentTarget); save({ title: fd.get('title') as string, description: fd.get('desc') as string, assignedTo: fd.get('assigned') as string, priority: (fd.get('priority') as Priority) || 'medium', deadline: fd.get('deadline') as string }); }} className="space-y-4">
              <div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Title *</label><input name="title" required className={inp} /></div>
              <div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Assigned To</label>
                <select name="assigned" className={inp}>{getUsers().map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Priority</label>
                  <select name="priority" className={inp}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option></select>
                </div>
                <div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Deadline</label><input name="deadline" type="date" className={inp} /></div>
              </div>
              <div className="flex justify-end"><button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm">Create</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
