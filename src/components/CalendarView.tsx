import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
  Sparkles,
  ExternalLink,
  Plus,
  X,
  ArrowRight,
  CheckSquare,
  Square,
  Layers,
  Search,
  BookOpen,
  Filter,
  RotateCw,
} from 'lucide-react';
import { DailyQueueItem, Problem, UserProfile, RevisionCard } from '../types';
import { getLocalDateKey, getOffsetLocalDateKey } from '../utils/dateUtils';
import { isProblemScheduledInLastWeeks } from '../services/recommendationEngine';

interface CalendarViewProps {
  userProfile: UserProfile | null;
  dailyQueue: DailyQueueItem[];
  catalog: Problem[];
  revisionCards?: RevisionCard[];
  onSolveProblem: (problem: Problem) => void;
  onOpenReflection: (problem: Problem) => void;
  onRescheduleItem: (itemIds: string | string[], targetDateKey: string) => void;
  onScheduleNewProblem: (problemId: string, targetDateKey: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  userProfile,
  dailyQueue,
  catalog,
  revisionCards = [],
  onSolveProblem,
  onOpenReflection,
  onRescheduleItem,
  onScheduleNewProblem,
}) => {
  const dailyLimit = userProfile?.dailyLimit || 3;
  const todayDateObj = new Date();
  const todayKey = getLocalDateKey(todayDateObj);

  // Calendar Navigation State
  const [currentYear, setCurrentYear] = useState(todayDateObj.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(todayDateObj.getMonth()); // 0 - 11
  const [selectedDateKey, setSelectedDateKey] = useState<string>(todayKey);

  // Selection state for batch rescheduling in selected date
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [rescheduleTargetIds, setRescheduleTargetIds] = useState<string[] | null>(null);
  const [customRescheduleDate, setCustomRescheduleDate] = useState<string>('');

  // Add problem modal state
  const [isAddProblemModalOpen, setIsAddProblemModalOpen] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [selectedPatternFilter, setSelectedPatternFilter] = useState('All');

  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Month navigation handlers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleGoToToday = () => {
    setCurrentYear(todayDateObj.getFullYear());
    setCurrentMonth(todayDateObj.getMonth());
    setSelectedDateKey(todayKey);
  };

  // Generate calendar grid days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const formatLocalDate = (year: number, month: number, day: number) => {
    const d = new Date(year, month, day);
    const yStr = d.getFullYear();
    const mStr = String(d.getMonth() + 1).padStart(2, '0');
    const dStr = String(d.getDate()).padStart(2, '0');
    return `${yStr}-${mStr}-${dStr}`;
  };

  const calendarCells = [];
  // Previous month padding days
  const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const dayNum = prevMonthDays - i;
    const dateKey = formatLocalDate(currentYear, currentMonth - 1, dayNum);
    calendarCells.push({ dayNum, dateKey, isCurrentMonth: false });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateKey = formatLocalDate(currentYear, currentMonth, d);
    calendarCells.push({ dayNum: d, dateKey, isCurrentMonth: true });
  }

  // Next month padding days to make full weeks (35 or 42 cells)
  const remainingCells = (7 - (calendarCells.length % 7)) % 7;
  for (let i = 1; i <= remainingCells; i++) {
    const dateKey = formatLocalDate(currentYear, currentMonth + 1, i);
    calendarCells.push({ dayNum: i, dateKey, isCurrentMonth: false });
  }

  // Group dailyQueue items by dateKey, plus map revision cards into queue if not already present
  const queueByDate: Record<string, DailyQueueItem[]> = {};
  dailyQueue.forEach((item) => {
    if (!queueByDate[item.dateKey]) {
      queueByDate[item.dateKey] = [];
    }
    queueByDate[item.dateKey].push(item);
  });

  revisionCards.forEach((card) => {
    if (card.status === 'graduated') return;
    const targetDate = new Date(card.nextReviewAt);
    const yStr = targetDate.getFullYear();
    const mStr = String(targetDate.getMonth() + 1).padStart(2, '0');
    const dStr = String(targetDate.getDate()).padStart(2, '0');
    const dateKey = `${yStr}-${mStr}-${dStr}`;

    if (!queueByDate[dateKey]) {
      queueByDate[dateKey] = [];
    }
    const exists = queueByDate[dateKey].some((i) => i.problemId === card.problemId);
    if (!exists) {
      queueByDate[dateKey].push({
        id: `dq-rev-${card.problemId}-${dateKey}`,
        userId: card.userId,
        problemId: card.problemId,
        dateKey,
        status: 'pending',
        isRevision: true,
        addedAt: card.lastReviewedAt || Date.now(),
      });
    }
  });

  // Items for selected date
  const selectedDateQueue = queueByDate[selectedDateKey] || [];

  // Batch selection on selected date
  const toggleSelectItem = (id: string) => {
    if (selectedItemIds.includes(id)) {
      setSelectedItemIds(selectedItemIds.filter((i) => i !== id));
    } else {
      setSelectedItemIds([...selectedItemIds, id]);
    }
  };

  const handleSelectAllOnSelectedDate = () => {
    if (selectedItemIds.length === selectedDateQueue.length) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(selectedDateQueue.map((i) => i.id));
    }
  };

  const handleApplyReschedule = (targetDateKey: string) => {
    if (!rescheduleTargetIds || rescheduleTargetIds.length === 0) return;
    const count = rescheduleTargetIds.length;
    onRescheduleItem(rescheduleTargetIds, targetDateKey);
    showToast(`Rescheduled ${count} problem(s) to ${targetDateKey}`);
    setSelectedItemIds([]);
    setRescheduleTargetIds(null);
    setCustomRescheduleDate('');
  };

  const handleAddProblemToDate = (problemId: string) => {
    onScheduleNewProblem(problemId, selectedDateKey);
    const prob = catalog.find((p) => p.id === problemId);
    showToast(`Scheduled "${prob?.title || 'Problem'}" to ${selectedDateKey}`);
    setIsAddProblemModalOpen(false);
  };

  const getFutureDate = (offsetDays: number) => {
    return getOffsetLocalDateKey(offsetDays);
  };

  // Filter catalog for add problem modal
  const filteredCatalog = catalog.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(catalogSearch.toLowerCase());
    const matchesPattern =
      selectedPatternFilter === 'All' || p.dsaPatterns.includes(selectedPatternFilter);
    return matchesSearch && matchesPattern;
  });

  // Total stats for current month
  const currentMonthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
  const allQueueItems = Object.values(queueByDate).flat();
  const itemsThisMonth = allQueueItems.filter((i) => i.dateKey.startsWith(currentMonthPrefix));
  const completedThisMonth = itemsThisMonth.filter((i) => i.status === 'completed').length;
  const rescheduledThisMonth = itemsThisMonth.filter((i) => i.isRescheduled).length;
  const revisionsThisMonth = itemsThisMonth.filter((i) => i.isRevision).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-slate-100/10 border border-slate-300/30 text-slate-200 text-xs font-mono font-semibold flex items-center justify-between shadow-lg">
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-300 hover:text-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono text-slate-300 uppercase font-semibold tracking-wider flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5" />
              Schedule & Calendar Engine
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
              Daily Limit Cap: {dailyLimit} Max
            </span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-100">
            Interactive Practice Calendar
          </h1>
          <p className="text-xs text-zinc-400">
            View scheduled problems, manage future reschedules, and ensure every day is balanced up to your daily cap.
          </p>
        </div>

        {/* Month Stats Bar */}
        <div className="flex items-center gap-3 bg-zinc-950 p-3 rounded-xl border border-zinc-800">
          <div className="text-center px-3 border-r border-zinc-800">
            <span className="text-[10px] font-mono text-zinc-500 uppercase block">Scheduled</span>
            <span className="text-sm font-bold font-mono text-zinc-200">
              {itemsThisMonth.length}
            </span>
          </div>
          <div className="text-center px-3 border-r border-zinc-800">
            <span className="text-[10px] font-mono text-zinc-500 uppercase block">Revisions</span>
            <span className="text-sm font-bold font-mono text-blue-400">
              {revisionsThisMonth}
            </span>
          </div>
          <div className="text-center px-3 border-r border-zinc-800">
            <span className="text-[10px] font-mono text-zinc-500 uppercase block">Completed</span>
            <span className="text-sm font-bold font-mono text-slate-200">
              {completedThisMonth}
            </span>
          </div>
          <div className="text-center px-3">
            <span className="text-[10px] font-mono text-zinc-500 uppercase block">Rescheduled</span>
            <span className="text-sm font-bold font-mono text-amber-400">
              {rescheduledThisMonth}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Calendar Month Grid (7 cols on LG) */}
        <div className="lg:col-span-7 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-lg">
          {/* Calendar Header Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-zinc-100 font-mono">
                {monthNames[currentMonth]} {currentYear}
              </h2>
              <button
                onClick={handleGoToToday}
                className="px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-mono border border-zinc-700 transition-colors"
              >
                Today
              </button>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 text-center border-b border-zinc-800 pb-2">
            {daysOfWeek.map((day) => (
              <span key={day} className="text-xs font-mono font-bold text-zinc-500">
                {day}
              </span>
            ))}
          </div>

          {/* Calendar Month Grid Cells */}
          <div className="grid grid-cols-7 gap-1.5">
            {calendarCells.map((cell, cellIdx) => {
              const itemsOnDay = queueByDate[cell.dateKey] || [];
              const isToday = cell.dateKey === todayKey;
              const isSelected = cell.dateKey === selectedDateKey;
              const completedCount = itemsOnDay.filter((i) => i.status === 'completed').length;
              const isCapped = itemsOnDay.length >= dailyLimit;

              return (
                <button
                  key={`cell-${cell.dateKey}-${cellIdx}`}
                  onClick={() => {
                    setSelectedDateKey(cell.dateKey);
                    setSelectedItemIds([]);
                  }}
                  className={`min-h-[72px] p-1.5 rounded-xl border text-left transition-all flex flex-col justify-between relative ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500 shadow-lg ring-1 ring-amber-500/50'
                      : isToday
                      ? 'bg-slate-100/10 border-slate-300/60'
                      : cell.isCurrentMonth
                      ? 'bg-zinc-950/70 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-800/40'
                      : 'bg-zinc-950/30 border-zinc-900 text-zinc-600'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs font-mono font-bold ${
                        isToday
                          ? 'text-slate-100 bg-slate-100/20 px-1.5 py-0.5 rounded'
                          : isSelected
                          ? 'text-amber-400'
                          : cell.isCurrentMonth
                          ? 'text-zinc-300'
                          : 'text-zinc-600'
                      }`}
                    >
                      {cell.dayNum}
                    </span>

                    {itemsOnDay.length > 0 && (
                      <span
                        className={`text-[9px] font-mono font-bold px-1 rounded ${
                          completedCount === itemsOnDay.length
                            ? 'bg-slate-100/20 text-slate-200'
                            : isCapped
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {completedCount}/{itemsOnDay.length}
                      </span>
                    )}
                  </div>

                  {/* Problem indicators on date cell */}
                  {itemsOnDay.length > 0 && (
                    <div className="space-y-0.5 mt-1">
                      {itemsOnDay.slice(0, 3).map((item) => {
                        const prob = catalog.find((p) => p.id === item.problemId);
                        return (
                          <div
                            key={item.id}
                            className={`text-[9px] font-mono truncate px-1 py-0.5 rounded flex items-center gap-1 ${
                              item.status === 'completed'
                                ? 'bg-slate-800/80 text-slate-200 border border-slate-700/60'
                                : item.isRevision
                                ? 'bg-blue-950/60 text-blue-300 border border-blue-500/30 font-semibold'
                                : item.isRescheduled
                                ? 'bg-amber-950/60 text-amber-300 border border-amber-500/20'
                                : 'bg-zinc-900 text-zinc-300 border border-zinc-800'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                item.status === 'completed'
                                  ? 'bg-slate-200'
                                  : item.isRevision
                                  ? 'bg-blue-400'
                                  : item.isRescheduled
                                  ? 'bg-amber-400'
                                  : 'bg-emerald-400'
                              }`}
                            />
                            <span className="truncate">{prob?.title || 'Problem'}</span>
                          </div>
                        );
                      })}
                      {itemsOnDay.length > 3 && (
                        <div className="text-[8px] font-mono text-zinc-500 pl-1">
                          +{itemsOnDay.length - 3} more
                        </div>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Detail & Action Panel (5 cols on LG) */}
        <div className="lg:col-span-5 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-lg flex flex-col">
          {/* Detail Panel Header */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <span className="text-[10px] font-mono text-slate-300 uppercase font-semibold">
                Selected Day Schedule
              </span>
              <h3 className="text-lg font-bold text-zinc-100 font-mono">
                {selectedDateKey === todayKey ? 'Today' : selectedDateKey}
              </h3>
            </div>

            <button
              onClick={() => setIsAddProblemModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-zinc-950 font-bold text-xs flex items-center gap-1 transition-all shadow-sm"
              title="Schedule a problem to this date"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Schedule Problem</span>
            </button>
          </div>

          {/* Date Queue List */}
          <div className="flex-1 space-y-3 overflow-y-auto max-h-[480px] pr-1">
            {selectedDateQueue.length === 0 ? (
              <div className="p-8 rounded-xl bg-zinc-950 border border-zinc-800 text-center space-y-3">
                <CalendarIcon className="w-8 h-8 text-zinc-600 mx-auto" />
                <p className="text-xs text-zinc-400">
                  No problems scheduled for <span className="font-mono text-zinc-200">{selectedDateKey}</span>.
                </p>
                <button
                  onClick={() => setIsAddProblemModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-slate-200 text-xs font-semibold inline-flex items-center gap-1.5 border border-zinc-700"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Problem to Schedule</span>
                </button>
              </div>
            ) : (
              <>
                {/* Batch selection bar for selected date */}
                <div className="flex items-center justify-between bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
                  <button
                    onClick={handleSelectAllOnSelectedDate}
                    className="flex items-center gap-1.5 text-xs font-mono text-zinc-300 hover:text-zinc-100"
                  >
                    {selectedItemIds.length === selectedDateQueue.length ? (
                      <CheckSquare className="w-4 h-4 text-slate-200" />
                    ) : (
                      <Square className="w-4 h-4 text-zinc-500" />
                    )}
                    <span>
                      {selectedItemIds.length === selectedDateQueue.length
                        ? 'Deselect All'
                        : 'Select All'}
                    </span>
                  </button>

                  {selectedItemIds.length > 0 && (
                    <button
                      onClick={() => setRescheduleTargetIds(selectedItemIds)}
                      className="px-3 py-1 rounded bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-xs flex items-center gap-1 transition-all"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Reschedule ({selectedItemIds.length})</span>
                    </button>
                  )}
                </div>

                {selectedDateQueue.map((item, index) => {
                  const problem = catalog.find((p) => p.id === item.problemId);
                  if (!problem) return null;

                  const isSelected = selectedItemIds.includes(item.id);

                  return (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500'
                          : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <button
                            onClick={() => toggleSelectItem(item.id)}
                            className="mt-0.5 text-zinc-500 hover:text-zinc-300"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-amber-400" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>

                          <div className="space-y-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {item.isRevision && (
                                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold uppercase flex items-center gap-1">
                                  <RotateCw className="w-2.5 h-2.5" />
                                  <span>Spaced Revision</span>
                                </span>
                              )}
                              {item.status === 'completed' && (
                                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100/20 text-slate-200 font-bold uppercase">
                                  Completed
                                </span>
                              )}
                              {item.isRescheduled && (
                                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold uppercase">
                                  Rescheduled
                                </span>
                              )}
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                                {problem.platform}
                              </span>
                              <span
                                className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
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

                            <h4 className="text-sm font-semibold text-zinc-100 truncate">
                              {problem.title}
                            </h4>
                          </div>
                        </div>

                        {/* Item Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => onSolveProblem(problem)}
                            className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs"
                            title="Solve problem"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setRescheduleTargetIds([item.id])}
                            className="p-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-amber-400 border border-amber-500/20 text-xs"
                            title="Reschedule problem"
                          >
                            <Clock className="w-3.5 h-3.5" />
                          </button>
                          {item.status !== 'completed' && (
                            <button
                              onClick={() => onOpenReflection(problem)}
                              className="p-1.5 rounded bg-slate-100 hover:bg-slate-200 text-zinc-950 font-bold text-xs"
                              title="Log & reflect"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Reschedule Modal */}
      {rescheduleTargetIds && rescheduleTargetIds.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
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
              Rescheduled problems are guaranteed to appear on the target day up to your maximum daily cap ({dailyLimit}/day).
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
                  <CalendarIcon className="w-4 h-4 text-blue-400" />
                  <span>In 2 Days ({getFutureDate(2)})</span>
                </span>
                <span className="text-[10px] font-mono text-blue-400 uppercase">+2 Days</span>
              </button>

              <button
                onClick={() => handleApplyReschedule(getFutureDate(7))}
                className="w-full p-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-amber-500/50 hover:bg-amber-500/5 text-left text-xs font-semibold text-zinc-200 flex items-center justify-between transition-all"
              >
                <span className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-purple-400" />
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
                  value={customRescheduleDate}
                  onChange={(e) => setCustomRescheduleDate(e.target.value)}
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-slate-300"
                />
                <button
                  disabled={!customRescheduleDate}
                  onClick={() => handleApplyReschedule(customRescheduleDate)}
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

      {/* Add Problem Modal */}
      {isAddProblemModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl relative max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-slate-300" />
                <h3 className="font-bold text-zinc-100 text-base">
                  Schedule Problem to {selectedDateKey}
                </h3>
              </div>
              <button
                onClick={() => setIsAddProblemModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search & Filter */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search problem title..."
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-slate-300"
                />
              </div>
            </div>

            {/* Catalog List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[360px]">
              {filteredCatalog.map((problem) => {
                const wasScheduledRecently = isProblemScheduledInLastWeeks(
                  problem.id,
                  selectedDateKey,
                  dailyQueue,
                  1.5
                );
                return (
                  <div
                    key={problem.id}
                    className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3 hover:border-zinc-700 transition-all"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
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
                        {wasScheduledRecently && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Scheduled &lt; 1.5w ago
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-semibold text-zinc-100 truncate">
                        {problem.title}
                      </h4>
                    </div>

                    <button
                      onClick={() => handleAddProblemToDate(problem.id)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-zinc-950 font-bold text-xs shrink-0 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add to Date</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
