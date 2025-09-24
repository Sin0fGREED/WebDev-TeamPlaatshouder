import { Moon, Sun } from "lucide-react";
import { useTheme } from "../theme/ThemeProvider";

export default function ThemeToggle() {
  const { resolved, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-card hover:bg-muted transition"
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      {resolved === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}
