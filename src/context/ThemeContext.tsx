import React, { createContext, useContext, useEffect, useState } from 'react';
import { THEME_LIST, ThemeDefinition, getThemeById } from '../data/themes';

export type ThemeMode =
  | 'system'
  | 'dark'
  | 'light'
  | 'obsidian-slate'
  | 'cyberpunk-matrix'
  | 'sunset-crimson'
  | 'nordic-frost';

interface ThemeContextType {
  themeMode: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  currentTheme: ThemeDefinition;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'algo_os_theme';

export const ThemeProvider: React.FC<{
  children: React.ReactNode;
  initialTheme?: ThemeMode;
  onThemeChange?: (mode: ThemeMode) => void;
}> = ({ children, initialTheme, onThemeChange }) => {
  const [themeMode, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY) as ThemeMode | null;
    const validThemes: ThemeMode[] = [
      'system',
      'dark',
      'light',
      'obsidian-slate',
      'cyberpunk-matrix',
      'sunset-crimson',
      'nordic-frost',
    ];
    if (saved && validThemes.includes(saved)) {
      return saved;
    }
    if (initialTheme && validThemes.includes(initialTheme)) return initialTheme;
    return 'dark'; // Main dark theme (matching extension popup) is the default
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');

  // Sync initialTheme prop changes if provided (e.g. from userProfile)
  useEffect(() => {
    if (initialTheme) {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!saved && initialTheme !== themeMode) {
        setThemeState(initialTheme);
      }
    }
  }, [initialTheme]);

  useEffect(() => {
    const updateTheme = () => {
      let active: 'light' | 'dark' = 'dark';
      let activeThemeId = themeMode;

      if (themeMode === 'system') {
        const isSystemDark =
          window.matchMedia &&
          window.matchMedia('(prefers-color-scheme: dark)').matches;
        active = isSystemDark ? 'dark' : 'light';
        activeThemeId = isSystemDark ? 'dark' : 'light';
      } else if (themeMode === 'light') {
        active = 'light';
      } else {
        active = 'dark';
      }

      setResolvedTheme(active);

      const root = document.documentElement;
      // Clear previous theme classes
      root.classList.remove(
        'light',
        'dark',
        'theme-dark',
        'theme-light',
        'theme-obsidian-slate',
        'theme-cyberpunk-matrix',
        'theme-sunset-crimson',
        'theme-nordic-frost'
      );

      root.classList.add(active);
      root.classList.add(`theme-${activeThemeId}`);
      root.setAttribute('data-theme', activeThemeId);

      // Dynamically update favicon based on active theme
      const favicon = document.getElementById('app-favicon') as HTMLLinkElement | null;
      if (favicon) {
        favicon.href = active === 'light' ? '/logo-dark.svg' : '/logo-light.svg';
      }
    };

    updateTheme();

    // Listen for OS system theme changes if themeMode is 'system'
    if (themeMode === 'system' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => updateTheme();
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
      } else if (mediaQuery.addListener) {
        mediaQuery.addListener(handleChange);
        return () => mediaQuery.removeListener(handleChange);
      }
    }
  }, [themeMode]);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeState(mode);
    localStorage.setItem(LOCAL_STORAGE_KEY, mode);
    if (onThemeChange) {
      onThemeChange(mode);
    }
  };

  const currentTheme = getThemeById(themeMode);

  return (
    <ThemeContext.Provider value={{ themeMode, resolvedTheme, currentTheme, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    // Safe fallback if called during startup or outside ThemeProvider
    const saved = typeof window !== 'undefined' ? (localStorage.getItem(LOCAL_STORAGE_KEY) as ThemeMode | null) : null;
    const mode: ThemeMode = saved || 'dark';
    const isDocLight = typeof document !== 'undefined' && document.documentElement.classList.contains('light');
    const resolved: 'light' | 'dark' = mode === 'light' || isDocLight ? 'light' : 'dark';
    return {
      themeMode: mode,
      resolvedTheme: resolved,
      currentTheme: getThemeById(mode),
      setThemeMode: () => {},
    };
  }
  return context;
};

