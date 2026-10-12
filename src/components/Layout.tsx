import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, ShoppingCart, CheckSquare, CreditCard, TrendingDown, UserCog, FolderOpen, BarChart3, Bell, Settings as SettingsIcon, Wrench, LogOut, Menu, Moon, Sun } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { unread } from '../lib/store';
import Logo from './Logo';

export default function Layout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [sidebar, setSidebar] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem('ags_dark') === 'true');
  const [nc, setNc] = useState(unread());

  useEffect(() => {
    if (dark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('ags_dark', String(dark));
  }, [dark]);

  useEffect(() => { setNc(unread()); }, [loc.pathname]);

  const items = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['ceo', 'developer', 'accountant'] },
    { path: '/clients', label: 'Clients', icon: Users, roles: ['ceo', 'developer', 'accountant'] },
    { path: '/orders', label: 'Orders', icon: ShoppingCart, roles: ['ceo', 'developer', 'accountant'] },
    { path: '/tasks', label: 'Tasks', icon: CheckSquare, roles: ['ceo', 'developer', 'accountant'] },
    { path: '/payments', label: 'Payments', icon: CreditCard, roles: ['ceo', 'accountant'] },
    { path: '/expenses', label: 'Expenses', icon: TrendingDown, roles: ['ceo', 'accountant'] },
    { path: '/team', label: 'Team', icon: UserCog, roles: ['ceo'] },
    { path: '/files', label: 'Files', icon: FolderOpen, roles: ['ceo', 'developer', 'accountant'] },
    { path: '/reports', label: 'Reports', icon: BarChart3, roles: ['ceo', 'accountant'] },
    { path: '/maintenance', label: 'Maintenance', icon: Wrench, roles: ['ceo', 'developer', 'accountant'] },
    { path: '/notifications', label: 'Notifications', icon: Bell, roles: ['ceo', 'developer', 'accountant'] },
    { path: '/settings', label: 'Settings', icon: SettingsIcon, roles: ['ceo'] },
  ];

  const filtered = items.filter(i => user && i.roles.includes(user.role));
  const roleLabels: Record<string, string> = { ceo: 'CEO & Marketing', developer: 'Web Developer', accountant: 'Accountant' };

  return (
    <div className={`min-h-screen flex ${dark ? 'dark bg-slate-900' : 'bg-gray-50'}`}>
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 lg:translate-x-0 lg:static ${sidebar ? 'translate-x-0' : '-translate-x-full'} ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border-r flex flex-col`}>
        <div className={`p-5 border-b ${dark ? 'border-slate-700' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <Logo size={40} variant={dark ? 'white' : 'default'} />
            <div>
              <h1 className={`font-bold text-sm ${dark ? 'text-white' : 'text-gray-900'}`}>AGS WEBWORKS</h1>
              <p className={`text-xs ${dark ? 'text-slate-400' : 'text-gray-500'}`}>Management System</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 overflow-y-auto">
          {filtered.map(i => {
            const active = loc.pathname === i.path;
            const Icon = i.icon;
            return (
              <button key={i.path} onClick={() => { nav(i.path); setSidebar(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm font-medium transition-all ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' : dark ? 'text-slate-300 hover:bg-slate-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                <Icon size={18} />
                <span>{i.label}</span>
                {i.path === '/notifications' && nc > 0 && <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{nc}</span>}
              </button>
            );
          })}
        </nav>
        <div className={`p-4 border-t ${dark ? 'border-slate-700' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">{user?.name?.[0]}</div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${dark ? 'text-white' : 'text-gray-900'}`}>{user?.name}</p>
              <p className={`text-xs truncate ${dark ? 'text-slate-400' : 'text-gray-500'}`}>{roleLabels[user?.role || '']}</p>
            </div>
            <button onClick={() => { logout(); nav('/login'); }} className={`p-1.5 rounded-lg ${dark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-100 text-gray-400'}`}><LogOut size={16} /></button>
          </div>
        </div>
      </aside>
      {sidebar && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebar(false)} />}
      <div className="flex-1 flex flex-col min-w-0">
        <header className={`sticky top-0 z-30 h-16 flex items-center justify-between px-4 lg:px-6 border-b ${dark ? 'bg-slate-900/95 border-slate-700 backdrop-blur' : 'bg-white/95 border-gray-200 backdrop-blur'}`}>
          <button onClick={() => setSidebar(true)} className={`lg:hidden p-2 rounded-lg ${dark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-gray-100 text-gray-600'}`}><Menu size={20} /></button>
          <div className="flex items-center gap-2">
            <button onClick={() => setDark(!dark)} className={`p-2 rounded-lg ${dark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-gray-100 text-gray-600'}`}>{dark ? <Sun size={18} /> : <Moon size={18} />}</button>
            <button onClick={() => nav('/notifications')} className={`relative p-2 rounded-lg ${dark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-gray-100 text-gray-600'}`}>
              <Bell size={18} />
              {nc > 0 && <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{nc > 9 ? '9+' : nc}</span>}
            </button>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-auto"><Outlet /></main>
      </div>
    </div>
  );
}
