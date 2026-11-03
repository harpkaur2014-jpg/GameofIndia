import React, { useEffect } from 'react';
import { IndiaTerritory } from '../data/indiaStates';
import { Trophy, Award, RotateCcw, BookOpen, CheckCircle, RefreshCw, Flame, Clock } from 'lucide-react';
import { fireVictoryCelebration } from '../utils/confetti';
import { soundManager } from '../utils/audio';

interface VictorySummaryProps {
  totalTerritories: number;
  missedHistory: Record<string, number>;
  allTerritories: IndiaTerritory[];
  bestStreak: number;
  elapsedSeconds: number;
  onRestart: () => void;
  onPracticeMissedOnly?: () => void;
  onOpenStudyAtlas: () => void;
}

export const VictorySummary: React.FC<VictorySummaryProps> = ({
  totalTerritories,
  missedHistory,
  allTerritories,
  bestStreak,
  elapsedSeconds,
  onRestart,
  onPracticeMissedOnly,
  onOpenStudyAtlas,
}) => {
  useEffect(() => {
    fireVictoryCelebration();
    soundManager.playVictory();
  }, []);

  const missedCount = Object.keys(missedHistory).length;
  const firstTryCount = totalTerritories - missedCount;
  const accuracy = Math.round((firstTryCount / Math.max(1, totalTerritories)) * 100);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4 space-y-8 animate-fadeIn">
      {/* Victory Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 shadow-md">
          <Trophy className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
          Geography Master!
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
          You have successfully identified and mastered all <strong>{totalTerritories}</strong> states and territories of India on the map!
        </p>
      </div>

      {/* KPI Performance Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs text-center space-y-1">
          <div className="flex items-center justify-center gap-1 text-xs text-slate-500 dark:text-slate-400">
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span>First-Try Accuracy</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 font-mono tabular-nums">
            {accuracy}%
          </p>
          <p className="text-xs text-slate-400">
            {firstTryCount} / {totalTerritories} flawless
          </p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs text-center space-y-1">
          <div className="flex items-center justify-center gap-1 text-xs text-slate-500 dark:text-slate-400">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>Best Streak</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400 font-mono tabular-nums">
            {bestStreak}
          </p>
          <p className="text-xs text-slate-400">Consecutive correct</p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs text-center space-y-1">
          <div className="flex items-center justify-center gap-1 text-xs text-slate-500 dark:text-slate-400">
            <RefreshCw className="w-3.5 h-3.5 text-indigo-500" />
            <span>Learned via Retry</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 font-mono tabular-nums">
            {missedCount}
          </p>
          <p className="text-xs text-slate-400">Mastered on spaced review</p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs text-center space-y-1">
          <div className="flex items-center justify-center gap-1 text-xs text-slate-500 dark:text-slate-400">
            <Clock className="w-3.5 h-3.5 text-emerald-500" />
            <span>Total Study Time</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 font-mono tabular-nums">
            {formatTime(elapsedSeconds)}
          </p>
          <p className="text-xs text-slate-400">Focused preparation</p>
        </div>
      </div>

      {/* Spaced Repetition Breakdown List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
          Mastery Breakdown by Territory
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
          {allTerritories.map(t => {
            const misses = missedHistory[t.id] || 0;
            return (
              <div
                key={t.id}
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850 text-xs"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{t.name}</span>
                </div>
                <span className="font-mono text-slate-600 dark:text-slate-300">
                  {misses === 0 ? 'Flawless' : `${misses} ${misses === 1 ? 'retry' : 'retries'}`}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Actions */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
        <button
          onClick={onRestart}
          className="flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-semibold shadow-md transition-all active:scale-[0.98]"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Play Full Quiz Again</span>
        </button>

        {missedCount > 0 && onPracticeMissedOnly && (
          <button
            onClick={onPracticeMissedOnly}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-semibold transition-all active:scale-[0.98]"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Practice {missedCount} Missed States</span>
          </button>
        )}

        <button
          onClick={onOpenStudyAtlas}
          className="flex items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-sm font-semibold transition-all"
        >
          <BookOpen className="w-4 h-4" />
          <span>Explore Study Map Atlas</span>
        </button>
      </div>
    </div>
  );
};
