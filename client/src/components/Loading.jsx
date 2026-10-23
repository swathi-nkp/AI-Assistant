import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

const Loading = ({ message = 'Loading study assistant...', fullScreen = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
      <div className="relative">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 animate-pulse">
          <Sparkles className="w-6 h-6" />
        </div>
        <Loader2 className="w-14 h-14 text-indigo-600 animate-spin absolute -top-1 -left-1" />
      </div>
      <p className="text-sm font-semibold text-slate-700 animate-pulse">{message}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-xs">
        {content}
      </div>
    );
  }

  return content;
};

export default Loading;
