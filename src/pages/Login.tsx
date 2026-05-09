import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Mail, Lock } from 'lucide-react';
import { motion } from 'motion/react';

export default function Login() {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple Hackathon Auth: Store name/email in localStorage
    localStorage.setItem('user', JSON.stringify({ email, name: email.split('@')[0] }));
    navigate('/dashboard');
  };

  return (
    <div className="flex justify-center items-center py-20 px-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass-card p-10 border-white/10 glow-indigo"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-slate-800 text-indigo-400 rounded-2xl mb-6 border border-white/5 shadow-2xl shadow-black">
            <LogIn className="h-6 w-6" />
          </div>
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-2 leading-none">Security Protocol</p>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase">AUTHORIZED ACCESS</h2>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2 text-left">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1 leading-none">Operator Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-4 h-4 w-4 text-slate-600" />
              <input 
                type="email" 
                required
                className="w-full pl-12 pr-4 py-4 bg-slate-950 border border-white/5 rounded-2xl focus:border-indigo-500/50 outline-none transition-all text-sm font-bold text-white placeholder:text-slate-800 focus:glow-indigo"
                placeholder="name@terminal.sh"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2 text-left">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1 leading-none">Access Key</label>
            <div className="relative">
              <Lock className="absolute left-4 top-4 h-4 w-4 text-slate-600" />
              <input 
                type="password" 
                required
                className="w-full pl-12 pr-4 py-4 bg-slate-950 border border-white/5 rounded-2xl focus:border-indigo-500/50 outline-none transition-all text-sm font-bold text-white placeholder:text-slate-800 focus:glow-indigo"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-white text-slate-950 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all shadow-2xl shadow-white/5 mt-4"
          >
            Access Core
          </button>
        </form>

        <p className="mt-10 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">
          New Subject? {' '}
          <Link to="/signup" className="text-indigo-400 hover:text-white transition-colors">
            Initialize Profile
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
