import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Sparkles, 
  Play, 
  CheckCircle2, 
  TrendingUp, 
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const user = localStorage.getItem('user');

  return (
    <div className="max-w-7xl mx-auto space-y-32 pb-20 px-6">
      {/* Hero Section */}
      <section className="text-center pt-24 space-y-10 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-indigo-500/5 -z-10 blur-[120px]" />
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-8"
        >
          <div className="flex justify-center">
            <span className="inline-flex items-center space-x-3 px-6 py-2 rounded-full bg-slate-900 border border-white/5 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl">
              <Sparkles className="h-3 w-3 fill-indigo-400" />
              <span>Smart Interview Practice</span>
            </span>
          </div>
          <h1 className="text-7xl sm:text-9xl font-black text-white tracking-tighter leading-[0.85] uppercase">
            MASTER YOUR <br />
            <span className="text-brand italic underline decoration-indigo-500/30 underline-offset-[20px]">INTERVIEW.</span>
          </h1>
          <p className="mt-10 text-xl text-slate-400 max-w-3xl mx-auto font-medium leading-relaxed">
            Practice for your next job with our AI coach. Get real-time feedback, improve your answers, and track your progress with simple charts.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex flex-col sm:flex-row justify-center items-center gap-6 pt-12"
        >
          {user ? (
            <div className="space-y-10">
              <button
                onClick={() => navigate('/practice')}
                className="group px-14 py-6 bg-white text-slate-950 rounded-[2.5rem] font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all shadow-2xl shadow-white/5 flex items-center space-x-4 mx-auto"
              >
                <Play className="h-4 w-4 fill-slate-950" />
                <span>Start Practice</span>
              </button>
              <div className="flex items-center justify-center space-x-4 text-[10px] font-black text-slate-500 uppercase tracking-widest pt-8 border-t border-white/5 mx-auto w-fit">
                <span>User: <span className="text-white">{(JSON.parse(user)).name}</span></span>
                <span className="h-1 w-1 rounded-full bg-slate-800" />
                <button 
                  onClick={() => { localStorage.removeItem('user'); window.location.reload(); }}
                  className="text-rose-500 hover:text-rose-400 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <>
              <Link
                to="/signup"
                className="group px-14 py-6 bg-white text-slate-950 rounded-[2.5rem] font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all shadow-2xl shadow-white/5 flex items-center space-x-4"
              >
                <span>Get Started</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="px-14 py-6 bg-slate-900 text-white border border-white/5 rounded-[2.5rem] font-black text-xs uppercase tracking-widest hover:bg-slate-800 hover:border-indigo-500/30 transition-all"
              >
                Sign In
              </Link>
            </>
          )}
        </motion.div>
      </section>

      {/* Feature Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: <TrendingUp className="h-8 w-8 text-indigo-400" />, title: "Resume Matching", desc: "We ask questions based on your actual experience and job history." },
          { icon: <CheckCircle2 className="h-8 w-8 text-indigo-400" />, title: "Smart Feedback", desc: "Get clear advice on how to improve your communication and confidence." },
          { icon: <ShieldCheck className="h-8 w-8 text-indigo-400" />, title: "Progress Tracking", desc: "See your scores improve over time with our simple dashboard analytics." },
        ].map((feature, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.8 }}
            key={i} 
            className="glass-card p-12 text-left group hover:border-indigo-500/30 transition-all"
          >
            <div className="mb-8 bg-slate-800 w-fit p-5 rounded-3xl border border-white/5 group-hover:bg-indigo-600 group-hover:shadow-indigo-500/20 group-hover:shadow-2xl transition-all">
              {feature.icon}
            </div>
            <h3 className="font-black text-2xl text-white mb-3 uppercase tracking-tighter">{feature.title}</h3>
            <p className="text-slate-500 text-sm font-medium leading-relaxed">{feature.desc}</p>
          </motion.div>
        ))}
      </section>
      
      {/* Bottom CTA */}
      {!user && (
        <section className="glass-card p-20 text-center relative overflow-hidden bg-slate-900 border-white/5">
           <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px] -mr-40 -mt-40" />
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 mb-6 leading-none">Ready to start?</p>
           <h2 className="text-5xl sm:text-7xl font-black italic tracking-tighter mb-12 leading-none text-white">ACE YOUR NEXT <br /> <span className="text-brand italic underline decoration-indigo-500/30 underline-offset-[16px]">INTERVIEW.</span></h2>
           <Link
             to="/signup"
             className="inline-flex items-center space-x-4 bg-white text-slate-950 px-16 py-7 rounded-[2.5rem] font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-transform hover:scale-105 shadow-2xl"
           >
              <span>Join IntervAI</span>
              <ArrowRight className="h-4 w-4" />
           </Link>
        </section>
      )}
    </div>
  );
}
