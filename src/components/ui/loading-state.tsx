import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  label?: string;
  fullScreen?: boolean;
}

export function LoadingState({ message, label, fullScreen = false }: LoadingStateProps) {
  const displayText = label || message || 'Carregando dados...';

  const content = (
    <div className="flex flex-col items-center justify-center p-8 space-y-3">
      <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center animate-spin">
        <Loader2 className="w-6 h-6" />
      </div>
      <p className="text-sm font-medium text-slate-300">{displayText}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-xs flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 shadow-float border border-slate-100">
          {content}
        </div>
      </div>
    );
  }

  return content;
}
