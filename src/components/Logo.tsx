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
 * Version 1: Omega Dark Icon
 * Used when the surrounding interface is in Light Mode (or explicitly requested).
 * Features: Dark background of default dark theme (#0b1326 / #09090b), slate border (#334155), light azure serif glyph (#dae2fd).
 */
export const OmegaDarkIcon: React.FC<{
  size?: number;
  className?: string;
}> = ({ size = 38, className = '' }) => {
  const radius = size >= 48 ? 'rounded-xl' : 'rounded-lg';
  return (
    <div
      id="omega-dark-icon"
      className={`relative flex items-center justify-center shrink-0 overflow-hidden shadow-sm transition-all duration-200 ${radius} bg-[#0b1326] text-[#dae2fd] border border-[#334155] ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
      aria-label="Omega Dark Icon"
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full p-1"
        xmlns="http://www.w3.org/2000/svg"
      >
        <text
          x="50"
          y="54"
          fontFamily="'Lora', Georgia, 'Times New Roman', serif"
          fontWeight="bold"
          fontSize="68"
          textAnchor="middle"
          dominantBaseline="central"
          fill="#dae2fd"
        >
          Ω
        </text>
      </svg>
    </div>
  );
};

/**
 * Version 2: Omega Light Icon
 * Used when the surrounding interface is in Dark Mode (or explicitly requested).
 * Features: Light background of the Vellum technical theme (#f7f9fb), slate border (#cbd5e1), dark navy serif glyph (#0b1326).
 */
export const OmegaLightIcon: React.FC<{
  size?: number;
  className?: string;
}> = ({ size = 38, className = '' }) => {
  const radius = size >= 48 ? 'rounded-xl' : 'rounded-lg';
  return (
    <div
      id="omega-light-icon"
      className={`relative flex items-center justify-center shrink-0 overflow-hidden shadow-sm transition-all duration-200 ${radius} bg-[#f7f9fb] text-[#0b1326] border border-[#cbd5e1] ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
      aria-label="Omega Light Icon"
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full p-1"
        xmlns="http://www.w3.org/2000/svg"
      >
        <text
          x="50"
          y="54"
          fontFamily="'Lora', Georgia, 'Times New Roman', serif"
          fontWeight="bold"
          fontSize="68"
          textAnchor="middle"
          dominantBaseline="central"
          fill="#0b1326"
        >
          Ω
        </text>
      </svg>
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
