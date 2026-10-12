import React, { useState, useEffect } from 'react';
import * as store from '../lib/store';
import type { Notification } from '../lib/types';
import { Bell, Check, CheckCheck, AlertTriangle, Info, DollarSign } from 'lucide-react';

export default function Notifications() {
  const isDark = document.documentElement.classList.contains('dark');
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => { setNotifications(store.getNotifications()); }, []);

  const markRead = (id: string) => {
    store.markNotificationRead(id);
    setNotifications(store.getNotifications());
  };

  const markAllRead = () => {
    store.markAllNotificationsRead();
    setNotifications(store.getNotifications());
  };

  const unread = notifications.filter(n => !n.read);
  const cardClass = `rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`;

  const typeIcons: Record<string, React.ReactNode> = {
    info: <Info size={16} className="text-blue-500" />,
    warning: <AlertTriangle size={16} className="text-amber-500" />,
    success: <Check size={16} className="text-green-500" />,
    error: <AlertTriangle size={16} className="text-red-500" />,
    assignment: <Bell size={16} className="text-purple-500" />,
    deadline: <AlertTriangle size={16} className="text-red-500" />,
    payment: <DollarSign size={16} className="text-green-500" />,
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Notifications</h1>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{unread.length} unread</p>
        </div>
        {unread.length > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-500 hover:text-blue-600">
            <CheckCheck size={16} /> Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className={`text-center py-16 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
          <Bell size={48} className={`mx-auto mb-4 ${isDark ? 'text-slate-600' : 'text-gray-300'}`} />
          <p className={`${isDark ? 'text-slate-400' : 'text-gray-500'}`}>No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(notif => (
            <div
              key={notif.id}
              className={`${cardClass} p-4 flex items-start gap-3 cursor-pointer transition-all ${
                !notif.read ? (isDark ? 'border-l-4 border-l-blue-500' : 'border-l-4 border-l-blue-500') : ''
              } ${!notif.read ? (isDark ? 'bg-slate-800/80' : 'bg-blue-50/50') : ''}`}
              onClick={() => markRead(notif.id)}
            >
              <div className={`p-2 rounded-lg flex-shrink-0 ${isDark ? 'bg-slate-700' : 'bg-gray-100'}`}>
                {typeIcons[notif.type] || <Info size={16} className="text-gray-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{notif.title}</p>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{notif.message}</p>
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                  {new Date(notif.createdAt).toLocaleString('en-SA', { timeZone: 'Asia/Riyadh' })}
                </p>
              </div>
              {!notif.read && (
                <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
