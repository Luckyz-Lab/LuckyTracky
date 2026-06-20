import { redirect } from "next/navigation";
import { getHouseholdContext } from "@/lib/household";
import AppShell from "@/components/AppShell";
import ChatPanel from "@/components/ChatPanel";
import { SoundProvider } from "@/components/mascot/SoundProvider";
import ThemeProvider from "@/components/theme/ThemeProvider";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_THEME_OVERRIDES, effectiveThemeId, isAppTheme, isThemeMode, sanitizeThemeOverrides, themeStyleText } from "@/lib/theme";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getHouseholdContext();
  if (!ctx) redirect("/login");

  const supabase = createClient();
  const { data: storedPreferences } = await supabase.from("profile_preferences").select("theme, theme_mode, theme_overrides").eq("profile_id", ctx.userId).maybeSingle();
  const preferences = {
    theme: isAppTheme(storedPreferences?.theme) ? storedPreferences.theme : "classic" as const,
    theme_mode: isThemeMode(storedPreferences?.theme_mode) ? storedPreferences.theme_mode : "light" as const,
    theme_overrides: sanitizeThemeOverrides(storedPreferences?.theme_overrides ?? DEFAULT_THEME_OVERRIDES),
  };
  const initialTheme = effectiveThemeId(preferences.theme, preferences.theme_mode);

  return (
    <ThemeProvider initialPreferences={preferences}>
      <style dangerouslySetInnerHTML={{ __html: `:root{${themeStyleText(initialTheme, preferences.theme_overrides)}}` }} />
      <SoundProvider>
        <AppShell
          households={ctx.households}
          activeHousehold={ctx.activeHousehold}
          chatPanel={<ChatPanel householdId={ctx.activeHousehold?.id ?? null} hideHeader />}
        >
          {children}
        </AppShell>
      </SoundProvider>
    </ThemeProvider>
  );
}
