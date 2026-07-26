export const THEME_STORAGE_KEY = "lf-theme";

const script = `
(function () {
  try {
    var stored = localStorage.getItem("${THEME_STORAGE_KEY}");
    var theme = stored === "light" || stored === "dark"
      ? stored
      : (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
    document.documentElement.setAttribute("data-theme", theme);
  } catch (e) {}
})();
`;

/** Sets data-theme on <html> before first paint to avoid a flash of the wrong theme. */
export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
