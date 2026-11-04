import React from 'react';
import Logo from '@/components/ui/Logo';

export default function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen app-grid-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center mb-8">
          <Logo size="lg" />
          <h1 className="mt-4 text-2xl font-bold text-white">Doc Builder</h1>
          <p className="mt-1 text-sm text-slate-400">Generador de documentación analítica</p>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-sm">
          {children}
        </div>
      </div>
    </main>
  );
}
