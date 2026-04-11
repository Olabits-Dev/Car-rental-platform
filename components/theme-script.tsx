import { THEME_STORAGE_KEY } from "@/components/theme-provider";

const themeScript = `
(() => {
  try {
    const stored = window.localStorage.getItem("${THEME_STORAGE_KEY}");
    const mode =
      stored === "light" || stored === "dark" || stored === "system"
        ? stored
        : "system";
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const resolved = mode === "system" ? (prefersDark ? "dark" : "light") : mode;
    const root = document.documentElement;
    root.dataset.themeMode = mode;
    root.dataset.theme = resolved;
    root.style.colorScheme = resolved;
  } catch (error) {
    const root = document.documentElement;
    root.dataset.themeMode = "system";
    root.dataset.theme = "light";
    root.style.colorScheme = "light";
  }
})();
`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: themeScript }} />;
}
