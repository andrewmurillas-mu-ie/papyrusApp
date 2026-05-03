import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';

const ThemeContext = createContext<{
  theme: 'light' | 'coffee-dark';
  toggleTheme: () => void;
} | null>(null);

const LIGHT = 'light';
const COFFEE_DARK = 'coffee-dark';
const STORAGE_KEY = 'papyrus_theme';

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<'light' | 'coffee-dark'>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === COFFEE_DARK ? COFFEE_DARK : LIGHT;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === COFFEE_DARK) {
      root.dataset.theme = COFFEE_DARK;
    } else {
      delete root.dataset.theme;
    }
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((current) => (current === LIGHT ? COFFEE_DARK : LIGHT));
  };

  const value = useMemo(
    () => ({ theme, toggleTheme }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}
