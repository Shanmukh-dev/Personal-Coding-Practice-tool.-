import React from 'react';
import { useTheme } from '../context/ThemeContext';

interface LogoProps {
  variant?: 'dark' | 'light' | 'auto';
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  className?: string;
  showText?: boolean;
  textSize?: string;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'auto',
  size = 'md',
  className = '',
  showText = false,
  textSize = 'text-sm',
}) => {
  const { resolvedTheme } = useTheme();

  // Swapped contrast: Light theme gets dark logo badge, dark theme gets light logo badge
  let isDarkBadge = false;
  if (variant === 'dark') {
    isDarkBadge = true;
  } else if (variant === 'light') {
    isDarkBadge = false;
  } else {
    isDarkBadge = resolvedTheme === 'light';
  }

  // Dimension mapping
  let pxSize = 38;
  let borderRadius = 'rounded-md';

  if (typeof size === 'number') {
    pxSize = size;
  } else {
    switch (size) {
      case 'sm':
        pxSize = 28;
        borderRadius = 'rounded-md';
        break;
      case 'md':
        pxSize = 38;
        borderRadius = 'rounded-md';
        break;
      case 'lg':
        pxSize = 48;
        borderRadius = 'rounded-lg';
        break;
      case 'xl':
        pxSize = 56;
        borderRadius = 'rounded-lg';
        break;
    }
  }

  const isDarkTheme = resolvedTheme === 'dark';

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Omega Logo Container */}
      <div
        className={`relative flex items-center justify-center shrink-0 overflow-hidden shadow-sm transition-all duration-200 ${borderRadius} ${
          isDarkBadge
            ? 'bg-[#0b1326] text-[#dae2fd] border border-[#334155]'
            : 'bg-[#f7f9fb] text-[#191c1e] border border-[#e2e8f0]'
        }`}
        style={{ width: `${pxSize}px`, height: `${pxSize}px` }}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <text
            x="50"
            y="53"
            fontFamily="'Lora', Georgia, serif"
            fontWeight="bold"
            fontSize="68"
            textAnchor="middle"
            dominantBaseline="central"
            fill={isDarkBadge ? '#dae2fd' : '#191c1e'}
          >
            Ω
          </text>
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col min-w-0">
          <span
            className={`font-bold tracking-tight flex items-center gap-1.5 ${textSize} ${
              isDarkTheme ? 'text-zinc-100' : 'text-zinc-900'
            }`}
          >
            Omega
            <span
              className={`text-[9px] uppercase font-mono px-1.5 py-0.2 rounded border ${
                isDarkTheme
                  ? 'bg-zinc-800 text-zinc-300 border-zinc-700'
                  : 'bg-slate-100 text-slate-700 border-slate-300'
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
