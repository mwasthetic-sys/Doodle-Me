
import React from 'react';

export const Header: React.FC = () => (
  <header className="py-8 w-full flex justify-center">
    <div className="flex items-center space-x-4">
      <div className="relative">
        <div className="absolute -inset-1 bg-yellow-300 rounded-full blur-sm opacity-50"></div>
        <div className="w-16 h-16 bg-white doodle-border doodle-shadow flex items-center justify-center -rotate-6">
          <span className="text-3xl">✏️</span>
        </div>
      </div>
      <div className="flex flex-col">
        <h1 className="text-4xl sm:text-6xl font-doodle font-bold tracking-tight text-slate-900 flex items-baseline gap-2">
          <span>Doodle</span>
          <span className="text-6xl sm:text-8xl text-indigo-600 rotate-3 inline-block drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">Me</span>
        </h1>
      </div>
    </div>
  </header>
);
