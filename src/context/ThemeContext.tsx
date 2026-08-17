import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'system' | 'light' | 'dark';

interface ThemeContextType {
  themeMode: ThemeMode;
  resolvedTheme: 'light' | 'dark';
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
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      return saved as ThemeMode;
    }
    if (initialTheme) return initialTheme;
    return 'system';
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
      if (themeMode === 'system') {
        active =
          window.matchMedia &&
          window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light';
      } else {
        active = themeMode;
      }

      setResolvedTheme(active);

      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(active);

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

  return (
    <ThemeContext.Provider value={{ themeMode, resolvedTheme, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
