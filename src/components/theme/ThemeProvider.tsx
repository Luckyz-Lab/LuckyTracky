"use client";

import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useState } from "react";
import type { AppTheme, ThemeMode, ThemeOverrides } from "@/lib/supabase/types";
import { DEFAULT_THEME_OVERRIDES, effectiveThemeId, isAppTheme, isThemeMode, sanitizeThemeOverrides, themeVariables, THEME_PRESETS } from "@/lib/theme";

export interface ThemePreferences {
  theme: AppTheme;
  theme_mode: ThemeMode;
  theme_overrides: ThemeOverrides;
}

interface ThemeContextValue extends ThemePreferences {
  effectiveTheme: AppTheme;
  setPreview: (next: ThemePreferences) => void;
  resetPreview: () => void;
}

const DEFAULT_PREFERENCES: ThemePreferences = {
  theme: "classic",
  theme_mode: "light",
  theme_overrides: DEFAULT_THEME_OVERRIDES,
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function normalize(value?: Partial<ThemePreferences> | null): ThemePreferences {
  return {
    theme: isAppTheme(value?.theme) ? value.theme : DEFAULT_PREFERENCES.theme,
    theme_mode: isThemeMode(value?.theme_mode) ? value.theme_mode : DEFAULT_PREFERENCES.theme_mode,
    theme_overrides: sanitizeThemeOverrides(value?.theme_overrides),
  };
}

function useSystemDark() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setDark(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return dark;
}

export default function ThemeProvider({ initialPreferences, children }: { initialPreferences?: Partial<ThemePreferences> | null; children: React.ReactNode }) {
  const initial = useMemo(() => normalize(initialPreferences), [initialPreferences]);
  const [preferences, setPreferences] = useState(initial);
  const systemDark = useSystemDark();
  const effectiveTheme = effectiveThemeId(preferences.theme, preferences.theme_mode, systemDark);

  const apply = useCallback((next: ThemePreferences, selectedTheme: AppTheme) => {
    const root = document.documentElement;
    Object.entries(themeVariables(selectedTheme, next.theme_overrides)).forEach(([property, value]) => root.style.setProperty(property, value));
    const dark = THEME_PRESETS.find((preset) => preset.id === selectedTheme)?.mode === "dark";
    root.classList.remove("dark");
    root.dataset.theme = selectedTheme;
    root.dataset.themeMode = next.theme_mode;
    root.style.colorScheme = dark ? "dark" : "light";
  }, []);

  useLayoutEffect(() => apply(preferences, effectiveTheme), [apply, effectiveTheme, preferences]);

  useEffect(() => {
    const onPreferences = (event: Event) => {
      const detail = (event as CustomEvent<Partial<ThemePreferences>>).detail;
      if (detail) setPreferences(normalize(detail));
    };
    window.addEventListener("lucky-preferences-updated", onPreferences);
    return () => window.removeEventListener("lucky-preferences-updated", onPreferences);
  }, []);

  const setPreview = useCallback((next: ThemePreferences) => setPreferences(normalize(next)), []);
  const resetPreview = useCallback(() => setPreferences(initial), [initial]);

  const value = useMemo<ThemeContextValue>(() => ({
    ...preferences,
    effectiveTheme,
    setPreview,
    resetPreview,
  }), [effectiveTheme, preferences, resetPreview, setPreview]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider");
  return context;
}
