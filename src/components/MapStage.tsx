import React, { useRef, useState } from 'react';
import { IndiaTerritory } from '../data/indiaStates';
import indiaGeoPaths from '../data/indiaGeoPaths.json';
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
  const [isDragging, setIsDragging] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    startPanX: number;
    startPanY: number;
    moved: boolean;
  } | null>(null);
  const suppressClickRef = useRef(false);
  const [hoveredStudyId, setHoveredStudyId] = useState<string | null>(null);
  const [hoveredStudyPoint, setHoveredStudyPoint] = useState<[number, number] | null>(null);
  const [showReferenceModal, setShowReferenceModal] = useState<boolean>(false);

  const clampPan = (offset: { x: number; y: number }, zoom: number) => {
    const viewport = viewportRef.current;
    if (!viewport || zoom <= 1) return { x: 0, y: 0 };
    const maxX = (viewport.clientWidth * (zoom - 1)) / 2;
    const maxY = (viewport.clientHeight * (zoom - 1)) / 2;
    return {
      x: Math.max(-maxX, Math.min(maxX, offset.x)),
      y: Math.max(-maxY, Math.min(maxY, offset.y)),
    };
  };

  const handleZoom = (delta: number) => {
    const nextZoom = Math.max(1, Math.min(2.8, zoomLevel + delta));
    setZoomLevel(nextZoom);
    setPanOffset(previous => clampPan(previous, nextZoom));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const polyData = indiaGeoPaths as Record<string, {
    d: string;
    centroid: [number, number];
    bounds: [number, number, number, number];
    hitAreas?: [number, number][];
  }>;

  const currentPoly = currentTerritory ? polyData[currentTerritory.id] : null;

  const handleFocusTarget = () => {
    if (!currentPoly) return;
    const nextZoom = 1.85;
    setZoomLevel(nextZoom);
    // Center the target while keeping the map inside the draggable viewport.
    const [cx, cy] = currentPoly.centroid;
    const viewport = viewportRef.current;
    const scaleX = (viewport?.clientWidth ?? 504) / 504;
    const scaleY = (viewport?.clientHeight ?? 572) / 572;
    setPanOffset(clampPan({
      x: (252 - cx) * scaleX * nextZoom,
      y: (286 - cy) * scaleY * nextZoom,
    }, nextZoom));
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (zoomLevel <= 1 || event.button !== 0) return;
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startPanX: panOffset.x,
      startPanY: panOffset.y,
      moved: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - drag.startX;
    const deltaY = event.clientY - drag.startY;
    if (Math.abs(deltaX) + Math.abs(deltaY) > 3) drag.moved = true;
    setPanOffset(clampPan({ x: drag.startPanX + deltaX, y: drag.startPanY + deltaY }, zoomLevel));
  };

  const handlePointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    setIsDragging(false);
    suppressClickRef.current = drag.moved;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (drag.moved) window.setTimeout(() => { suppressClickRef.current = false; }, 0);
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
        ref={viewportRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onClickCapture={event => {
          if (suppressClickRef.current) {
            event.preventDefault();
            event.stopPropagation();
            suppressClickRef.current = false;
          }
        }}
        className={`relative w-full max-w-[504px] aspect-[504/572] ${
          isDragging ? 'transition-none' : 'transition-transform duration-200 ease-out'
        } flex items-center justify-center p-2 ${
          zoomLevel > 1 ? 'cursor-grab active:cursor-grabbing' : ''
        }`}
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
          transformOrigin: 'center center',
          touchAction: zoomLevel > 1 ? 'none' : 'auto',
        }}
      >
        {/* GeoJSON map and highlights share one set of state boundaries. */}
        <svg
          viewBox="0 0 504 572"
          role="img"
          aria-label="Map of India highlighting states and union territories"
          className="absolute inset-0 w-full h-full z-10 overflow-visible"
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

          {/* Base territories are drawn directly from the supplied GeoJSON. */}
          <g>
            {Object.entries(polyData).map(([id, geometry]) => {
              const territory = allTerritories.find(t => t.id === id);
              const isHovered = mode === 'study' && hoveredStudyId === id;
              const isMastered = masteredIds.has(id);
              const canInspect = mode === 'study' && Boolean(territory);

              return (
                <path
                  key={`map-${id}`}
                  d={geometry.d}
                  fill={isHovered ? '#3B82F6' : isMastered ? '#10B981' : '#5D91C9'}
                  fillOpacity={isHovered ? 0.8 : isMastered ? 0.75 : 1}
                  fillRule="evenodd"
                  stroke="#FFFFFF"
                  strokeWidth={0.8}
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                  className={canInspect ? 'cursor-pointer transition-colors duration-150' : 'pointer-events-none'}
                  onMouseEnter={canInspect ? () => {
                    setHoveredStudyId(id);
                    setHoveredStudyPoint(geometry.centroid);
                  } : undefined}
                  onMouseLeave={canInspect ? () => {
                    setHoveredStudyId(null);
                    setHoveredStudyPoint(null);
                  } : undefined}
                  onClick={canInspect && territory ? () => onSelectTerritoryInStudy?.(territory) : undefined}
                />
              );
            })}
          </g>

          {/* Enlarged hover and click targets help users find tiny or scattered territories. */}
          {mode === 'study' && Object.entries(polyData).map(([id, geometry]) => {
            const territory = allTerritories.find(t => t.id === id);
            if (!territory || !geometry.hitAreas?.length) return null;
            const isHovered = hoveredStudyId === id;
            const hitRadius = id === 'lakshadweep' ? 11 : id === 'andaman_nicobar' ? 9 : 8;

            return (
              <g key={`hit-areas-${id}`}>
                {geometry.hitAreas.map(([cx, cy], index) => (
                  <circle
                    key={`marker-${index}`}
                    cx={cx}
                    cy={cy}
                    r={isHovered ? 3.2 : 2.4}
                    fill={isHovered ? '#3B82F6' : '#F59E0B'}
                    stroke="#FFFFFF"
                    strokeWidth={1}
                    vectorEffect="non-scaling-stroke"
                    pointerEvents="none"
                  />
                ))}
                {geometry.hitAreas.map(([cx, cy], index) => (
                  <circle
                    key={`target-${index}`}
                    cx={cx}
                    cy={cy}
                    r={hitRadius}
                    fill="transparent"
                    className="cursor-pointer"
                    pointerEvents="all"
                    onMouseEnter={() => {
                      setHoveredStudyId(id);
                      setHoveredStudyPoint([cx, cy]);
                    }}
                    onMouseLeave={() => {
                      setHoveredStudyId(null);
                      setHoveredStudyPoint(null);
                    }}
                    onClick={() => onSelectTerritoryInStudy?.(territory)}
                  />
                ))}
              </g>
            );
          })}

          {/* The target is filled from the same exact path used for its map border. */}
          {mode === 'quiz' && currentPoly && currentTerritory && (
            <g id="india-target-highlight" className="transition-all duration-200">
              {/* Vibrant Glowing State Polygon Overlay */}
              <path
                d={currentPoly.d}
                fillRule="evenodd"
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
                strokeWidth={0.8}
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                className="transition-all duration-200"
              />

              {/* Shimmering animated dash border on top of state shape */}
              {answerState === 'unanswered' && (
                <path
                  d={currentPoly.d}
                  fillRule="evenodd"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth={1.2}
                  strokeDasharray="6 4"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
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
                  transform={`translate(${(hoveredStudyPoint ?? pItem.centroid)[0]}, ${Math.max(28, (hoveredStudyPoint ?? pItem.centroid)[1] - 18)})`}
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
        {zoomLevel > 1 && (
          <span className="block mt-1 font-medium text-slate-600 dark:text-slate-300">
            Drag the map to explore the zoomed area.
          </span>
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
