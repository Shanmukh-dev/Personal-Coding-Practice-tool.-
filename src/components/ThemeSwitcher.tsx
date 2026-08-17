import React from 'react';
import { Monitor, Sun, Moon, Check, Sparkles, Sliders } from 'lucide-react';
import { useTheme, ThemeMode } from '../context/ThemeContext';

interface ThemeSwitcherProps {
  className?: string;
  onSelectTheme?: (mode: ThemeMode) => void;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  className = '',
  onSelectTheme,
}) => {
  const { themeMode, resolvedTheme, setThemeMode } = useTheme();

  const handleSelect = (mode: ThemeMode) => {
    setThemeMode(mode);
    if (onSelectTheme) {
      onSelectTheme(mode);
    }
  };

  const themeOptions: {
    id: ThemeMode;
    name: string;
    subtitle: string;
    description: string;
    icon: React.ElementType;
    previewBg: string;
    previewCard: string;
    previewBorder: string;
    previewText: string;
    previewAccent: string;
    badgeText?: string;
  }[] = [
    {
      id: 'system',
      name: 'System Default',
      subtitle: 'Follow OS Preference',
      description: 'Automatically switches between Vellum Technical and Obsidian Slate based on system setting.',
      icon: Monitor,
      previewBg: 'bg-gradient-to-r from-slate-100 to-zinc-900',
      previewCard: 'bg-zinc-800/80',
      previewBorder: 'border-zinc-500/30',
      previewText: 'text-zinc-200',
      previewAccent: 'bg-slate-200',
      badgeText: 'Default',
    },
    {
      id: 'light',
      name: 'Vellum Technical',
      subtitle: 'Cool Vellum Light Mode',
      description: 'Expansive whitespace, rigid structural alignment, and crisp Hanken Grotesk typography.',
      icon: Sun,
      previewBg: 'bg-[#f7f9fb]',
      previewCard: 'bg-white',
      previewBorder: 'border-[#e2e8f0]',
      previewText: 'text-[#191c1e]',
      previewAccent: 'bg-[#0f172a]',
    },
    {
      id: 'dark',
      name: 'Obsidian Slate',
      subtitle: 'Deep Slate Dark Mode',
      description: 'Low-chroma deep slate palette (#0b1326), desaturated slate white accents (#e2e8f0), and Geist typography.',
      icon: Moon,
      previewBg: 'bg-[#0b1326]',
      previewCard: 'bg-[#131b2e]',
      previewBorder: 'border-[#334155]',
      previewText: 'text-[#dae2fd]',
      previewAccent: 'bg-[#e2e8f0]',
    },
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-slate-300" />
            <span>Theme & Visual Palette</span>
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Select your preferred visual architecture. Defaults to your system settings.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-full bg-zinc-800/80 border border-zinc-700/80 text-zinc-300">
          <Sparkles className="w-3.5 h-3.5 text-slate-300" />
          <span>
            Active: <strong className="text-slate-100 capitalize">{resolvedTheme} Mode</strong>
            {themeMode === 'system' && ' (OS)'}
          </span>
        </div>
      </div>

      {/* Grid of Theme Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {themeOptions.map((opt) => {
          const Icon = opt.icon;
          const isSelected = themeMode === opt.id;

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleSelect(opt.id)}
              className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between group cursor-pointer ${
                isSelected
                  ? 'bg-slate-800/50 border-slate-300 ring-1 ring-slate-400/50 shadow-md'
                  : 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/60'
              }`}
            >
              {/* Header inside option card */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`p-2 rounded-lg border transition-colors ${
                        isSelected
                          ? 'bg-slate-100 text-zinc-950 border-slate-300'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800 group-hover:text-zinc-200'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-zinc-100 block flex items-center gap-1.5">
                        {opt.name}
                        {opt.badgeText && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700 font-normal">
                            {opt.badgeText}
                          </span>
                        )}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400 block">
                        {opt.subtitle}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-slate-100 border-slate-300 text-zinc-950'
                        : 'border-zinc-700 bg-zinc-900 opacity-60'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>

                <p className="text-[11px] text-zinc-400 leading-snug pt-1">
                  {opt.description}
                </p>
              </div>

              {/* Visual Preview Chip */}
              <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-[10px] font-mono">
                <span className="text-zinc-500">Preview:</span>
                <div className={`p-1.5 rounded-lg ${opt.previewBg} border ${opt.previewBorder} flex items-center space-x-1.5 shadow-sm`}>
                  <div className={`w-3 h-3 rounded ${opt.previewCard} border ${opt.previewBorder}`} />
                  <div className={`w-2 h-2 rounded-full ${opt.previewAccent}`} />
                  <span className={`text-[9px] font-bold ${opt.previewText}`}>
                    Aa
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
