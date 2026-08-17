import React, { useState } from 'react';
import { Mail, Lock, LogIn, AlertCircle, Sparkles, UserPlus, ArrowRight, ShieldCheck, Zap, Layers, Trophy } from 'lucide-react';
import { Logo } from './Logo';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from '../lib/firebase';

interface OnboardingAuthScreenProps {
  onAuthSuccess: (uid: string, email: string | null, displayName: string | null) => void;
  onContinueAsGuest: () => void;
}

export const OnboardingAuthScreen: React.FC<OnboardingAuthScreenProps> = ({
  onAuthSuccess,
  onContinueAsGuest,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      onAuthSuccess(user.uid, user.email, user.displayName);
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide email and password');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      if (mode === 'signup') {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        onAuthSuccess(result.user.uid, result.user.email, displayName || result.user.displayName);
      } else {
        const result = await signInWithEmailAndPassword(auth, email, password);
        onAuthSuccess(result.user.uid, result.user.email, result.user.displayName);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden selection:bg-slate-300/20 selection:text-slate-100">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-slate-300/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10 my-auto">
        {/* Left Column: Branding & Feature Highlights */}
        <div className="lg:col-span-6 space-y-6 text-left">
          <div className="flex items-center space-x-3">
            <Logo size="lg" />
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100/10 border border-slate-300/20 text-slate-200 text-xs font-mono font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Omega • Adaptive Learning System</span>
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-100 tracking-tight leading-tight">
              Master Data Structures & Algorithms
            </h1>
            <p className="text-sm text-zinc-400 leading-relaxed">
              SuperMemo SM-2 spaced repetition, pattern mastery matrixes, mistake journals, and unified platform synchronization.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800/80 flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-slate-100/10 text-slate-200">
                <Zap className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-zinc-200 block">SM-2 Spaced Retention</span>
                <span className="text-[10px] text-zinc-400 font-mono">Optimal review scheduling</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800/80 flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                <Layers className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-zinc-200 block">Pattern Taxonomy</span>
                <span className="text-[10px] text-zinc-400 font-mono">15+ core DSA patterns</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Auth Card (Sign In / Sign Up) */}
        <div className="lg:col-span-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            {/* Header Tabs */}
            <div className="flex items-center p-1 bg-zinc-950 rounded-xl border border-zinc-800 mb-6">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setError(null);
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold font-mono transition-all flex items-center justify-center gap-1.5 ${
                  mode === 'signin'
                    ? 'bg-slate-100/10 text-slate-200 border border-slate-300/30'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError(null);
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold font-mono transition-all flex items-center justify-center gap-1.5 ${
                  mode === 'signup'
                    ? 'bg-slate-100/10 text-slate-200 border border-slate-300/30'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create Account</span>
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2 text-left">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all mb-4 shadow-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.09z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.09c.95-2.85 3.6-4.96 6.72-4.96z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="relative flex py-2 items-center my-2">
              <div className="flex-grow border-t border-zinc-800"></div>
              <span className="flex-shrink mx-3 text-[10px] text-zinc-500 uppercase tracking-widest font-mono">
                or email
              </span>
              <div className="flex-grow border-t border-zinc-800"></div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailAuth} className="space-y-3.5 text-left">
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Alex Chen"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-slate-300"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="engineer@algoos.app"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-slate-300"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-zinc-950 text-xs font-bold flex items-center justify-center gap-2 transition-all mt-4 shadow-md"
              >
                <span>{mode === 'signup' ? 'Create Account' : 'Sign In to Omega'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-zinc-800/80 text-center">
              <button
                type="button"
                onClick={onContinueAsGuest}
                className="text-xs text-zinc-400 hover:text-slate-200 transition-colors font-mono flex items-center justify-center gap-1.5 mx-auto"
              >
                <span>Explore Demo / Continue as Guest</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
