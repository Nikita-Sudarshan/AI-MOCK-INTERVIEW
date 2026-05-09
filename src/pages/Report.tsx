import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Award, CheckCircle, AlertCircle, TrendingUp, ArrowLeft, Download, Share2, Target, ArrowRight, Loader2 } from 'lucide-react';

import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface ReportData {
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  tips?: string[];
  verdict: string;
  sentiment: string;
  breakdown?: {
    question: string;
    answer: string;
    score: number;
    critique: string;
  }[];
}

export default function Report() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isDownloading, setIsDownloading] = useState(false);
  const { report, role } = location.state as { report: ReportData, role: string } || {};

  const handleDownloadPDF = async () => {
    const element = document.getElementById('report-container');
    if (!element || isDownloading) return;

    setIsDownloading(true);

    // Scroll to top to ensure clean capture
    window.scrollTo(0, 0);

    try {
      // Small delay to ensure state update for loader is visible
      await new Promise(resolve => setTimeout(resolve, 300));

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#020617', 
        logging: true,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById('report-container');
          if (clonedElement) {
            clonedElement.style.padding = '40px';
            clonedElement.style.width = '1100px'; 
            clonedElement.style.transform = 'none';
            clonedElement.style.borderRadius = '0';
          }

          // 1. Remove all external stylesheets that might contain complex CSS4/v5 colors
          const links = clonedDoc.querySelectorAll('link[rel="stylesheet"]');
          links.forEach(link => link.remove());

          // 2. Clear all existing style tags and replace with a simplified, safe CSS sheet
          const existingStyles = clonedDoc.querySelectorAll('style');
          existingStyles.forEach(style => style.remove());

          const pdfStyle = clonedDoc.createElement('style');
          pdfStyle.innerHTML = `
            * {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              transition: none !important;
              animation: none !important;
              box-sizing: border-box;
              font-family: sans-serif;
            }
            body {
              background-color: #020617 !important;
              color: #ffffff !important;
              margin: 0;
              padding: 0;
            }
            #report-container {
              background-color: #020617 !important;
              width: 1100px !important;
              margin: 0 auto !important;
            }
            .text-indigo-400 { color: #818cf8 !important; }
            .text-indigo-500 { color: #6366f1 !important; }
            .text-slate-400 { color: #94a3b8 !important; }
            .text-slate-300 { color: #cbd5e1 !important; }
            .text-white { color: #ffffff !important; }
            .bg-indigo-600 { background-color: #4f46e5 !important; }
            .bg-slate-900 { background-color: #0f172a !important; }
            .bg-slate-950 { background-color: #020617 !important; }
            .border-white\\/5 { border-color: rgba(255, 255, 255, 0.05) !important; }
            .border-indigo-500\\/20 { border-color: rgba(99, 102, 241, 0.2) !important; }
            .glass-card {
              background-color: #0f172a !important;
              border: 1px solid rgba(255, 255, 255, 0.1) !important;
              border-radius: 1.5rem !important;
            }
            .rounded-[2.5rem] { border-radius: 2.5rem !important; }
            .rounded-2xl { border-radius: 1rem !important; }
            .rounded-3xl { border-radius: 1.5rem !important; }
            .flex { display: flex !important; }
            .grid { display: grid !important; }
            .items-center { align-items: center !important; }
            .justify-between { justify-content: space-between !important; }
            .space-x-4 > * + * { margin-left: 1rem !important; }
            .space-y-4 > * + * { margin-top: 1rem !important; }
            .p-6 { padding: 1.5rem !important; }
            .p-10 { padding: 2.5rem !important; }
            .mb-8 { margin-bottom: 2rem !important; }
            .font-black { font-weight: 900 !important; }
            .uppercase { text-transform: uppercase !important; }
            .tracking-tighter { letter-spacing: -0.05em !important; }
            .text-5xl { font-size: 3rem !important; }
            .text-sm { font-size: 0.875rem !important; }
            .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)) !important; }
            @media (min-width: 768px) {
              .md\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
              .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
            }
          `;
          clonedDoc.head.appendChild(pdfStyle);

          // 3. Find any elements with inline styles and wipe oklab/oklch
          const allElements = clonedDoc.querySelectorAll('*');
          allElements.forEach((el: any) => {
            const inlineStyle = el.getAttribute('style') || '';
            if (inlineStyle.includes('oklab') || inlineStyle.includes('oklch')) {
              el.setAttribute('style', inlineStyle
                .replace(/oklch\([^)]+\)/g, '#6366f1')
                .replace(/oklab\([^)]+\)/g, '#4f46e5'));
            }
          });

          // Remove elements that shouldn't be in the PDF
          const actionFooter = clonedDoc.querySelector('.pdf-exclude');
          if (actionFooter) actionFooter.remove();
        }
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`IntervAI-Report-${role?.replace(/\s+/g, '-')}.pdf`);
    } catch (err) {
      console.error('PDF Generation Error:', err);
      alert('We hit a snag generating your PDF. This is often due to complex CSS. Please try using browser print (Ctrl+P) and "Save as PDF" instead.');
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    if (report && role) {
      const sessions = JSON.parse(localStorage.getItem('sessions') || '[]');
      const newSession = {
        id: Date.now(),
        date: new Date().toISOString(),
        role,
        score: report.overallScore,
        report
      };
      // Avoid duplicate saves if possible (though useEffect runs twice in dev, localStorage handles it)
      const exists = sessions.some((s: any) => s.role === role && s.score === report.overallScore && (Date.now() - s.id < 5000));
      if (!exists) {
        localStorage.setItem('sessions', JSON.stringify([newSession, ...sessions]));
      }
    }
  }, [report, role]);

  if (!report) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-xl font-bold">No report found.</h2>
        <Link to="/dashboard" className="text-indigo-600 underline">Return to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between mb-12">
        <button 
          onClick={() => navigate('/dashboard')}
          className="group flex items-center text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-[0.2em] transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Dossier
        </button>
        <div className="flex items-center space-x-3">
           <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-white/5 text-[9px] font-black text-slate-400 uppercase tracking-widest font-mono">
              ID: {(Math.random()*1000000).toFixed(0)}
           </div>
           <button 
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="p-2.5 bg-slate-900 border border-white/5 text-slate-400 hover:text-white rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50"
           >
             {isDownloading ? <Loader2 className="h-4 w-4 animate-spin text-indigo-400" /> : <Download className="h-4 w-4" />}
           </button>
        </div>
      </div>

      <motion.div 
        id="report-container"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card overflow-hidden glow-indigo border-white/10"
      >
        {/* Dossier Banner */}
        <div className="bg-slate-900 p-12 border-b border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-violet-500/5 rounded-full blur-[100px]" />
          
          <div className="relative z-10 flex flex-col items-center text-center">
             <div className="bg-indigo-600 p-4 rounded-3xl glow-indigo mb-6">
               <Award className="h-10 w-10 text-white" />
             </div>
             <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-2">Performance Audit Report</p>
             <h1 className="text-5xl font-black text-white tracking-widest uppercase mb-4">{(report.overallScore > 90 ? 'MASTER' : 'PROFICIENT')}</h1>
             <div className="h-1 w-20 bg-indigo-600 rounded-full mb-6" />
             <div className="px-5 py-2 bg-slate-950/50 rounded-full border border-white/5 text-xs font-black text-slate-400 uppercase tracking-widest">
                ROLE: <span className="text-white">{role}</span>
             </div>
          </div>
        </div>

        <div className="p-12 space-y-16">
          {/* Main Analytics Block */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
             <div className="lg:col-span-4 flex justify-center">
                <div className="relative group">
                   {/* Radial Score */}
                   <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                   <div className="relative h-48 w-48 rounded-full border-8 border-slate-900 flex items-center justify-center p-4">
                      <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                        <circle
                          cx="96"
                          cy="96"
                          r="88"
                          stroke="rgba(255,255,255,0.05)"
                          strokeWidth="12"
                          fill="transparent"
                        />
                        <motion.circle
                          initial={{ strokeDashoffset: 553 }}
                          animate={{ strokeDashoffset: 553 - (553 * report.overallScore) / 100 }}
                          cx="96"
                          cy="96"
                          r="88"
                          stroke="#6366f1"
                          strokeWidth="12"
                          strokeLinecap="round"
                          fill="transparent"
                          strokeDasharray={553}
                          transition={{ duration: 2, ease: "easeOut" }}
                        />
                      </svg>
                      <div className="text-center z-10">
                        <span className="text-6xl font-black text-white tracking-tighter leading-none font-mono">{report.overallScore}</span>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">PERCENT</p>
                      </div>
                   </div>
                </div>
             </div>
             
             <div className="lg:col-span-8 flex flex-col justify-center space-y-6">
                <div className="space-y-4">
                   <h2 className="text-2xl font-black text-white tracking-tighter uppercase leading-none">Intelligence Verdict</h2>
                   <p className="text-slate-400 text-lg font-medium leading-relaxed italic">"{report.verdict}"</p>
                </div>
                <div className="flex flex-wrap gap-4">
                   <div className="px-4 py-2 bg-slate-900 rounded-xl border border-white/5 flex items-center space-x-2 font-mono">
                      <TrendingUp className="h-4 w-4 text-indigo-400" />
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">SENTIMENT: {report.sentiment}</span>
                   </div>
                   <div className="px-4 py-2 bg-slate-900 rounded-xl border border-white/5 flex items-center space-x-2 text-emerald-400">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">PASSING BENCHMARK</span>
                   </div>
                </div>
             </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-slate-900/50 border border-white/5 p-10 rounded-[2.5rem] group hover:border-emerald-500/20 transition-all"
            >
              <div className="flex items-center space-x-4 mb-8">
                <div className="bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20">
                   <CheckCircle className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                   <h3 className="text-lg font-black text-white uppercase tracking-tighter">Command Assets</h3>
                   <p className="text-[10px] font-black text-slate-500 uppercase">Primary strengths identified</p>
                </div>
              </div>
              <div className="space-y-5">
                {report.strengths.map((s, i) => (
                  <div key={i} className="flex items-start space-x-4 p-4 bg-slate-950/50 rounded-2xl border border-white/5 hover:border-emerald-500/10 transition-all">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-2.5 shrink-0" />
                    <p className="text-slate-300 text-sm font-medium leading-relaxed">{s}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-slate-900/50 border border-white/5 p-10 rounded-[2.5rem] group hover:border-rose-500/20 transition-all"
            >
              <div className="flex items-center space-x-4 mb-8">
                <div className="bg-rose-500/10 p-3 rounded-2xl border border-rose-500/20">
                  <AlertCircle className="h-5 w-5 text-rose-400" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-tighter">Target Deficiencies</h3>
                  <p className="text-[10px] font-black text-slate-500 uppercase">Areas for synchronization</p>
                </div>
              </div>
              <div className="space-y-5">
                {report.weaknesses.map((w, i) => (
                  <div key={i} className="flex items-start space-x-4 p-4 bg-slate-950/50 rounded-2xl border border-white/5 hover:border-rose-500/10 transition-all">
                    <div className="h-1.5 w-1.5 rounded-full bg-rose-400 mt-2.5 shrink-0" />
                    <p className="text-slate-300 text-sm font-medium leading-relaxed">{w}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Improvement Tips */}
          {report.tips && report.tips.length > 0 && (
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-indigo-600/5 border border-indigo-500/20 p-10 rounded-[2.5rem]"
            >
              <div className="flex items-center space-x-4 mb-8">
                <div className="bg-indigo-600 p-3 rounded-2xl glow-indigo">
                   <Target className="h-5 w-5 text-white" />
                </div>
                <div>
                   <h3 className="text-xl font-black text-white uppercase tracking-tighter">Strategic Growth Calibration</h3>
                   <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Recommended actions for mastery</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {report.tips.map((tip, i) => (
                    <div key={i} className="bg-slate-900 border border-white/5 p-6 rounded-2xl relative overflow-hidden group">
                       <div className="absolute top-0 right-0 p-3 text-[10px] font-black text-slate-800 uppercase tracking-widest">TIP 0{i+1}</div>
                       <p className="text-slate-300 text-sm font-medium relative z-10">{tip}</p>
                    </div>
                 ))}
              </div>
            </motion.section>
          )}

          {/* New: Synaptic Breakdown (Question by Question) */}
          <section className="space-y-8">
             <div className="flex items-center space-x-4">
                <div className="bg-indigo-600 p-3 rounded-2xl glow-indigo">
                   <Target className="h-5 w-5 text-white" />
                </div>
                <div>
                   <h3 className="text-xl font-black text-white uppercase tracking-tighter">Synaptic Breakdown</h3>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Question-level proficiency audit</p>
                </div>
             </div>

             <div className="space-y-6">
                {report.breakdown?.map((item: any, i: number) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + (i * 0.1) }}
                    key={i} 
                    className="glass-card p-10 border-white/5 bg-slate-900/30 group hover:border-indigo-500/20 transition-all"
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                       <div className="space-y-4 flex-1">
                          <div className="space-y-1">
                             <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Node 0{i+1}: Question</p>
                             <p className="text-white font-bold leading-relaxed">{item.question}</p>
                          </div>
                          <div className="space-y-1">
                             <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Transmission: Response</p>
                             <p className="text-slate-400 text-sm italic">"{item.answer}"</p>
                          </div>
                       </div>
                       <div className="md:w-48 space-y-4">
                          <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5">
                             <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Proficiency</p>
                             <div className="flex items-end space-x-2">
                                <span className={`text-3xl font-black font-mono ${
                                  item.score >= 80 ? 'text-emerald-400' :
                                  item.score >= 50 ? 'text-amber-400' :
                                  'text-rose-400'
                                }`}>{item.score}</span>
                                <span className="text-[10px] font-black text-slate-700 mb-1">/ 100</span>
                             </div>
                          </div>
                       </div>
                    </div>
                    <div className="mt-8 pt-6 border-t border-white/5">
                       <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-2">AI Critique</p>
                       <p className="text-xs text-slate-400 leading-relaxed font-medium">{item.critique}</p>
                    </div>
                  </motion.div>
                ))}
                {!report.breakdown && (
                  <div className="py-12 bg-slate-900/50 rounded-[2.5rem] border border-dashed border-white/10 text-center">
                    <p className="text-xs font-black text-slate-600 uppercase tracking-[0.2em]">Detailed breakdown not available for this session</p>
                  </div>
                )}
             </div>
          </section>

          {/* Action Footer */}
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 pdf-exclude">
             <div className="flex items-center space-x-4">
                <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center border border-white/5">
                   <Share2 className="h-4 w-4 text-slate-400" />
                </div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Share results with mentor</p>
             </div>
             <Link 
               to="/interview" 
               className="w-full md:w-auto px-12 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all glow-indigo flex items-center justify-center space-x-3"
             >
                <span>Initiate New Session</span>
                <ArrowRight className="h-4 w-4" />
             </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
