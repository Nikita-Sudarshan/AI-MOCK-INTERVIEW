import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, UserCircle, LogOut, LayoutDashboard, Target } from 'lucide-react';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
    else setUser(null);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  return (
    <nav className="bg-slate-950/60 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3">
          <div className="bg-indigo-600 p-2 rounded-xl glow-indigo">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-black text-white tracking-tighter uppercase leading-none">IntervAI</span>
        </Link>
        
        <div className="hidden md:flex items-center space-x-10">
          {user && (
            <>
              <Link to="/practice" className="flex items-center space-x-2 text-[10px] font-black text-slate-400 hover:text-indigo-400 transition-colors uppercase tracking-widest">
                <Target className="h-3 w-3" />
                <span>Simulation</span>
              </Link>
              <Link to="/dashboard" className="flex items-center space-x-2 text-[10px] font-black text-slate-400 hover:text-indigo-400 transition-colors uppercase tracking-widest">
                <LayoutDashboard className="h-3 w-3" />
                <span>Analytics</span>
              </Link>
            </>
          )}
          
          {user ? (
            <div className="flex items-center space-x-5 ml-4 pl-8 border-l border-white/5">
               <div className="text-right hidden sm:block">
                  <p className="text-[9px] font-black text-slate-500 leading-none mb-1 uppercase tracking-tighter font-mono">System Operator</p>
                  <p className="text-xs font-black text-slate-200 leading-none truncate max-w-[120px]">{user.name}</p>
               </div>
               <button 
                 onClick={handleLogout}
                 className="p-3 bg-slate-900 border border-white/5 text-slate-400 rounded-xl hover:bg-rose-600/10 hover:text-rose-500 hover:border-rose-500/20 transition-all shadow-sm"
                 title="Logout"
               >
                 <LogOut className="h-4 w-4" />
               </button>
            </div>
          ) : (
            <Link to="/login" className="flex items-center space-x-3 bg-white text-slate-950 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 hover:translate-y-[-2px] transition-all shadow-xl shadow-white/5">
              <UserCircle className="h-4 w-4" />
              <span>Gateway</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
