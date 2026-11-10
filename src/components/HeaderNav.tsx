import React from 'react';
import { Volume2, VolumeX, Moon, Sun, RotateCcw } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface HeaderNavProps {
  mode: 'quiz' | 'study' | 'summary';
  onSelectMode: (mode: 'quiz' | 'study') => void;
  onRestart: () => void;
  isDark: boolean;
  onToggleDark: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  mode,
  onSelectMode,
  onRestart,
  isDark,
  onToggleDark,
  soundEnabled,
  onToggleSound,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-40">
      {/* Zone 1: Single element brand wordmark */}
      <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
        <div className="flex flex-col justify-center w-7 h-7 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shadow-2xs">
          <div className="h-1/3 bg-[#FF9933]" />
          <div className="h-1/3 bg-white flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full border border-[#000080]" />
          </div>
          <div className="h-1/3 bg-[#128807]" />
        </div>
        <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50 font-sans">
          Game of India
        </span>
      </div>

      {/* Zone 2: Navigation Links (single line, clean typography) */}
      <nav className="hidden sm:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
        <button
          onClick={() => onSelectMode('quiz')}
          className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
            mode === 'quiz' || mode === 'summary'
              ? 'border-amber-500 text-slate-900 dark:text-slate-100 font-semibold'
              : 'border-transparent hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          Geography Test
        </button>
        <button
          onClick={() => onSelectMode('study')}
          className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
            mode === 'study'
              ? 'border-amber-500 text-slate-900 dark:text-slate-100 font-semibold'
              : 'border-transparent hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          Study Map Atlas
        </button>
      </nav>

      {/* Zone 3: Primary Action & Preferences */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onToggleSound}
          title={soundEnabled ? 'Mute Audio' : 'Enable Audio'}
          aria-label={soundEnabled ? 'Mute Audio' : 'Enable Audio'}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
        </button>

        <button
          onClick={onToggleDark}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        <button
          onClick={onRestart}
          title="Restart Quiz"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors whitespace-nowrap shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Restart</span>
        </button>
      </div>
    </header>
  );
};
