import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../lib/auth';
import Logo from '../components/Logo';

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = login(email, pw);
    if (r.success) nav('/');
    else setErr(r.error || 'Failed');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4"><Logo size={80} variant="white" /></div>
          <h1 className="text-2xl font-bold text-white">AGS WEBWORKS</h1>
          <p className="text-blue-200 mt-1">Business Management System</p>
        </div>
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-6">Sign In</h2>
          {err && <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-200 text-sm flex items-center gap-2"><AlertCircle size={16} />{err}</div>}
          <form onSubmit={submit} className="space-y-4">
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-400" required />
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300" />
              <input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="Password" className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-400" required />
            </div>
            <button type="submit" className="w-full py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-600/25">Sign In</button>
          </form>
        </div>
        <div className="mt-4 p-3 rounded-lg bg-white/5 border border-white/10">
          <p className="text-xs text-blue-200/70 text-center">
            <strong>Demo:</strong><br />
            sharjeel@agswebworks.com / AGS@CEO2024!<br />
            gufran@agswebworks.com / AGS@Dev2024!<br />
            addan@agswebworks.com / AGS@Acc2024!
          </p>
        </div>
      </div>
    </div>
  );
}
