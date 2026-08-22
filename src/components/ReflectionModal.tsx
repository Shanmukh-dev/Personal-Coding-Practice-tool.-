import React, { useState, useEffect } from 'react';
import { X, Star, Sparkles, Check, History, TrendingUp, Loader2, AlertCircle } from 'lucide-react';
import { Problem, Difficulty, Reflection } from '../types';

interface ReflectionModalProps {
  isOpen: boolean;
  problem: Problem | null;
  previousReflections?: Reflection[];
  onClose: () => void;
  onSubmitReflection: (data: {
    confidence: number;
    feltDifficulty: Difficulty;
    recognizedPatternImmediately: boolean;
    requiredHintsOrEditorial: boolean;
    notes: string;
    improvementAnswers?: {
      speedImprovement?: string;
      avoidedPreviousMistakes?: string;
      interviewReadiness?: string;
    };
  }) => Promise<void>;
}

export const ReflectionModal: React.FC<ReflectionModalProps> = ({
  isOpen,
  problem,
  previousReflections = [],
  onClose,
  onSubmitReflection,
}) => {
  const [confidence, setConfidence] = useState<number>(3);
  const [feltDifficulty, setFeltDifficulty] = useState<Difficulty>('Medium');
  const [recognizedPattern, setRecognizedPattern] = useState<boolean>(true);
  const [requiredHints, setRequiredHints] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');
  
  // Progress check state based on previous logs
  const [speedImprovement, setSpeedImprovement] = useState<string>('Slightly Faster');
  const [avoidedMistakes, setAvoidedMistakes] = useState<string>('Independent Now');
  const [interviewReadiness, setInterviewReadiness] = useState<string>('Moderate Progress');
  
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Get latest previous reflection for this problem if any
  const sortedPrevious = [...previousReflections].sort((a, b) => b.timestamp - a.timestamp);
  const latestPrevious = sortedPrevious[0] || null;

  useEffect(() => {
    if (isOpen) {
      setConfidence(3);
      setFeltDifficulty('Medium');
      setRecognizedPattern(true);
      setRequiredHints(false);
      setNotes('');
      setSpeedImprovement('Slightly Faster');
      setAvoidedMistakes('Independent Now');
      setInterviewReadiness('Moderate Progress');
      setSubmitting(false);
      setErrorMsg(null);
    }
  }, [isOpen, problem?.id]);

  if (!isOpen || !problem) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      await onSubmitReflection({
        confidence,
        feltDifficulty,
        recognizedPatternImmediately: recognizedPattern,
        requiredHintsOrEditorial: requiredHints,
        notes,
        improvementAnswers: latestPrevious
          ? {
              speedImprovement,
              avoidedPreviousMistakes: avoidedMistakes,
              interviewReadiness,
            }
          : undefined,
      });
      onClose();
    } catch (err: any) {
      console.error('Reflection submission error:', err);
      setErrorMsg(err?.message || 'Failed to sync reflection with server. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-xl w-full p-6 relative shadow-2xl max-h-[90vh] flex flex-col space-y-4">
        {/* Modal Header (Fixed) */}
        <div className="shrink-0 flex items-start justify-between border-b border-zinc-800 pb-3 pr-8">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-slate-300 font-medium uppercase mb-1">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>{latestPrevious ? 'Revision Reflection Log' : 'Problem Reflection (< 1 min)'}</span>
            </div>
            <h2 className="text-xl font-bold text-zinc-100">{problem.title}</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Reflecting builds pattern memory and adapts your spaced revision schedule.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-200 transition-colors p-1 rounded-lg hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error alert banner */}
        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2.5 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span className="flex-1">{errorMsg}</span>
          </div>
        )}

        {/* Form Body (Scrollable container so modal stays fixed max-h-[90vh]) */}
        <form onSubmit={handleSubmit} className="overflow-y-auto pr-1 space-y-4 flex-1 custom-scrollbar">
          {/* Previous Reflection Context & Banner */}
          {latestPrevious && (
            <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-blue-300 font-semibold flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5" />
                  <span>Previous Log ({new Date(latestPrevious.timestamp).toLocaleDateString()})</span>
                </span>
                <span className="text-[10px] font-mono text-blue-300/80 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                  Rating: {latestPrevious.confidence}/5 Stars ({latestPrevious.feltDifficulty})
                </span>
              </div>
              {latestPrevious.notes ? (
                <p className="text-xs text-zinc-300 italic bg-zinc-950/70 p-2 rounded border border-zinc-800">
                  "{latestPrevious.notes}"
                </p>
              ) : (
                <p className="text-xs text-zinc-400 italic">No notes recorded in previous attempt.</p>
              )}
              <div className="flex flex-wrap items-center gap-2 text-[10px] text-zinc-400 font-mono">
                <span>Pattern Recognition: {latestPrevious.recognizedPatternImmediately ? 'Instant' : 'Struggled'}</span>
                <span>•</span>
                <span>Hints/Editorial: {latestPrevious.requiredHintsOrEditorial ? 'Required' : 'None needed'}</span>
              </div>
            </div>
          )}

          {/* Targeted Improvement Questions when previous log exists */}
          {latestPrevious && (
            <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
              <div className="flex items-center space-x-1.5 text-xs font-mono text-amber-400 font-semibold uppercase">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Improvement Since Last Attempt</span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    1. Pattern Recognition Speed:
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {['Much Faster', 'Slightly Faster', 'Same / Slower'].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        disabled={submitting}
                        onClick={() => setSpeedImprovement(opt)}
                        className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold border transition-all ${
                          speedImprovement === opt
                            ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    2. Avoided Previous Hints/Mistakes?
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {['Independent Now', 'Needed Minor Hint', 'Required Editorial'].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        disabled={submitting}
                        onClick={() => setAvoidedMistakes(opt)}
                        className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold border transition-all ${
                          avoidedMistakes === opt
                            ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    3. Interview Readiness Level:
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {['Ready / Solid', 'Moderate Progress', 'Needs Practice'].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        disabled={submitting}
                        onClick={() => setInterviewReadiness(opt)}
                        className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold border transition-all ${
                          interviewReadiness === opt
                            ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Confidence 1 - 5 */}
          <div>
            <label className="block text-xs font-mono text-zinc-300 font-semibold uppercase mb-2">
              Current Confidence (1 to 5 Stars)
            </label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  disabled={submitting}
                  onClick={() => setConfidence(star)}
                  className={`p-2 rounded-lg border transition-all ${
                    confidence >= star
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-600 hover:text-zinc-400'
                  }`}
                >
                  <Star className={`w-5 h-5 ${confidence >= star ? 'fill-amber-400' : ''}`} />
                </button>
              ))}
              <span className="text-xs font-mono text-zinc-400 ml-2">
                {confidence === 1
                  ? 'Very Uncertain'
                  : confidence === 2
                  ? 'Shaky'
                  : confidence === 3
                  ? 'Fair'
                  : confidence === 4
                  ? 'Confident'
                  : 'Mastered'}
              </span>
            </div>
          </div>

          {/* Felt Difficulty */}
          <div>
            <label className="block text-xs font-mono text-zinc-300 font-semibold uppercase mb-2">
              Felt Difficulty
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map((diff) => (
                <button
                  key={diff}
                  type="button"
                  disabled={submitting}
                  onClick={() => setFeltDifficulty(diff)}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                    feltDifficulty === diff
                      ? 'bg-slate-100/10 border-slate-300 text-slate-200'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Rapid Questions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
              <span className="text-xs font-medium text-zinc-200 block">
                Recognized pattern immediately?
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setRecognizedPattern(true)}
                  className={`flex-1 py-1.5 rounded text-xs font-semibold border ${
                    recognizedPattern
                      ? 'bg-slate-100/20 border-slate-300 text-slate-200'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setRecognizedPattern(false)}
                  className={`flex-1 py-1.5 rounded text-xs font-semibold border ${
                    !recognizedPattern
                      ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
              <span className="text-xs font-medium text-zinc-200 block">
                Required hints or editorial?
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setRequiredHints(true)}
                  className={`flex-1 py-1.5 rounded text-xs font-semibold border ${
                    requiredHints
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setRequiredHints(false)}
                  className={`flex-1 py-1.5 rounded text-xs font-semibold border ${
                    !requiredHints
                      ? 'bg-slate-100/20 border-slate-300 text-slate-200'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                  }`}
                >
                  No
                </button>
              </div>
            </div>
          </div>

          {/* Optional Notes */}
          <div>
            <label className="block text-xs font-mono text-zinc-300 font-semibold uppercase mb-1">
              Key Insights or Implementation Notes
            </label>
            <textarea
              rows={3}
              disabled={submitting}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Watch out for off-by-one boundary check when low > high..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-slate-300 resize-none max-h-28 disabled:opacity-60"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-zinc-950 font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md shrink-0 disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                <span>Saving & Syncing to Cloud...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Save Reflection Log</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};


