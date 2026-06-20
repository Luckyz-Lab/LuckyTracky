import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { contrastRatio, DEFAULT_THEME_OVERRIDES, effectiveThemeId, isAppTheme, isThemeMode, sanitizeThemeOverrides, THEME_PRESETS } from "@/lib/theme";

const DEFAULTS = {
  theme: "classic",
  theme_mode: "light",
  theme_overrides: DEFAULT_THEME_OVERRIDES,
  mascot_name: "Lucky",
  mascot_breed: "tabby",
  mascot_color: "#FFEFE6",
  mascot_accessory: "collar_bell",
  notifications_enabled: true,
};

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data, error } = await supabase.from("profile_preferences").select("*").eq("profile_id", user.id).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ preferences: data ?? { profile_id: user.id, ...DEFAULTS } });
}

export async function PATCH(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const { data: current } = await supabase.from("profile_preferences").select("*").eq("profile_id", user.id).maybeSingle();
  const theme = isAppTheme(body.theme) ? body.theme : (isAppTheme(current?.theme) ? current.theme : DEFAULTS.theme);
  const themeMode = isThemeMode(body.theme_mode) ? body.theme_mode : (isThemeMode(current?.theme_mode) ? current.theme_mode : DEFAULTS.theme_mode);
  const themeOverrides = sanitizeThemeOverrides(body.theme_overrides ?? current?.theme_overrides);
  const targetIds = themeMode === "system" ? [effectiveThemeId(theme, "light"), effectiveThemeId(theme, "dark")] : [effectiveThemeId(theme, themeMode)];
  for (const targetId of new Set(targetIds)) {
    const preset = THEME_PRESETS.find((item) => item.id === targetId) ?? THEME_PRESETS[0];
    const surface = themeOverrides.surface ?? preset.palette.surface;
    const text = themeOverrides.text ?? preset.palette.text;
    const primary = themeOverrides.primary ?? preset.palette.primary;
    if (contrastRatio(text, surface) < 4.5) {
      return NextResponse.json({ error: "Text and surface colors need at least 4.5:1 contrast in every display mode." }, { status: 400 });
    }
    if (contrastRatio(primary, preset.palette.onPrimary) < 4.5) {
      return NextResponse.json({ error: "Primary color does not have enough contrast for button labels in every display mode." }, { status: 400 });
    }
  }
  const payload = {
    profile_id: user.id,
    theme,
    theme_mode: themeMode,
    theme_overrides: themeOverrides,
    mascot_name: String(body.mascot_name ?? current?.mascot_name ?? DEFAULTS.mascot_name).trim().slice(0, 24) || DEFAULTS.mascot_name,
    mascot_breed: body.mascot_breed ?? current?.mascot_breed ?? DEFAULTS.mascot_breed,
    mascot_color: /^#[0-9a-f]{6}$/i.test(body.mascot_color) ? body.mascot_color : current?.mascot_color ?? DEFAULTS.mascot_color,
    mascot_accessory: body.mascot_accessory ?? current?.mascot_accessory ?? DEFAULTS.mascot_accessory,
    notifications_enabled: body.notifications_enabled ?? current?.notifications_enabled ?? true,
  };
  const { data, error } = await supabase.from("profile_preferences").upsert(payload, { onConflict: "profile_id" }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ preferences: data });
}
