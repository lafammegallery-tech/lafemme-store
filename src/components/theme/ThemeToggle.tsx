"use client";
import { useEffect, useState } from "react";
import { IconButton } from "@/components/ui";
import { THEME_STORAGE_KEY } from "./ThemeScript";

type Theme = "dark" | "light";

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // localStorage may be unavailable (private mode, blocked storage) — theme just won't persist.
  }
}

/** Toggles the site's light/dark theme; syncs with the value ThemeScript set before paint. */
export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    if (current === "light" || current === "dark") setTheme(current);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  }

  return (
    <IconButton
      className={className}
      label={theme === "dark" ? "روشن کردن حالت نمایش" : "تیره کردن حالت نمایش"}
      icon={<span aria-hidden="true">{theme === "dark" ? "☀️" : "🌙"}</span>}
      onClick={toggle}
    />
  );
}
