import React from 'react';
import { getUsers, getLogs, getUser } from '../lib/store';

export default function TeamPage() {
  const dk = document.documentElement.classList.contains('dark');
  const users = getUsers();
  const logs = getLogs();
  const card = `rounded-xl p-6 border ${dk ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`;
  const roles: Record<string, string> = { ceo: 'CEO & Marketing', developer: 'Web Developer', accountant: 'Accountant' };

  return (
    <div className="animate-fade-in">
      <h1 className={`text-2xl font-bold mb-6 ${dk ? 'text-white' : 'text-gray-900'}`}>Team</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {users.map(u => (
          <div key={u.id} className={card}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl">{u.name[0]}</div>
              <div><h3 className={`font-bold ${dk ? 'text-white' : 'text-gray-900'}`}>{u.name}</h3><p className={`text-sm ${dk ? 'text-slate-400' : 'text-gray-500'}`}>{roles[u.role]}</p></div>
            </div>
            <p className={`text-sm ${dk ? 'text-slate-300' : 'text-gray-600'}`}>{u.email}</p>
          </div>
        ))}
      </div>
      <div className={card}>
        <h3 className={`font-semibold mb-4 ${dk ? 'text-white' : 'text-gray-900'}`}>Activity Log</h3>
        {logs.length === 0 ? <p className={dk ? 'text-slate-400' : 'text-gray-500'}>No activity</p> : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {logs.slice(0, 30).map(l => {
              const u = getUser(l.userId);
              return (
                <div key={l.id} className={`flex items-start gap-3 p-2 rounded-lg ${dk ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'}`}>
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{u?.name?.[0]}</div>
                  <div><p className={`text-sm ${dk ? 'text-white' : 'text-gray-900'}`}>{l.details}</p><p className={`text-xs ${dk ? 'text-slate-400' : 'text-gray-500'}`}>{u?.name} • {new Date(l.createdAt).toLocaleString()}</p></div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
