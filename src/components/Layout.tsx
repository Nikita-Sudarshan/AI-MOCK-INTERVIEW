import { ReactNode } from 'react';
import Navbar from './Navbar';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col selection:bg-indigo-500/30">
      <Navbar />
      <main className="flex-1 py-12">
        {children}
      </main>
      <footer className="mt-auto py-16 border-t border-white/5 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-4">
          <div className="flex justify-center">
            <span className="h-1 w-8 bg-slate-900 rounded-full" />
          </div>
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">
            © {new Date().getFullYear()} AI.Coach Node-Alpha // All rights reserved
          </p>
        </div>
      </footer>
    </div>
  );
}
