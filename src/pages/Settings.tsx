import React, { useState } from 'react';
import { Save, Building2, DollarSign } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { getSettings, updateSettings } from '../lib/store';

export default function SettingsPage() {
  const { user } = useAuth();
  const dk = document.documentElement.classList.contains('dark');
  const [s, setS] = useState(getSettings());
  const [saved, setSaved] = useState(false);

  if (user?.role !== 'ceo') return <div className="text-center py-16"><p className={dk ? 'text-slate-400' : 'text-gray-500'}>Access denied</p></div>;

  const card = `rounded-xl p-6 border ${dk ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`;
  const inp = `w-full px-3 py-2 rounded-lg border text-sm ${dk ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-300'}`;

  return (
    <div className="animate-fade-in">
      <h1 className={`text-2xl font-bold mb-6 ${dk ? 'text-white' : 'text-gray-900'}`}>Settings</h1>
      <div className="max-w-2xl space-y-6">
        <div className={card}>
          <div className="flex items-center gap-2 mb-4"><Building2 size={20} className="text-blue-500" /><h3 className={`font-semibold ${dk ? 'text-white' : 'text-gray-900'}`}>Company</h3></div>
          <div className="space-y-4">
            <div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Name</label><input value={s.companyName} onChange={e => setS({ ...s, companyName: e.target.value })} className={inp} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Email</label><input value={s.companyEmail} onChange={e => setS({ ...s, companyEmail: e.target.value })} className={inp} /></div>
              <div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Phone</label><input value={s.companyPhone} onChange={e => setS({ ...s, companyPhone: e.target.value })} className={inp} /></div>
            </div>
            <div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Address</label><input value={s.companyAddress} onChange={e => setS({ ...s, companyAddress: e.target.value })} className={inp} /></div>
          </div>
        </div>
        <div className={card}>
          <div className="flex items-center gap-2 mb-4"><DollarSign size={20} className="text-green-500" /><h3 className={`font-semibold ${dk ? 'text-white' : 'text-gray-900'}`}>Financial</h3></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Currency</label><input value={s.currency} onChange={e => setS({ ...s, currency: e.target.value })} className={inp} /></div>
            <div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Tax Rate (%)</label><input type="number" value={s.taxRate} onChange={e => setS({ ...s, taxRate: Number(e.target.value) })} className={inp} /></div>
          </div>
        </div>
        <button onClick={() => { updateSettings(s); setSaved(true); setTimeout(() => setSaved(false), 2000); }} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-600/25">
          <Save size={16} />{saved ? '✓ Saved!' : 'Save'}
        </button>
      </div>
    </div>
  );
}
