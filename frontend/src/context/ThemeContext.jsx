import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(null);

const LIGHT = 'light';
const COFFEE_DARK = 'coffee-dark';
const STORAGE_KEY = 'papyrus_theme';

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
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