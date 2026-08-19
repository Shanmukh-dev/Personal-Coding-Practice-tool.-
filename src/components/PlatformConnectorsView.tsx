import React, { useState } from 'react';
import { Link2, Check, RefreshCw, Copy, CheckCircle2, AlertCircle, Code, Download, FolderOpen } from 'lucide-react';
import { Platform, PlatformConnection } from '../types';
import { ALL_PLATFORMS, generateUserscriptSnippet } from '../services/platformConnectors';
import { Logo } from './Logo';

interface PlatformConnectorsViewProps {
  userId: string;
  userEmail?: string | null;
  userDisplayName?: string | null;
  isAuthenticated: boolean;
  connections: PlatformConnection[];
  onConnectPlatform: (platform: Platform, username: string) => Promise<void>;
  onSyncPlatform: (platform: Platform) => Promise<void>;
  onSimulateCompletionEvent: (platform: Platform, problemTitle: string, problemUrl: string) => Promise<void>;
  onOpenAuth: () => void;
  onOpenExtensionPair?: () => void;
  onOpenDownloadExtension?: () => void;
}

export const PlatformConnectorsView: React.FC<PlatformConnectorsViewProps> = ({
  userId,
  userEmail,
  userDisplayName,
  isAuthenticated,
  connections,
  onConnectPlatform,
  onSyncPlatform,
  onSimulateCompletionEvent,
  onOpenAuth,
  onOpenExtensionPair,
  onOpenDownloadExtension,
}) => {
  const [connectingPlatform, setConnectingPlatform] = useState<Platform | null>(null);
  const [handleInput, setHandleInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Extension Pair Code State
  const [pairCode, setPairCode] = useState<string | null>(null);
  const [pairLoading, setPairLoading] = useState(false);
  const [copiedPairCode, setCopiedPairCode] = useState(false);
  const [isPairModalOpen, setIsPairModalOpen] = useState(false);

  const handleGeneratePairCode = async () => {
    try {
      setPairLoading(true);
      const res = await fetch('/api/extension/auth/create-pair-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: userId || 'guest',
          email: userEmail || null,
          displayName: userDisplayName || 'Engineer',
        }),
      });
      const data = await res.json();
      if (data.success && data.pairCode) {
        setPairCode(data.pairCode);
        setIsPairModalOpen(true);
      }
    } catch (err) {
      console.error('Failed to create pair code:', err);
    } finally {
      setPairLoading(false);
    }
  };

  const copyPairCodeToClipboard = () => {
    if (!pairCode) return;
    navigator.clipboard.writeText(pairCode);
    setCopiedPairCode(true);
    setTimeout(() => setCopiedPairCode(false), 2000);
  };

  // Event simulator inputs
  const [simPlatform, setSimPlatform] = useState<Platform>('LeetCode');
  const [simTitle, setSimTitle] = useState('3Sum');
  const [simUrl, setSimUrl] = useState('https://leetcode.com/problems/3sum/');

  const handleConnectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      onOpenAuth();
      return;
    }
    if (!connectingPlatform || !handleInput) return;
    try {
      setLoading(true);
      await onConnectPlatform(connectingPlatform, handleInput.trim());
      setConnectingPlatform(null);
      setHandleInput('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const userscriptCode = generateUserscriptSnippet(
    userId || 'guest-user',
    window.location.origin
  );

  const copyUserscript = () => {
    navigator.clipboard.writeText(userscriptCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
        <span className="text-xs font-mono text-slate-300 font-medium uppercase">
          Modular Platform Connectors
        </span>
        <h1 className="text-2xl font-bold text-zinc-100">
          Connect Your Competitive Programming Platforms
        </h1>
        <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
          Omega connects with coding platforms to synchronize solved problems. The learning engine operates independently and consumes normalized completion events: <code className="text-slate-200 font-mono">ProblemCompleted(problemId, timestamp)</code>.
        </p>
      </div>

      {!isAuthenticated && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-mono font-bold text-amber-300 uppercase">
                Authentication Required
              </h3>
              <p className="text-xs text-amber-200/80 mt-0.5">
                Connecting platform accounts requires an authenticated user profile to associate your problem completion events securely.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenAuth}
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-xs shrink-0 transition-all shadow-sm"
          >
            Sign In to Connect
          </button>
        </div>
      )}

      {/* 8 Supported Platforms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {ALL_PLATFORMS.map((platform) => {
          const conn = connections.find((c) => c.platform === platform);
          const isConnected = conn?.connected || false;

          return (
            <div
              key={platform}
              className={`p-5 rounded-xl border flex flex-col justify-between transition-all space-y-4 ${
                isConnected
                  ? 'bg-zinc-900 border-slate-300/40'
                  : 'bg-zinc-900/60 border-zinc-800'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-zinc-200">
                    {platform}
                  </span>
                  {isConnected ? (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100/10 text-slate-200 border border-slate-300/30 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3 h-3" />
                      Connected
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-500">
                      Not Connected
                    </span>
                  )}
                </div>

                {isConnected && conn?.username && (
                  <div className="p-2.5 rounded bg-zinc-950 border border-zinc-800">
                    <span className="text-[10px] font-mono text-zinc-500 block uppercase">
                      Account Handle
                    </span>
                    <span className="text-xs font-mono font-semibold text-slate-200 truncate block">
                      @{conn.username}
                    </span>
                  </div>
                )}
              </div>

              <div>
                {isConnected ? (
                  <button
                    onClick={() => onSyncPlatform(platform)}
                    className="w-full py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border border-zinc-700"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-slate-300" />
                    <span>Sync Submissions</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (!isAuthenticated) {
                        onOpenAuth();
                      } else {
                        setConnectingPlatform(platform);
                        setHandleInput('');
                      }
                    }}
                    className="w-full py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-zinc-950 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  >
                    <Link2 className="w-3.5 h-3.5" />
                    <span>Connect Account</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Connect Account Modal */}
      {connectingPlatform && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 relative shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-zinc-100">
              Connect {connectingPlatform}
            </h3>
            <p className="text-xs text-zinc-400">
              Enter your public handle or username on {connectingPlatform}.
            </p>

            <form onSubmit={handleConnectSubmit} className="space-y-4">
              <input
                type="text"
                value={handleInput}
                onChange={(e) => setHandleInput(e.target.value)}
                placeholder={`Your ${connectingPlatform} username`}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-slate-300"
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setConnectingPlatform(null)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !handleInput}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-zinc-950 text-xs font-semibold flex items-center gap-1"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Handle</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Omega Chrome Extension Showcase & Setup Card */}
      <div className="p-6 rounded-2xl bg-zinc-900 border border-slate-300/30 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
          <div className="flex items-center space-x-3.5">
            {/* Omega Badge matching Sidebar */}
            <Logo size="lg" />
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-zinc-100">Omega Chrome Extension (Manifest V3)</h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Ready to Load
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Automatically detects submissions on LeetCode and displays the mandatory reflection dialogue.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {onOpenDownloadExtension ? (
              <button
                onClick={onOpenDownloadExtension}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600/90 hover:bg-emerald-600 text-white font-semibold text-xs transition-all flex items-center gap-1.5 border border-emerald-500/30 cursor-pointer shadow-sm shadow-emerald-500/10"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>Download Extension</span>
              </button>
            ) : (
              <a
                href="/api/extension/download-zip"
                download="omega-chrome-extension.zip"
                className="px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs transition-all flex items-center gap-1.5 border border-zinc-700 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Extension (.zip)</span>
              </a>
            )}

            <button
              onClick={() => {
                if (onOpenExtensionPair) {
                  onOpenExtensionPair();
                } else {
                  handleGeneratePairCode();
                }
              }}
              disabled={pairLoading}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>{pairLoading ? 'Generating...' : 'Generate 6-Digit Pair Code'}</span>
            </button>
            <span className="text-[11px] font-mono px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Icon Badge: <strong>ON / OFF</strong></span>
            </span>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-1.5">
            <div className="text-xs font-mono font-semibold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Submission Interceptor</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Monitors LeetCode in real-time. The moment an "Accepted" verdict is detected, the reflection modal opens on the problem page.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-1.5">
            <div className="text-xs font-mono font-semibold text-amber-400 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Unavoidable Practice Log</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Focus is locked to the reflection modal. Captures confidence (1-5 stars), felt difficulty, and key notes before continuing.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-1.5">
            <div className="text-xs font-mono font-semibold text-blue-400 flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Month Heatmap & Today Count</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Toolbar popup shows your current month activity heatmap, total problems solved today, and an on/off badge indicator.
            </p>
          </div>
        </div>

        {/* How to load the extension */}
        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-300 uppercase">
              How to Load Extension in Chrome / Brave / Edge
            </span>
            <span className="text-[11px] font-mono text-zinc-500">Folder: <code className="text-zinc-300">/extension</code></span>
          </div>

          <ol className="list-decimal list-inside text-xs text-zinc-300 space-y-1.5 leading-relaxed font-sans">
            <li>Open your browser and navigate to <code className="text-amber-300 font-mono bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">chrome://extensions</code></li>
            <li>Enable <strong>"Developer mode"</strong> in the top right corner.</li>
            <li>Click <strong>"Load unpacked"</strong> and select the <code className="text-amber-300 font-mono bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">extension</code> folder from this project directory.</li>
            <li>Pin the <strong>Ω Omega</strong> icon to your toolbar to view the month heatmap, today's solved count, and on/off badge status!</li>
          </ol>
        </div>
      </div>

      {/* Real-time Completion Listener & Userscript Tool */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Userscript snippet */}
        <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Code className="w-5 h-5 text-slate-300" />
              <h3 className="font-bold text-sm text-zinc-100">
                Browser Extension & Userscript Connector
              </h3>
            </div>
            <button
              onClick={copyUserscript}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 font-mono flex items-center gap-1 border border-zinc-700"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3.5 h-3.5 text-slate-300" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed">
            Install Tampermonkey or Violentmonkey in your browser and load this snippet to automatically trigger real-time completion events whenever you pass a problem on LeetCode or Codeforces.
          </p>

          <pre className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-slate-200/90 overflow-x-auto max-h-40">
            {userscriptCode}
          </pre>
        </div>

        {/* Completion Event Simulator */}
        <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800 space-y-4">
          <h3 className="font-bold text-sm text-zinc-100 flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-slate-300" />
            <span>Simulate ProblemCompletion Event</span>
          </h3>
          <p className="text-xs text-zinc-400">
            Directly test sending a normalized completion event to the adaptive learning engine:
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-mono text-zinc-400 mb-1">Platform</label>
              <select
                value={simPlatform}
                onChange={(e) => setSimPlatform(e.target.value as Platform)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200"
              >
                {ALL_PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-zinc-400 mb-1">Problem Title</label>
              <input
                type="text"
                value={simTitle}
                onChange={(e) => setSimTitle(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-zinc-400 mb-1">Problem URL</label>
              <input
                type="url"
                value={simUrl}
                onChange={(e) => setSimUrl(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200"
              />
            </div>

            <button
              onClick={() => onSimulateCompletionEvent(simPlatform, simTitle, simUrl)}
              className="w-full py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-zinc-950 font-semibold text-xs transition-all shadow-md mt-2"
            >
              Trigger ProblemCompleted(problemId, timestamp)
            </button>
          </div>
        </div>
      </div>
      {/* Extension Pair Code Modal */}
      {isPairModalOpen && pairCode && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-md w-full p-6 relative shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2.5">
                <Logo size="sm" />
                <h3 className="text-base font-bold text-zinc-100">
                  Chrome Extension Pair Code
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                Valid for 15 min
              </span>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Enter this 6-digit code into your <strong>Omega Chrome Extension</strong> popup under the <strong>Pair Code</strong> tab to link your practice submissions directly to this dashboard.
            </p>

            {/* Huge 6-Digit Code Display */}
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center">
              <span className="text-3xl font-mono font-black tracking-[0.25em] text-white select-all">
                {pairCode}
              </span>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => setIsPairModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
              >
                Close
              </button>

              <button
                type="button"
                onClick={copyPairCodeToClipboard}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
              >
                {copiedPairCode ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy 6-Digit Code</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
