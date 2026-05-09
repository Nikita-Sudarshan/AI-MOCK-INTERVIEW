import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User, Bot, Loader2, ChevronLeft, Flag, Mic, MicOff, Volume2 } from 'lucide-react';
import { api } from '../services/api';
import { geminiService } from '../services/gemini';

interface Message {
  role: 'bot' | 'user';
  text: string;
  feedback?: {
    score: number;
    rating: string;
    text: string;
  };
}

export default function Interview() {
  const location = useLocation();
  const navigate = useNavigate();
  const { role, resumeContext } = location.state || { role: 'Software Engineer', resumeContext: null };

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript;
          }
        }
        if (transcript) {
          setInput(prev => prev + (prev.endsWith(' ') || !prev ? '' : ' ') + transcript);
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const speakText = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // Stop any current speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  // Initial Question
  useEffect(() => {
    const start = async () => {
      setIsLoading(true);
      try {
        const data = await geminiService.startInterview(role, resumeContext);
        setMessages([{ role: 'bot', text: data.question }]);
        speakText(data.question);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    start();
  }, [role, resumeContext]);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFinish = async () => {
    if (messages.length < 2) {
      navigate('/dashboard');
      return;
    }
    
    setIsFinishing(true);
    try {
      const historyString = messages.map(m => `${m.role}: ${m.text}`).join('\n');
      const report = await geminiService.getReport(role, historyString, resumeContext);
      
      // Save session
      const savedSessions = JSON.parse(localStorage.getItem('sessions') || '[]');
      const newSession = {
        id: Math.random().toString(36).substring(7),
        role,
        score: report.overallScore,
        date: new Date().toISOString(),
        report
      };
      localStorage.setItem('sessions', JSON.stringify([...savedSessions, newSession]));

      navigate('/report', { state: { report, role } });
    } catch (err) {
      console.error(err);
      alert("Failed to generate report. Returning to dashboard.");
      navigate('/dashboard');
    } finally {
      setIsFinishing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const historyString = messages.map(m => `${m.role}: ${m.text}`).join('\n');
      const data = await geminiService.sendAnswer(role, userMsg, historyString, resumeContext);
      
      // Assign the feedback to the USER'S message we just sent
      setMessages(prev => {
        const newMsgs = [...prev];
        let lastUserIdx = -1;
        for (let i = newMsgs.length - 1; i >= 0; i--) {
          if (newMsgs[i].role === 'user') {
            lastUserIdx = i;
            break;
          }
        }
        
        if (lastUserIdx !== -1) {
          newMsgs[lastUserIdx] = { 
            ...newMsgs[lastUserIdx], 
            feedback: { score: data.score, rating: data.rating, text: data.feedback } 
          };
        }
        speakText(data.nextQuestion);
        return [...newMsgs, { role: 'bot', text: data.nextQuestion }];
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-180px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-sm font-medium text-slate-500 hover:text-white transition-colors"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Leave Practice
        </button>
        <div className="text-center">
          <h2 className="text-lg font-bold text-white uppercase tracking-tight">{role} Interview</h2>
          <div className="flex items-center justify-center space-x-1">
            {isSpeaking ? (
              <button 
                onClick={() => { window.speechSynthesis.cancel(); setIsSpeaking(false); }}
                className="flex items-center space-x-1 px-2 py-0.5 bg-rose-500/10 text-rose-500 rounded-full text-[10px] font-black animate-pulse border border-rose-500/20"
              >
                <MicOff className="h-2 w-2" />
                <span>STOP SPEECH</span>
              </button>
            ) : (
              <>
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Session Started</span>
              </>
            )}
          </div>
        </div>
        <button 
          onClick={handleFinish} 
          disabled={isFinishing}
          className="text-xs font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest leading-none disabled:opacity-50"
        >
          {isFinishing ? "Generating Results..." : "Finish Session"}
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-8 scrollbar-thin scrollbar-thumb-gray-200 pb-10">
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} max-w-[85%]`}>
                <div className={`flex items-start space-x-3 ${m.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    m.role === 'user' ? 'bg-indigo-600' : 'bg-slate-900 border border-white/5 shadow-sm'
                  }`}>
                    {m.role === 'user' ? <User className="h-4 w-4 text-white" /> : <Bot className="h-4 w-4 text-indigo-400" />}
                  </div>
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed relative group ${
                    m.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none shadow-xl glow-indigo' 
                    : 'bg-slate-900 text-slate-300 border border-white/5 rounded-tl-none'
                  }`}>
                    {m.text}
                    {m.role === 'bot' && (
                      <button 
                        onClick={() => speakText(m.text)}
                        className="absolute -right-10 top-1/2 -translate-y-1/2 p-2 text-slate-600 hover:text-indigo-400 transition-colors opacity-0 group-hover:opacity-100"
                        title="Play audio"
                      >
                        <Volume2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Feedback Bubble (Visible on User Answers) */}
                {m.feedback && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 bg-slate-900/50 border border-white/5 rounded-xl p-3 w-[90%] shadow-sm overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-2">
                       <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Feedback</span>
                       <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                         m.feedback.rating === 'Good' ? 'bg-emerald-500/10 text-emerald-400' : 
                         m.feedback.rating === 'Average' ? 'bg-amber-500/10 text-amber-400' : 
                         'bg-rose-500/10 text-rose-400'
                       }`}>
                         {m.feedback.rating} • {m.feedback.score}/10
                       </span>
                    </div>
                    <p className="text-xs text-slate-400 font-medium italic">"{m.feedback.text}"</p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="flex items-center space-x-3 bg-slate-900 px-6 py-3 rounded-full text-xs text-slate-400 font-black uppercase tracking-widest border border-white/5">
              <Loader2 className="h-3 w-3 animate-spin text-indigo-500" />
              <span>AI is analyzing your answer...</span>
            </div>
          </motion.div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Loading Overlay for Session Initialization */}
      <AnimatePresence>
        {messages.length === 0 && isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-md rounded-3xl"
          >
            <div className="p-8 bg-indigo-600 rounded-3xl shadow-2xl glow-indigo mb-6">
              <Loader2 className="h-12 w-12 text-white animate-spin" />
            </div>
            <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Initializing AI Bench</h3>
            <p className="text-xs font-black text-indigo-400 uppercase tracking-widest animate-pulse px-10 text-center">Synchronizing role parameters and experience context...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="mt-6 flex space-x-3">
        <div className="relative flex-1">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? "Listening..." : "Type your answer..."}
            disabled={isLoading}
            className={`w-full bg-slate-900 border border-white/10 rounded-2xl py-5 pl-8 pr-14 text-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 outline-none transition-all shadow-2xl disabled:opacity-50 ${isListening ? 'border-rose-500 ring-4 ring-rose-500/10' : ''}`}
          />
          <button 
            type="button"
            onClick={toggleListening}
            className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${isListening ? 'text-rose-500 bg-rose-500/10' : 'text-slate-500 hover:text-indigo-400 hover:bg-white/5'}`}
            title={isListening ? "Stop listening" : "Start voice input"}
          >
            {isListening ? <MicOff className="h-5 w-5 animate-pulse" /> : <Mic className="h-5 w-5" />}
          </button>
        </div>
        <button 
          type="submit"
          disabled={!input.trim() || isLoading}
          className="h-[60px] w-[60px] bg-indigo-600 text-white rounded-2xl flex items-center justify-center hover:bg-indigo-500 transition-all disabled:opacity-30 shadow-xl glow-indigo flex-shrink-0"
        >
          <Send className="h-6 w-6" />
        </button>
      </form>
    </div>
  );
}
