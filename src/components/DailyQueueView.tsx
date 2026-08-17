import React, { useState } from 'react';
import {
  Layers,
  CheckCircle,
  ExternalLink,
  RefreshCw,
  Calendar,
  Sparkles,
  Clock,
  X,
  ArrowRight,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { DailyQueueItem, Problem, UserProfile } from '../types';
import { getLocalDateKey, getOffsetLocalDateKey } from '../utils/dateUtils';

interface DailyQueueViewProps {
  userProfile: UserProfile | null;
  dailyQueue: DailyQueueItem[];
  catalog: Problem[];
  onSolveProblem: (problem: Problem) => void;
  onOpenReflection: (problem: Problem) => void;
  onRefreshQueue: () => void;
  onRescheduleItem: (itemIds: string | string[], targetDateKey: string) => void;
}

export const DailyQueueView: React.FC<DailyQueueViewProps> = ({
  userProfile,
  dailyQueue,
  catalog,
  onSolveProblem,
  onOpenReflection,
  onRefreshQueue,
  onRescheduleItem,
}) => {
  const dailyLimit = userProfile?.dailyLimit || 3;
  const selectedTopics = userProfile?.selectedTopics || [];

  const todayKey = getLocalDateKey(new Date());

  // Active items for today: dateKey matches today or carried over, AND NOT completed
  const activeTodayQueue = dailyQueue.filter(
    (item) =>
      (item.dateKey === todayKey || (item.status === 'carried_over' && item.dateKey <= todayKey)) &&
      item.status !== 'completed'
  );

  // Completed items today
  const completedTodayQueue = dailyQueue.filter(
    (item) =>
      (item.dateKey === todayKey || (item.status === 'carried_over' && item.dateKey <= todayKey)) &&
      item.status === 'completed'
  );

  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [rescheduleTargetIds, setRescheduleTargetIds] = useState<string[] | null>(null);
  const [customDate, setCustomDate] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const getFutureDate = (offsetDays: number) => {
    return getOffsetLocalDateKey(offsetDays);
  };

  // Toggle multi-selection for a problem item
  const toggleSelectItem = (id: string) => {
    if (selectedItemIds.includes(id)) {
      setSelectedItemIds(selectedItemIds.filter((item) => item !== id));
    } else {
      setSelectedItemIds([...selectedItemIds, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedItemIds.length === activeTodayQueue.length) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(activeTodayQueue.map((item) => item.id));
    }
  };

  const handleOpenRescheduleModal = (ids: string[]) => {
    setRescheduleTargetIds(ids);
    setCustomDate('');
  };

  const handleApplyReschedule = (targetDateKey: string) => {
    if (!rescheduleTargetIds || rescheduleTargetIds.length === 0) return;

    const count = rescheduleTargetIds.length;
    onRescheduleItem(rescheduleTargetIds, targetDateKey);

    showToast(
      `Successfully rescheduled ${count} problem${count > 1 ? 's' : ''} to ${targetDateKey}. Removed from today's list.`
    );

    setSelectedItemIds((prev) => prev.filter((id) => !rescheduleTargetIds.includes(id)));
    setRescheduleTargetIds(null);
    setCustomDate('');
  };

  const isAllSelected =
    activeTodayQueue.length > 0 && selectedItemIds.length === activeTodayQueue.length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-slate-100/10 border border-slate-300/30 text-slate-200 text-xs font-mono font-semibold flex items-center justify-between shadow-lg">
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-200 hover:text-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-xl bg-zinc-900 border border-zinc-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono text-slate-300 font-medium uppercase">
              Daily Practice Queue
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
              Limit: {dailyLimit} Max
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100/10 text-slate-200 border border-slate-300/20">
              {selectedTopics.length} Topics Active
            </span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-100 mt-1">
            Today's Focused Queue
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right">
            <span className="text-xs font-mono text-zinc-400 block">Today's Progress</span>
            <span className="text-sm font-mono font-bold text-slate-200">
              {completedTodayQueue.length} Completed
            </span>
          </div>
          <button
            onClick={onRefreshQueue}
            className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-all text-xs font-semibold flex items-center gap-1.5"
            title="Regenerate queue matching selected topics"
          >
            <RefreshCw className="w-4 h-4 text-slate-300" />
            <span>Regenerate Queue</span>
          </button>
        </div>
      </div>

      {/* Multi-selection Toolbar */}
      {activeTodayQueue.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSelectAll}
              className="flex items-center gap-2 text-xs font-mono text-zinc-300 hover:text-zinc-100 px-2.5 py-1.5 rounded bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700 transition-colors"
            >
              {isAllSelected ? (
                <CheckSquare className="w-4 h-4 text-slate-200" />
              ) : (
                <Square className="w-4 h-4 text-zinc-400" />
              )}
              <span>{isAllSelected ? 'Deselect All' : 'Select All Today'}</span>
            </button>

            {selectedItemIds.length > 0 && (
              <span className="text-xs font-mono text-slate-200 bg-slate-100/10 px-2.5 py-1 rounded border border-slate-300/20 font-bold">
                {selectedItemIds.length} Selected
              </span>
            )}
          </div>

          {selectedItemIds.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleOpenRescheduleModal(selectedItemIds)}
                className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Reschedule Selected ({selectedItemIds.length})</span>
              </button>
              <button
                onClick={() => setSelectedItemIds([])}
                className="px-2.5 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 text-xs font-mono"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      )}

      {/* Queue Items */}
      {activeTodayQueue.length === 0 ? (
        <div className="p-10 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100/10 text-slate-200 flex items-center justify-center mx-auto border border-slate-300/20">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-zinc-100">
            No active problems remaining in today's queue!
          </h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
            {completedTodayQueue.length > 0
              ? `Awesome job! You've logged and reflected on ${completedTodayQueue.length} problem(s) today.`
              : 'All problems have either been completed or rescheduled to future dates.'}
          </p>
          <button
            onClick={onRefreshQueue}
            className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-zinc-950 font-bold text-xs inline-flex items-center gap-2 transition-all shadow-md"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Generate Fresh Queue from Selected Topics</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {activeTodayQueue.map((item, index) => {
            const problem = catalog.find((p) => p.id === item.problemId);
            if (!problem) return null;

            const isSelected = selectedItemIds.includes(item.id);
            const isRollover = item.status === 'carried_over';

            return (
              <div
                key={item.id}
                className={`p-5 rounded-xl border transition-all relative ${
                  isSelected
                    ? 'bg-amber-500/5 border-amber-500/50 shadow-md'
                    : isRollover
                    ? 'bg-amber-500/5 border-amber-500/30'
                    : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    {/* Multi-select checkbox */}
                    <button
                      onClick={() => toggleSelectItem(item.id)}
                      className="mt-1 p-1 text-zinc-400 hover:text-slate-200 transition-colors shrink-0"
                      title={isSelected ? 'Deselect problem' : 'Select problem for batch actions'}
                    >
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-amber-400" />
                      ) : (
                        <Square className="w-5 h-5 text-zinc-600 hover:text-zinc-400" />
                      )}
                    </button>

                    <div className="space-y-2 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono text-zinc-500 font-bold">
                          #{index + 1}
                        </span>
                        {isRollover && (
                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-medium">
                            Carried Over
                          </span>
                        )}
                        {item.isRevision && (
                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 font-medium">
                            Revision Card
                          </span>
                        )}
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                          {problem.platform}
                        </span>
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

                      <h3 className="text-base font-semibold text-zinc-100 truncate">
                        {problem.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {problem.dsaPatterns.map((pat) => (
                          <span
                            key={pat}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-950 text-slate-300 border border-zinc-800"
                          >
                            {pat}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0 sm:self-center">
                    <button
                      onClick={() => onSolveProblem(problem)}
                      className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-all border border-zinc-700"
                    >
                      <span>Solve</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleOpenRescheduleModal([item.id])}
                      className="px-3 py-2 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-amber-400 hover:text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-all border border-zinc-800 hover:border-amber-500/40"
                      title="Reschedule problem to another date"
                    >
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      <span>Reschedule</span>
                    </button>

                    <button
                      onClick={() => onOpenReflection(problem)}
                      className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-zinc-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Log & Reflect</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Completed Today Collapsible Section */}
      {completedTodayQueue.length > 0 && (
        <div className="pt-4 border-t border-zinc-800/80">
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center justify-between w-full p-3 rounded-xl bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-400 hover:text-zinc-200 transition-all"
          >
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-slate-200" />
              <span>Completed Today ({completedTodayQueue.length})</span>
            </span>
            {showCompleted ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {showCompleted && (
            <div className="mt-3 space-y-2">
              {completedTodayQueue.map((item) => {
                const problem = catalog.find((p) => p.id === item.problemId);
                if (!problem) return null;
                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/60 flex items-center justify-between text-xs opacity-75"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-slate-200 shrink-0" />
                      <span className="font-semibold text-zinc-200">{problem.title}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                        {problem.platform}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-300 uppercase">
                      Reflected & Completed
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleTargetIds && rescheduleTargetIds.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-zinc-100 text-base">
                  Reschedule {rescheduleTargetIds.length} Problem
                  {rescheduleTargetIds.length > 1 ? 's' : ''}
                </h3>
              </div>
              <button
                onClick={() => setRescheduleTargetIds(null)}
                className="text-zinc-400 hover:text-zinc-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Rescheduling moves the problem to the scheduled day and removes it from today's list.
            </p>

            <div className="space-y-2">
              <button
                onClick={() => handleApplyReschedule(getFutureDate(1))}
                className="w-full p-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-amber-500/50 hover:bg-amber-500/5 text-left text-xs font-semibold text-zinc-200 flex items-center justify-between transition-all"
              >
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Tomorrow ({getFutureDate(1)})</span>
                </span>
                <span className="text-[10px] font-mono text-amber-400 uppercase">+1 Day</span>
              </button>

              <button
                onClick={() => handleApplyReschedule(getFutureDate(2))}
                className="w-full p-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-amber-500/50 hover:bg-amber-500/5 text-left text-xs font-semibold text-zinc-200 flex items-center justify-between transition-all"
              >
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <span>In 2 Days ({getFutureDate(2)})</span>
                </span>
                <span className="text-[10px] font-mono text-blue-400 uppercase">+2 Days</span>
              </button>

              <button
                onClick={() => handleApplyReschedule(getFutureDate(3))}
                className="w-full p-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-amber-500/50 hover:bg-amber-500/5 text-left text-xs font-semibold text-zinc-200 flex items-center justify-between transition-all"
              >
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-300" />
                  <span>In 3 Days ({getFutureDate(3)})</span>
                </span>
                <span className="text-[10px] font-mono text-slate-300 uppercase">+3 Days</span>
              </button>

              <button
                onClick={() => handleApplyReschedule(getFutureDate(7))}
                className="w-full p-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-amber-500/50 hover:bg-amber-500/5 text-left text-xs font-semibold text-zinc-200 flex items-center justify-between transition-all"
              >
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  <span>Next Week ({getFutureDate(7)})</span>
                </span>
                <span className="text-[10px] font-mono text-purple-400 uppercase">+7 Days</span>
              </button>
            </div>

            <div className="pt-3 border-t border-zinc-800 space-y-2">
              <label className="text-xs font-mono text-zinc-400 block">
                Or pick custom date:
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  min={getFutureDate(1)}
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-slate-300"
                />
                <button
                  disabled={!customDate}
                  onClick={() => handleApplyReschedule(customDate)}
                  className="px-4 py-2 rounded-lg bg-slate-100 disabled:opacity-40 hover:bg-slate-200 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-all"
                >
                  <span>Set Date</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
