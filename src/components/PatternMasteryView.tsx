import React, { useState } from 'react';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Award,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Zap,
} from 'lucide-react';
import { PatternMastery } from '../types';
import { DSA_PATTERNS } from '../data/dsaPatterns';

interface PatternMasteryViewProps {
  patternMasteries: PatternMastery[];
}

export const PatternMasteryView: React.FC<PatternMasteryViewProps> = ({
  patternMasteries,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'strong' | 'weak'>('all');

  // Filter practiced patterns only (defensive check for totalSolved or presence in patternMasteries)
  const practicedPatterns = patternMasteries.filter((m) => m.totalSolved > 0 || m.lastPracticedAt);

  if (practicedPatterns.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-purple-400 mx-auto mb-4 shadow-xl">
          <Brain className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-zinc-100">
          No Practiced Patterns Found Yet
        </h2>
        <p className="text-xs text-zinc-400 max-w-md mx-auto mt-2 leading-relaxed">
          The Pattern Taxonomy dynamically displays <strong className="text-zinc-200">only patterns you have practiced</strong>.
          Complete a problem in your Daily Queue or record a practice reflection to activate taxonomy metrics.
        </p>
      </div>
    );
  }

  // Filter based on search and status tabs
  const filteredPatterns = practicedPatterns
    .filter((m) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        m.patternName.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q)
      );
    })
    .filter((m) => {
      if (statusFilter === 'strong') {
        return (
          m.comparativeStatus === 'Strongest' ||
          m.comparativeStatus === 'Above Average' ||
          m.masteryTier === 'Mastered' ||
          m.masteryTier === 'Proficient'
        );
      }
      if (statusFilter === 'weak') {
        return (
          m.comparativeStatus === 'Needs Focus' ||
          m.comparativeStatus === 'Critical Weakness' ||
          m.masteryTier === 'Novice' ||
          m.masteryTier === 'Developing'
        );
      }
      return true;
    });

  // Calculate summary metrics across practiced patterns
  const strongest = practicedPatterns.find(
    (m) => m.relativeRank === 1 || m.comparativeStatus === 'Strongest'
  ) || practicedPatterns[0];

  const focusArea = practicedPatterns.find(
    (m) => m.comparativeStatus === 'Critical Weakness' || m.comparativeStatus === 'Needs Focus'
  ) || practicedPatterns[practicedPatterns.length - 1];

  const totalSolves = practicedPatterns.reduce((acc, p) => acc + p.totalSolved, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Overview Cards */}
      <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-purple-400 font-bold uppercase tracking-wider">
                Taxonomy Intelligence
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                {practicedPatterns.length} Practiced Pattern{practicedPatterns.length === 1 ? '' : 's'}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-zinc-100 mt-1">
              DSA Pattern Mastery Taxonomy
            </h1>
            <p className="text-xs text-zinc-400 max-w-2xl mt-1 leading-relaxed">
              Dynamically computed exclusively from your practiced problem logs, reflection history, and comparative cross-pattern analytics.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-mono text-zinc-400">Total Logged Solves:</span>
            <span className="text-sm font-bold font-mono text-purple-400 px-2.5 py-1 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              {totalSolves}
            </span>
          </div>
        </div>

        {/* Analytics Summary Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-zinc-800">
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center gap-3.5">
            <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-zinc-400 uppercase font-semibold block">
                Top Practiced Pattern
              </span>
              <span className="text-sm font-bold text-zinc-100">
                {strongest?.patternName || 'N/A'}
              </span>
              <span className="text-[10px] font-mono text-purple-400 block font-semibold">
                Rank #1 &bull; {strongest?.recognitionScore || 0}% Recognition
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center gap-3.5">
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-zinc-400 uppercase font-semibold block">
                Recommended Focus Area
              </span>
              <span className="text-sm font-bold text-zinc-100">
                {focusArea?.patternName || 'N/A'}
              </span>
              <span className="text-[10px] font-mono text-amber-400 block font-semibold">
                {focusArea?.comparativeStatus || 'Needs Practice'} &bull; {focusArea?.implementationScore || 0}% Implementation
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center gap-3.5">
            <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400 border border-purple-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-zinc-400 uppercase font-semibold block">
                Smart Analysis Engine
              </span>
              <span className="text-sm font-bold text-zinc-100">
                Cross-Pattern Sync
              </span>
              <span className="text-[10px] font-mono text-blue-400 block font-semibold">
                Updated on every log &amp; memory
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search practiced patterns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            All Practiced ({practicedPatterns.length})
          </button>
          <button
            onClick={() => setStatusFilter('strong')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all whitespace-nowrap ${
              statusFilter === 'strong'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Top Strengths
          </button>
          <button
            onClick={() => setStatusFilter('weak')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all whitespace-nowrap ${
              statusFilter === 'weak'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Needs Focus
          </button>
        </div>
      </div>

      {/* Grid of Practiced Pattern Masteries */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPatterns.map((mastery) => {
          const meta = DSA_PATTERNS.find((p) => p.id === mastery.patternId);

          return (
            <div
              key={mastery.patternId}
              className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4 hover:border-zinc-700 transition-all shadow-lg flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Top Badges & Category */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[10px] font-mono uppercase text-zinc-500 font-semibold">
                        {mastery.category || meta?.category || 'Pattern'}
                      </span>
                      {mastery.relativeRank && (
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-purple-400 border border-purple-500/20">
                          Rank #{mastery.relativeRank}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-base text-zinc-100">
                      {mastery.patternName}
                    </h3>
                  </div>

                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
                    {mastery.totalSolved} Solved
                  </span>
                </div>

                {/* Status Badges Row */}
                <div className="flex items-center gap-2 flex-wrap text-[11px] font-mono">
                  {mastery.comparativeStatus && (
                    <span
                      className={`px-2 py-0.5 rounded font-semibold border ${
                        mastery.comparativeStatus === 'Strongest'
                          ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                          : mastery.comparativeStatus === 'Above Average'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : mastery.comparativeStatus === 'Critical Weakness'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          : mastery.comparativeStatus === 'Needs Focus'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                      }`}
                    >
                      {mastery.comparativeStatus}
                    </span>
                  )}

                  {mastery.masteryTier && (
                    <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-medium">
                      {mastery.masteryTier}
                    </span>
                  )}

                  {mastery.trend && (
                    <span className="flex items-center gap-1 text-zinc-400 font-semibold">
                      {mastery.trend === 'improving' ? (
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                      ) : mastery.trend === 'declining' ? (
                        <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                      ) : (
                        <Minus className="w-3.5 h-3.5 text-zinc-500" />
                      )}
                      <span className="capitalize">{mastery.trend}</span>
                    </span>
                  )}
                </div>

                {meta?.description && (
                  <p className="text-xs text-zinc-400 line-clamp-2">
                    {meta.description}
                  </p>
                )}

                {/* Metrics Breakdown */}
                <div className="space-y-2.5 pt-2 border-t border-zinc-800/80">
                  {/* Recognition Score */}
                  <div>
                    <div className="flex justify-between text-[11px] font-mono mb-1">
                      <span className="text-zinc-400">Pattern Recognition</span>
                      <span className="text-purple-400 font-semibold">
                        {mastery.recognitionScore}%
                      </span>
                    </div>
                    <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-purple-500 h-full rounded-full transition-all"
                        style={{ width: `${mastery.recognitionScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Implementation Score */}
                  <div>
                    <div className="flex justify-between text-[11px] font-mono mb-1">
                      <span className="text-zinc-400">Implementation Accuracy</span>
                      <span className="text-slate-200 font-semibold">
                        {mastery.implementationScore}%
                      </span>
                    </div>
                    <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-slate-300 h-full rounded-full transition-all"
                        style={{ width: `${mastery.implementationScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Retention Score */}
                  <div>
                    <div className="flex justify-between text-[11px] font-mono mb-1">
                      <span className="text-zinc-400">Retention &amp; Recall</span>
                      <span className="text-blue-400 font-semibold">
                        {mastery.retentionScore}%
                      </span>
                    </div>
                    <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full transition-all"
                        style={{ width: `${mastery.retentionScore}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Smart Comparative Analysis & Key Weakness Box */}
              <div className="space-y-2 pt-3 border-t border-zinc-800/80">
                {mastery.comparisonInsight && (
                  <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-300 space-y-1">
                    <div className="flex items-center gap-1.5 text-purple-400 font-mono font-semibold">
                      <Sparkles className="w-3 h-3" />
                      <span>Cross-Pattern Analysis</span>
                    </div>
                    <p className="leading-relaxed text-zinc-400">
                      {mastery.comparisonInsight}
                    </p>
                  </div>
                )}

                {mastery.keyWeaknessNote && (
                  <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-start gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{mastery.keyWeaknessNote}</span>
                  </div>
                )}

                {mastery.lastPracticedAt && (
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-zinc-500" />
                      <span>Last Practiced</span>
                    </span>
                    <span>
                      {new Date(mastery.lastPracticedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
