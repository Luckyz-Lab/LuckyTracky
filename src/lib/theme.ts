import type { AppTheme, ThemeMode, ThemeOverrides } from "@/lib/supabase/types";

export type ThemeRadius = "compact" | "soft" | "rounded";
export type ThemeShadow = "flat" | "soft" | "lifted";

export interface ThemePalette {
  canvas: string;
  surface: string;
  surfaceMuted: string;
  surfaceElevated: string;
  textStrong: string;
  text: string;
  textMuted: string;
  border: string;
  borderStrong: string;
  primary: string;
  primaryHover: string;
  primarySoft: string;
  onPrimary: string;
  success: string;
  successSoft: string;
  danger: string;
  dangerSoft: string;
  warning: string;
  warningSoft: string;
  info: string;
  infoSoft: string;
}

export interface ThemePreset {
  id: AppTheme;
  name: string;
  description: string;
  mode: "light" | "dark";
  swatches: string[];
  palette: ThemePalette;
}

const PRESETS: Record<AppTheme, ThemePreset> = {
  classic: {
    id: "classic",
    name: "Lucky Orange",
    description: "Bright, focused and familiar",
    mode: "light",
    swatches: ["#FAF8F5", "#FFFFFF", "#C2410C", "#0F172A"],
    palette: {
      canvas: "#FAF8F5", surface: "#FFFFFF", surfaceMuted: "#F8FAFC", surfaceElevated: "#FFFFFF",
      textStrong: "#0F172A", text: "#334155", textMuted: "#64748B", border: "#E2E8F0", borderStrong: "#CBD5E1",
      primary: "#C2410C", primaryHover: "#9A3412", primarySoft: "#FFF7ED", onPrimary: "#FFFFFF",
      success: "#047857", successSoft: "#ECFDF5", danger: "#BE123C", dangerSoft: "#FFF1F2",
      warning: "#B45309", warningSoft: "#FFFBEB", info: "#1D4ED8", infoSoft: "#EFF6FF",
    },
  },
  calico: {
    id: "calico",
    name: "Calico",
    description: "Warm terracotta with a teal counterpoint",
    mode: "light",
    swatches: ["#FFF8F1", "#FFFCF8", "#B94720", "#0F766E"],
    palette: {
      canvas: "#FFF8F1", surface: "#FFFCF8", surfaceMuted: "#F7EEE6", surfaceElevated: "#FFFFFF",
      textStrong: "#2A211C", text: "#51443B", textMuted: "#75675E", border: "#E8D8CC", borderStrong: "#D8C2B2",
      primary: "#B94720", primaryHover: "#913719", primarySoft: "#FCE9DE", onPrimary: "#FFFFFF",
      success: "#0F766E", successSoft: "#E6F7F4", danger: "#B4233D", dangerSoft: "#FCECEF",
      warning: "#A15C08", warningSoft: "#FFF2D7", info: "#356A91", infoSoft: "#EAF3F8",
    },
  },
  siamese: {
    id: "siamese",
    name: "Siamese",
    description: "Ivory surfaces with composed blue ink",
    mode: "light",
    swatches: ["#F5F1EA", "#FFFEFB", "#315A72", "#241F1C"],
    palette: {
      canvas: "#F5F1EA", surface: "#FFFEFB", surfaceMuted: "#ECE7DF", surfaceElevated: "#FFFFFF",
      textStrong: "#241F1C", text: "#4A423C", textMuted: "#70665F", border: "#DDD5CB", borderStrong: "#C8BDB0",
      primary: "#315A72", primaryHover: "#244456", primarySoft: "#E6EEF2", onPrimary: "#FFFFFF",
      success: "#3C6E5B", successSoft: "#E8F2ED", danger: "#A63D4C", dangerSoft: "#F8E9EB",
      warning: "#996515", warningSoft: "#F9F0DA", info: "#315A72", infoSoft: "#E6EEF2",
    },
  },
  "black-cat": {
    id: "black-cat",
    name: "Black Cat",
    description: "Charcoal workspace with amber focus",
    mode: "dark",
    swatches: ["#151517", "#202024", "#F59E0B", "#F8FAFC"],
    palette: {
      canvas: "#151517", surface: "#202024", surfaceMuted: "#29292F", surfaceElevated: "#303036",
      textStrong: "#F8FAFC", text: "#E2E8F0", textMuted: "#A1A1AA", border: "#3F3F46", borderStrong: "#52525B",
      primary: "#F59E0B", primaryHover: "#FBBF24", primarySoft: "#3B2A0B", onPrimary: "#241704",
      success: "#34D399", successSoft: "#0D3529", danger: "#FB7185", dangerSoft: "#421923",
      warning: "#FBBF24", warningSoft: "#3C2E0C", info: "#60A5FA", infoSoft: "#142E50",
    },
  },
  midnight: {
    id: "midnight",
    name: "Midnight",
    description: "Deep navy with crisp cyan signals",
    mode: "dark",
    swatches: ["#09111F", "#101B2D", "#22D3EE", "#F8FAFC"],
    palette: {
      canvas: "#09111F", surface: "#101B2D", surfaceMuted: "#17243A", surfaceElevated: "#1C2B43",
      textStrong: "#F8FAFC", text: "#DCE7F5", textMuted: "#94A3B8", border: "#263A55", borderStrong: "#36506E",
      primary: "#22D3EE", primaryHover: "#67E8F9", primarySoft: "#123947", onPrimary: "#08232A",
      success: "#34D399", successSoft: "#10382D", danger: "#FB7185", dangerSoft: "#461B29",
      warning: "#FBBF24", warningSoft: "#3D300F", info: "#60A5FA", infoSoft: "#162F52",
    },
  },
};

export const THEME_PRESETS = Object.values(PRESETS);
const DARK_PAIR: Record<AppTheme, AppTheme> = { classic: "midnight", calico: "black-cat", siamese: "midnight", "black-cat": "black-cat", midnight: "midnight" };
const LIGHT_PAIR: Record<AppTheme, AppTheme> = { classic: "classic", calico: "calico", siamese: "siamese", "black-cat": "calico", midnight: "siamese" };

export function effectiveThemeId(theme: AppTheme, mode: ThemeMode, systemDark = false): AppTheme {
  const wantsDark = mode === "dark" || (mode === "system" && systemDark);
  return wantsDark ? DARK_PAIR[theme] : LIGHT_PAIR[theme];
}

export const DEFAULT_THEME_OVERRIDES: ThemeOverrides = {
  primary: null,
  canvas: null,
  surface: null,
  text: null,
  radius: "soft",
  shadow: "soft",
};

const HEX = /^#[0-9a-f]{6}$/i;

export function isAppTheme(value: unknown): value is AppTheme {
  return typeof value === "string" && value in PRESETS;
}

export function isThemeMode(value: unknown): value is ThemeMode {
  return value === "light" || value === "dark" || value === "system";
}

export function sanitizeThemeOverrides(value: unknown): ThemeOverrides {
  const source = value && typeof value === "object" ? value as Record<string, unknown> : {};
  return {
    primary: typeof source.primary === "string" && HEX.test(source.primary) ? source.primary.toUpperCase() : null,
    canvas: typeof source.canvas === "string" && HEX.test(source.canvas) ? source.canvas.toUpperCase() : null,
    surface: typeof source.surface === "string" && HEX.test(source.surface) ? source.surface.toUpperCase() : null,
    text: typeof source.text === "string" && HEX.test(source.text) ? source.text.toUpperCase() : null,
    radius: source.radius === "compact" || source.radius === "rounded" ? source.radius : "soft",
    shadow: source.shadow === "flat" || source.shadow === "lifted" ? source.shadow : "soft",
  };
}

function hexToRgb(hex: string) {
  const value = hex.slice(1);
  return [Number.parseInt(value.slice(0, 2), 16), Number.parseInt(value.slice(2, 4), 16), Number.parseInt(value.slice(4, 6), 16)];
}

function channel(value: number) {
  const normalized = value / 255;
  return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
}

export function contrastRatio(first: string, second: string) {
  const luminance = (color: string) => {
    const [r, g, b] = hexToRgb(color);
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
  };
  const a = luminance(first);
  const b = luminance(second);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

export function resolveTheme(theme: AppTheme, overrides: ThemeOverrides = DEFAULT_THEME_OVERRIDES) {
  const preset = PRESETS[theme] ?? PRESETS.classic;
  const clean = sanitizeThemeOverrides(overrides);
  const palette = { ...preset.palette };
  if (clean.canvas) palette.canvas = clean.canvas;
  if (clean.surface) palette.surface = clean.surface;
  if (clean.text && contrastRatio(clean.text, palette.surface) >= 4.5) {
    palette.textStrong = clean.text;
    palette.text = clean.text;
  }
  if (clean.primary && contrastRatio(clean.primary, palette.onPrimary) >= 4.5) {
    palette.primary = clean.primary;
    palette.primaryHover = clean.primary;
  }
  return { preset, palette, overrides: clean };
}

export function themeVariables(theme: AppTheme, overrides?: ThemeOverrides): Record<string, string> {
  const { palette, overrides: clean } = resolveTheme(theme, overrides);
  const rgb = (value: string) => hexToRgb(value).join(" ");
  const radius = clean.radius === "compact" ? ["12px", "10px"] : clean.radius === "rounded" ? ["24px", "18px"] : ["18px", "14px"];
  const shadow = clean.shadow === "flat" ? "none" : clean.shadow === "lifted" ? "0 18px 45px -18px rgb(15 23 42 / 0.35)" : "0 8px 24px -16px rgb(15 23 42 / 0.28)";
  return {
    "--ui-canvas": rgb(palette.canvas), "--ui-surface": rgb(palette.surface), "--ui-surface-muted": rgb(palette.surfaceMuted),
    "--ui-surface-elevated": rgb(palette.surfaceElevated), "--ui-text-strong": rgb(palette.textStrong), "--ui-text": rgb(palette.text),
    "--ui-text-muted": rgb(palette.textMuted), "--ui-border": rgb(palette.border), "--ui-border-strong": rgb(palette.borderStrong),
    "--ui-primary": rgb(palette.primary), "--ui-primary-hover": rgb(palette.primaryHover), "--ui-primary-soft": rgb(palette.primarySoft),
    "--ui-on-primary": rgb(palette.onPrimary), "--ui-success": rgb(palette.success), "--ui-success-soft": rgb(palette.successSoft),
    "--ui-danger": rgb(palette.danger), "--ui-danger-soft": rgb(palette.dangerSoft), "--ui-warning": rgb(palette.warning),
    "--ui-warning-soft": rgb(palette.warningSoft), "--ui-info": rgb(palette.info), "--ui-info-soft": rgb(palette.infoSoft),
    "--ui-card-radius": radius[0], "--ui-control-radius": radius[1], "--ui-card-shadow": shadow,
  };
}

export function themeStyleText(theme: AppTheme, overrides?: ThemeOverrides) {
  return Object.entries(themeVariables(theme, overrides)).map(([key, value]) => `${key}:${value}`).join(";");
}
