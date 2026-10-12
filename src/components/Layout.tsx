import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import * as store from '../lib/store';
import {
  LayoutDashboard, Users, ShoppingCart, CheckSquare, CreditCard,
  TrendingDown, UserCog, FolderOpen, BarChart3, Bell, Settings,
  Wrench, LogOut, Menu, X, Moon, Sun, ChevronDown, Search
} from 'lucide-react';
import Logo from './Logo';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['ceo', 'developer', 'accountant'] },
  { path: '/clients', label: 'Clients Database', icon: Users, roles: ['ceo', 'developer', 'accountant'] },
  { path: '/orders', label: 'Orders & Projects', icon: ShoppingCart, roles: ['ceo', 'developer', 'accountant'] },
  { path: '/tasks', label: 'Tasks & Assignments', icon: CheckSquare, roles: ['ceo', 'developer', 'accountant'] },
  { path: '/payments', label: 'Payments & Invoices', icon: CreditCard, roles: ['ceo', 'accountant'] },
  { path: '/expenses', label: 'Expenses & Profit', icon: TrendingDown, roles: ['ceo', 'accountant'] },
  { path: '/team', label: 'Team Members', icon: UserCog, roles: ['ceo'] },
  { path: '/files', label: 'Files & Documents', icon: FolderOpen, roles: ['ceo', 'developer', 'accountant'] },
  { path: '/reports', label: 'Reports & Analytics', icon: BarChart3, roles: ['ceo', 'accountant'] },
  { path: '/maintenance', label: 'Maintenance', icon: Wrench, roles: ['ceo', 'developer', 'accountant'] },
  { path: '/notifications', label: 'Notifications', icon: Bell, roles: ['ceo', 'developer', 'accountant'] },
  { path: '/settings', label: 'Settings', icon: Settings, roles: ['ceo'] },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('ags_dark') === 'true');
  const [notifCount, setNotifCount] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('ags_dark', String(darkMode));
  }, [darkMode]);

  useEffect(() => {
    setNotifCount(store.getUnreadCount());
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredNav = navItems.filter(item => user && item.roles.includes(user.role));

  const roleLabels: Record<string, string> = {
    ceo: 'CEO & Marketing',
    developer: 'Web Developer',
    accountant: 'Accountant',
  };

  return (
    <div className={`min-h-screen flex ${darkMode ? 'dark bg-slate-900' : 'bg-gray-50'}`}>
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-auto ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border-r flex flex-col`}>
        {/* Logo */}
        <div className={`p-5 border-b ${darkMode ? 'border-slate-700' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <Logo size={40} variant={darkMode ? 'white' : 'default'} />
            <div>
              <h1 className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>AGS WEBWORKS</h1>
              <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Management System</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 overflow-y-auto">
          {filteredNav.map(item => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                    : darkMode
                      ? 'text-slate-300 hover:bg-slate-700 hover:text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {item.path === '/notifications' && notifCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notifCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User info */}
        <div className={`p-4 border-t ${darkMode ? 'border-slate-700' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>{user?.name}</p>
              <p className={`text-xs truncate ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>{roleLabels[user?.role || '']}</p>
            </div>
            <button onClick={handleLogout} className={`p-1.5 rounded-lg ${darkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-100 text-gray-400'}`}>
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className={`sticky top-0 z-30 h-16 flex items-center justify-between px-4 lg:px-6 border-b ${
          darkMode ? 'bg-slate-900/95 border-slate-700 backdrop-blur' : 'bg-white/95 border-gray-200 backdrop-blur'
        }`}>
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className={`lg:hidden p-2 rounded-lg ${darkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-gray-100 text-gray-600'}`}>
              <Menu size={20} />
            </button>
            
            {searchOpen ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search clients, orders, tasks..."
                  className={`px-3 py-1.5 rounded-lg text-sm border ${
                    darkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-gray-50 border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 w-64`}
                  autoFocus
                />
                <button onClick={() => { setSearchOpen(false); setSearchQuery(''); }}>
                  <X size={18} className={darkMode ? 'text-slate-400' : 'text-gray-500'} />
                </button>
              </div>
            ) : (
              <button onClick={() => setSearchOpen(true)} className={`p-2 rounded-lg ${darkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-gray-100 text-gray-600'}`}>
                <Search size={20} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg ${darkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-gray-100 text-gray-600'}`}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => navigate('/notifications')}
              className={`relative p-2 rounded-lg ${darkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-gray-100 text-gray-600'}`}
            >
              <Bell size={18} />
              {notifCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {notifCount > 9 ? '9+' : notifCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
