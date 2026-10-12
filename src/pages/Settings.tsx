import React, { useState } from 'react';
import { useAuth } from '../lib/auth';
import * as store from '../lib/store';
import { Save, Building2, Globe, DollarSign } from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const isDark = document.documentElement.classList.contains('dark');
  const [settings, setSettings] = useState(store.getSettings());
  const [saved, setSaved] = useState(false);

  if (user?.role !== 'ceo') {
    return (
      <div className="animate-fade-in text-center py-16">
        <p className={isDark ? 'text-slate-400' : 'text-gray-500'}>Access denied. Only administrators can access settings.</p>
      </div>
    );
  }

  const handleSave = () => {
    store.updateSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const cardClass = `rounded-xl p-6 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`;
  const inputClass = `w-full px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`;

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Settings</h1>
        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Business configuration</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Company Info */}
        <div className={cardClass}>
          <div className="flex items-center gap-2 mb-4">
            <Building2 size={20} className="text-blue-500" />
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Company Information</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Company Name</label>
              <input type="text" value={settings.companyName} onChange={e => setSettings({ ...settings, companyName: e.target.value })} className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Email</label>
                <input type="email" value={settings.companyEmail} onChange={e => setSettings({ ...settings, companyEmail: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Phone</label>
                <input type="text" value={settings.companyPhone} onChange={e => setSettings({ ...settings, companyPhone: e.target.value })} className={inputClass} />
              </div>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Address</label>
              <input type="text" value={settings.companyAddress} onChange={e => setSettings({ ...settings, companyAddress: e.target.value })} className={inputClass} />
            </div>
          </div>
        </div>

        {/* Financial Settings */}
        <div className={cardClass}>
          <div className="flex items-center gap-2 mb-4">
            <DollarSign size={20} className="text-green-500" />
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Financial Settings</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Currency</label>
              <input type="text" value={settings.currency} onChange={e => setSettings({ ...settings, currency: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Tax Rate (%)</label>
              <input type="number" value={settings.taxRate} onChange={e => setSettings({ ...settings, taxRate: Number(e.target.value) })} className={inputClass} />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Invoice Prefix</label>
              <input type="text" value={settings.invoicePrefix} onChange={e => setSettings({ ...settings, invoicePrefix: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Order Prefix</label>
              <input type="text" value={settings.orderPrefix} onChange={e => setSettings({ ...settings, orderPrefix: e.target.value })} className={inputClass} />
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className={cardClass}>
          <div className="flex items-center gap-2 mb-4">
            <Globe size={20} className="text-purple-500" />
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>System Settings</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Timezone</label>
              <input type="text" value={settings.timezone} onChange={e => setSettings({ ...settings, timezone: e.target.value })} className={inputClass} />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/25"
        >
          <Save size={16} /> {saved ? '✓ Saved!' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
