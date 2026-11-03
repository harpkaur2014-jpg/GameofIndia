import React from 'react';
import { IndiaTerritory } from '../data/indiaStates';
import { X, Building2, MapPin, Globe, Sparkles, BookOpen, Play } from 'lucide-react';

interface TerritoryDetailDrawerProps {
  territory: IndiaTerritory | null;
  onClose: () => void;
  onTestThisTerritory?: (territory: IndiaTerritory) => void;
}

export const TerritoryDetailDrawer: React.FC<TerritoryDetailDrawerProps> = ({
  territory,
  onClose,
  onTestThisTerritory,
}) => {
  if (!territory) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-slideLeft">
      <div className="space-y-6">
        {/* Drawer Header */}
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              {territory.type === 'state' ? 'State of India' : 'Union Territory'}
            </span>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight mt-0.5">
              {territory.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
              <Building2 className="w-3.5 h-3.5 text-amber-600" />
              <span>Capital</span>
            </div>
            <p className="font-semibold text-slate-900 dark:text-slate-100">{territory.capital}</p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
              <MapPin className="w-3.5 h-3.5 text-amber-600" />
              <span>Region</span>
            </div>
            <p className="font-semibold text-slate-900 dark:text-slate-100">{territory.region} India</p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
              <Globe className="w-3.5 h-3.5 text-amber-600" />
              <span>Land Area</span>
            </div>
            <p className="font-semibold text-slate-900 dark:text-slate-100 font-mono tabular-nums">
              {territory.areaKm2.toLocaleString()} km²
            </p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Major Languages</span>
            </div>
            <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">{territory.language}</p>
          </div>
        </div>

        {/* Famous Landmark */}
        <div className="p-4 bg-amber-50/60 dark:bg-amber-950/20 rounded-xl border border-amber-200/80 dark:border-amber-800/40 text-sm">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300 mb-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Notable Landmark</span>
          </div>
          <p className="text-slate-800 dark:text-slate-200 font-medium">
            {territory.landmark}
          </p>
        </div>

        {/* Geography & Cultural Trivia */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Study Notes & Facts
          </h4>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/70 dark:border-slate-700">
            {territory.funFact}
          </p>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3">
        {onTestThisTerritory && (
          <button
            onClick={() => onTestThisTerritory(territory)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-xs"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Test Me on This State</span>
          </button>
        )}
        <button
          onClick={onClose}
          className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-medium transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};
