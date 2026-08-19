import React, { useState } from 'react';
import { Target, Check, Sparkles, Sliders } from 'lucide-react';
import { UserProfile } from '../types';
import { DSA_PATTERNS } from '../data/dsaPatterns';

interface OnboardingModalProps {
  isOpen: boolean;
  userProfile: UserProfile | null;
  onSave: (updated: Partial<UserProfile>) => void;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  userProfile,
  onSave,
  onClose,
}) => {
  const [targetLevel, setTargetLevel] = useState<UserProfile['targetInterviewLevel']>(
    userProfile?.targetInterviewLevel || 'Junior'
  );
  const [dailyLimit, setDailyLimit] = useState<number>(userProfile?.dailyLimit || 3);
  const [selectedTopics, setSelectedTopics] = useState<string[]>(
    userProfile?.selectedTopics && userProfile.selectedTopics.length > 0
      ? userProfile.selectedTopics
      : ['arrays', 'two_pointers', 'sliding_window', 'binary_search', 'hashmap', 'dfs', 'dynamic_programming']
  );

  if (!isOpen) return null;

  const activeTopics = selectedTopics || [];

  const toggleTopic = (id: string) => {
    if (activeTopics.includes(id)) {
      setSelectedTopics(activeTopics.filter((t) => t !== id));
    } else {
      setSelectedTopics([...activeTopics, id]);
    }
  };

  const handleFinish = () => {
    onSave({
      targetInterviewLevel: targetLevel,
      dailyLimit,
      selectedTopics: activeTopics,
      onboardingCompleted: true,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-2xl w-full p-6 relative shadow-2xl max-h-[90vh] flex flex-col">
        <div className="mb-4 text-center shrink-0">
          <div className="w-10 h-10 rounded-xl bg-slate-100/10 border border-slate-300/30 flex items-center justify-center text-slate-200 font-mono font-bold text-xl mx-auto mb-2">
            <Target className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-zinc-100">
            Personalize Your Adaptive DSA Path
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Omega generates a tailored daily practice queue based on your goals.
          </p>
        </div>

        <div className="overflow-y-auto space-y-6 pr-1 flex-1 text-left">
          {/* Target Interview Level */}
          <div>
            <label className="block text-xs font-mono font-semibold text-zinc-300 mb-2 uppercase tracking-wider">
              1. Target Interview Level
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(
                ['Internship', 'Junior', 'Mid', 'Senior', 'FAANG/Top Tech'] as const
              ).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setTargetLevel(lvl)}
                  className={`p-2.5 rounded-lg border text-xs text-left transition-all ${
                    targetLevel === lvl
                      ? 'bg-slate-100/10 border-slate-300 text-slate-200 font-semibold'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{lvl}</span>
                    {targetLevel === lvl && <Check className="w-3.5 h-3.5 text-slate-200" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Daily Practice Limit */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono font-semibold text-zinc-300 uppercase tracking-wider">
                2. Daily Practice Limit
              </label>
              <span className="text-xs font-mono text-slate-200 font-semibold">
                {dailyLimit} problems / day
              </span>
            </div>
            <div className="flex items-center space-x-3 bg-zinc-950 p-3 rounded-lg border border-zinc-800">
              <Sliders className="w-4 h-4 text-zinc-500" />
              <input
                type="range"
                min={1}
                max={5}
                step={1}
                value={dailyLimit}
                onChange={(e) => setDailyLimit(Number(e.target.value))}
                className="w-full accent-slate-300 bg-zinc-800 h-1.5 rounded-lg cursor-pointer"
              />
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              Recommended: 3 to 5 problems per day to prevent burn-out and optimize spaced retention.
            </p>
          </div>

          {/* Topics selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono font-semibold text-zinc-300 uppercase tracking-wider">
                3. Select Priority Topics ({selectedTopics.length} selected)
              </label>
              <button
                type="button"
                onClick={() =>
                  setSelectedTopics(
                    activeTopics.length === DSA_PATTERNS.length
                      ? []
                      : DSA_PATTERNS.map((p) => p.id)
                  )
                }
                className="text-[11px] text-slate-300 hover:underline"
              >
                {activeTopics.length === DSA_PATTERNS.length
                  ? 'Deselect All'
                  : 'Select All'}
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto p-1 bg-zinc-950 rounded-lg border border-zinc-800/80">
              {DSA_PATTERNS.map((p) => {
                const selected = activeTopics.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => toggleTopic(p.id)}
                    className={`p-2 rounded border text-[11px] text-left transition-all flex items-center justify-between ${
                      selected
                        ? 'bg-slate-100/10 border-slate-300/60 text-slate-200 font-medium'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <span className="truncate">{p.name}</span>
                    {selected && <Check className="w-3 h-3 text-slate-200 shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-zinc-800 flex justify-end shrink-0">
          <button
            onClick={handleFinish}
            className="px-5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-zinc-950 font-semibold text-xs flex items-center gap-2 transition-all shadow-md"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Adaptive Path</span>
          </button>
        </div>
      </div>
    </div>
  );
};
