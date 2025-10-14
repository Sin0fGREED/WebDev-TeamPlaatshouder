import { createContext, useContext, useEffect, useMemo, useState } from "react";

type Theme = "light" | "dark" | "system";
type ThemeCtx = {
  theme: Theme;            // user choice
  resolved: "light" | "dark"; // actual applied
  setTheme: (t: Theme) => void;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeCtx | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() =>
    (localStorage.getItem("theme") as Theme) || "system"
  );

  const resolved: "light" | "dark" = (() => {
    if (theme === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return theme;
  })();

  useEffect(() => {
    const root = document.documentElement;
    if (resolved === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme, resolved]);

  // react to system change when theme === system
  useEffect(() => {
    const mm = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (theme === "system") {
        const root = document.documentElement;
        mm.matches ? root.classList.add("dark") : root.classList.remove("dark");
      }
    };
    mm.addEventListener("change", handler);
    return () => mm.removeEventListener("change", handler);
  }, [theme]);

  const value = useMemo<ThemeCtx>(() => ({
    theme, resolved,
    setTheme,
    toggle: () => setTheme(resolved === "dark" ? "light" : "dark")
  }), [theme, resolved]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
