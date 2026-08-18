import React, { useState, useEffect, useCallback } from 'react';
import { 
  Key, 
  Copy, 
  Check, 
  RefreshCw, 
  X, 
  Chrome, 
  Sparkles, 
  ShieldCheck, 
  Download,
  ExternalLink,
  ArrowRight,
  User as UserIcon,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { signInWithGoogle } from '../lib/firebase';

interface ExtensionPairModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  userEmail?: string;
  userDisplayName?: string;
  onOpenAuth?: () => void;
  onOpenDownloadExtension?: () => void;
}

export const ExtensionPairModal: React.FC<ExtensionPairModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  userEmail,
  userDisplayName,
  onOpenAuth,
  onOpenDownloadExtension,
}) => {
  const [pairCode, setPairCode] = useState<string>('');
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('15:00');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSigningInWithGoogle, setIsSigningInWithGoogle] = useState<boolean>(false);
  const [extensionLinked, setExtensionLinked] = useState<boolean>(false);

  // Broadcast auth state to Chrome Extension bridge whenever modal is open or user changes
  const broadcastAuthToExtension = useCallback(() => {
    try {
      const userPayload = currentUser ? {
        uid: currentUser.uid,
        email: currentUser.email || userEmail || null,
        displayName: currentUser.displayName || userDisplayName || null,
        photoURL: currentUser.photoURL || null,
      } : {
        uid: `guest-${Date.now()}`,
        email: userEmail || 'guest@algoos.app',
        displayName: userDisplayName || 'Guest Engineer',
        photoURL: null,
      };

      window.postMessage(
        {
          type: 'OMEGA_SET_AUTH',
          user: userPayload,
          appUrl: window.location.origin,
        },
        '*'
      );
      window.postMessage({ type: 'OMEGA_PING_EXTENSION' }, '*');
    } catch (e) {
      console.warn('Bridge broadcast error:', e);
    }
  }, [currentUser, userEmail, userDisplayName]);

  // Listen for extension acknowledgment
  useEffect(() => {
    const handleBridgeResponse = (event: MessageEvent) => {
      if (event.data?.type === 'OMEGA_EXTENSION_AUTH_SUCCESS' || event.data?.type === 'OMEGA_PONG_EXTENSION') {
        if (event.data?.user || event.data?.type === 'OMEGA_EXTENSION_AUTH_SUCCESS') {
          setExtensionLinked(true);
        }
      }
    };

    window.addEventListener('message', handleBridgeResponse);
    return () => window.removeEventListener('message', handleBridgeResponse);
  }, []);

  const generateCode = useCallback(async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const uid = currentUser?.uid || `guest-${Date.now()}`;
      const email = currentUser?.email || userEmail || 'engineer@algoos.app';
      const displayName = currentUser?.displayName || userDisplayName || (email ? email.split('@')[0] : 'Omega Engineer');
      const photoURL = currentUser?.photoURL || null;

      const res = await fetch('/api/extension/auth/create-pair-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid,
          email,
          displayName,
          photoURL,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.pairCode) {
        setPairCode(data.pairCode);
        setExpiresAt(data.expiresAt || (Date.now() + 15 * 60 * 1000));
        setCopied(false);
        // Also broadcast to extension bridge
        broadcastAuthToExtension();
      } else {
        setError(data.error || 'Failed to generate pair code. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Could not connect to server.');
    } finally {
      setIsGenerating(false);
    }
  }, [currentUser, userEmail, userDisplayName, broadcastAuthToExtension]);

  // Generate code on open
  useEffect(() => {
    if (isOpen) {
      generateCode();
      broadcastAuthToExtension();
    } else {
      setCopied(false);
      setError(null);
    }
  }, [isOpen, generateCode, broadcastAuthToExtension]);

  // Countdown timer
  useEffect(() => {
    if (!expiresAt || !isOpen) return;

    const interval = setInterval(() => {
      const remainingMs = Math.max(0, expiresAt - Date.now());
      if (remainingMs <= 0) {
        setTimeLeft('Expired');
        clearInterval(interval);
      } else {
        const totalSecs = Math.floor(remainingMs / 1000);
        const mins = Math.floor(totalSecs / 60);
        const secs = totalSecs % 60;
        setTimeLeft(`${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, isOpen]);

  const handleCopy = () => {
    if (!pairCode) return;
    navigator.clipboard.writeText(pairCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleGoogleSignIn = async () => {
    setIsSigningInWithGoogle(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Google sign in error:', err);
      setError('Could not complete Google Sign-In.');
    } finally {
      setIsSigningInWithGoogle(false);
    }
  };

  const handleDownloadZip = () => {
    window.location.href = '/api/extension/download-zip';
  };

  if (!isOpen) return null;

  const digits = pairCode ? pairCode.split('') : ['•', '•', '•', '•', '•', '•'];
  const isAuthenticated = Boolean(currentUser && currentUser.uid && !currentUser.isAnonymous);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header decoration */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400" />

        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-zinc-800/80 flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-lg shrink-0">
              <Key className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-zinc-100">Chrome Extension Auth Code</h2>
                <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full">
                  6-Digit Pairing
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Link your Chrome Extension directly to your Omega cloud account
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Extension Auto-Sync Banner */}
          {extensionLinked && (
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Chrome Extension detected and synchronized with this account!</span>
            </div>
          )}

          {/* Account Status Pill */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-semibold text-zinc-200 overflow-hidden">
                {currentUser?.photoURL ? (
                  <img src={currentUser.photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-3.5 h-3.5 text-zinc-400" />
                )}
              </div>
              <div>
                <div className="font-semibold text-zinc-200 flex items-center gap-1.5">
                  <span>{currentUser?.displayName || userDisplayName || 'Logged-In User'}</span>
                  {isAuthenticated && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                  )}
                </div>
                <div className="text-[11px] text-zinc-400">{currentUser?.email || userEmail || 'Guest Mode'}</div>
              </div>
            </div>

            {!isAuthenticated ? (
              <button
                onClick={handleGoogleSignIn}
                disabled={isSigningInWithGoogle}
                className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-lg transition-colors cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.09z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.09c.95-2.85 3.6-4.96 6.72-4.96z"/>
                </svg>
                <span>{isSigningInWithGoogle ? 'Connecting...' : 'Sign in with Google'}</span>
              </button>
            ) : (
              <span className="text-[11px] text-emerald-400 font-medium">● Google Synced</span>
            )}
          </div>

          {/* 6-Digit Pair Code Display Card */}
          <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 text-center space-y-4 shadow-inner relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="font-mono uppercase tracking-wider text-[11px]">One-Time Pair Code</span>
              <span className="flex items-center gap-1 font-mono text-zinc-300">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Expires in {timeLeft}</span>
              </span>
            </div>

            {/* Monospace Digits Grid */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 py-2">
              {digits.map((digit, idx) => (
                <div
                  key={idx}
                  className="w-11 h-14 sm:w-12 sm:h-16 rounded-xl bg-zinc-900 border-2 border-blue-500/30 flex items-center justify-center text-2xl sm:text-3xl font-black font-mono text-blue-400 shadow-lg shadow-blue-500/5 select-all transition-all hover:border-blue-400 hover:scale-105"
                >
                  {digit}
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                onClick={handleCopy}
                disabled={!pairCode || isGenerating}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs transition-all shadow-md cursor-pointer ${
                  copied
                    ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy 6-Digit Code</span>
                  </>
                )}
              </button>

              <button
                onClick={generateCode}
                disabled={isGenerating}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-semibold text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-colors cursor-pointer"
                title="Generate fresh code"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>New Code</span>
              </button>
            </div>

            {error && (
              <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg p-2.5">
                {error}
              </div>
            )}
          </div>

          {/* Quick Instructions & Download */}
          <div className="space-y-2.5 text-xs text-zinc-300">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-zinc-200 uppercase tracking-wider text-[11px] font-mono">
                How to Connect Chrome Extension:
              </h4>
              <button
                onClick={() => {
                  if (onOpenDownloadExtension) {
                    onClose();
                    onOpenDownloadExtension();
                  } else {
                    handleDownloadZip();
                  }
                }}
                className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 font-medium text-[11px] transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Extension</span>
              </button>
            </div>
            <div className="space-y-2 pl-1">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 font-bold flex items-center justify-center text-[10px] shrink-0">
                  1
                </span>
                <p className="text-zinc-400 pt-0.5">
                  Click the <strong className="text-zinc-200">Ω Omega</strong> extension icon in your Chrome browser toolbar (or click <strong className="text-blue-400">Sign in with Google</strong> in the extension).
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 font-bold flex items-center justify-center text-[10px] shrink-0">
                  2
                </span>
                <p className="text-zinc-400 pt-0.5">
                  If prompted for code, enter <strong className="text-blue-400 font-mono font-bold">{pairCode || 'your code'}</strong> and click <strong className="text-zinc-200">Connect</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Secure session synchronization</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (onOpenDownloadExtension) {
                  onClose();
                  onOpenDownloadExtension();
                } else {
                  handleDownloadZip();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium rounded-xl transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Extension</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
