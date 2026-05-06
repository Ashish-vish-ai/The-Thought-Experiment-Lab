import { Moon, SunMedium } from "lucide-react";

export default function ThemeToggle({ theme, onToggleTheme, className = "" }) {
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={onToggleTheme}
      className={`theme-toggle ${className}`.trim()}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      aria-pressed={isDark}
    >
      {isDark ? <SunMedium size={15} /> : <Moon size={15} />}
      <span>{isDark ? "Light mode" : "Dark mode"}</span>
    </button>
  );
}
