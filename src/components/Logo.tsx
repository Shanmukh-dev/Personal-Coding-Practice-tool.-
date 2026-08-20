import React from 'react';
import { useTheme } from '../context/ThemeContext';

export interface LogoProps {
  variant?: 'dark' | 'light' | 'auto';
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  className?: string;
  showText?: boolean;
  textSize?: string;
}

/**
 * Version 1: Omega Dark Icon (matching uploaded 2.png)
 * Used when the surrounding interface is in Light Mode (or on light browser chrome).
 * Features: Dark background (#111111), crisp light glyph (#f2f2f2) in Lora font.
 */
export const OmegaDarkIcon: React.FC<{
  size?: number;
  className?: string;
}> = ({ size = 38, className = '' }) => {
  const radius = size >= 48 ? 'rounded-xl' : 'rounded-lg';
  return (
    <div
      id="omega-dark-icon"
      className={`relative flex items-center justify-center shrink-0 overflow-hidden shadow-sm transition-all duration-200 ${radius} bg-[#111111] text-[#f2f2f2] border border-zinc-800 select-none ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
      aria-label="Omega Dark Icon"
    >
      <span
        className="font-bold leading-none select-none flex items-center justify-center pointer-events-none"
        style={{
          fontFamily: "'Lora', serif",
          fontSize: `${Math.round(size * 0.72)}px`,
          lineHeight: 1,
          transform: 'translateY(-2%)',
          color: '#f2f2f2',
        }}
      >
        Ω
      </span>
    </div>
  );
};

/**
 * Version 2: Omega Light Icon (matching uploaded 1.png)
 * Used when the surrounding interface is in Dark Mode (or on dark browser chrome).
 * Features: Sleek light background (#ececec), dark glyph (#111111) in Lora font.
 */
export const OmegaLightIcon: React.FC<{
  size?: number;
  className?: string;
}> = ({ size = 38, className = '' }) => {
  const radius = size >= 48 ? 'rounded-xl' : 'rounded-lg';
  return (
    <div
      id="omega-light-icon"
      className={`relative flex items-center justify-center shrink-0 overflow-hidden shadow-sm transition-all duration-200 ${radius} bg-[#ececec] text-[#111111] border border-zinc-300 select-none ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
      aria-label="Omega Light Icon"
    >
      <span
        className="font-bold leading-none select-none flex items-center justify-center pointer-events-none"
        style={{
          fontFamily: "'Lora', serif",
          fontSize: `${Math.round(size * 0.72)}px`,
          lineHeight: 1,
          transform: 'translateY(-2%)',
          color: '#111111',
        }}
      >
        Ω
      </span>
    </div>
  );
};

/**
 * Main Logo Component
 * Dynamically chooses between OmegaDarkIcon and OmegaLightIcon based on current active theme:
 * - When in Light Mode -> Renders OmegaDarkIcon (dark background of default dark theme)
 * - When in Dark Mode -> Renders OmegaLightIcon (light background of Vellum technical theme)
 */
export const Logo: React.FC<LogoProps> = ({
  variant = 'auto',
  size = 'md',
  className = '',
  showText = false,
  textSize = 'text-sm',
}) => {
  const { resolvedTheme } = useTheme();

  // Dimension mapping
  let pxSize = 38;
  if (typeof size === 'number') {
    pxSize = size;
  } else {
    switch (size) {
      case 'sm':
        pxSize = 28;
        break;
      case 'md':
        pxSize = 38;
        break;
      case 'lg':
        pxSize = 48;
        break;
      case 'xl':
        pxSize = 56;
        break;
    }
  }

  // Dynamic version selection:
  // - In Light Mode: use Dark Icon version
  // - In Dark Mode: use Light Icon version (Vellum background)
  const isLightMode = resolvedTheme === 'light';
  const effectiveVariant =
    variant === 'auto'
      ? isLightMode
        ? 'dark'
        : 'light'
      : variant;

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {effectiveVariant === 'dark' ? (
        <OmegaDarkIcon size={pxSize} />
      ) : (
        <OmegaLightIcon size={pxSize} />
      )}

      {showText && (
        <div className="flex flex-col min-w-0">
          <span
            className={`font-bold tracking-tight flex items-center gap-1.5 ${textSize} ${
              isLightMode ? 'text-zinc-900' : 'text-zinc-100'
            }`}
          >
            Omega
            <span
              className={`text-[9px] uppercase font-mono px-1.5 py-0.2 rounded border ${
                isLightMode
                  ? 'bg-slate-100 text-slate-700 border-slate-300'
                  : 'bg-zinc-800 text-zinc-300 border-zinc-700'
              }`}
            >
              v2.0
            </span>
          </span>
        </div>
      )}
    </div>
  );
};
