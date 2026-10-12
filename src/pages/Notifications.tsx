import React, { useState } from 'react';
import { Bell, CheckCheck, Info, AlertTriangle, DollarSign } from 'lucide-react';
import { getNotifs, markRead, markAllRead } from '../lib/store';

export default function NotificationsPage() {
  const dk = document.documentElement.classList.contains('dark');
  const [notifs, setNotifs] = useState(getNotifs());
  const unread = notifs.filter(n => !n.read);
  const icons: Record<string, React.ReactNode> = { info: <Info size={16} className="text-blue-500" />, warning: <AlertTriangle size={16} className="text-amber-500" />, assignment: <Bell size={16} className="text-purple-500" />, deadline: <AlertTriangle size={16} className="text-red-500" />, payment: <DollarSign size={16} className="text-green-500" /> };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className={`text-2xl font-bold ${dk ? 'text-white' : 'text-gray-900'}`}>Notifications</h1><p className={`text-sm ${dk ? 'text-slate-400' : 'text-gray-500'}`}>{unread.length} unread</p></div>
        {unread.length > 0 && <button onClick={() => { markAllRead(); setNotifs(getNotifs()); }} className="text-sm text-blue-500 flex items-center gap-1"><CheckCheck size={16} />Mark all read</button>}
      </div>
      {notifs.length === 0 ? (
        <div className={`text-center py-16 rounded-xl border ${dk ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
          <Bell size={48} className={`mx-auto mb-4 ${dk ? 'text-slate-600' : 'text-gray-300'}`} />
          <p className={dk ? 'text-slate-400' : 'text-gray-500'}>No notifications</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifs.map(n => (
            <div key={n.id} onClick={() => { markRead(n.id); setNotifs(getNotifs()); }} className={`rounded-xl border p-4 flex items-start gap-3 cursor-pointer ${!n.read ? (dk ? 'border-l-4 border-l-blue-500 bg-slate-800/80' : 'border-l-4 border-l-blue-500 bg-blue-50/50') : dk ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
              <div className={`p-2 rounded-lg flex-shrink-0 ${dk ? 'bg-slate-700' : 'bg-gray-100'}`}>{icons[n.type] || <Info size={16} />}</div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${dk ? 'text-white' : 'text-gray-900'}`}>{n.title}</p>
                <p className={`text-sm ${dk ? 'text-slate-400' : 'text-gray-500'}`}>{n.message}</p>
                <p className={`text-xs mt-1 ${dk ? 'text-slate-500' : 'text-gray-400'}`}>{new Date(n.createdAt).toLocaleString()}</p>
              </div>
              {!n.read && <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
