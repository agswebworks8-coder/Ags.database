import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { getExpenses, addExpense, getPayments } from '../lib/store';

export default function ExpensesPage() {
  const dk = document.documentElement.classList.contains('dark');
  const [exp, setExp] = useState(getExpenses());
  const [show, setShow] = useState(false);
  const inp = `w-full px-3 py-2 rounded-lg border text-sm ${dk ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-300'}`;
  const card = `rounded-xl p-5 border ${dk ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`;
  const tot = exp.filter(e => e.status !== 'rejected').reduce((s, e) => s + e.amount, 0);
  const rev = getPayments().filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className={`text-2xl font-bold ${dk ? 'text-white' : 'text-gray-900'}`}>Expenses & Profit</h1>
        <button onClick={() => setShow(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"><Plus size={16} />Add</button>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className={card}><p className="text-xl font-bold text-red-500">{tot.toLocaleString()} SAR</p><p className={`text-xs ${dk ? 'text-slate-400' : 'text-gray-500'}`}>Expenses</p></div>
        <div className={card}><p className="text-xl font-bold text-green-500">{rev.toLocaleString()} SAR</p><p className={`text-xs ${dk ? 'text-slate-400' : 'text-gray-500'}`}>Revenue</p></div>
        <div className={card}><p className={`text-xl font-bold ${rev - tot >= 0 ? 'text-green-500' : 'text-red-500'}`}>{(rev - tot).toLocaleString()} SAR</p><p className={`text-xs ${dk ? 'text-slate-400' : 'text-gray-500'}`}>Profit</p></div>
      </div>
      <div className={card}>
        {exp.length === 0 ? <p className={`text-center py-8 ${dk ? 'text-slate-400' : 'text-gray-500'}`}>No expenses</p> : (
          <table className="w-full text-sm">
            <thead><tr>{['Date', 'Category', 'Amount', 'Status'].map(h => <th key={h} className={`text-left py-3 px-2 ${dk ? 'text-slate-300' : 'text-gray-600'}`}>{h}</th>)}</tr></thead>
            <tbody>{exp.map(e => <tr key={e.id}><td className="py-3 px-2">{e.date}</td><td className="py-3 px-2">{e.category}</td><td className="py-3 px-2 text-red-500">-{e.amount.toLocaleString()} SAR</td><td className="py-3 px-2"><span className={`text-xs px-2 py-0.5 rounded-full ${e.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{e.status}</span></td></tr>)}</tbody>
          </table>
        )}
      </div>
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShow(false)}>
          <div className={`w-full max-w-md rounded-2xl p-6 ${dk ? 'bg-slate-800' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
            <h2 className={`text-lg font-bold mb-4 ${dk ? 'text-white' : 'text-gray-900'}`}>Add Expense</h2>
            <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.currentTarget); addExpense({ category: fd.get('cat') as string, amount: Number(fd.get('amount')), description: fd.get('desc') as string }); setExp(getExpenses()); setShow(false); }} className="space-y-4">
              <div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Category</label>
                <select name="cat" required className={inp}><option>Hosting & Domains</option><option>Software</option><option>Marketing</option><option>Office</option><option>Other</option></select>
              </div>
              <div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Amount (SAR)</label><input name="amount" type="number" required className={inp} /></div>
              <div><label className={`block text-sm mb-1 ${dk ? 'text-slate-300' : 'text-gray-700'}`}>Description</label><input name="desc" className={inp} /></div>
              <button type="submit" className="w-full py-2 rounded-lg bg-blue-600 text-white text-sm">Add</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
