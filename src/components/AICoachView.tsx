import React, { useState } from 'react';
import { Bot, Send, User, Sparkles, AlertCircle } from 'lucide-react';
import {
  AICoachMessage,
  UserProfile,
  LearningMemory,
  MistakeEntry,
  PatternMastery,
} from '../types';

interface AICoachViewProps {
  messages: AICoachMessage[];
  userProfile: UserProfile | null;
  memories: LearningMemory[];
  mistakes: MistakeEntry[];
  masteries: PatternMastery[];
  onSendMessage: (text: string) => Promise<void>;
}

export const AICoachView: React.FC<AICoachViewProps> = ({
  messages,
  userProfile,
  memories,
  mistakes,
  masteries,
  onSendMessage,
}) => {
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || sending) return;
    const msg = inputText.trim();
    setInputText('');
    setSending(true);
    try {
      await onSendMessage(msg);
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const hasData = memories.length > 0 || mistakes.length > 0 || masteries.length > 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-4rem)] md:h-screen flex flex-col space-y-4 overflow-hidden">
      {/* Header */}
      <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="p-2 rounded-lg bg-slate-100/10 text-slate-200 border border-slate-300/20 shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-base text-zinc-100 truncate">AlgoOS Adaptive Coach</h1>
            <p className="text-xs text-zinc-400 truncate">
              Context-aware engineering mentor grounded in your real DSA activity.
            </p>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-4 min-h-0">
        {messages.length === 0 ? (
          <div className="p-8 text-center max-w-lg mx-auto space-y-3">
            <div className="w-12 h-12 rounded-xl bg-slate-100/10 border border-slate-300/20 flex items-center justify-center text-slate-200 mx-auto">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-zinc-200 text-sm">
              Hello! I am your AlgoOS Adaptive DSA Coach.
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {!hasData
                ? "I don't know your learning style yet. Solve a few problems and complete your reflections so I can personalize my guidance."
                : "Ask me anything about your weak pattern areas, interview preparation strategies, or mistake patterns!"}
            </p>

            {hasData && (
              <div className="pt-2 flex flex-wrap gap-2 justify-center">
                <button
                  onClick={() => onSendMessage('What are my top 3 weakest patterns right now?')}
                  className="text-xs px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 text-left"
                >
                  "What are my top 3 weakest patterns right now?"
                </button>
                <button
                  onClick={() => onSendMessage('Analyze my mistake journal and give me advice.')}
                  className="text-xs px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 text-left"
                >
                  "Analyze my mistake journal and give me advice."
                </button>
              </div>
            )}
          </div>
        ) : (
          messages.map((msg) => {
            const isAssistant = msg.role === 'assistant';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${
                  isAssistant ? 'justify-start' : 'justify-end'
                }`}
              >
                {isAssistant && (
                  <div className="w-7 h-7 rounded-lg bg-slate-100/10 border border-slate-300/30 flex items-center justify-center text-slate-200 shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-xl p-3.5 rounded-xl text-xs leading-relaxed ${
                    isAssistant
                      ? 'bg-zinc-900 border border-zinc-800 text-zinc-200'
                      : 'bg-slate-100 text-zinc-950 font-medium'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <span className="text-[10px] font-mono opacity-60 block mt-1.5 text-right">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                {!isAssistant && (
                  <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSubmit} className="flex gap-2 shrink-0">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask AlgoOS Coach about your DSA progress or pattern strategies..."
          className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-slate-300"
        />
        <button
          type="submit"
          disabled={sending || !inputText.trim()}
          className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-zinc-950 font-semibold text-xs flex items-center gap-1.5 transition-all shrink-0 shadow-md disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          <span>{sending ? 'Thinking...' : 'Send'}</span>
        </button>
      </form>
    </div>
  );
};
