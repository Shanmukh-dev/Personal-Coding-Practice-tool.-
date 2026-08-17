import React, { useState } from 'react';
import {
  RotateCw,
  ExternalLink,
  Calendar,
  Check,
  Clock,
  ChevronDown,
  ChevronUp,
  Zap,
  Sparkles,
  History,
  Star,
  X,
} from 'lucide-react';
import { RevisionCard, Problem, ReviewOutcome, Reflection } from '../types';
import { RescheduleResult } from '../services/revisionEngine';

interface RevisionViewProps {
  revisionCards: RevisionCard[];
  catalog: Problem[];
  reflections?: Reflection[];
  onReviewOutcome: (card: RevisionCard, outcome: ReviewOutcome) => void;
  onAutoRescheduleOverdue?: () => Promise<RescheduleResult>;
  onSolveProblem: (problem: Problem) => void;
  onOpenReflection: (problem: Problem) => void;
}

const ProblemReflectionHistory: React.FC<{
  problemId: string;
  reflections: Reflection[];
}> = ({ problemId, reflections }) => {
  const [expanded, setExpanded] = useState(false);
  const problemReflections = reflections
    .filter((r) => r.problemId === problemId)
    .sort((a, b) => b.timestamp - a.timestamp);

  if (problemReflections.length === 0) {
    return (
      <div className="text-[11px] font-mono text-zinc-500 italic flex items-center gap-1.5 pt-1">
        <History className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
        <span>No reflection logs saved yet. Click 'Log Reflection' to track your memory and progress!</span>
      </div>
    );
  }

  const latest = problemReflections[0];

  return (
    <div className="mt-3 pt-3 border-t border-zinc-800 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono text-blue-400 font-semibold flex items-center gap-1.5">
          <History className="w-3.5 h-3.5" />
          <span>Past Reflection Logs ({problemReflections.length})</span>
        </span>
        {problemReflections.length > 1 && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="text-[10px] font-mono text-zinc-400 hover:text-zinc-200 underline flex items-center gap-1"
          >
            {expanded ? 'Hide History' : `Show All (${problemReflections.length})`}
          </button>
        )}
      </div>

      {/* Latest Log Card */}
      <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 space-y-1.5">
        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
          <span className="text-zinc-300 font-semibold">
            Latest: {new Date(latest.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <span className="text-amber-400 font-semibold flex items-center gap-1">
            <Star className="w-3 h-3 fill-amber-400" />
            <span>{latest.confidence}/5 ({latest.feltDifficulty})</span>
          </span>
        </div>

        {latest.notes ? (
          <p className="text-xs text-zinc-300 italic bg-zinc-900/80 p-2 rounded border border-zinc-800">
            "{latest.notes}"
          </p>
        ) : null}

        {latest.improvementAnswers && (
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 p-2 rounded border border-emerald-500/20">
            {latest.improvementAnswers.speedImprovement && (
              <span>Speed: {latest.improvementAnswers.speedImprovement}</span>
            )}
            {latest.improvementAnswers.avoidedPreviousMistakes && (
              <span>• Accuracy: {latest.improvementAnswers.avoidedPreviousMistakes}</span>
            )}
            {latest.improvementAnswers.interviewReadiness && (
              <span>• Interview: {latest.improvementAnswers.interviewReadiness}</span>
            )}
          </div>
        )}
      </div>

      {/* Expanded Older Logs */}
      {expanded && problemReflections.length > 1 && (
        <div className="space-y-2 pt-1 pl-2 border-l-2 border-zinc-800">
          {problemReflections.slice(1).map((ref) => (
            <div key={ref.id} className="p-2.5 rounded bg-zinc-950/70 border border-zinc-800 text-xs space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                <span>{new Date(ref.timestamp).toLocaleDateString()}</span>
                <span className="text-amber-400 font-medium">Rating: {ref.confidence}/5</span>
              </div>
              {ref.notes && <p className="text-zinc-300 text-[11px] italic">"{ref.notes}"</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const RevisionView: React.FC<RevisionViewProps> = ({
  revisionCards,
  catalog,
  reflections = [],
  onReviewOutcome,
  onAutoRescheduleOverdue,
  onSolveProblem,
  onOpenReflection,
}) => {
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);
  const endOfTodayMs = endOfToday.getTime();

  const startOfTodayMs = new Date().setHours(0, 0, 0, 0);

  // Categorize cards
  const todayAndDueCards = revisionCards
    .filter((card) => card.nextReviewAt <= endOfTodayMs && card.status !== 'graduated')
    .sort((a, b) => a.nextReviewAt - b.nextReviewAt);

  const overdueCardsCount = revisionCards.filter(
    (card) => card.status !== 'graduated' && card.nextReviewAt < startOfTodayMs
  ).length;

  const upcomingCards = revisionCards
    .filter((card) => card.nextReviewAt > endOfTodayMs && card.status !== 'graduated')
    .sort((a, b) => a.nextReviewAt - b.nextReviewAt);

  const graduatedCards = revisionCards.filter((card) => card.status === 'graduated');

  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [showGraduated, setShowGraduated] = useState(false);
  const [expandedLogProblemId, setExpandedLogProblemId] = useState<string | null>(null);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleTriggerAutoReschedule = async () => {
    if (!onAutoRescheduleOverdue) return;
    setIsRescheduling(true);
    try {
      const res = await onAutoRescheduleOverdue();
      if (res.rescheduledCount > 0) {
        showToast(
          `🤖 Smart Auto-Rescheduler: ${res.rescheduledCount} overdue revision(s) intelligently redistributed across upcoming days!`
        );
      } else {
        showToast('✨ All revisions are already up-to-date and optimally scheduled!');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRescheduling(false);
    }
  };

  // Active card for flashcard review
  const activeCard =
    revisionCards.find((c) => c.id === selectedCardId) ||
    todayAndDueCards[0] ||
    upcomingCards[0] ||
    null;

  const activeProblem = activeCard
    ? catalog.find((p) => p.id === activeCard.problemId)
    : null;

  const formatRevisionDate = (timestamp: number) => {
    if (!timestamp) return 'Unscheduled';
    const target = new Date(timestamp);
    const now = new Date();

    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfTarget = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();

    const diffDays = Math.round((startOfTarget - startOfToday) / (1000 * 60 * 60 * 24));

    const dateStr = target.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    if (diffDays < 0) {
      return `${dateStr} (${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? 's' : ''} overdue)`;
    }
    if (diffDays === 0) {
      return `Today (${dateStr})`;
    }
    if (diffDays === 1) {
      return `Tomorrow (${dateStr})`;
    }
    return `${dateStr} (In ${diffDays} days)`;
  };

  const handleOutcomeClick = (card: RevisionCard, outcome: ReviewOutcome) => {
    onReviewOutcome(card, outcome);
    const remainingDue = todayAndDueCards.filter((c) => c.id !== card.id);
    if (remainingDue.length > 0) {
      setSelectedCardId(remainingDue[0].id);
    } else {
      setSelectedCardId(null);
    }
  };

  if (revisionCards.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mx-auto mb-4">
          <RotateCw className="w-6 h-6 text-blue-400" />
        </div>
        <h2 className="text-xl font-bold text-zinc-200">No revisions scheduled yet.</h2>
        <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1">
          When you solve problems and complete reflections, Omega automatically schedules spaced-repetition revisions here and on your calendar.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-slate-100/10 border border-slate-300/30 text-slate-200 text-xs font-mono font-semibold flex items-center justify-between shadow-lg">
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{toastMessage}</span>
          </span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-300 hover:text-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-zinc-500 block">Today & Due</span>
            <span className="text-xl font-mono font-bold text-blue-400">
              {todayAndDueCards.length} Card{todayAndDueCards.length === 1 ? '' : 's'}
            </span>
          </div>
          <RotateCw className="w-5 h-5 text-blue-400" />
        </div>
        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-zinc-500 block">Upcoming Future</span>
            <span className="text-xl font-mono font-bold text-emerald-400">
              {upcomingCards.length} Card{upcomingCards.length === 1 ? '' : 's'}
            </span>
          </div>
          <Calendar className="w-5 h-5 text-emerald-400" />
        </div>
        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-zinc-500 block">Mastered / Graduated</span>
            <span className="text-xl font-mono font-bold text-slate-200">
              {graduatedCards.length} Problem{graduatedCards.length === 1 ? '' : 's'}
            </span>
          </div>
          <Check className="w-5 h-5 text-slate-300" />
        </div>
      </div>

      {/* Overdue Intelligent Auto-Reschedule Banner */}
      {overdueCardsCount > 0 && (
        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-200">
                {overdueCardsCount} Overdue Revision{overdueCardsCount > 1 ? 's' : ''} Detected
              </h4>
              <p className="text-xs text-zinc-400 mt-0.5">
                Prevent review fatigue! Smart Auto-Rescheduler automatically redistributes overdue problems across upcoming days based on pattern difficulty and spacing algorithms.
              </p>
            </div>
          </div>

          <button
            onClick={handleTriggerAutoReschedule}
            disabled={isRescheduling}
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-2 transition-all shrink-0 self-start sm:self-auto shadow"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isRescheduling ? 'Rescheduling...' : 'Smart Reschedule Overdue'}</span>
          </button>
        </div>
      )}

      {/* Main Flashcard Review Area */}
      {activeCard && activeProblem ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono uppercase px-2.5 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 font-semibold flex items-center gap-1.5">
                <RotateCw className="w-3 h-3" />
                <span>Revision Card #{activeCard.reviewCount}</span>
              </span>
              <span className="text-xs font-mono text-zinc-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-zinc-500" />
                <span>Scheduled: {formatRevisionDate(activeCard.nextReviewAt)}</span>
              </span>
            </div>

            <span className="text-xs font-mono text-zinc-500">
              Interval: {activeCard.intervalDays}d | Ease: {activeCard.easeFactor.toFixed(1)}
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 uppercase">
                {activeProblem.platform}
              </span>
              <span
                className={`text-xs font-mono px-2 py-0.5 rounded ${
                  activeProblem.difficulty === 'Easy'
                    ? 'text-slate-200 bg-slate-100/10'
                    : activeProblem.difficulty === 'Medium'
                    ? 'text-amber-400 bg-amber-500/10'
                    : 'text-rose-400 bg-rose-500/10'
                }`}
              >
                {activeProblem.difficulty}
              </span>
            </div>

            <h2 className="text-2xl font-bold text-zinc-100">{activeProblem.title}</h2>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {activeProblem.dsaPatterns.map((pat) => (
                <span
                  key={pat}
                  className="text-xs font-mono px-2.5 py-1 rounded bg-zinc-950 text-zinc-300 border border-zinc-800"
                >
                  {pat}
                </span>
              ))}
            </div>
          </div>

          {/* Previous Reflection Logs for active problem */}
          <ProblemReflectionHistory problemId={activeProblem.id} reflections={reflections} />

          {/* Action Buttons: Solve + Reflect & Complete */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="text-xs text-zinc-400">
              Solve on {activeProblem.platform}, then log your reflection to update memory curves and complete revision!
            </div>
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                onClick={() => onSolveProblem(activeProblem)}
                className="px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-semibold text-xs flex items-center gap-2 border border-zinc-700 transition-all"
              >
                <span>Solve Problem</span>
                <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              <button
                onClick={() => onOpenReflection(activeProblem)}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-md"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Log Reflection & Complete</span>
              </button>
            </div>
          </div>

          {/* Self-Assessment Quick FSRS Outcomes */}
          <div className="pt-4 border-t border-zinc-800 space-y-3">
            <label className="block text-xs font-mono uppercase text-zinc-400 font-medium">
              Quick Self-Assessment Log Outcome:
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={() => handleOutcomeClick(activeCard, 'Forgot')}
                className="p-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-left transition-all"
              >
                <div className="font-bold text-xs mb-0.5">Forgot</div>
                <div className="text-[10px] font-mono opacity-80">Reset (1 day)</div>
              </button>

              <button
                onClick={() => handleOutcomeClick(activeCard, 'Hard')}
                className="p-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-left transition-all"
              >
                <div className="font-bold text-xs mb-0.5">Hard</div>
                <div className="text-[10px] font-mono opacity-80">+1.2x Interval</div>
              </button>

              <button
                onClick={() => handleOutcomeClick(activeCard, 'Good')}
                className="p-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 text-left transition-all"
              >
                <div className="font-bold text-xs mb-0.5">Good</div>
                <div className="text-[10px] font-mono opacity-80">Optimal Interval</div>
              </button>

              <button
                onClick={() => handleOutcomeClick(activeCard, 'Easy')}
                className="p-3 rounded-xl bg-slate-100/10 hover:bg-slate-100/20 border border-slate-300/30 text-slate-200 text-left transition-all"
              >
                <div className="font-bold text-xs mb-0.5">Easy</div>
                <div className="text-[10px] font-mono opacity-80">+1.4x Boost</div>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-2xl bg-zinc-900 border border-zinc-800 text-center">
          <Check className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-zinc-100">All revisions up to date!</h3>
          <p className="text-xs text-zinc-400 mt-1">
            There are no pending revisions for today. Check your upcoming schedule below!
          </p>
        </div>
      )}

      {/* TODAY'S & DUE REVISIONS LIST */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-bold text-zinc-100">Today's & Due Revisions</h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30">
              {todayAndDueCards.length}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-zinc-500">
              {new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>

        {todayAndDueCards.length === 0 ? (
          <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800/80 text-center text-xs text-zinc-400">
            No revisions due today.
          </div>
        ) : (
          <div className="space-y-3">
            {todayAndDueCards.map((card) => {
              const prob = catalog.find((p) => p.id === card.problemId);
              if (!prob) return null;
              const isSelected = activeCard?.id === card.id;
              const isLogsOpen = expandedLogProblemId === card.problemId;

              return (
                <div
                  key={card.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col space-y-3 ${
                    isSelected
                      ? 'bg-blue-950/30 border-blue-500/50 shadow-lg'
                      : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold uppercase flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatRevisionDate(card.nextReviewAt)}</span>
                        </span>
                        <span className="text-xs font-mono text-zinc-400">
                          {prob.platform}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                            prob.difficulty === 'Easy'
                              ? 'text-slate-200 bg-slate-100/10'
                              : prob.difficulty === 'Medium'
                              ? 'text-amber-400 bg-amber-500/10'
                              : 'text-rose-400 bg-rose-500/10'
                          }`}
                        >
                          {prob.difficulty}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-zinc-100 truncate">{prob.title}</h4>

                      <div className="flex flex-wrap items-center gap-1.5">
                        {prob.dsaPatterns.map((pat) => (
                          <span key={pat} className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-950 text-zinc-400 border border-zinc-800">
                            {pat}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => onSolveProblem(prob)}
                        className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium border border-zinc-700 transition-all flex items-center gap-1"
                      >
                        <span>Solve</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>

                      <button
                        onClick={() => onOpenReflection(prob)}
                        className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-semibold transition-all flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Reflect</span>
                      </button>

                      <button
                        onClick={() => setExpandedLogProblemId(isLogsOpen ? null : card.problemId)}
                        className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 text-xs font-medium transition-all"
                        title="View Past Reflection Logs"
                      >
                        <History className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setSelectedCardId(card.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700'
                        }`}
                      >
                        {isSelected ? 'Reviewing' : 'Focus Card'}
                      </button>
                    </div>
                  </div>

                  {isLogsOpen && (
                    <ProblemReflectionHistory problemId={prob.id} reflections={reflections} />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* UPCOMING REVISIONS LIST */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-emerald-400" />
          <h3 className="text-lg font-bold text-zinc-100">Upcoming Revisions</h3>
          <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            {upcomingCards.length}
          </span>
        </div>

        {upcomingCards.length === 0 ? (
          <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800/80 text-center text-xs text-zinc-400">
            No upcoming revisions scheduled. Solve problems and log reflections to add items to your schedule.
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingCards.map((card) => {
              const prob = catalog.find((p) => p.id === card.problemId);
              if (!prob) return null;
              const isSelected = activeCard?.id === card.id;
              const isLogsOpen = expandedLogProblemId === card.problemId;

              return (
                <div
                  key={card.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col space-y-3 ${
                    isSelected
                      ? 'bg-emerald-950/30 border-emerald-500/50'
                      : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold uppercase flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>Date: {formatRevisionDate(card.nextReviewAt)}</span>
                        </span>
                        <span className="text-xs font-mono text-zinc-400">
                          {prob.platform}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                            prob.difficulty === 'Easy'
                              ? 'text-slate-200 bg-slate-100/10'
                              : prob.difficulty === 'Medium'
                              ? 'text-amber-400 bg-amber-500/10'
                              : 'text-rose-400 bg-rose-500/10'
                          }`}
                        >
                          {prob.difficulty}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500">
                          Interval: {card.intervalDays}d
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-zinc-100 truncate">{prob.title}</h4>

                      <div className="flex flex-wrap items-center gap-1.5">
                        {prob.dsaPatterns.map((pat) => (
                          <span key={pat} className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-950 text-zinc-400 border border-zinc-800">
                            {pat}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => onSolveProblem(prob)}
                        className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium border border-zinc-700 transition-all flex items-center gap-1"
                      >
                        <span>Solve</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>

                      <button
                        onClick={() => onOpenReflection(prob)}
                        className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-semibold transition-all flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Reflect</span>
                      </button>

                      <button
                        onClick={() => setExpandedLogProblemId(isLogsOpen ? null : card.problemId)}
                        className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 text-xs font-medium transition-all"
                        title="View Past Reflection Logs"
                      >
                        <History className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setSelectedCardId(card.id)}
                        className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium border border-zinc-700 transition-all"
                      >
                        Review Early
                      </button>
                    </div>
                  </div>

                  {isLogsOpen && (
                    <ProblemReflectionHistory problemId={prob.id} reflections={reflections} />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* GRADUATED / MASTERED SECTION */}
      {graduatedCards.length > 0 && (
        <div className="pt-4 border-t border-zinc-800 space-y-3">
          <button
            onClick={() => setShowGraduated(!showGraduated)}
            className="flex items-center justify-between w-full p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-left hover:bg-zinc-800/80 transition-all"
          >
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-slate-300" />
              <span className="text-sm font-bold text-zinc-300">
                Mastered & Graduated Revisions ({graduatedCards.length})
              </span>
            </div>
            {showGraduated ? (
              <ChevronUp className="w-4 h-4 text-zinc-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-zinc-400" />
            )}
          </button>

          {showGraduated && (
            <div className="space-y-2 pt-2">
              {graduatedCards.map((card) => {
                const prob = catalog.find((p) => p.id === card.problemId);
                if (!prob) return null;
                return (
                  <div
                    key={card.id}
                    className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xs font-bold text-zinc-200">{prob.title}</span>
                      <span className="text-[10px] font-mono text-zinc-500">{prob.platform}</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 uppercase font-semibold">
                      Mastered
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
