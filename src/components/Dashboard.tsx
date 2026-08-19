import React, { useState } from 'react';
import {
  Layers,
  RotateCw,
  Brain,
  Flame,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Link2,
  Calendar,
  Clock,
  X,
} from 'lucide-react';
import {
  UserProfile,
  Problem,
  DailyQueueItem,
  RevisionCard,
  PatternMastery,
  UserGamification,
  SolvingRecord,
  Reflection,
} from '../types';
import { PracticeTopicSelector } from './PracticeTopicSelector';
import { getProfileAvatarUrl } from '../utils/avatar';
import { ActivityHeatmap } from './ActivityHeatmap';
import { getLocalDateKey, getOffsetLocalDateKey } from '../utils/dateUtils';
import { SyncStatusWidget } from './SyncStatusWidget';

interface DashboardProps {
  userProfile: UserProfile | null;
  dailyQueue: DailyQueueItem[];
  revisionCards: RevisionCard[];
  catalog: Problem[];
  patternMasteries: PatternMastery[];
  gamification: UserGamification | null;
  solvingRecords?: SolvingRecord[];
  reflections?: Reflection[];
  lastSyncTime?: number | null;
  isSyncing?: boolean;
  isExtensionDetected?: boolean;
  onManualSync?: () => void;
  onOpenPairModal?: () => void;
  onNavigateTab: (tab: string) => void;
  onSolveProblem: (problem: Problem) => void;
  onOpenOnboarding: () => void;
  onUpdateTopics: (topics: string[]) => void;
  onRegenerateQueue: () => void;
  onRescheduleItem: (itemId: string | string[], targetDateKey: string) => void;
  onOpenReflection: (problem: Problem) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  userProfile,
  dailyQueue,
  revisionCards,
  catalog,
  patternMasteries,
  gamification,
  solvingRecords = [],
  reflections = [],
  lastSyncTime = null,
  isSyncing = false,
  isExtensionDetected = false,
  onManualSync = () => {},
  onOpenPairModal = () => {},
  onNavigateTab,
  onSolveProblem,
  onOpenOnboarding,
  onUpdateTopics,
  onRegenerateQueue,
  onRescheduleItem,
  onOpenReflection,
}) => {
  const [rescheduleTargetItem, setRescheduleTargetItem] = useState<{ id: string; problemTitle: string } | null>(null);
  const [customDate, setCustomDate] = useState<string>('');

  const getFutureDate = (offsetDays: number) => {
    return getOffsetLocalDateKey(offsetDays);
  };

  const handleApplyReschedule = (targetDateKey: string) => {
    if (!rescheduleTargetItem) return;
    onRescheduleItem(rescheduleTargetItem.id, targetDateKey);
    setRescheduleTargetItem(null);
    setCustomDate('');
  };
  // Check empty state
  const isNewUser =
    !userProfile ||
    (!userProfile.onboardingCompleted && dailyQueue.length === 0 && revisionCards.length === 0);

  if (isNewUser) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#0b1326] border border-[#334155] flex items-center justify-center text-[#dae2fd] font-serif font-bold text-3xl mx-auto mb-6 shadow-xl">
          Ω
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-100 tracking-tight">
          Welcome to Omega
        </h1>
        <p className="text-zinc-400 max-w-lg mx-auto text-sm mt-3 leading-relaxed">
          Welcome to Omega. Choose your learning topics and connect a coding platform to begin.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onOpenOnboarding}
            className="px-5 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-zinc-950 font-semibold text-xs flex items-center gap-2 transition-all shadow-lg"
          >
            <Sparkles className="w-4 h-4" />
            <span>Setup Learning Goals</span>
          </button>
          <button
            onClick={() => onNavigateTab('connectors')}
            className="px-5 py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-semibold flex items-center gap-2 transition-all"
          >
            <Link2 className="w-4 h-4 text-slate-300" />
            <span>Connect Coding Platforms</span>
          </button>
        </div>
      </div>
    );
  }

  // Active queue items for today
  const todayKey = getLocalDateKey(new Date());
  const pendingQueue = dailyQueue.filter(
    (item) =>
      (item.dateKey === todayKey || item.status === 'carried_over') &&
      item.status !== 'completed'
  );

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfTodayMs = startOfToday.getTime();

  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);
  const endOfTodayMs = endOfToday.getTime();

  // Revisions due today and upcoming
  const dueRevisions = revisionCards
    .filter((c) => c.nextReviewAt <= endOfTodayMs && c.status !== 'graduated')
    .sort((a, b) => a.nextReviewAt - b.nextReviewAt);

  const upcomingRevisions = revisionCards
    .filter((c) => c.nextReviewAt > endOfTodayMs && c.status !== 'graduated')
    .sort((a, b) => a.nextReviewAt - b.nextReviewAt);

  // 1. Scheduled queue items completed today (non-revision items)
  const completedScheduledQueue = dailyQueue.filter(
    (item) =>
      (item.dateKey === todayKey || item.status === 'carried_over') &&
      item.status === 'completed' &&
      !item.isRevision
  );

  // 2. Solving records created today between startOfTodayMs and endOfTodayMs
  const recordsToday = (solvingRecords || []).filter(
    (s) => s.completedAt >= startOfTodayMs && s.completedAt <= endOfTodayMs
  );

  const reflectionsToday = (reflections || []).filter(
    (r) => r.timestamp >= startOfTodayMs && r.timestamp <= endOfTodayMs
  );

  const revisionsFromRecords = recordsToday.filter(
    (s) => s.source === 'revision' || s.isRevision
  ).length;

  const revisionsFromQueue = dailyQueue.filter(
    (item) =>
      (item.dateKey === todayKey || item.status === 'carried_over') &&
      item.status === 'completed' &&
      item.isRevision
  ).length;

  const revisedTodayCount = Math.max(revisionsFromRecords, revisionsFromQueue);

  const scheduledFromRecords = recordsToday.filter(
    (s) => s.source !== 'revision' && !s.isRevision
  ).length;

  const completedQueueCount = Math.max(completedScheduledQueue.length, scheduledFromRecords);

  const totalCompletedToday = Math.max(
    completedQueueCount + revisedTodayCount,
    recordsToday.length,
    reflectionsToday.length
  );
  const totalScheduledToday = dailyQueue.filter(
    (item) => item.dateKey === todayKey || item.status === 'carried_over'
  ).length;
  const totalDueRevisionsToday = dueRevisions.length + revisedTodayCount;

  // Top improving pattern masteries
  const activeMasteries = patternMasteries
    .sort((a, b) => b.totalSolved - a.totalSolved)
    .slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner - Total Progress & Navigation */}
      <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-zinc-800 border border-zinc-700 overflow-hidden flex items-center justify-center shrink-0 shadow-md">
            <img
              src={getProfileAvatarUrl(
                userProfile?.photoURL,
                userProfile?.email,
                userProfile?.displayName
              )}
              alt={userProfile?.displayName || 'Profile'}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-zinc-100">
                Welcome back, {userProfile?.displayName || userProfile?.email?.split('@')[0] || 'Engineer'}
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100/10 text-slate-200 border border-slate-300/20 font-bold">
                {userProfile?.targetInterviewLevel || 'Junior'} Engineer
              </span>
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 font-mono text-xs font-bold shadow-sm">
                <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400/20" />
                <span>{gamification?.currentStreak || 0}d Streak</span>
              </div>
            </div>
            <p className="text-xs text-zinc-400">
              {pendingQueue.length} daily queue items remaining &bull; {dueRevisions.length} spaced revisions due
            </p>
          </div>
        </div>

        {/* Total Solved Today Metric Badge */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase text-zinc-400 font-semibold">
                Total Solved Today
              </div>
              <div className="text-sm font-bold text-zinc-100 font-mono">
                {totalCompletedToday} Solved
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => onNavigateTab('daily-queue')}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-zinc-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md"
            >
              <Layers className="w-4 h-4" />
              <span>Daily Queue</span>
            </button>
            <button
              onClick={() => onNavigateTab('revision')}
              className="px-3.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-semibold text-xs flex items-center gap-2 transition-all"
            >
              <RotateCw className="w-4 h-4 text-blue-400" />
              <span>Revision Deck</span>
            </button>
          </div>
        </div>
      </div>

      {/* Extension & Cloud Synchronization Status Banner */}
      <SyncStatusWidget
        lastSyncTime={lastSyncTime}
        isSyncing={isSyncing}
        isExtensionDetected={isExtensionDetected}
        onManualSync={onManualSync}
        onOpenPairModal={onOpenPairModal}
        currentUser={userProfile}
      />

      {/* Practice Activity Heatmap (LeetCode Style) */}
      <ActivityHeatmap
        solvingRecords={solvingRecords}
        reflections={reflections}
        dailyQueue={dailyQueue}
      />

      {/* 4 Core Questions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Q1: What should I solve today? */}
        <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-slate-100/10 text-slate-200">
                  <Layers className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-zinc-200 text-sm">
                  1. What should I solve today?
                </h3>
              </div>
              <span className="text-xs font-mono text-zinc-400">
                {completedQueueCount} / {dailyQueue.length} done
              </span>
            </div>

            {pendingQueue.length > 0 ? (
              <div className="space-y-3">
                {pendingQueue.map((item) => {
                  const problem = catalog.find((p) => p.id === item.problemId);
                  if (!problem) return null;
                  return (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-zinc-700 transition-all"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-2 mb-1">
                          {item.status === 'carried_over' && (
                            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              Rollover
                            </span>
                          )}
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                            {problem.platform}
                          </span>
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
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
                        <h4 className="font-medium text-xs text-zinc-200 truncate">
                          {problem.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                        <button
                          onClick={() => onSolveProblem(problem)}
                          className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-all text-xs font-semibold flex items-center gap-1"
                          title="Solve problem"
                        >
                          <span>Solve</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>

                        <button
                          onClick={() =>
                            setRescheduleTargetItem({ id: item.id, problemTitle: problem.title })
                          }
                          className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-amber-400 border border-amber-500/20 text-xs font-semibold flex items-center gap-1"
                          title="Reschedule problem"
                        >
                          <Calendar className="w-3 h-3" />
                          <span>Reschedule</span>
                        </button>

                        <button
                          onClick={() => onOpenReflection(problem)}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-zinc-950 transition-all text-xs font-bold flex items-center gap-1"
                          title="Log & reflect"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Reflect</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-800/60 text-center">
                <CheckCircle2 className="w-6 h-6 text-slate-200 mx-auto mb-2" />
                <p className="text-xs text-zinc-300 font-medium">
                  All scheduled problems for today are completed!
                </p>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Great job staying on pace.
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-800/80 flex justify-end">
            <button
              onClick={() => onNavigateTab('daily-queue')}
              className="text-xs font-mono text-slate-300 hover:underline flex items-center gap-1"
            >
              <span>View full queue</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Q2: What should I revise today? */}
        <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                  <RotateCw className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-zinc-200 text-sm">
                  2. What should I revise today?
                </h3>
              </div>
              <span className="text-xs font-mono text-blue-400 font-semibold">
                {dueRevisions.length > 0
                  ? `${dueRevisions.length} due today`
                  : upcomingRevisions.length > 0
                  ? `${upcomingRevisions.length} upcoming`
                  : '0 due'}
              </span>
            </div>

            {dueRevisions.length > 0 ? (
              <div className="space-y-3">
                {dueRevisions.slice(0, 2).map((card) => {
                  const problem = catalog.find((p) => p.id === card.problemId);
                  if (!problem) return null;
                  return (
                    <div
                      key={card.id}
                      className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-between hover:border-zinc-700 transition-all"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400">
                            Review #{card.reviewCount}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-500">
                            Interval: {card.intervalDays}d
                          </span>
                        </div>
                        <h4 className="font-medium text-xs text-zinc-200 truncate">
                          {problem.title}
                        </h4>
                      </div>
                      <button
                        onClick={() => onNavigateTab('revision')}
                        className="px-2.5 py-1.5 rounded bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-zinc-950 transition-all text-xs font-semibold flex items-center gap-1 shrink-0"
                      >
                        <span>Revise</span>
                        <RotateCw className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : upcomingRevisions.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                  <span>No revisions due today. Next scheduled:</span>
                </div>
                {upcomingRevisions.slice(0, 2).map((card) => {
                  const problem = catalog.find((p) => p.id === card.problemId);
                  if (!problem) return null;
                  const dateStr = new Date(card.nextReviewAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  });
                  return (
                    <div
                      key={card.id}
                      className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-between hover:border-zinc-700 transition-all"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Scheduled: {dateStr}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-500">
                            Interval: {card.intervalDays}d
                          </span>
                        </div>
                        <h4 className="font-medium text-xs text-zinc-200 truncate">
                          {problem.title}
                        </h4>
                      </div>
                      <button
                        onClick={() => onNavigateTab('revision')}
                        className="px-2.5 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-all text-xs font-semibold flex items-center gap-1 shrink-0 border border-zinc-700"
                      >
                        <span>View</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-zinc-200">No Revisions Pending</h4>
                    <p className="text-[11px] text-zinc-400">
                      Solve a problem in your daily queue &amp; log a reflection to automatically trigger spaced-repetition scheduling!
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => onNavigateTab('daily-queue')}
                    className="w-full py-2 px-3 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Go to Daily Queue</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-800/80 flex justify-end">
            <button
              onClick={() => onNavigateTab('revision')}
              className="text-xs font-mono text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>Open Revision Deck</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Q3: Which DSA patterns am I improving? */}
        <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                  <Brain className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-zinc-200 text-sm">
                  3. Which DSA patterns am I improving?
                </h3>
              </div>
            </div>

            {activeMasteries.length > 0 ? (
              <div className="space-y-3">
                {activeMasteries.map((mastery) => (
                  <div
                    key={mastery.patternId}
                    className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800"
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-medium text-zinc-200">
                        {mastery.patternName}
                      </span>
                      <span className="font-mono text-purple-400 font-semibold">
                        {mastery.recognitionScore}% Recognition
                      </span>
                    </div>
                    <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-purple-500 h-full rounded-full transition-all"
                        style={{ width: `${mastery.recognitionScore}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-800/60 text-center">
                <p className="text-xs text-zinc-400">
                  Practice a few problems before pattern mastery can be calculated.
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-800/80 flex justify-end">
            <button
              onClick={() => onNavigateTab('patterns')}
              className="text-xs font-mono text-purple-400 hover:underline flex items-center gap-1"
            >
              <span>Explore Taxonomy</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Q4: How consistent am I? */}
        <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
                  <Flame className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-zinc-200 text-sm">
                  4. How consistent am I?
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-800 text-center">
                <span className="text-xs font-mono text-zinc-500 block mb-1 uppercase">
                  Active Streak
                </span>
                <span className="text-2xl font-mono font-bold text-orange-400">
                  {gamification?.currentStreak || 0} Days
                </span>
              </div>
              <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-800 text-center">
                <span className="text-xs font-mono text-zinc-500 block mb-1 uppercase">
                  Level & XP
                </span>
                <span className="text-2xl font-mono font-bold text-slate-200">
                  Lvl {gamification?.level || 1}
                </span>
                <span className="text-[10px] font-mono text-zinc-500 block mt-0.5">
                  {gamification?.xp || 0} Total XP
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-800/80 flex justify-end">
            <button
              onClick={() => onNavigateTab('coach')}
              className="text-xs font-mono text-slate-300 hover:underline flex items-center gap-1"
            >
              <span>Consult AI Coach</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Schedule & Calendar Overview Card */}
      <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-100 text-sm flex items-center gap-2">
                <span>7-Day Schedule & Reschedule Preview</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                  Daily Cap: {userProfile?.dailyLimit || 3}/day
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                Track problem schedules, reschedules, and rest days across the week.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('calendar')}
            className="px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500 hover:text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-all shrink-0 self-start sm:self-auto"
          >
            <span>Open Full Calendar</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 pt-2">
          {Array.from({ length: 7 }).map((_, idx) => {
            const dateObj = new Date();
            dateObj.setDate(dateObj.getDate() + idx);
            const yStr = dateObj.getFullYear();
            const mStr = String(dateObj.getMonth() + 1).padStart(2, '0');
            const dStr = String(dateObj.getDate()).padStart(2, '0');
            const dateKey = `${yStr}-${mStr}-${dStr}`;
            const isToday = idx === 0;

            const itemsOnDate = dailyQueue.filter((i) => i.dateKey === dateKey);
            const completedCount = itemsOnDate.filter((i) => i.status === 'completed').length;
            const rescheduledCount = itemsOnDate.filter((i) => i.isRescheduled).length;

            const dayLabel = idx === 0 ? 'Today' : idx === 1 ? 'Tomorrow' : dateObj.toLocaleDateString('en-US', { weekday: 'short' });

            return (
              <button
                key={`dash-date-${dateKey}-${idx}`}
                onClick={() => onNavigateTab('calendar')}
                className={`p-3 rounded-xl border text-left transition-all hover:border-amber-500/60 ${
                  isToday
                    ? 'bg-slate-100/10 border-slate-300/50'
                    : 'bg-zinc-950 border-zinc-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-mono font-bold uppercase ${isToday ? 'text-slate-200' : 'text-zinc-400'}`}>
                    {dayLabel}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    {dateObj.getDate()} {dateObj.toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                </div>

                <div className="text-lg font-bold font-mono text-zinc-100 flex items-baseline gap-1">
                  <span>{itemsOnDate.length}</span>
                  <span className="text-xs text-zinc-500 font-normal">/ {userProfile?.dailyLimit || 3}</span>
                </div>

                <div className="flex flex-wrap gap-1 mt-1.5">
                  {completedCount > 0 && (
                    <span className="text-[9px] font-mono px-1 rounded bg-slate-100/20 text-slate-200">
                      {completedCount} done
                    </span>
                  )}
                  {rescheduledCount > 0 && (
                    <span className="text-[9px] font-mono px-1 rounded bg-amber-500/20 text-amber-400">
                      {rescheduledCount} resched
                    </span>
                  )}
                  {itemsOnDate.length === 0 && (
                    <span className="text-[9px] font-mono text-zinc-600">
                      Empty
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Practice Topics Selector - Pushed to the bottom & Collapsible */}
      <PracticeTopicSelector
        selectedTopics={userProfile?.selectedTopics || []}
        onUpdateTopics={onUpdateTopics}
        onRegenerateQueue={onRegenerateQueue}
      />

      {/* Reschedule Modal Overlay */}
      {rescheduleTargetItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-zinc-100 text-base">
                  Reschedule Problem
                </h3>
              </div>
              <button
                onClick={() => setRescheduleTargetItem(null)}
                className="text-zinc-400 hover:text-zinc-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-300 font-medium bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
              "{rescheduleTargetItem.problemTitle}"
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
