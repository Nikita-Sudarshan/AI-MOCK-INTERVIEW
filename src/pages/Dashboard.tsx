import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  TrendingUp, 
  ChevronRight, 
  Target,
  BarChart3,
  Clock,
  Award,
  History,
  Star,
  Search,
  Filter,
  Download,
  X,
  Sparkles,
  ArrowRight,
  BrainCircuit,
  MessageSquareQuote
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { geminiService } from '../services/gemini';

export default function Dashboard() {
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [showInsights, setShowInsights] = useState(false);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [insightText, setInsightText] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) {
      navigate('/login');
    } else {
      setUser(JSON.parse(savedUser));
      const savedSessions = JSON.parse(localStorage.getItem('sessions') || '[]');
      const sortedSessions = [...savedSessions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setSessions(sortedSessions);
    }
  }, [navigate]);

  const generateAdvancedInsights = async () => {
    if (sessions.length === 0) {
      alert("Initialize a session to activate intelligence nodes.");
      return;
    }
    
    setShowInsights(true);
    if (insightText) return;

    setIsGeneratingInsights(true);
    try {
      const text = await geminiService.getAdvancedInsights(sessions);
      setInsightText(text);
    } catch (error) {
      console.error("Gemini Error:", error);
      setInsightText("The AI analyst is momentarily offline. Synchronize later.");
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  const avgScore = sessions.length > 0 
    ? Math.round(sessions.reduce((acc, s) => acc + s.score, 0) / sessions.length) 
    : 0;

  const highestScore = sessions.length > 0
    ? Math.max(...sessions.map(s => s.score))
    : 0;

  const chartData = sessions.map(s => ({
    date: new Date(s.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    score: s.score,
    role: s.role
  }));

  const roleCounts = sessions.reduce((acc: any, s) => {
    acc[s.role] = (acc[s.role] || 0) + 1;
    return acc;
  }, {});

  const barData = Object.entries(roleCounts).map(([name, value]) => ({ 
    name, 
    value: value as number 
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 px-6">
      {/* Dynamic Header */}
      <header className="flex flex-col lg:row md:items-center justify-between gap-8 pt-8 group">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] leading-none">Global Analytics Terminal</p>
          </div>
          <h1 className="text-6xl font-black text-white tracking-tighter leading-none">
            DASH<span className="text-indigo-500">BOARD</span>
          </h1>
          <p className="text-slate-500 font-medium text-sm">Operator: {user?.name || 'UNKNOWN'}</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
           <div className="glass-card px-6 py-4 flex items-center space-x-4 border-white/10">
              <div className="h-10 w-10 rounded-xl bg-slate-800 flex items-center justify-center border border-white/5">
                <Target className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1 text-left">Current Focus</p>
                <p className="text-sm font-black text-white leading-none">{sessions[sessions.length - 1]?.role || "UNASSIGNED"}</p>
              </div>
           </div>
           
           <button 
             onClick={() => navigate('/practice')}
             className="px-8 py-4 bg-white text-slate-950 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/5"
           >
             Launch Session
           </button>
        </div>
      </header>

      {/* Grid: 4-Core Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Mean Proficiency', val: `${avgScore}%`, icon: Zap, trend: '+4.2%', sub: 'vs last week' },
          { label: 'Intelligence Nodes', val: sessions.length, icon: History, trend: 'ACTIVE', sub: 'Completed simulations' },
          { label: 'Peak Performance', val: `${highestScore}%`, icon: Award, trend: 'ELITE', sub: 'Highest recorded score' },
          { label: 'Engagement Level', val: 'HIGH', icon: Clock, trend: 'ON-TARGET', sub: 'Calculated consistency' },
        ].map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label}
            className="glass-card p-8 group hover:border-indigo-500/30 transition-all cursor-default"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-slate-800 rounded-2xl border border-white/5 group-hover:bg-indigo-600 transition-colors">
                <stat.icon className="h-5 w-5 text-indigo-400 group-hover:text-white" />
              </div>
              <span className="text-[9px] font-black text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-md font-mono">{stat.trend}</span>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-2">{stat.label}</p>
              <h4 className="text-4xl font-black text-white tracking-tighter mb-1 font-mono">{stat.val}</h4>
              <p className="text-[9px] font-bold text-slate-600 uppercase tracking-tight">{stat.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Performance Visualization */}
        <div className="lg:col-span-8 space-y-8">
          <section className="glass-card p-10 border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 h-40 w-40 bg-indigo-500/5 rounded-full blur-[80px]" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-12">
                <div className="space-y-1">
                  <h2 className="text-2xl font-black text-white tracking-tighter">EVOLUTION MATRIX</h2>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Cross-session performance benchmarks</p>
                </div>
                <div className="flex items-center space-x-2">
                   <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 rounded-lg border border-white/5">
                      <span className="h-2 w-2 rounded-full bg-indigo-500" />
                      <span className="text-[9px] font-black text-slate-300 uppercase">Proficiency</span>
                   </div>
                </div>
              </div>

              <div className="h-[380px] w-full">
                {sessions.length >= 1 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="glowScore" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4}/>
                          <stop offset="100%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="10 10" vertical={false} stroke="rgba(255,255,255,0.03)" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fill: '#64748b', fontWeight: 800, fontFamily: 'JetBrains Mono' }}
                        dy={15}
                      />
                      <YAxis hide={true} domain={[0, 105]} />
                      <Tooltip 
                        contentStyle={{ 
                          borderRadius: '24px', 
                          border: 'none', 
                          boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.5)',
                          padding: '16px 20px',
                          background: '#0f172a'
                        }}
                        itemStyle={{ color: '#818cf8', fontWeight: 900 }}
                        labelStyle={{ color: '#fff', fontWeight: 900, marginBottom: '4px' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="score" 
                        stroke="#6366f1" 
                        strokeWidth={6}
                        fillOpacity={1} 
                        fill="url(#glowScore)" 
                        animationDuration={2000}
                        activeDot={{ r: 8, fill: '#fff', stroke: '#6366f1', strokeWidth: 4 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full w-full flex flex-col items-center justify-center rounded-3xl bg-slate-900/20 border border-dashed border-white/5 px-8 text-center over">
                    <BarChart3 className="h-12 w-12 text-slate-800 mb-4 animate-pulse" />
                    <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Insufficient Data Points</p>
                    <p className="text-[10px] text-slate-700 font-bold uppercase tracking-tight">Complete more simulations to map trajectory</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* New: Skill Proficiency Map */}
          <section className="glass-card p-10 border-white/10">
             <div className="flex items-center space-x-4 mb-10">
                <div className="bg-slate-800 p-3 rounded-2xl border border-white/5">
                   <Target className="h-5 w-5 text-indigo-400" />
                </div>
                <div>
                   <h3 className="text-xl font-black text-white tracking-tighter leading-none mb-1">PROFICIENCY DISTRIBUTION</h3>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Focus areas by role category</p>
                </div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                   {barData.map((role, idx) => (
                     <div key={role.name} className="space-y-2">
                        <div className="flex justify-between items-end">
                           <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{role.name}</span>
                           <span className="text-xs font-black text-indigo-400 font-mono">{role.value} Sessions</span>
                        </div>
                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: sessions.length > 0 ? `${(role.value / sessions.length) * 100}%` : '0%' }}
                             className="h-full bg-indigo-500" 
                           />
                        </div>
                     </div>
                   ))}
                   {barData.length === 0 && (
                     <div className="py-10 text-center opacity-20 text-[10px] font-black uppercase tracking-[0.2em]">Zero Data Points</div>
                   )}
                </div>
                <div className="bg-slate-950/40 rounded-3xl p-6 border border-white/5 flex flex-col justify-center text-center space-y-4">
                   <Award className="h-12 w-12 text-indigo-500/50 mx-auto" />
                   <div>
                      <h4 className="text-lg font-black text-white tracking-tight">CAREER ARCHETYPE</h4>
                      <p className="text-[10px] font-bold text-slate-500 italic">Determined by session volume</p>
                   </div>
                   <div className="py-2 px-4 bg-indigo-500/10 rounded-xl text-indigo-400 text-xs font-black uppercase tracking-[0.2em] w-fit mx-auto">
                      {barData.sort((a,b) => b.value - a.value)[0]?.name || "N/A"} Specialist
                   </div>
                </div>
             </div>
          </section>
        </div>

        {/* Intelligence Sidepanel */}
        <div className="lg:col-span-4 space-y-8">
          <section className="bg-slate-900 border border-white/5 rounded-[2.5rem] p-8 flex flex-col h-full min-h-[600px] shadow-2xl shadow-black">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                <h3 className="font-black text-xs uppercase tracking-[0.3em] flex items-center space-x-2 text-indigo-400">
                  <History className="h-4 w-4" />
                  <span>SESSION VAULT</span>
                </h3>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
              {sessions.length > 0 ? (
                sessions.slice().reverse().map((session) => (
                  <motion.button
                    whileHover={{ x: 5 }}
                    key={session.id}
                    onClick={() => navigate('/report', { state: { report: session.report, role: session.role } })}
                    className="w-full flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-indigo-500/50 transition-all group"
                  >
                    <div className="flex items-center space-x-4 text-left">
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-black text-xs border font-mono ${
                        session.score >= 80 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        session.score >= 50 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        {session.score}
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="text-xs font-black text-white group-hover:text-indigo-400 transition-colors truncate max-w-[120px] mb-0.5 uppercase tracking-tighter">{session.role}</h4>
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest font-mono">{new Date(session.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-700 group-hover:text-white transition-all" />
                  </motion.button>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-10 text-center py-20">
                  <Search className="h-16 w-16 mb-4" />
                  <p className="text-xs font-black uppercase tracking-[0.3em]">Vault Lockdown</p>
                </div>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
               <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest text-center">Neural Analysis Engine</p>
               <button 
                 onClick={generateAdvancedInsights}
                 className="w-full flex items-center justify-center space-x-2 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all glow-indigo"
               >
                  <Sparkles className="h-3 w-3" />
                  <span>Run Intelligence Sweep</span>
               </button>
            </div>
          </section>
        </div>
      </div>
      {/* Feature Explanation / Intelligence Glossary */}
      <section className="glass-card p-10 border-white/5 mt-16 bg-slate-900/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <BrainCircuit className="h-32 w-32 text-indigo-500" />
        </div>
        <div className="relative z-10">
          <div className="mb-10">
            <h3 className="text-2xl font-black text-white tracking-tighter uppercase mb-2">Command Node Capabilities</h3>
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Protocol Documentation // Intelligence Matrix</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-indigo-400">
                <div className="p-2 bg-indigo-500/10 rounded-lg">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <h4 className="text-xs font-black uppercase tracking-widest text-white">Evolution Matrix</h4>
              </div>
              <p className="text-[11px] text-slate-500 font-bold leading-relaxed uppercase tracking-wider">
                Maps your performance trajectory across all sessions. High-density data points help identify if your readiness is stabilizing or accelerating in real-time.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-indigo-400">
                <div className="p-2 bg-indigo-500/10 rounded-lg">
                  <Sparkles className="h-4 w-4" />
                </div>
                <h4 className="text-xs font-black uppercase tracking-widest text-white">Neural Meta-Analysis</h4>
              </div>
              <p className="text-[11px] text-slate-500 font-bold leading-relaxed uppercase tracking-wider">
                Uses cross-session patterns to generate a comprehensive "Verdict". Identifies deep behavioral trends that a single session report might miss.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-indigo-400">
                <div className="p-2 bg-indigo-500/10 rounded-lg">
                  <History className="h-4 w-4" />
                </div>
                <h4 className="text-xs font-black uppercase tracking-widest text-white">Synaptic Vault</h4>
              </div>
              <p className="text-[11px] text-slate-500 font-bold leading-relaxed uppercase tracking-wider">
                A permanent record of every transmission. Each entry contains a full breakdown of specific questions, answers, and proficiency scores.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Insights Modal Overlay */}
      <AnimatePresence>
        {showInsights && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          >
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowInsights(false)} />
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-10 border-b border-white/5 flex items-center justify-between bg-slate-900/50">
                <div className="flex items-center space-x-5">
                  <div className="bg-indigo-600 p-3 rounded-2xl glow-indigo">
                    <BrainCircuit className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1">Module: MetaAnalysis v2.0</p>
                    <h2 className="text-2xl font-black text-white tracking-tighter">READINESS VERDICT</h2>
                  </div>
                </div>
                <button 
                  onClick={() => setShowInsights(false)}
                  className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-500 hover:text-white"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="p-10 overflow-y-auto flex-1 custom-scrollbar space-y-8">
                {isGeneratingInsights ? (
                  <div className="py-20 flex flex-col items-center justify-center space-y-6 text-center">
                    <motion.div 
                      animate={{ rotate: 360 }} 
                      transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                      className="p-6 bg-indigo-500/10 rounded-full"
                    >
                      <Zap className="h-10 w-10 text-indigo-500 fill-indigo-500/20" />
                    </motion.div>
                    <div>
                      <h4 className="text-xl font-black text-white uppercase tracking-tighter">Synthesizing Neural Data</h4>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2 px-10">Running cross-session proficiency mapping and trend alignment...</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                     <div className="bg-white text-slate-950 rounded-[2rem] p-8 shadow-2xl shadow-indigo-500/10">
                        <div className="flex items-start space-x-5">
                           <MessageSquareQuote className="h-6 w-6 text-indigo-600 shrink-0 mt-1" />
                           <div className="text-base font-bold leading-relaxed italic whitespace-pre-wrap">
                              {insightText}
                           </div>
                        </div>
                     </div>
                     
                     <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 bg-slate-800/50 rounded-3xl border border-white/5">
                           <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 text-left">Trajectory</p>
                           <p className="text-xl font-black text-white uppercase tracking-tighter">OPTIMAL</p>
                        </div>
                        <div className="p-6 bg-slate-800/50 rounded-3xl border border-white/5">
                           <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2 text-left">Confidence</p>
                           <p className="text-xl font-black text-white uppercase tracking-tighter">ELITE</p>
                        </div>
                     </div>
                  </div>
                )}
              </div>

              <div className="p-10 border-t border-white/5 bg-slate-950/50">
                <button 
                  onClick={() => setShowInsights(false)}
                  className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center space-x-3 shadow-xl hover:bg-indigo-500 transition-all glow-indigo"
                >
                  <ArrowRight className="h-4 w-4" />
                  <span>Close Analyst</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

