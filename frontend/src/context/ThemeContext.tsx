import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  Context,
  ReactElement,
} from "react";

interface ThemeContextValue {
  theme: "light" | "coffee-dark";
  toggleTheme: () => void;
}

const ThemeContext: Context<ThemeContextValue | null> =
  createContext<ThemeContextValue | null>(null);

const LIGHT = "light";
const COFFEE_DARK = "coffee-dark";
const STORAGE_KEY = "papyrus_theme";

export function ThemeProvider({
  children,
}: {
  children: ReactNode;
}): ReactElement<any, any> {
  const [theme, setTheme] = useState((): "coffee-dark" | "light" => {
    const stored: string | null = localStorage.getItem(STORAGE_KEY);
    return stored === COFFEE_DARK ? COFFEE_DARK : LIGHT;
  });

  useEffect((): void => {
    const root: HTMLElement = document.documentElement;
    if (theme === COFFEE_DARK) {
      root.dataset.theme = COFFEE_DARK;
    } else {
      delete root.dataset.theme;
    }
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme: () => void = (): void => {
    setTheme((current: "light" | "coffee-dark"): "light" | "coffee-dark" =>
      current === LIGHT ? COFFEE_DARK : LIGHT,
    );
  };

  interface ThemeContextValue {
    theme: "light" | "coffee-dark";
    toggleTheme: () => void;
  }

  const value: ThemeContextValue = useMemo(
    (): ThemeContextValue => ({ theme, toggleTheme }),
    [theme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export default function useTheme(): ThemeContextValue {
  const ctx: ThemeContextValue | null = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}
