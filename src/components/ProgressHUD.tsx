import React from 'react';
import { Flame, Check, RefreshCw, Layers } from 'lucide-react';

interface ProgressHUDProps {
  masteredCount: number;
  totalCount: number;
  remainingQueueCount: number;
  requeuedCount: number;
  streak: number;
  bestStreak: number;
  filterStatesOnly: boolean;
  onToggleFilter: () => void;
}

export const ProgressHUD: React.FC<ProgressHUDProps> = ({
  masteredCount,
  totalCount,
  remainingQueueCount,
  requeuedCount,
  streak,
  bestStreak,
  filterStatesOnly,
  onToggleFilter,
}) => {
  const percentage = Math.round((masteredCount / Math.max(1, totalCount)) * 100);

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3">
      {/* Top Row: Progress Metrics & Scope Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Mastery & Streak */}
        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono tabular-nums">
              {masteredCount} / {totalCount}
            </span>
            <span className="text-slate-500 font-medium">Mastered</span>
          </div>

          <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>

          <div className="flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
            <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-bounce" />
            <span className="font-mono tabular-nums">{streak}</span>
            <span className="font-normal text-slate-500">Streak</span>
            {bestStreak > 0 && (
              <span className="text-slate-600 dark:text-slate-300 font-normal">
                (Best: {bestStreak})
              </span>
            )}
          </div>

          {requeuedCount > 0 && (
            <>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
              <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                <RefreshCw className="w-3.5 h-3.5 text-amber-500" />
                <span className="font-mono tabular-nums">{requeuedCount}</span>
                <span>In Retry</span>
              </div>
            </>
          )}
        </div>

        {/* Right: Territory Scope Toggle (Segmented button control) */}
        <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium">
          <button
            onClick={onToggleFilter}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              !filterStatesOnly
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            All 36 (States + UTs)
          </button>
          <button
            onClick={onToggleFilter}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              filterStatesOnly
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            28 States Only
          </button>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Overall Geography Mastery</span>
          <span className="font-mono font-semibold text-slate-700 dark:text-slate-200 tabular-nums">
            {percentage}%
          </span>
        </div>
        <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-300 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};
