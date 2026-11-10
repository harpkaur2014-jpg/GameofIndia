import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { INDIA_TERRITORIES, STATES_ONLY, IndiaTerritory } from './data/indiaStates';
import { MapStage } from './components/MapStage';
import { QuestionDeck } from './components/QuestionDeck';
import { HeaderNav } from './components/HeaderNav';
import { ProgressHUD } from './components/ProgressHUD';
import { VictorySummary } from './components/VictorySummary';
import { TerritoryDetailDrawer } from './components/TerritoryDetailDrawer';
import { fireCorrectConfetti } from './utils/confetti';
import { soundManager } from './utils/audio';

// Helper to shuffle an array
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export default function App() {
  // App visual theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Sync dark class on documentElement
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Sync sound manager
  useEffect(() => {
    soundManager.enabled = soundEnabled;
  }, [soundEnabled]);

  // App Modes: 'quiz' | 'study' | 'summary'
  const [mode, setMode] = useState<'quiz' | 'study' | 'summary'>('quiz');

  // Territory filter: false = All 36 (States + UTs), true = 28 States Only
  const [filterStatesOnly, setFilterStatesOnly] = useState<boolean>(false);

  // Active pool based on filter
  const activePool = useMemo(() => {
    return filterStatesOnly ? STATES_ONLY : INDIA_TERRITORIES;
  }, [filterStatesOnly]);

  // Spaced Repetition Queue
  const [queue, setQueue] = useState<string[]>([]);
  // The next queue is staged after an answer and committed only on Continue.
  const [pendingQueue, setPendingQueue] = useState<string[] | null>(null);
  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set());
  const [missedHistory, setMissedHistory] = useState<Record<string, number>>({});
  const [streak, setStreak] = useState<number>(0);
  const [bestStreak, setBestStreak] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Current Question State
  const [answerState, setAnswerState] = useState<'unanswered' | 'correct' | 'incorrect'>('unanswered');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [currentOptions, setCurrentOptions] = useState<IndiaTerritory[]>([]);
  const [requeueOffset, setRequeueOffset] = useState<number | null>(null);
  // Preserve the answered target for feedback until Continue is selected.
  const [answeredTerritory, setAnsweredTerritory] = useState<IndiaTerritory | null>(null);

  // Study Mode detail drawer state
  const [inspectedTerritory, setInspectedTerritory] = useState<IndiaTerritory | null>(null);

  // Timer loop for tracking elapsed study time
  useEffect(() => {
    if (mode === 'quiz') {
      const timer = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [mode, startTime]);

  // Initialize or Restart Quiz Session
  const initializeQuiz = useCallback((territories: IndiaTerritory[] = activePool) => {
    const shuffledIds = shuffleArray(territories.map(t => t.id));
    setQueue(shuffledIds);
    setPendingQueue(null);
    setMasteredIds(new Set());
    setMissedHistory({});
    setStreak(0);
    setBestStreak(0);
    setStartTime(Date.now());
    setElapsedSeconds(0);
    setAnswerState('unanswered');
    setSelectedOption(null);
    setRequeueOffset(null);
    setAnsweredTerritory(null);
    setMode('quiz');
  }, [activePool]);

  // Initialize on mount or when filter changes
  useEffect(() => {
    initializeQuiz(activePool);
  }, [activePool, initializeQuiz]);

  // Get current active territory
  const currentTerritoryId = queue.length > 0 ? queue[0] : null;
  const currentTerritory = useMemo(() => {
    if (!currentTerritoryId) return null;
    return activePool.find(t => t.id === currentTerritoryId) || null;
  }, [currentTerritoryId, activePool]);
  const displayedTerritory = answerState === 'unanswered' ? currentTerritory : answeredTerritory;

  // Generate 4 randomized options (1 correct + 3 smart distractors)
  const generateOptionsFor = useCallback((target: IndiaTerritory, pool: IndiaTerritory[]) => {
    const distractors: IndiaTerritory[] = [];

    // Prioritize configured regional distractors that exist in the active pool
    const preferredNames = target.distractors || [];
    for (const name of preferredNames) {
      const match = pool.find(item => item.name === name || item.name.includes(name));
      if (match && match.id !== target.id && !distractors.some(d => d.id === match.id)) {
        distractors.push(match);
      }
      if (distractors.length >= 3) break;
    }

    // Fill remaining slots with random choices from pool
    if (distractors.length < 3) {
      const remainingCandidates = pool.filter(
        item => item.id !== target.id && !distractors.some(d => d.id === item.id)
      );
      const shuffledCandidates = shuffleArray(remainingCandidates);
      for (const item of shuffledCandidates) {
        distractors.push(item);
        if (distractors.length >= 3) break;
      }
    }

    // Shuffle all 4 choices
    return shuffleArray([target, ...distractors.slice(0, 3)]);
  }, []);

  // Update current options whenever the target territory changes
  useEffect(() => {
    if (currentTerritory && answerState === 'unanswered') {
      const opts = generateOptionsFor(currentTerritory, activePool);
      setCurrentOptions(opts);
    }
  }, [currentTerritory, activePool, answerState, generateOptionsFor]);

  // Advance to next question in queue
  const handleNextQuestion = useCallback(() => {
    if (pendingQueue === null) return;
    if (pendingQueue.length === 0) {
      setQueue([]);
      setPendingQueue(null);
      setAnswerState('unanswered');
      setSelectedOption(null);
      setRequeueOffset(null);
      setAnsweredTerritory(null);
      setMode('summary');
      return;
    }

    setQueue(pendingQueue);
    setPendingQueue(null);
    setAnswerState('unanswered');
    setSelectedOption(null);
    setRequeueOffset(null);
    setAnsweredTerritory(null);
  }, [pendingQueue]);

  // Handle User Answer Selection
  const handleSelectOption = useCallback((optionId: string) => {
    if (answerState !== 'unanswered' || !currentTerritory) return;

    setAnsweredTerritory(currentTerritory);
    setSelectedOption(optionId);
    const isCorrect = optionId === currentTerritory.id;

    if (isCorrect) {
      // 1. Correct Answer flow
      setAnswerState('correct');
      soundManager.playCorrect();
      fireCorrectConfetti();

      // Permanently master this state
      const nextMastered = new Set(masteredIds);
      nextMastered.add(currentTerritory.id);
      setMasteredIds(nextMastered);

      // Streak tracking
      setStreak(prev => {
        const next = prev + 1;
        setBestStreak(b => Math.max(b, next));
        return next;
      });

      // Stage removal until the student chooses Continue.
      setPendingQueue(queue.slice(1));
    } else {
      // 2. Incorrect Answer flow
      setAnswerState('incorrect');
      soundManager.playIncorrect();

      // Reset streak
      setStreak(0);

      // Record mistake history for summary
      setMissedHistory(prev => ({
        ...prev,
        [currentTerritory.id]: (prev[currentTerritory.id] || 0) + 1,
      }));

      // Spaced Repetition Logic:
      // Re-insert this state 3 to 5 questions later (or at the end if fewer remain)
      const remainingQueue = queue.slice(1);
      const randomOffset = Math.floor(Math.random() * 3) + 3; // 3, 4, or 5
      const insertIndex = Math.min(remainingQueue.length, randomOffset);

      const updatedQueue = [
        ...remainingQueue.slice(0, insertIndex),
        currentTerritory.id,
        ...remainingQueue.slice(insertIndex),
      ];

      // Stage the spaced-repetition queue until the student chooses Continue.
      setPendingQueue(updatedQueue);
      setRequeueOffset(insertIndex);
    }
  }, [answerState, currentTerritory, masteredIds, queue]);

  // Skip State (re-queues state towards the back without hard penalty)
  const handleSkipQuestion = useCallback(() => {
    if (!currentTerritory || queue.length <= 1) return;
    const remaining = queue.slice(1);
    const pushPos = Math.min(remaining.length, 3);
    const updated = [
      ...remaining.slice(0, pushPos),
      currentTerritory.id,
      ...remaining.slice(pushPos),
    ];
    setQueue(updated);
    setAnswerState('unanswered');
    setSelectedOption(null);
    setAnsweredTerritory(null);
    setPendingQueue(null);
  }, [currentTerritory, queue]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (mode === 'quiz') {
        if (answerState === 'unanswered') {
          if (['1', '2', '3', '4'].includes(e.key)) {
            const index = parseInt(e.key, 10) - 1;
            if (currentOptions[index]) {
              handleSelectOption(currentOptions[index].id);
            }
          }
        } else {
          // If answered, pressing Space or Enter advances
          if (e.code === 'Space' || e.key === 'Enter') {
            e.preventDefault();
            handleNextQuestion();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, answerState, currentOptions, handleSelectOption, handleNextQuestion]);

  // Practice only missed states after a test
  const handlePracticeMissedOnly = () => {
    const missedTerritoryIds = Object.keys(missedHistory);
    if (missedTerritoryIds.length === 0) return;
    const subset = activePool.filter(t => missedTerritoryIds.includes(t.id));
    initializeQuiz(subset);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Bar Navigation */}
      <HeaderNav
        mode={mode}
        onSelectMode={newMode => setMode(newMode)}
        onRestart={() => initializeQuiz(activePool)}
        isDark={isDark}
        onToggleDark={() => setIsDark(d => !d)}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(s => !s)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 flex flex-col gap-5">
        {mode === 'summary' ? (
          /* Victory Completion View */
          <VictorySummary
            totalTerritories={activePool.length}
            missedHistory={missedHistory}
            allTerritories={activePool}
            bestStreak={bestStreak}
            elapsedSeconds={elapsedSeconds}
            onRestart={() => initializeQuiz(activePool)}
            onPracticeMissedOnly={Object.keys(missedHistory).length > 0 ? handlePracticeMissedOnly : undefined}
            onOpenStudyAtlas={() => setMode('study')}
          />
        ) : (
          /* Quiz or Study Interactive View */
          <>
            {/* Top Progress HUD (in Quiz mode) */}
            {mode === 'quiz' && (
              <ProgressHUD
                masteredCount={masteredIds.size}
                totalCount={activePool.length}
                remainingQueueCount={queue.length}
                requeuedCount={Object.keys(missedHistory).length}
                streak={streak}
                bestStreak={bestStreak}
                filterStatesOnly={filterStatesOnly}
                onToggleFilter={() => {
                  setFilterStatesOnly(prev => !prev);
                }}
              />
            )}

            {/* Two-Zone Sandbox Split Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 items-stretch">
              {/* Left Zone: Interactive Map Stage (7 cols on desktop) */}
              <div className="lg:col-span-7 flex flex-col min-h-[460px] sm:min-h-[560px]">
                <MapStage
                  currentTerritory={displayedTerritory}
                  mode={mode}
                  answerState={answerState}
                  selectedOption={selectedOption}
                  allTerritories={activePool}
                  masteredIds={masteredIds}
                  onSelectTerritoryInStudy={t => setInspectedTerritory(t)}
                />
              </div>

              {/* Right Zone: Question Deck (5 cols on desktop) */}
              <div className="lg:col-span-5 flex flex-col">
                {mode === 'quiz' && displayedTerritory ? (
                  <QuestionDeck
                    currentTerritory={displayedTerritory}
                    options={currentOptions}
                    answerState={answerState}
                    selectedOption={selectedOption}
                    onSelectOption={handleSelectOption}
                    onNextQuestion={handleNextQuestion}
                    onSkipQuestion={handleSkipQuestion}
                    requeueOffset={requeueOffset}
                  />
                ) : (
                  /* Study Mode Sidebar Guide */
                  <div className="flex flex-col h-full justify-between gap-4 p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
                    <div className="space-y-4">
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                          Atlas Explorer
                        </span>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight mt-1">
                          States & Territories Atlas
                        </h2>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          Hover or click on any territory on the map to review its capital, land area, famous landmarks, and geography facts.
                        </p>
                      </div>

                      <div className="space-y-2 pt-2">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider pb-1 border-b border-slate-100 dark:border-slate-800">
                          <span>Territories ({activePool.length})</span>
                          <span>Capital</span>
                        </div>
                        <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
                          {activePool.map(t => (
                            <button
                              key={t.id}
                              onClick={() => setInspectedTerritory(t)}
                              className="w-full flex items-center justify-between p-2 rounded-xl text-left text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-amber-500" />
                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                  {t.name}
                                </span>
                              </div>
                              <span className="text-slate-600 dark:text-slate-300 truncate max-w-[140px]">
                                {t.capital}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setMode('quiz')}
                      className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-xs"
                    >
                      Start Geography Test
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>

      {/* Territory Detail Drawer in Study Mode */}
      <TerritoryDetailDrawer
        territory={inspectedTerritory}
        onClose={() => setInspectedTerritory(null)}
        onTestThisTerritory={t => {
          setInspectedTerritory(null);
          // Re-order queue so this territory is tested immediately
          setQueue([t.id, ...queue.filter(id => id !== t.id)]);
          setPendingQueue(null);
          setMode('quiz');
          setAnswerState('unanswered');
          setAnsweredTerritory(null);
        }}
      />
    </div>
  );
}
