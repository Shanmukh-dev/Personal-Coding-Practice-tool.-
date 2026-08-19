import React, { useState, useMemo } from 'react';
import { Search, Plus, ExternalLink, Layers, Sparkles, Filter, Zap, Check, Tag, BookOpen, X } from 'lucide-react';
import { Problem, Platform, Difficulty } from '../types';
import { ALL_PLATFORMS } from '../services/platformConnectors';

interface ProblemCatalogViewProps {
  catalog: Problem[];
  onAddProblemUrl: (url: string) => Promise<void>;
  onSolveProblem: (problem: Problem) => void;
  onOpenReflection: (problem: Problem) => void;
}

export const ProblemCatalogView: React.FC<ProblemCatalogViewProps> = ({
  catalog,
  onAddProblemUrl,
  onSolveProblem,
  onOpenReflection,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'striver' | 'non_striver'>('all');
  const [selectedStriverTopic, setSelectedStriverTopic] = useState<string>('all');
  const [importUrl, setImportUrl] = useState('');
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  // Extract unique Striver Topics
  const striverTopics = useMemo(() => {
    const topics = new Set<string>();
    catalog.forEach((p) => {
      if (p.isStriverSheet && p.striverTopic) {
        topics.add(p.striverTopic);
      }
    });
    return Array.from(topics).sort();
  }, [catalog]);

  // Extract all unique Topics / Patterns across entire catalog with counts
  const allTopicOptions = useMemo(() => {
    const topicCounts = new Map<string, number>();

    catalog.forEach((p) => {
      // Collect from dsaPatterns
      p.dsaPatterns?.forEach((pat) => {
        if (pat && pat.trim()) {
          const trimmed = pat.trim();
          topicCounts.set(trimmed, (topicCounts.get(trimmed) || 0) + 1);
        }
      });

      // Collect from striverTopic
      if (p.striverTopic && p.striverTopic.trim()) {
        const trimmed = p.striverTopic.trim();
        topicCounts.set(trimmed, (topicCounts.get(trimmed) || 0) + 1);
      }

      // Collect from tags (excluding sheet name tag)
      p.tags?.forEach((tag) => {
        if (tag && tag.trim() && !tag.includes("Striver's")) {
          const trimmed = tag.trim();
          topicCounts.set(trimmed, (topicCounts.get(trimmed) || 0) + 1);
        }
      });
    });

    return Array.from(topicCounts.entries())
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count || a.topic.localeCompare(b.topic));
  }, [catalog]);

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importUrl) return;
    try {
      setImporting(true);
      setImportError(null);
      await onAddProblemUrl(importUrl);
      setImportUrl('');
    } catch (err: any) {
      setImportError(err.message || 'Failed to import problem from URL');
    } finally {
      setImporting(false);
    }
  };

  const filteredCatalog = catalog.filter((p) => {
    const term = searchTerm.toLowerCase().trim();
    const pTags = p.tags || [];
    const pPatterns = p.dsaPatterns || [];

    const matchesSearch =
      !term ||
      (p.title || '').toLowerCase().includes(term) ||
      pTags.some((t) => t && t.toLowerCase().includes(term)) ||
      pPatterns.some((pat) => pat && pat.toLowerCase().includes(term)) ||
      (p.striverTopic && p.striverTopic.toLowerCase().includes(term)) ||
      (p.striverSubTopic && p.striverSubTopic.toLowerCase().includes(term));

    const matchesPlatform = selectedPlatform === 'all' || p.platform === selectedPlatform;
    const matchesDifficulty = selectedDifficulty === 'all' || p.difficulty === selectedDifficulty;

    const matchesSource =
      sourceFilter === 'all' ||
      (sourceFilter === 'striver' && (p.isStriverSheet || pTags.includes("Striver's AtoZ DSA Sheet"))) ||
      (sourceFilter === 'non_striver' && !p.isStriverSheet && !pTags.includes("Striver's AtoZ DSA Sheet"));

    const matchesStriverTopic =
      selectedStriverTopic === 'all' ||
      p.striverTopic === selectedStriverTopic;

    const matchesTopic =
      selectedTopic === 'all' ||
      pPatterns.some((pat) => pat && pat.toLowerCase() === selectedTopic.toLowerCase()) ||
      pTags.some((t) => t && t.toLowerCase() === selectedTopic.toLowerCase()) ||
      (p.striverTopic && p.striverTopic.toLowerCase() === selectedTopic.toLowerCase()) ||
      (p.striverSubTopic && p.striverSubTopic.toLowerCase() === selectedTopic.toLowerCase());

    return matchesSearch && matchesPlatform && matchesDifficulty && matchesSource && matchesStriverTopic && matchesTopic;
  });

  const striverProblemCount = useMemo(() => {
    return catalog.filter((p) => p.isStriverSheet || (p.tags || []).includes("Striver's AtoZ DSA Sheet")).length;
  }, [catalog]);

  const resetAllFilters = () => {
    setSearchTerm('');
    setSelectedPlatform('all');
    setSelectedDifficulty('all');
    setSelectedTopic('all');
    setSourceFilter('all');
    setSelectedStriverTopic('all');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Bar: Title & Import Form */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 rounded-xl bg-zinc-900 border border-zinc-800">
        <div>
          <span className="text-xs font-mono text-slate-300 font-medium uppercase">
            Unified Problem Aggregator
          </span>
          <h1 className="text-2xl font-bold text-zinc-100 mt-0.5">
            Problem Catalog ({catalog.length})
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Aggregated across LeetCode, Codeforces, CodeChef, HackerRank, GeeksforGeeks, and Striver's AtoZ DSA Sheet.
          </p>
        </div>

        {/* Add Problem URL Form */}
        <form onSubmit={handleImportSubmit} className="w-full lg:max-w-md space-y-2">
          <label className="block text-[11px] font-mono text-zinc-400 uppercase">
            Add Problem by URL
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={importUrl}
              onChange={(e) => setImportUrl(e.target.value)}
              placeholder="e.g. https://leetcode.com/problems/two-sum/"
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-slate-300"
            />
            <button
              type="submit"
              disabled={importing || !importUrl}
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-zinc-950 font-semibold text-xs flex items-center gap-1.5 transition-all shrink-0 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{importing ? 'Importing...' : 'Add'}</span>
            </button>
          </div>
          {importError && <p className="text-[11px] text-red-400">{importError}</p>}
        </form>
      </div>

      {/* Unified Search & Filter Controls Container */}
      <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-3.5">
        {/* Row 1: Search Input + Platform + Difficulty + Topic Select */}
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search problems by title, tag, DSA pattern, or Striver topic..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-8 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-slate-400 transition-colors"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2.5 text-zinc-500 hover:text-zinc-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Topic Wise Dropdown */}
            <div className="relative">
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-slate-400 w-auto max-w-[200px] font-medium truncate"
              >
                <option value="all" className="bg-zinc-900 text-zinc-200">
                  All Topics ({allTopicOptions.length})
                </option>
                {allTopicOptions.map(({ topic, count }) => (
                  <option key={topic} value={topic} className="bg-zinc-900 text-zinc-200">
                    {topic} ({count})
                  </option>
                ))}
              </select>
            </div>

            {/* Platform Select */}
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-slate-400 w-full sm:w-auto"
            >
              <option value="all" className="bg-zinc-900 text-zinc-200">All Platforms</option>
              {ALL_PLATFORMS.map((plat) => (
                <option key={plat} value={plat} className="bg-zinc-900 text-zinc-200">
                  {plat}
                </option>
              ))}
            </select>

            {/* Difficulty Select */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-slate-400 w-full sm:w-auto"
            >
              <option value="all" className="bg-zinc-900 text-zinc-200">All Difficulties</option>
              <option value="Easy" className="bg-zinc-900 text-zinc-200">Easy</option>
              <option value="Medium" className="bg-zinc-900 text-zinc-200">Medium</option>
              <option value="Hard" className="bg-zinc-900 text-zinc-200">Hard</option>
            </select>
          </div>
        </div>



        {/* Row 3: Sheet Quick Filter Pills & Striver Topic Select */}
        <div className="border-t border-zinc-800/80 pt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-zinc-400 flex items-center gap-1.5 mr-1 font-medium">
              <Filter className="w-3.5 h-3.5" /> Sheet Filter:
            </span>
            <button
              onClick={() => {
                setSourceFilter('all');
                setSelectedStriverTopic('all');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 border ${
                sourceFilter === 'all'
                  ? 'bg-zinc-800 text-zinc-100 border-zinc-700 shadow-xs'
                  : 'bg-zinc-950/60 text-zinc-400 border-zinc-800/80 hover:text-zinc-200 hover:border-zinc-700'
              }`}
            >
              <span>All Problems ({catalog.length})</span>
            </button>

            <button
              onClick={() => setSourceFilter('striver')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 border ${
                sourceFilter === 'striver'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-xs font-bold'
                  : 'bg-zinc-950/60 text-zinc-400 border-zinc-800/80 hover:text-amber-300 hover:border-amber-500/30'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
              <span>Striver's AtoZ DSA Sheet ({striverProblemCount})</span>
            </button>

            <button
              onClick={() => {
                setSourceFilter('non_striver');
                setSelectedStriverTopic('all');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 border ${
                sourceFilter === 'non_striver'
                  ? 'bg-zinc-800 text-zinc-100 border-zinc-700 shadow-xs'
                  : 'bg-zinc-950/60 text-zinc-400 border-zinc-800/80 hover:text-zinc-200 hover:border-zinc-700'
              }`}
            >
              <span>Standard Catalog</span>
            </button>
          </div>

          {sourceFilter === 'striver' && striverTopics.length > 0 && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-mono text-zinc-400 whitespace-nowrap font-medium">Striver Sub-Topic:</span>
              <select
                value={selectedStriverTopic}
                onChange={(e) => setSelectedStriverTopic(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-amber-500/80 w-full sm:w-auto"
              >
                <option value="all" className="bg-zinc-900 text-zinc-200">
                  All Striver Topics ({striverTopics.length})
                </option>
                {striverTopics.map((top) => (
                  <option key={top} value={top} className="bg-zinc-900 text-zinc-200">
                    {top}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Results Header & Active Filters Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-zinc-400 px-1">
        <div className="flex flex-wrap items-center gap-2">
          <span>
            Showing <strong className="text-zinc-200">{filteredCatalog.length}</strong> of {catalog.length} problems
            {sourceFilter === 'striver' ? " in Striver's AtoZ DSA Sheet" : ''}
          </span>
          {selectedTopic !== 'all' && (
            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-[11px] border border-blue-500/30 flex items-center gap-1">
              Topic: {selectedTopic}
              <button onClick={() => setSelectedTopic('all')} className="hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>

        {(searchTerm || selectedPlatform !== 'all' || selectedDifficulty !== 'all' || selectedTopic !== 'all' || sourceFilter !== 'all' || selectedStriverTopic !== 'all') && (
          <button
            onClick={resetAllFilters}
            className="text-amber-400 hover:underline font-mono text-left sm:text-right"
          >
            Reset All Filters
          </button>
        )}
      </div>

      {/* Problem Grid or Empty State */}
      {filteredCatalog.length === 0 ? (
        <div className="py-16 text-center bg-zinc-900/40 border border-zinc-800/60 rounded-xl space-y-3">
          <Layers className="w-8 h-8 text-zinc-600 mx-auto" />
          <h3 className="text-lg font-semibold text-zinc-300">
            {catalog.length === 0
              ? 'No synchronized problems available yet.'
              : 'No matching problems found.'}
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            {catalog.length === 0
              ? 'Paste a problem URL above or connect a coding platform account to sync problems automatically.'
              : 'Try clearing your active search query, topic filter, or difficulty settings.'}
          </p>
          {(searchTerm || selectedPlatform !== 'all' || selectedDifficulty !== 'all' || selectedTopic !== 'all' || sourceFilter !== 'all' || selectedStriverTopic !== 'all') && (
            <button
              onClick={resetAllFilters}
              className="px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 transition-all border border-zinc-700"
            >
              Reset All Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCatalog.map((problem) => {
            const isStriver = problem.isStriverSheet || (problem.tags || []).includes("Striver's AtoZ DSA Sheet");
            return (
              <div
                key={problem.id}
                className={`p-5 rounded-xl bg-zinc-900 border flex flex-col justify-between hover:border-zinc-700 transition-all space-y-4 ${
                  isStriver ? 'border-amber-500/20' : 'border-zinc-800'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                        {problem.platform}
                      </span>
                      {isStriver && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1 font-semibold">
                          <Zap className="w-2.5 h-2.5 fill-current" />
                          <span>Striver AtoZ</span>
                        </span>
                      )}
                    </div>
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
                  </div>

                  <h3 className="font-semibold text-sm text-zinc-100 line-clamp-2">
                    {problem.title}
                  </h3>

                  {problem.striverTopic && (
                    <button
                      type="button"
                      onClick={() => setSelectedTopic(problem.striverTopic || 'all')}
                      className="text-[10px] font-mono text-amber-400/90 truncate hover:underline text-left block max-w-full"
                    >
                      📁 {problem.striverTopic} {problem.striverSubTopic ? `• ${problem.striverSubTopic}` : ''}
                    </button>
                  )}

                  <div className="flex flex-wrap gap-1 pt-1">
                    {problem.dsaPatterns.map((pat) => {
                      const isPatternActive = selectedTopic.toLowerCase() === pat.toLowerCase();
                      return (
                        <button
                          key={pat}
                          type="button"
                          onClick={() => setSelectedTopic(isPatternActive ? 'all' : pat)}
                          className={`text-[10px] font-mono px-2 py-0.5 rounded transition-colors ${
                            isPatternActive
                              ? 'bg-blue-600 text-white font-semibold'
                              : 'bg-zinc-950 text-zinc-400 border border-zinc-800/80 hover:text-zinc-200 hover:border-zinc-700'
                          }`}
                        >
                          {pat}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onSolveProblem(problem)}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1 transition-all border border-zinc-700"
                  >
                    <span>Solve</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onOpenReflection(problem)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100/10 hover:bg-slate-100 hover:text-zinc-950 text-slate-200 text-xs font-semibold flex items-center gap-1 transition-all"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Log Practice</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
