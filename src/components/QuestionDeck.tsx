import React, { useState } from 'react';
import { IndiaTerritory } from '../data/indiaStates';
import { Lightbulb, CheckCircle2, XCircle, ArrowRight, MapPin, Sparkles, Building2 } from 'lucide-react';

interface QuestionDeckProps {
  currentTerritory: IndiaTerritory;
  options: IndiaTerritory[];
  answerState: 'unanswered' | 'correct' | 'incorrect';
  selectedOption: string | null;
  onSelectOption: (territoryId: string) => void;
  onNextQuestion: () => void;
  onSkipQuestion: () => void;
  requeueOffset: number | null;
  isFinalCorrectAnswer?: boolean;
}

export const QuestionDeck: React.FC<QuestionDeckProps> = ({
  currentTerritory,
  options,
  answerState,
  selectedOption,
  onSelectOption,
  onNextQuestion,
  onSkipQuestion,
  requeueOffset,
  isFinalCorrectAnswer = false,
}) => {
  const [showHint, setShowHint] = useState<boolean>(false);

  // Reset hint when territory changes
  React.useEffect(() => {
    setShowHint(false);
  }, [currentTerritory.id]);

  return (
    <div className="flex flex-col h-full justify-between gap-4 p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
      {/* Top Question Header */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            <MapPin className="w-3.5 h-3.5" />
            <span>Map Identification</span>
          </div>
          <span className="text-xs text-slate-600 dark:text-slate-300 font-mono">
            {currentTerritory.type === 'state' ? 'State of India' : 'Union Territory'}
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
          Which state or territory is highlighted?
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Look at the highlighted area on the map and choose its name below.
        </p>
      </div>

      {/* 4 Multiple Choice Option Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-auto">
        {options.map((opt, index) => {
          const isSelected = selectedOption === opt.id;
          const isCorrectAnswer = opt.id === currentTerritory.id;

          let buttonStyle = 'bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-500 hover:bg-amber-50/40 dark:hover:bg-amber-950/20';

          if (answerState !== 'unanswered') {
            if (isSelected) {
              if (isCorrectAnswer) {
                // Correct selected -> Green
                buttonStyle = 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-400 font-bold shadow-md shadow-emerald-500/20 scale-[1.01]';
              } else {
                // Incorrect selected -> Red
                buttonStyle = 'bg-rose-600 text-white border-rose-600 ring-2 ring-rose-400 font-bold shadow-md shadow-rose-500/20';
              }
            } else if (isCorrectAnswer) {
              // Reveal correct answer in green when user answered incorrectly
              buttonStyle = 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border-emerald-500 ring-2 ring-emerald-400/80 font-bold';
            } else {
              buttonStyle = 'bg-slate-100 dark:bg-slate-850 text-slate-400 dark:text-slate-600 border-slate-200 dark:border-slate-800 opacity-40';
            }
          }

          return (
            <button
              key={opt.id}
              disabled={answerState !== 'unanswered'}
              onClick={() => onSelectOption(opt.id)}
              className={`relative flex items-center justify-between p-3.5 rounded-xl border text-left font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 active:scale-[0.98] ${buttonStyle}`}
            >
              <div className="flex items-center gap-3">
                <span className={`flex items-center justify-center w-6 h-6 rounded-md text-xs font-mono font-semibold ${
                  answerState !== 'unanswered' && isSelected && isCorrectAnswer
                    ? 'bg-emerald-700 text-white'
                    : answerState !== 'unanswered' && isSelected && !isCorrectAnswer
                    ? 'bg-rose-700 text-white'
                    : answerState !== 'unanswered' && isCorrectAnswer
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                }`}>
                  {index + 1}
                </span>
                <span className="text-base font-semibold tracking-tight">{opt.name}</span>
              </div>

              {answerState !== 'unanswered' && isCorrectAnswer && (
                <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
              )}
              {answerState !== 'unanswered' && isSelected && !isCorrectAnswer && (
                <XCircle className="w-5 h-5 text-white shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* On-Demand Hint Section (Unanswered state) */}
      {answerState === 'unanswered' && (
        <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
          {!showHint ? (
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowHint(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 hover:underline transition-colors"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Need a Hint? (Press H)</span>
              </button>
              <button
                onClick={onSkipQuestion}
                className="text-xs text-slate-600 dark:text-slate-300 hover:text-slate-700 dark:hover:text-slate-200 hover:underline"
              >
                Skip for now
              </button>
            </div>
          ) : (
            <div className="p-3 bg-amber-50/80 dark:bg-amber-950/30 rounded-xl border border-amber-200/80 dark:border-amber-800/50 text-xs text-amber-900 dark:text-amber-200 space-y-1.5 animate-fadeIn">
              <div className="flex items-center justify-between font-semibold">
                <span className="flex items-center gap-1">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                  Study Clues
                </span>
                <button
                  onClick={() => setShowHint(false)}
                  className="text-amber-700 dark:text-amber-400 hover:underline"
                >
                  Hide
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700 dark:text-slate-300 pt-1">
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span><strong>Capital:</strong> {currentTerritory.capital}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span><strong>Region:</strong> {currentTerritory.region} India</span>
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-400 italic pt-1">
                "{currentTerritory.funFact}"
              </p>
            </div>
          )}
        </div>
      )}

      {/* Answer Feedback & Explicit Continue Button */}
      {answerState !== 'unanswered' && (
        <div className="space-y-3 animate-fadeIn">
          <div className={`p-4 rounded-xl border ${
            answerState === 'correct'
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800'
          }`}>
            <div className="flex items-center gap-2 mb-1.5">
              {answerState === 'correct' ? (
                <span className="inline-flex items-center gap-1.5 text-base font-bold text-emerald-800 dark:text-emerald-300">
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                  Correct! That is {currentTerritory.name}.
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-base font-bold text-rose-800 dark:text-rose-300">
                  <XCircle className="w-5 h-5 text-rose-600" />
                  Incorrect. The highlighted state is {currentTerritory.name}.
                </span>
              )}
            </div>

            <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
              <p>
                <strong>Capital:</strong> {currentTerritory.capital} &nbsp;·&nbsp; <strong>Region:</strong> {currentTerritory.region} India
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                {currentTerritory.funFact}
              </p>
              {answerState === 'incorrect' && requeueOffset && (
                <p className="text-amber-700 dark:text-amber-400 font-semibold pt-1">
                  🔄 Scheduled to reappear in {requeueOffset} questions so you can test it again!
                </p>
              )}
            </div>
          </div>

          {/* Explicit Continue Button */}
          <button
            autoFocus
            onClick={onNextQuestion}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.99] cursor-pointer"
          >
            <span>{isFinalCorrectAnswer ? 'View Results' : 'Continue to Next Question'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Keyboard Shortcut Guidance */}
      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800/80">
        <span>Keys <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono">1</kbd> - <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono">4</kbd> to select</span>
        <span><kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono">Space</kbd> / <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono">Enter</kbd> to advance</span>
      </div>
    </div>
  );
};
