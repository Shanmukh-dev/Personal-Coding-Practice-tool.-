import React from 'react';
import { motion } from 'motion/react';
import { Logo } from './Logo';

interface StartupLoadingScreenProps {
  statusText?: string;
}

export const StartupLoadingScreen: React.FC<StartupLoadingScreenProps> = ({
  statusText = 'Initializing Omega DSA OS...',
}) => {
  return (
    <div 
      id="startup-loading-screen"
      className="min-h-screen w-full bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6 relative overflow-hidden select-none"
    >
      {/* Subtle background ambient radial light */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.06)_0%,transparent_70%)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative z-10 flex flex-col items-center max-w-sm w-full text-center"
      >
        {/* Animated Brand Emblem */}
        <div className="relative mb-6">
          {/* Subtle outer rotating glowing ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            className="absolute -inset-2.5 rounded-3xl border border-blue-500/20 border-dashed pointer-events-none"
          />
          
          {/* Glowing background blur */}
          <div className="absolute inset-0 rounded-2xl bg-blue-500/20 blur-xl animate-pulse" />

          {/* Central Logo Box matching Sidebar styling */}
          <Logo size={64} className="relative shadow-2xl" />
        </div>

        {/* Brand Title & Hierarchy */}
        <h1 className="text-xl font-bold tracking-tight text-zinc-100 mb-1">
          Omega
        </h1>
        <p className="text-xs font-mono text-zinc-400 mb-6 uppercase tracking-wider">
          Adaptive DSA Learning OS
        </p>

        {/* Shimmer Progress Track */}
        <div className="w-56 h-1 bg-zinc-900 rounded-full overflow-hidden relative mb-4 border border-zinc-800/80">
          <motion.div
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="w-1/2 h-full bg-gradient-to-r from-transparent via-blue-400 to-transparent"
          />
        </div>

        {/* Informative Status Text */}
        <motion.p
          key={statusText}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="text-xs text-zinc-400 font-mono tracking-tight"
        >
          {statusText}
        </motion.p>
      </motion.div>
    </div>
  );
};
