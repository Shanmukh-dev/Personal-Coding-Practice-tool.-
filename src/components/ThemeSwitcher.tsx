import React from 'react';
import { Sparkles, Sliders, Palette } from 'lucide-react';
import { useTheme, ThemeMode } from '../context/ThemeContext';
import { ThemeDropdown } from './ThemeDropdown';

interface ThemeSwitcherProps {
  className?: string;
  onSelectTheme?: (mode: ThemeMode) => void;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  className = '',
  onSelectTheme,
}) => {
  const { themeMode, resolvedTheme, currentTheme, setThemeMode } = useTheme();

  const handleSelect = (mode: ThemeMode) => {
    setThemeMode(mode);
    if (onSelectTheme) {
      onSelectTheme(mode);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-400" />
            <span>Theme & Visual Palette</span>
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Select your preferred visual architecture or search through curated themes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-mono px-3 py-1 rounded-full bg-zinc-800/80 border border-zinc-700/80 text-zinc-300">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>
              Active: <strong className="text-zinc-100">{currentTheme.name}</strong>
              {themeMode === 'system' ? ` (OS: ${resolvedTheme})` : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Searchable Theme Dropdown Component */}
      <div className="max-w-xl">
        <ThemeDropdown onSelectTheme={handleSelect} />
      </div>

      {/* Active Theme Color Specs / Pallete Inspector */}
      <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-blue-400" />
            Active Palette Tokens
          </span>
          <span className="text-[10px] font-mono text-zinc-400">
            {currentTheme.palette.bg} • {currentTheme.palette.card} • {currentTheme.palette.accent}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-md border border-white/20 shrink-0"
              style={{ backgroundColor: currentTheme.palette.bg }}
            />
            <div className="min-w-0">
              <span className="text-[10px] text-zinc-400 block truncate">Canvas</span>
              <span className="text-[10px] font-mono text-zinc-200 font-bold block truncate">
                {currentTheme.palette.bg}
              </span>
            </div>
          </div>

          <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-md border border-white/20 shrink-0"
              style={{ backgroundColor: currentTheme.palette.card }}
            />
            <div className="min-w-0">
              <span className="text-[10px] text-zinc-400 block truncate">Surface</span>
              <span className="text-[10px] font-mono text-zinc-200 font-bold block truncate">
                {currentTheme.palette.card}
              </span>
            </div>
          </div>

          <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-md border border-white/20 shrink-0"
              style={{ backgroundColor: currentTheme.palette.border }}
            />
            <div className="min-w-0">
              <span className="text-[10px] text-zinc-400 block truncate">Border</span>
              <span className="text-[10px] font-mono text-zinc-200 font-bold block truncate">
                {currentTheme.palette.border}
              </span>
            </div>
          </div>

          <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-md border border-white/20 shrink-0"
              style={{ backgroundColor: currentTheme.palette.accent }}
            />
            <div className="min-w-0">
              <span className="text-[10px] text-zinc-400 block truncate">Accent</span>
              <span className="text-[10px] font-mono text-zinc-200 font-bold block truncate">
                {currentTheme.palette.accent}
              </span>
            </div>
          </div>

          <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-md border border-white/20 shrink-0"
              style={{ backgroundColor: currentTheme.palette.text }}
            />
            <div className="min-w-0">
              <span className="text-[10px] text-zinc-400 block truncate">Text</span>
              <span className="text-[10px] font-mono text-zinc-200 font-bold block truncate">
                {currentTheme.palette.text}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

