import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";
const ThemeContext = createContext<{ theme: Theme; setTheme: (t: Theme) => void }>({
  theme: "dark",
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    const stored = window.localStorage.getItem("geoscope-theme") as Theme | null;
    const initial: Theme = stored ?? "dark";
    setThemeState(initial);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    window.localStorage.setItem("geoscope-theme", t);
  }, []);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  return (
    <div className={`glass-chip flex items-center gap-0.5 sm:gap-1 rounded-full p-0.5 sm:p-1 ${className}`}>
      <button
        aria-label="Light mode"
        onClick={() => setTheme("light")}
        className={`grid h-8 w-8 sm:h-9 sm:w-auto sm:flex-1 place-items-center rounded-full transition-all ${
          theme === "light" ? "glass-strong text-sunny" : "text-muted-foreground"
        }`}
      >
        <Sun className="h-4 w-4 sm:h-[18px] sm:w-[18px]" strokeWidth={1.9} />
      </button>
      <button
        aria-label="Dark mode"
        onClick={() => setTheme("dark")}
        className={`grid h-8 w-8 sm:h-9 sm:w-auto sm:flex-1 place-items-center rounded-full transition-all ${
          theme === "dark" ? "glass-strong text-primary" : "text-muted-foreground"
        }`}
      >
        <Moon className="h-4 w-4 sm:h-[18px] sm:w-[18px]" strokeWidth={1.9} />
      </button>
    </div>
  );
}
