import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth';
import * as store from '../lib/store';
import type { Expense } from '../lib/types';
import { Plus, X, TrendingDown, DollarSign, TrendingUp } from 'lucide-react';

const expenseCategories = ['Hosting & Domains', 'Software & Tools', 'Marketing & Ads', 'Office & Equipment', 'Travel', 'Subcontractor', 'Other'];

export default function Expenses() {
  const { user } = useAuth();
  const isDark = document.documentElement.classList.contains('dark');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { setExpenses(store.getExpenses()); }, []);

  const totalExpenses = expenses.filter(e => e.status !== 'rejected').reduce((s, e) => s + e.amount, 0);
  const totalRevenue = store.getPayments().filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const thisMonth = new Date().toISOString().slice(0, 7);
  const monthExpenses = expenses.filter(e => e.date.startsWith(thisMonth) && e.status !== 'rejected').reduce((s, e) => s + e.amount, 0);

  const cardClass = `rounded-xl p-5 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`;
  const inputClass = `w-full px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`;

  const handleSave = (data: Partial<Expense>) => {
    store.addExpense({ ...data, approvedBy: user?.role === 'ceo' ? user.id : '' , status: user?.role === 'ceo' ? 'approved' : 'pending' });
    setExpenses(store.getExpenses());
    setShowForm(false);
  };

  const handleApprove = (id: string) => {
    store.updateExpense(id, { status: 'approved', approvedBy: user?.id });
    setExpenses(store.getExpenses());
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Expenses & Profit</h1>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Track business expenses and profitability</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
          <Plus size={16} /> Add Expense
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className={cardClass}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10"><TrendingDown size={20} className="text-red-500" /></div>
            <div>
              <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{totalExpenses.toLocaleString()} SAR</p>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Total Expenses</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10"><DollarSign size={20} className="text-green-500" /></div>
            <div>
              <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{totalRevenue.toLocaleString()} SAR</p>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Total Revenue</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10"><TrendingUp size={20} className="text-emerald-500" /></div>
            <div>
              <p className={`text-lg font-bold ${netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>{netProfit.toLocaleString()} SAR</p>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Net Profit</p>
            </div>
          </div>
        </div>
        <div className={cardClass}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10"><TrendingDown size={20} className="text-amber-500" /></div>
            <div>
              <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{monthExpenses.toLocaleString()} SAR</p>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>This Month</p>
            </div>
          </div>
        </div>
      </div>

      {/* Expense List */}
      <div className={cardClass}>
        <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Expense Records</h3>
        {expenses.length === 0 ? (
          <p className={`text-center py-8 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>No expenses recorded</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={isDark ? 'border-b border-slate-700' : 'border-b border-gray-200'}>
                  <th className={`text-left py-3 px-2 font-medium ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>Date</th>
                  <th className={`text-left py-3 px-2 font-medium ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>Category</th>
                  <th className={`text-left py-3 px-2 font-medium ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>Description</th>
                  <th className={`text-left py-3 px-2 font-medium ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>Amount</th>
                  <th className={`text-left py-3 px-2 font-medium ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>Status</th>
                  {user?.role === 'ceo' && <th className={`text-left py-3 px-2 font-medium ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>Action</th>}
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-700' : 'divide-gray-100'}`}>
                {expenses.map(exp => (
                  <tr key={exp.id} className={isDark ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'}>
                    <td className={`py-3 px-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>{exp.date}</td>
                    <td className={`py-3 px-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>{exp.category}</td>
                    <td className={`py-3 px-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>{exp.description}</td>
                    <td className="py-3 px-2 font-medium text-red-500">-{exp.amount.toLocaleString()} SAR</td>
                    <td className="py-3 px-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        exp.status === 'approved' ? 'bg-green-100 text-green-700' :
                        exp.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>{exp.status}</span>
                    </td>
                    {user?.role === 'ceo' && (
                      <td className="py-3 px-2">
                        {exp.status === 'pending' && (
                          <button onClick={() => handleApprove(exp.id)} className="text-xs text-blue-500 hover:text-blue-600">Approve</button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Expense Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowForm(false)}>
          <div className={`w-full max-w-md rounded-2xl p-6 ${isDark ? 'bg-slate-800' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Add Expense</h2>
              <button onClick={() => setShowForm(false)}><X size={18} /></button>
            </div>
            <ExpenseForm onSave={handleSave} isDark={isDark} inputClass={inputClass} categories={expenseCategories} />
          </div>
        </div>
      )}
    </div>
  );
}

function ExpenseForm({ onSave, isDark, inputClass, categories }: { onSave: (d: Partial<Expense>) => void; isDark: boolean; inputClass: string; categories: string[] }) {
  const [form, setForm] = useState<Partial<Expense>>({
    category: '', amount: 0, date: new Date().toISOString().split('T')[0],
    description: '', paymentMethod: 'bank_transfer', reference: '',
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="space-y-4">
      <div>
        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Category *</label>
        <select required value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className={inputClass}>
          <option value="">Select category</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Amount (SAR) *</label>
          <input required type="number" value={form.amount || ''} onChange={e => setForm({ ...form, amount: Number(e.target.value) })} className={inputClass} />
        </div>
        <div>
          <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Date</label>
          <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className={inputClass} />
        </div>
      </div>
      <div>
        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Description</label>
        <input type="text" value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} className={inputClass} />
      </div>
      <div>
        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Reference</label>
        <input type="text" value={form.reference || ''} onChange={e => setForm({ ...form, reference: e.target.value })} className={inputClass} />
      </div>
      <button type="submit" className="w-full py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700">Add Expense</button>
    </form>
  );
}
