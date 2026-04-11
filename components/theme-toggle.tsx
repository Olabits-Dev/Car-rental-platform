"use client";

import { useTheme, type ThemeMode } from "@/components/theme-provider";

function getNextThemeMode(mode: ThemeMode): ThemeMode {
  if (mode === "light") return "dark";
  if (mode === "dark") return "system";
  return "light";
}

function getThemeIcon(mode: ThemeMode) {
  if (mode === "light") {
    return (
      <svg viewBox="0 0 24 24" className="theme-toggle-icon" aria-hidden="true">
        <circle cx="12" cy="12" r="5.2" fill="currentColor" />
        <g stroke="currentColor" strokeWidth="1.8">
          <line x1="12" y1="1.5" x2="12" y2="4.5" />
          <line x1="12" y1="19.5" x2="12" y2="22.5" />
          <line x1="1.5" y1="12" x2="4.5" y2="12" />
          <line x1="19.5" y1="12" x2="22.5" y2="12" />
          <line x1="4.7" y1="4.7" x2="6.9" y2="6.9" />
          <line x1="17.1" y1="17.1" x2="19.3" y2="19.3" />
          <line x1="4.7" y1="19.3" x2="6.9" y2="17.1" />
          <line x1="17.1" y1="6.9" x2="19.3" y2="4.7" />
        </g>
      </svg>
    );
  }

  if (mode === "dark") {
    return (
      <svg viewBox="0 0 24 24" className="theme-toggle-icon" aria-hidden="true">
        <path
          d="M14.1 2.65a8.2 8.2 0 1 0 7.25 10.75 9.3 9.3 0 0 1-7.25-10.75Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="theme-toggle-icon" aria-hidden="true">
      <path
        d="M12 4a1 1 0 0 1 1 1v2.5a1 1 0 0 1-2 0V5a1 1 0 0 1 1-1Zm5.2 3.5 1.8-1.8a1 1 0 1 1 1.4 1.4l-1.8 1.8a1 1 0 1 1-1.4-1.4Zm-10.4 0a1 1 0 0 1-1.4 0L4.6 5.1a1 1 0 1 1 1.4-1.4l1.8 1.8a1 1 0 0 1 0 1.4ZM12 17a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm-5 1.5a1 1 0 0 1 1-1h2.5a1 1 0 1 1 0 2H8a1 1 0 0 1-1-1Zm7.5 0a1 1 0 0 1 1-1h2.5a1 1 0 1 1 0 2H15.5a1 1 0 0 1-1-1Z"
        fill="currentColor"
      />
    </svg>
  );
}

type ThemeToggleProps = {
  compact?: boolean;
  className?: string;
};

export function ThemeToggle({ compact = false, className = "" }: ThemeToggleProps) {
  const { mode, setMode } = useTheme();
  const nextMode = getNextThemeMode(mode);

  return (
    <button
      type="button"
      onClick={() => setMode(nextMode)}
      className={`theme-toggle-button ${compact ? "theme-toggle-button-compact" : ""} ${className}`.trim()}
      aria-label={`Switch theme. Current theme: ${mode}. Next: ${nextMode}.`}
      title={`Switch theme. Current: ${mode}, next: ${nextMode}.`}
    >
      <span className="sr-only">Switch theme</span>
      {getThemeIcon(mode)}
    </button>
  );
}
