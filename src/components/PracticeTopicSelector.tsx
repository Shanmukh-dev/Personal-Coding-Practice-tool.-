import React, { useState } from 'react';
import { Target, CheckCircle2, RefreshCw, Filter, Sparkles, Layers, ChevronDown, ChevronUp } from 'lucide-react';
import { DSA_PATTERNS } from '../data/dsaPatterns';

interface PracticeTopicSelectorProps {
  selectedTopics: string[];
  onUpdateTopics: (topics: string[]) => void;
  onRegenerateQueue: () => void;
}

const CORE_FAANG_TOPICS = [
  'arrays',
  'two_pointers',
  'sliding_window',
  'binary_search',
  'hashing',
  'stack',
  'dfs',
  'bfs',
  'dynamic_programming',
];

export const PracticeTopicSelector: React.FC<PracticeTopicSelectorProps> = ({
  selectedTopics = [],
  onUpdateTopics,
  onRegenerateQueue,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const topics = selectedTopics || [];

  const toggleTopic = (patternId: string) => {
    if (topics.includes(patternId)) {
      onUpdateTopics(topics.filter((id) => id !== patternId));
    } else {
      onUpdateTopics([...topics, patternId]);
    }
  };

  const handleSelectAll = () => {
    onUpdateTopics(DSA_PATTERNS.map((p) => p.id));
  };

  const handleClearAll = () => {
    onUpdateTopics([]);
  };

  const handleSelectCore = () => {
    onUpdateTopics(CORE_FAANG_TOPICS);
  };

  return (
    <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800/90 space-y-4 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center space-x-3 text-left w-full sm:w-auto group"
        >
          <div className="p-2 rounded-xl bg-zinc-800 text-zinc-300 border border-zinc-700/80 group-hover:text-zinc-100 transition-colors">
            <Target className="w-4 h-4 text-slate-300" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-zinc-100 group-hover:text-zinc-200 transition-colors">
                Current Practice Topics
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100/10 text-slate-200 border border-slate-300/20 font-bold">
                {selectedTopics.length} Active
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Topics stay selected until changed. Daily queue problems strictly match your active filters.
            </p>
          </div>
        </button>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <button
            onClick={onRegenerateQueue}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md"
            title="Regenerate daily queue with questions from active topics"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Regenerate Queue</span>
          </button>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-all flex items-center gap-1 text-xs font-semibold"
            title={isCollapsed ? 'Expand Practice Topics' : 'Collapse Practice Topics'}
          >
            <span className="hidden sm:inline">{isCollapsed ? 'Expand' : 'Collapse'}</span>
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="pt-4 border-t border-zinc-800/80 space-y-4 animate-fadeIn">
          {/* Preset Quick Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">Presets:</span>
              <button
                onClick={handleSelectCore}
                className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono text-[11px] transition-colors border border-zinc-700"
              >
                FAANG Core 9
              </button>
              <button
                onClick={handleSelectAll}
                className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono text-[11px] transition-colors border border-zinc-700"
              >
                Select All
              </button>
              <button
                onClick={handleClearAll}
                className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 font-mono text-[11px] transition-colors border border-zinc-800"
              >
                Clear All
              </button>
            </div>

            {selectedTopics.length === 0 && (
              <span className="text-rose-400 text-xs font-mono flex items-center gap-1">
                ⚠️ Select at least 1 topic to generate targeted queue problems
              </span>
            )}
          </div>

          {/* Topics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {DSA_PATTERNS.map((pattern) => {
              const isSelected = topics.includes(pattern.id);
              return (
                <button
                  key={pattern.id}
                  onClick={() => toggleTopic(pattern.id)}
                  className={`p-2.5 rounded-xl text-left border transition-all relative group flex flex-col justify-between min-h-[64px] ${
                    isSelected
                      ? 'bg-slate-100/10 border-slate-300/40 text-slate-200 font-semibold'
                      : 'bg-zinc-950/80 border-zinc-800/80 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 w-full">
                    <span className="text-xs font-bold truncate tracking-tight">{pattern.name}</span>
                    {isSelected && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-slate-200 shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center justify-between w-full mt-1.5">
                    <span className="text-[10px] font-mono text-zinc-500 group-hover:text-zinc-400 truncate">
                      {pattern.category}
                    </span>
                    <span
                      className={`text-[9px] font-mono px-1 rounded ${
                        pattern.interviewWeight === 'Essential'
                          ? 'text-amber-400 bg-amber-500/10'
                          : 'text-zinc-400 bg-zinc-800'
                      }`}
                    >
                      {pattern.interviewWeight}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

