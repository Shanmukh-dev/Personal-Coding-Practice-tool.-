import React, { useState } from 'react';
import { Bug, Plus, AlertCircle, X } from 'lucide-react';
import { MistakeEntry, Problem } from '../types';
import { DSA_PATTERNS } from '../data/dsaPatterns';

interface MistakeJournalViewProps {
  mistakes: MistakeEntry[];
  catalog: Problem[];
  onAddMistake: (data: Omit<MistakeEntry, 'id' | 'timestamp'>) => Promise<void>;
}

export const MistakeJournalView: React.FC<MistakeJournalViewProps> = ({
  mistakes,
  catalog,
  onAddMistake,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [patternId, setPatternId] = useState('arrays');
  const [problemId, setProblemId] = useState('');
  const [mistakeType, setMistakeType] = useState<MistakeEntry['mistakeType']>(
    'Wrong Algorithm Selection'
  );
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description) return;
    try {
      setSaving(true);
      await onAddMistake({
        userId: '',
        patternId,
        problemId: problemId || 'general-problem',
        mistakeType,
        description,
      });
      setIsAdding(false);
      setDescription('');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (mistakes.length === 0 && !isAdding) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mx-auto mb-4">
          <Bug className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-zinc-200">No recurring mistakes detected.</h2>
        <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1">
          Omega categorizes your execution flaws, edge-case oversights, and implementation bugs to eliminate repeat errors.
        </p>
        <button
          onClick={() => setIsAdding(true)}
          className="mt-6 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-zinc-950 font-semibold text-xs flex items-center gap-2 mx-auto transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Log Execution Mistake</span>
        </button>
      </div>
    );
  }

  // Group mistakes by DSA pattern
  const grouped = mistakes.reduce((acc, m) => {
    acc[m.patternId] = acc[m.patternId] || [];
    acc[m.patternId].push(m);
    return acc;
  }, {} as Record<string, MistakeEntry[]>);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-xl bg-zinc-900 border border-zinc-800">
        <div>
          <span className="text-xs font-mono text-rose-400 font-medium uppercase">
            Error Elimination Engine
          </span>
          <h1 className="text-2xl font-bold text-zinc-100 mt-0.5">
            Mistake Journal ({mistakes.length})
          </h1>
          <p className="text-xs text-zinc-400 max-w-lg mt-1">
            Track implementation bugs, off-by-one errors, and misunderstood edge cases grouped by pattern.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-zinc-950 font-semibold text-xs flex items-center gap-1.5 shrink-0 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Log Execution Mistake</span>
        </button>
      </div>

      {/* Add Mistake Modal */}
      {isAdding && (
        <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-zinc-100">Log New Execution Mistake</h3>
            <button
              onClick={() => setIsAdding(false)}
              className="text-zinc-500 hover:text-zinc-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                  DSA Pattern
                </label>
                <select
                  value={patternId}
                  onChange={(e) => setPatternId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200"
                >
                  {DSA_PATTERNS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                  Mistake Type
                </label>
                <select
                  value={mistakeType}
                  onChange={(e) =>
                    setMistakeType(e.target.value as MistakeEntry['mistakeType'])
                  }
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200"
                >
                  <option value="Wrong Algorithm Selection">Wrong Algorithm Selection</option>
                  <option value="Implementation Bug">Implementation Bug</option>
                  <option value="Off-by-One Error">Off-by-One Error</option>
                  <option value="Forgotten Edge Case">Forgotten Edge Case</option>
                  <option value="Misunderstood Concept">Misunderstood Concept</option>
                  <option value="Time/Space Complexity Failure">
                    Time/Space Complexity Failure
                  </option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                Detailed Mistake Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Forgot to handle empty string case in sliding window expand loop..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-slate-300"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !description}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-zinc-950 font-semibold text-xs"
              >
                Save to Journal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grouped Mistakes */}
      <div className="space-y-6">
        {Object.entries(grouped).map(([patKey, rawEntries]) => {
          const entries = rawEntries as MistakeEntry[];
          const patMeta = DSA_PATTERNS.find((p) => p.id === patKey);

          return (
            <div key={patKey} className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                  {patMeta?.name || patKey}
                </span>
                <span className="text-xs font-mono text-zinc-500">
                  {entries.length} recorded mistake(s)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-rose-400 font-medium">
                        {entry.mistakeType}
                      </span>
                      <span className="font-mono text-[10px] text-zinc-500">
                        {new Date(entry.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-200 leading-relaxed">
                      {entry.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
