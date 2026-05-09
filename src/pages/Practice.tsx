import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Briefcase, 
  FileText, 
  Play, 
  Zap,
  ChevronRight,
  ShieldCheck,
  Target
} from 'lucide-react';
import { api } from '../services/api';

const ROLES = [
  "Frontend Developer",
  "Backend Developer",
  "Fullstack Developer",
  "Data Scientist",
  "Product Manager",
  "DevOps Engineer"
];

export default function Practice() {
  const [selectedRole, setSelectedRole] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [resumeText, setResumeText] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) {
      navigate('/login');
    } else {
      setUser(JSON.parse(savedUser));
    }
  }, [navigate]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert("Please upload a valid PDF file.");
      return;
    }

    setFileName(file.name);
    setIsUploading(true);

    try {
      const data = await api.uploadResume(file);
      setResumeText(data.text);
    } catch (err: any) {
      console.error("Upload failed", err);
      // Don't alert "Failed to fetch" as a blocking error, just inform the user
      const isNetworkError = err.message.includes('Network error') || err.message.includes('fetch');
      if (isNetworkError) {
        alert("The resume analysis server is currently unreachable. You can still begin the session, but it won't be personalized to your resume.");
        setResumeText(null); // Ensure it's clear no text was extracted
      } else {
        alert(err.message || "Failed to parse resume. You can still proceed without it.");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleStartInterview = () => {
    if (!selectedRole) {
      alert("Please select a role first!");
      return;
    }
    navigate('/interview', { state: { role: selectedRole, resumeContext: resumeText } });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-8">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight leading-none mb-1">
            Training <span className="text-indigo-500">Ground</span>
          </h1>
          <p className="text-slate-400 font-medium text-sm">Set up your practice session</p>
        </div>
        <div className="flex items-center space-x-2 bg-indigo-50 px-4 py-2 rounded-full ring-1 ring-indigo-200">
          <Zap className="h-3 w-3 text-indigo-600 fill-indigo-600" />
          <span className="text-[10px] font-black uppercase text-indigo-700 tracking-widest">Active Session</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Configuration */}
        <div className="lg:col-span-7 space-y-10">
          {/* Step 1 */}
          <section className="glass-card p-10 border-white/5 shadow-sm">
            <div className="flex items-center space-x-4 mb-10">
              <div className="bg-indigo-600 p-3 rounded-2xl glow-indigo">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1">Step 01</p>
                <h2 className="text-2xl font-black text-white">Select Your Role</h2>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {ROLES.map((role) => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`px-4 py-4 rounded-2xl border text-xs font-bold transition-all ${
                    selectedRole === role 
                    ? 'bg-indigo-600 border-indigo-600 text-white glow-indigo scale-105' 
                    : 'bg-slate-900 border-white/5 text-slate-400 hover:border-indigo-500/30 hover:bg-slate-800'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </section>

          {/* Step 2 */}
          <section className="glass-card p-10 border-white/5 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="flex items-center space-x-4 mb-10">
                <div className="bg-indigo-600 p-3 rounded-2xl glow-indigo">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1">Step 02</p>
                  <h2 className="text-2xl font-black text-white">Upload Resume (Optional)</h2>
                </div>
              </div>

              <div className={`border-2 border-dashed rounded-[2rem] p-12 text-center transition-all cursor-pointer group ${
                resumeText ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/5 hover:border-indigo-500/30 bg-slate-900/50'
              }`}>
                <input 
                  type="file" 
                  id="practice-resume" 
                  className="hidden" 
                  accept=".pdf"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
                <label htmlFor="practice-resume" className="cursor-pointer space-y-6 block">
                  <div className={`mx-auto w-20 h-20 rounded-3xl flex items-center justify-center transition-all shadow-xl ${
                    resumeText ? 'bg-emerald-500 text-white' : 'bg-slate-800 group-hover:bg-indigo-600 text-slate-500 group-hover:text-white'
                  }`}>
                    {isUploading ? (
                      <Zap className="h-10 w-10 animate-pulse" />
                    ) : (
                      <FileText className="h-10 w-10" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-white leading-none mb-2">
                       {isUploading ? "Uploading..." : fileName || "Choose PDF File"}
                    </h4>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                      {resumeText ? "Analysis Complete" : "Let AI personalize your interview"}
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </section>
        </div>

        {/* Right: Summary & Action */}
        <div className="lg:col-span-5 space-y-8">
           <section className="glass-card p-10 shadow-2xl text-white relative overflow-hidden bg-slate-900 border-white/5">
              <div className="absolute bottom-0 right-0 -mb-20 -mr-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-[100px]" />
              
              <div className="relative z-10 space-y-8">
                 <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Ready to start?</p>
                    <h3 className="text-4xl font-black italic tracking-tighter leading-none uppercase">Begin <br /> Practice</h3>
                 </div>

                 <motion.button 
                   whileHover={{ y: -5 }}
                   whileTap={{ scale: 0.95 }}
                   onClick={handleStartInterview}
                   className="w-full bg-white text-slate-950 py-6 rounded-[2rem] font-black uppercase tracking-widest text-sm flex items-center justify-center space-x-3 shadow-2xl transition-all"
                 >
                    <Play className="h-4 w-4 fill-slate-950" />
                    <span>Begin Session</span>
                 </motion.button>
              </div>
           </section>

           <div className="glass-card p-8 bg-slate-900/50 border-white/5">
              <div className="flex items-center space-x-3 mb-4">
                 <div className="p-2 bg-indigo-600 rounded-lg glow-indigo">
                    <ShieldCheck className="h-4 w-4 text-white" />
                 </div>
                 <h4 className="text-sm font-black uppercase tracking-widest text-white">AI Integrity</h4>
              </div>
              <p className="text-xs font-bold text-slate-500 leading-relaxed uppercase tracking-wider">
                 Our system provides real-time feedback and analysis during the session. Performance is tracked and saved to your dashboard.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
