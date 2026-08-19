import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  ChevronDown,
  Search,
  Check,
  Sparkles,
  Sliders,
  X,
  Palette,
  Sun,
  Moon,
  Monitor,
  Laptop,
  Terminal,
  Flame,
  Snowflake,
} from 'lucide-react';
import { useTheme, ThemeMode } from '../context/ThemeContext';
import { THEME_LIST, ThemeDefinition } from '../data/themes';

interface ThemeDropdownProps {
  className?: string;
  onSelectTheme?: (mode: ThemeMode) => void;
  showDetails?: boolean;
}

export const ThemeDropdown: React.FC<ThemeDropdownProps> = ({
  className = '',
  onSelectTheme,
  showDetails = true,
}) => {
  const { themeMode, resolvedTheme, currentTheme, setThemeMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Filter themes based on search query
  const filteredThemes = useMemo(() => {
    if (!searchQuery.trim()) return THEME_LIST;
    const q = searchQuery.toLowerCase().trim();
    return THEME_LIST.filter(
      (theme) =>
        theme.name.toLowerCase().includes(q) ||
        theme.subtitle.toLowerCase().includes(q) ||
        theme.description.toLowerCase().includes(q) ||
        theme.tags.some((tag) => tag.toLowerCase().includes(q)) ||
        theme.id.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const handleSelect = (id: ThemeMode) => {
    setThemeMode(id);
    if (onSelectTheme) {
      onSelectTheme(id);
    }
    setIsOpen(false);
  };

  const getThemeIcon = (theme: ThemeDefinition) => {
    switch (theme.id) {
      case 'dark':
        return Moon;
      case 'light':
        return Sun;
      case 'system':
        return Monitor;
      case 'cyberpunk-matrix':
        return Terminal;
      case 'sunset-crimson':
        return Flame;
      case 'nordic-frost':
        return Snowflake;
      default:
        return Palette;
    }
  };

  const CurrentIcon = getThemeIcon(currentTheme);

  return (
    <div ref={dropdownRef} className={`relative inline-block w-full ${className}`}>
      {/* Trigger Button */}
      <button
        id="theme-dropdown-trigger"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className="w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800/90 border border-zinc-800 hover:border-zinc-700 text-zinc-100 transition-all shadow-sm group cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/50"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-zinc-800/90 border border-zinc-700/80 flex items-center justify-center text-zinc-300 group-hover:text-zinc-100 transition-colors shrink-0">
            <CurrentIcon className="w-4 h-4" />
          </div>

          <div className="flex flex-col text-left min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-100 truncate">
                {currentTheme.name}
              </span>
              {currentTheme.isMainDark && (
                <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 shrink-0 font-medium">
                  Main Dark
                </span>
              )}
              {themeMode === 'system' && (
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700 shrink-0">
                  OS ({resolvedTheme})
                </span>
              )}
            </div>
            <span className="text-[10px] text-zinc-400 truncate">
              {currentTheme.subtitle}
            </span>
          </div>
        </div>

        {/* Swatch preview strip in button */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center -space-x-1 p-1 rounded-md bg-zinc-950/80 border border-zinc-800/80 shadow-inner">
            <div
              className="w-3.5 h-3.5 rounded-full border border-black/40 shadow-xs"
              style={{ backgroundColor: currentTheme.palette.bg }}
              title="Canvas Background"
            />
            <div
              className="w-3.5 h-3.5 rounded-full border border-black/40 shadow-xs"
              style={{ backgroundColor: currentTheme.palette.card }}
              title="Surface Card"
            />
            <div
              className="w-3.5 h-3.5 rounded-full border border-black/40 shadow-xs"
              style={{ backgroundColor: currentTheme.palette.border }}
              title="Border"
            />
            <div
              className="w-3.5 h-3.5 rounded-full border border-black/40 shadow-xs"
              style={{ backgroundColor: currentTheme.palette.accent }}
              title="Accent"
            />
            <div
              className="w-3.5 h-3.5 rounded-full border border-black/40 shadow-xs"
              style={{ backgroundColor: currentTheme.palette.text }}
              title="Foreground Text"
            />
          </div>

          <ChevronDown
            className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-zinc-200' : ''
            }`}
          />
        </div>
      </button>

      {/* Dropdown Menu Popup */}
      {isOpen && (
        <div
          id="theme-dropdown-menu"
          role="listbox"
          className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl bg-zinc-950/95 backdrop-blur-xl border border-zinc-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[420px]"
        >
          {/* Search Header */}
          <div className="p-2.5 border-b border-zinc-800/80 bg-zinc-900/60 sticky top-0 z-10">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 pointer-events-none" />
              <input
                ref={searchInputRef}
                id="theme-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search color themes (e.g. extension, light, obsidian, cyberpunk)..."
                className="w-full pl-8.5 pr-8 py-1.5 text-xs bg-zinc-900 border border-zinc-700/80 rounded-lg text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-sans"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 text-zinc-400 hover:text-zinc-200 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Theme List Content */}
          <div className="overflow-y-auto p-1.5 space-y-1 custom-scrollbar">
            {filteredThemes.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-xs text-zinc-400">
                  No themes found matching "{searchQuery}"
                </p>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="mt-2 text-xs text-blue-400 hover:underline"
                >
                  Clear search
                </button>
              </div>
            ) : (
              filteredThemes.map((theme) => {
                const isSelected = themeMode === theme.id;
                const Icon = getThemeIcon(theme);

                return (
                  <button
                    key={theme.id}
                    id={`theme-option-${theme.id}`}
                    role="option"
                    aria-selected={isSelected}
                    type="button"
                    onClick={() => handleSelect(theme.id as ThemeMode)}
                    className={`w-full p-2.5 rounded-xl text-left transition-all flex flex-col gap-2 group cursor-pointer border ${
                      isSelected
                        ? 'bg-zinc-800/90 border-blue-500/50 shadow-md ring-1 ring-blue-500/30'
                        : 'bg-zinc-900/40 hover:bg-zinc-800/60 border-transparent hover:border-zinc-800'
                    }`}
                  >
                    {/* Top Row: Name, Badges, and Active Check */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 border ${
                            isSelected
                              ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                              : 'bg-zinc-800 text-zinc-400 border-zinc-700/60 group-hover:text-zinc-200'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-zinc-100">
                            {theme.name}
                          </span>

                          {theme.isMainDark && (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-medium">
                              Main Dark
                            </span>
                          )}

                          {theme.mode === 'light' && (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium">
                              Light
                            </span>
                          )}

                          {theme.id === 'system' && (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                              OS Default
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-[11px] text-zinc-400 leading-snug line-clamp-2 pl-8">
                      {theme.description}
                    </p>

                    {/* Bottom Row: Palette Swatch Preview */}
                    <div className="pl-8 pt-1 flex items-center justify-between gap-2 border-t border-zinc-800/40 mt-1">
                      <span className="text-[10px] font-mono text-zinc-500">
                        Color Palette:
                      </span>

                      {/* 5-Color Palette Preview Swatch Strip */}
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center -space-x-1 p-0.5 rounded-md bg-zinc-950/90 border border-zinc-800/90 shadow-inner">
                          <div
                            className="w-3.5 h-3.5 rounded-full border border-black/40 shadow-xs"
                            style={{ backgroundColor: theme.palette.bg }}
                            title={`Background: ${theme.palette.bg}`}
                          />
                          <div
                            className="w-3.5 h-3.5 rounded-full border border-black/40 shadow-xs"
                            style={{ backgroundColor: theme.palette.card }}
                            title={`Card: ${theme.palette.card}`}
                          />
                          <div
                            className="w-3.5 h-3.5 rounded-full border border-black/40 shadow-xs"
                            style={{ backgroundColor: theme.palette.border }}
                            title={`Border: ${theme.palette.border}`}
                          />
                          <div
                            className="w-3.5 h-3.5 rounded-full border border-black/40 shadow-xs"
                            style={{ backgroundColor: theme.palette.accent }}
                            title={`Accent: ${theme.palette.accent}`}
                          />
                          <div
                            className="w-3.5 h-3.5 rounded-full border border-black/40 shadow-xs"
                            style={{ backgroundColor: theme.palette.text }}
                            title={`Text: ${theme.palette.text}`}
                          />
                        </div>

                        {/* Miniature Aa badge preview */}
                        <div
                          className="px-1.5 py-0.5 rounded text-[9px] font-bold border font-mono flex items-center shadow-xs"
                          style={{
                            backgroundColor: theme.palette.card,
                            borderColor: theme.palette.border,
                            color: theme.palette.text,
                          }}
                        >
                          Aa
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Dropdown Footer */}
          <div className="p-2 border-t border-zinc-800/80 bg-zinc-900/60 flex items-center justify-between text-[10px] font-mono text-zinc-400">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-blue-400" />
              <span>{filteredThemes.length} Theme Options</span>
            </span>
            <span className="text-zinc-500">Instant Live Preview</span>
          </div>
        </div>
      )}
    </div>
  );
};
