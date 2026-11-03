import React, { useState } from 'react';
import { IndiaTerritory } from '../data/indiaStates';
import referencePolygons from '../data/referencePolygons.json';
import { ZoomIn, ZoomOut, RotateCcw, Crosshair, HelpCircle, X } from 'lucide-react';

interface MapStageProps {
  currentTerritory: IndiaTerritory | null;
  mode: 'quiz' | 'study';
  answerState: 'unanswered' | 'correct' | 'incorrect';
  selectedOption: string | null;
  allTerritories: IndiaTerritory[];
  masteredIds: Set<string>;
  onSelectTerritoryInStudy?: (t: IndiaTerritory) => void;
}

export const MapStage: React.FC<MapStageProps> = ({
  currentTerritory,
  mode,
  answerState,
  allTerritories,
  masteredIds,
  onSelectTerritoryInStudy,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredStudyId, setHoveredStudyId] = useState<string | null>(null);
  const [showReferenceModal, setShowReferenceModal] = useState<boolean>(false);

  const handleZoom = (delta: number) => {
    setZoomLevel(prev => {
      const next = Math.max(1, Math.min(2.8, prev + delta));
      if (next === 1) setPanOffset({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const polyData = (referencePolygons as unknown) as Record<string, {
    id: string;
    centroid: [number, number];
    bounds: [number, number, number, number];
    poly: [number, number][];
  }>;

  const currentPoly = currentTerritory ? polyData[currentTerritory.id] : null;

  const handleFocusTarget = () => {
    if (!currentPoly) return;
    setZoomLevel(1.85);
    // Center point in 504x572 viewBox is (252, 286)
    const [cx, cy] = currentPoly.centroid;
    const targetX = (252 - cx) * 0.8;
    const targetY = (286 - cy) * 0.8;
    setPanOffset({ x: targetX, y: targetY });
  };

  const isSmallTerritory = currentTerritory ? currentTerritory.areaKm2 < 18000 : false;

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-3 select-none overflow-hidden bg-white/70 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
      {/* Floating Map Utility Bar */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 p-1 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-xl shadow-xs border border-slate-200/70 dark:border-slate-700">
        <button
          onClick={() => handleZoom(0.3)}
          title="Zoom In"
          aria-label="Zoom In"
          className="p-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleZoom(-0.3)}
          title="Zoom Out"
          aria-label="Zoom Out"
          className="p-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        {zoomLevel > 1 && (
          <button
            onClick={handleResetZoom}
            title="Reset Zoom"
            aria-label="Reset Zoom"
            className="p-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
        {mode === 'quiz' && currentPoly && (
          <button
            onClick={handleFocusTarget}
            title="Focus On Highlighted State"
            aria-label="Focus On Highlighted State"
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 rounded-lg hover:bg-amber-100 transition-colors"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>Focus</span>
          </button>
        )}
      </div>

      {/* Target State Guidance Banner */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-2 px-3.5 py-1.5 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-xl shadow-xs border border-slate-200 dark:border-slate-700">
        {mode === 'quiz' ? (
          <>
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                answerState === 'correct'
                  ? 'bg-emerald-500'
                  : answerState === 'incorrect'
                  ? 'bg-rose-500'
                  : 'bg-amber-500 animate-pulse'
              }`}
            />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {answerState === 'unanswered'
                ? 'Identify Highlighted State'
                : answerState === 'correct'
                ? 'Correct State!'
                : 'State Revealed'}
            </span>
          </>
        ) : (
          <button
            onClick={() => setShowReferenceModal(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
            <span>Reference Chart</span>
          </button>
        )}
      </div>

      {/* Map Viewport Container */}
      <div
        className="relative w-full max-w-[504px] aspect-[504/572] transition-transform duration-200 ease-out flex items-center justify-center p-2"
        style={{
          transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
          transformOrigin: 'center center',
        }}
      >
        {/* Exact Clean Reference Map Image: Consistent with user provided map, no labels, no white blocks */}
        <img
          src="/assets/aistudio/india_map_clean.png"
          alt="Map of India highlighting states and union territories"
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain pointer-events-none drop-shadow-sm select-none"
        />

        {/* SVG Overlay layer matching 504x572 image dimensions */}
        <svg
          viewBox="0 0 504 572"
          className="absolute inset-0 w-full h-full z-10 overflow-visible pointer-events-none"
        >
          <defs>
            {/* Luminous Glow Filter for Highlighted State */}
            <filter id="luminous-amber-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#F59E0B" floodOpacity="0.85" />
              <feDropShadow dx="0" dy="0" stdDeviation="10" floodColor="#EA580C" floodOpacity="0.5" />
            </filter>

            <filter id="luminous-green-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#10B981" floodOpacity="0.9" />
              <feDropShadow dx="0" dy="0" stdDeviation="10" floodColor="#059669" floodOpacity="0.6" />
            </filter>

            <filter id="luminous-red-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#EF4444" floodOpacity="0.9" />
              <feDropShadow dx="0" dy="0" stdDeviation="10" floodColor="#DC2626" floodOpacity="0.6" />
            </filter>
          </defs>

          {/* 1. Study Mode Clickable & Hoverable Regions */}
          {mode === 'study' && (
            <g className="pointer-events-auto">
              {allTerritories.map(t => {
                const pItem = polyData[t.id];
                if (!pItem) return null;
                const isHovered = hoveredStudyId === t.id;
                const isMastered = masteredIds.has(t.id);
                const pts = pItem.poly.map(pt => pt.join(',')).join(' ');

                return (
                  <polygon
                    key={`study-${t.id}`}
                    points={pts}
                    fill={isHovered ? '#3B82F6' : isMastered ? '#10B981' : 'transparent'}
                    fillOpacity={isHovered ? 0.45 : isMastered ? 0.2 : 0}
                    stroke={isHovered ? '#1D4ED8' : isMastered ? '#059669' : 'transparent'}
                    strokeWidth={isHovered ? 2.5 : 1}
                    className="cursor-pointer transition-all duration-150"
                    onMouseEnter={() => setHoveredStudyId(t.id)}
                    onMouseLeave={() => setHoveredStudyId(null)}
                    onClick={() => onSelectTerritoryInStudy?.(t)}
                  />
                );
              })}
            </g>
          )}

          {/* 2. Highlight Layer: Target State illuminated clearly directly on the map (No pointers) */}
          {mode === 'quiz' && currentPoly && currentTerritory && (
            <g id="india-target-highlight" className="transition-all duration-200">
              {/* Vibrant Glowing State Polygon Overlay */}
              <polygon
                points={currentPoly.poly.map(pt => pt.join(',')).join(' ')}
                filter={
                  answerState === 'correct'
                    ? 'url(#luminous-green-glow)'
                    : answerState === 'incorrect'
                    ? 'url(#luminous-red-glow)'
                    : 'url(#luminous-amber-glow)'
                }
                fill={
                  answerState === 'correct'
                    ? '#10B981'
                    : answerState === 'incorrect'
                    ? '#EF4444'
                    : '#F59E0B'
                }
                fillOpacity={answerState === 'unanswered' ? 0.65 : 0.75}
                stroke={
                  answerState === 'correct'
                    ? '#047857'
                    : answerState === 'incorrect'
                    ? '#991B1B'
                    : '#B45309'
                }
                strokeWidth={3.5}
                strokeLinejoin="round"
                className="transition-all duration-200"
              />

              {/* Shimmering animated dash border on top of state shape */}
              {answerState === 'unanswered' && (
                <polygon
                  points={currentPoly.poly.map(pt => pt.join(',')).join(' ')}
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  strokeLinejoin="round"
                  className="animate-pulse"
                  opacity={0.9}
                />
              )}

              {/* Highlight Halo for small territories (Goa, Chandigarh, Delhi, Sikkim, Puducherry, etc.) */}
              {isSmallTerritory && answerState === 'unanswered' && (
                <>
                  <circle
                    cx={currentPoly.centroid[0]}
                    cy={currentPoly.centroid[1]}
                    r={18}
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    className="animate-radar origin-center"
                    style={{ transformOrigin: `${currentPoly.centroid[0]}px ${currentPoly.centroid[1]}px` }}
                  />
                  <circle
                    cx={currentPoly.centroid[0]}
                    cy={currentPoly.centroid[1]}
                    r={14}
                    fill="none"
                    stroke="#EA580C"
                    strokeWidth={2}
                    strokeDasharray="4 2"
                  />
                </>
              )}

              {/* Floating Answer Confirmation Badge (revealed smoothly when answered) */}
              {answerState !== 'unanswered' && (
                <g
                  transform={`translate(${currentPoly.centroid[0]}, ${Math.max(26, currentPoly.centroid[1] - 22)})`}
                  className="animate-fadeIn"
                >
                  <rect
                    x={-70}
                    y={-14}
                    width={140}
                    height={28}
                    rx={14}
                    fill={answerState === 'correct' ? '#047857' : '#B91C1C'}
                    stroke="#FFFFFF"
                    strokeWidth={1.5}
                    filter="drop-shadow(0px 3px 6px rgba(0,0,0,0.35))"
                  />
                  <text
                    x={0}
                    y={4}
                    textAnchor="middle"
                    fontSize="10.5"
                    fontWeight="bold"
                    fill="#FFFFFF"
                  >
                    {answerState === 'correct' ? '✓ ' : '✗ '}
                    {currentTerritory.name}
                  </text>
                </g>
              )}
            </g>
          )}

          {/* 3. Study Mode Tooltip on Hover */}
          {mode === 'study' &&
            hoveredStudyId &&
            (() => {
              const pItem = polyData[hoveredStudyId];
              const territory = allTerritories.find(t => t.id === hoveredStudyId);
              if (!pItem || !territory) return null;

              return (
                <g
                  transform={`translate(${pItem.centroid[0]}, ${Math.max(28, pItem.centroid[1] - 18)})`}
                  className="animate-fadeIn"
                >
                  <rect
                    x={-75}
                    y={-22}
                    width={150}
                    height={26}
                    rx={6}
                    fill="#0F172A"
                    stroke="#38BDF8"
                    strokeWidth={1}
                    filter="drop-shadow(0px 3px 6px rgba(0,0,0,0.35))"
                  />
                  <text
                    x={0}
                    y={-5}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="bold"
                    fill="#F8FAFC"
                  >
                    {territory.name} · {territory.capital}
                  </text>
                </g>
              );
            })()}
        </svg>
      </div>

      {/* Mode hint caption at bottom */}
      <div className="mt-2 text-center text-xs text-slate-500 dark:text-slate-400">
        {mode === 'quiz' ? (
          <span>
            The state highlighted in <strong className="text-amber-600 dark:text-amber-400">Golden Amber</strong> is the one to identify. Select its name on the right.
          </span>
        ) : (
          <span>Hover or click any state on the map to review its capital and geography trivia.</span>
        )}
      </div>

      {/* Optional Reference Modal with the original labeled chart */}
      {showReferenceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative max-w-lg w-full bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Original Labeled Reference Chart
              </h3>
              <button
                onClick={() => setShowReferenceModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex justify-center p-2 bg-slate-50 dark:bg-slate-950 rounded-xl">
              <img
                src="/assets/aistudio/image_18b005dd.png"
                alt="Reference map with labels"
                className="max-h-[420px] object-contain"
              />
            </div>
            <p className="text-xs text-center text-slate-500">
              Reference chart for geography review. During the quiz, names are hidden so you can test your knowledge!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
