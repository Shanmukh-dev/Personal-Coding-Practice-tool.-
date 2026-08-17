import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Calendar,
  RotateCw,
  Star,
  History,
  Search,
  ArrowUpDown,
  Filter,
  X,
  BookOpen,
} from 'lucide-react';
import { LearningMemory, Problem } from '../types';

interface LearningMemoryViewProps {
  memories: LearningMemory[];
  catalog: Problem[];
}

type SortOption =
  | 'lastReviewedDesc'
  | 'lastReviewedAsc'
  | 'firstSolvedDesc'
  | 'firstSolvedAsc'
  | 'reviewCountDesc'
  | 'confidenceDesc';

export const LearningMemoryView: React.FC<LearningMemoryViewProps> = ({ memories, catalog }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('lastReviewedDesc');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  // Filter and sort memories
  const filteredAndSortedMemories = useMemo(() => {
    let list = [...memories];

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((mem) => {
        const problem = catalog.find((p) => p.id === mem.problemId);
        const titleMatch = problem?.title.toLowerCase().includes(q) || mem.problemId.toLowerCase().includes(q);
        const platformMatch = problem?.platform.toLowerCase().includes(q);
        const difficultyMatch = problem?.difficulty.toLowerCase().includes(q);
        const patternMatch = problem?.dsaPatterns?.some((pat) => pat.toLowerCase().includes(q));
        const tagsMatch = problem?.tags?.some((tag) => tag.toLowerCase().includes(q));

        // Also search in reflections notes and insights
        const notesMatch = mem.reflectionHistory?.some(
          (ref) =>
            ref.notes?.toLowerCase().includes(q) ||
            ref.aiAnalysis?.summary?.toLowerCase().includes(q) ||
            ref.aiAnalysis?.suggestedFocus?.toLowerCase().includes(q)
        );

        return titleMatch || platformMatch || difficultyMatch || patternMatch || tagsMatch || notesMatch;
      });
    }

    // Filter by difficulty
    if (selectedDifficulty !== 'all') {
      list = list.filter((mem) => {
        const problem = catalog.find((p) => p.id === mem.problemId);
        return problem?.difficulty === selectedDifficulty;
      });
    }

    // Sort list
    list.sort((a, b) => {
      if (sortBy === 'lastReviewedDesc') {
        return (b.lastReviewedDate || 0) - (a.lastReviewedDate || 0);
      }
      if (sortBy === 'lastReviewedAsc') {
        return (a.lastReviewedDate || 0) - (b.lastReviewedDate || 0);
      }
      if (sortBy === 'firstSolvedDesc') {
        return (b.firstSolvedDate || 0) - (a.firstSolvedDate || 0);
      }
      if (sortBy === 'firstSolvedAsc') {
        return (a.firstSolvedDate || 0) - (b.firstSolvedDate || 0);
      }
      if (sortBy === 'reviewCountDesc') {
        return (b.reviewCount || 0) - (a.reviewCount || 0);
      }
      if (sortBy === 'confidenceDesc') {
        const avgConfidenceA =
          a.confidenceHistory && a.confidenceHistory.length > 0
            ? a.confidenceHistory.reduce((acc, curr) => acc + curr.score, 0) / a.confidenceHistory.length
            : 0;
        const avgConfidenceB =
          b.confidenceHistory && b.confidenceHistory.length > 0
            ? b.confidenceHistory.reduce((acc, curr) => acc + curr.score, 0) / b.confidenceHistory.length
            : 0;
        return avgConfidenceB - avgConfidenceA;
      }
      return 0;
    });

    return list;
  }, [memories, catalog, searchQuery, sortBy, selectedDifficulty]);

  if (memories.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mx-auto mb-4">
          <Sparkles className="w-6 h-6 text-blue-400" />
        </div>
        <h2 className="text-xl font-bold text-zinc-200">No learning history yet.</h2>
        <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1">
          Complete practice problems and reflections to build your permanent long-term DSA memory on Omega.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
        <div className="flex items-center space-x-2 text-slate-300">
          <BookOpen className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-mono font-medium uppercase tracking-wider">
            Permanent Learning Memory
          </span>
        </div>
        <h1 className="text-2xl font-bold text-zinc-100">
          Personal DSA Knowledge Vault
        </h1>
        <p className="text-xs text-zinc-400 max-w-xl">
          Stores confidence trajectories, reflection history, mistakes, and AI insights for every problem solved. Automatically sorted by recent activity.
        </p>
      </div>

      {/* Controls Bar: Search & Sort */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-zinc-900 p-4 rounded-xl border border-zinc-800">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search problems, patterns, notes, reflections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-8 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter & Sort Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Difficulty Filter */}
          <div className="flex items-center space-x-1 bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300">
            <Filter className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="bg-transparent text-xs text-zinc-200 focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-zinc-900 text-zinc-200">All Difficulties</option>
              <option value="Easy" className="bg-zinc-900 text-zinc-200">Easy</option>
              <option value="Medium" className="bg-zinc-900 text-zinc-200">Medium</option>
              <option value="Hard" className="bg-zinc-900 text-zinc-200">Hard</option>
            </select>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center space-x-1.5 bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300">
            <ArrowUpDown className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="text-[11px] font-mono text-zinc-500 hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-transparent text-xs text-zinc-200 font-medium focus:outline-none cursor-pointer"
            >
              <option value="lastReviewedDesc" className="bg-zinc-900 text-zinc-200">
                Last Review (Newest First)
              </option>
              <option value="lastReviewedAsc" className="bg-zinc-900 text-zinc-200">
                Last Review (Oldest First)
              </option>
              <option value="firstSolvedDesc" className="bg-zinc-900 text-zinc-200">
                First Solved (Newest First)
              </option>
              <option value="firstSolvedAsc" className="bg-zinc-900 text-zinc-200">
                First Solved (Oldest First)
              </option>
              <option value="reviewCountDesc" className="bg-zinc-900 text-zinc-200">
                Most Reviews
              </option>
              <option value="confidenceDesc" className="bg-zinc-900 text-zinc-200">
                Highest Avg Confidence
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Memory Cards Count Indicator */}
      <div className="flex items-center justify-between text-xs font-mono text-zinc-500 px-1">
        <span>
          Showing {filteredAndSortedMemories.length} of {memories.length} Knowledge Memory Item{memories.length === 1 ? '' : 's'}
        </span>
        {searchQuery && (
          <span className="text-blue-400">
            Filtered by: "{searchQuery}"
          </span>
        )}
      </div>

      {/* Memory List */}
      {filteredAndSortedMemories.length === 0 ? (
        <div className="p-12 rounded-xl bg-zinc-900 border border-zinc-800 text-center space-y-2">
          <Search className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
          <h3 className="text-base font-bold text-zinc-300">No matching knowledge memories found</h3>
          <p className="text-xs text-zinc-500">
            Try adjusting your search query or difficulty filters to see more memories.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedDifficulty('all');
            }}
            className="mt-3 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 transition-all"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAndSortedMemories.map((mem) => {
            const problem = catalog.find((p) => p.id === mem.problemId);

            return (
              <div
                key={mem.problemId}
                className="p-6 rounded-xl bg-zinc-900 border border-zinc-800 space-y-4 hover:border-zinc-700 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 uppercase font-semibold">
                        {problem?.platform || 'Problem'}
                      </span>
                      {problem?.difficulty && (
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                            problem.difficulty === 'Easy'
                              ? 'text-slate-200 bg-slate-100/10'
                              : problem.difficulty === 'Medium'
                              ? 'text-amber-400 bg-amber-500/10'
                              : 'text-rose-400 bg-rose-500/10'
                          }`}
                        >
                          {problem.difficulty}
                        </span>
                      )}
                      <span className="text-xs font-mono text-blue-400 font-medium">
                        Reviews: {mem.reviewCount}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-zinc-100">
                      {problem?.title || mem.problemId}
                    </h3>

                    {problem?.dsaPatterns && problem.dsaPatterns.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {problem.dsaPatterns.map((pat) => (
                          <span
                            key={pat}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-950 text-zinc-400 border border-zinc-800"
                          >
                            {pat}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:items-end gap-1 text-xs font-mono text-zinc-400 shrink-0">
                    <div className="flex items-center gap-1.5 text-blue-300 font-semibold">
                      <RotateCw className="w-3.5 h-3.5 text-blue-400" />
                      <span>Last Review: {new Date(mem.lastReviewedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-zinc-500 text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                      <span>First Solved: {new Date(mem.firstSolvedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>

                {/* Reflections timeline */}
                {mem.reflectionHistory && mem.reflectionHistory.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-mono uppercase text-zinc-400 font-semibold flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Reflection Log ({mem.reflectionHistory.length})</span>
                    </span>
                    <div className="space-y-2">
                      {mem.reflectionHistory.map((ref) => (
                        <div
                          key={ref.id}
                          className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1.5 text-amber-400">
                              <Star className="w-3.5 h-3.5 fill-amber-400" />
                              <span className="font-mono font-bold">Confidence {ref.confidence}/5</span>
                            </div>
                            <span className="text-[10px] font-mono text-zinc-500">
                              {new Date(ref.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          {ref.notes && (
                            <p className="text-zinc-300 italic">
                              "{ref.notes}"
                            </p>
                          )}

                          {ref.aiAnalysis && (
                            <div className="mt-2 p-2.5 rounded bg-slate-100/5 border border-slate-300/20 text-slate-200 space-y-1">
                              <span className="font-mono text-[10px] uppercase block font-bold text-amber-400 flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                <span>AI Reflection Insight</span>
                              </span>
                              <p className="text-[11px]">{ref.aiAnalysis.summary}</p>
                              {ref.aiAnalysis.suggestedFocus && (
                                <p className="text-[11px] font-semibold text-slate-100">
                                  Focus: {ref.aiAnalysis.suggestedFocus}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
