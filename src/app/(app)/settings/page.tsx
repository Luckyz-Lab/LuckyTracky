import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getHouseholdContext } from "@/lib/household";
import SettingsView from "@/components/SettingsView";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const ctx = await getHouseholdContext();
  if (!ctx) redirect("/login");
  if (!ctx.activeHousehold) return <p className="text-slate-500 dark:text-slate-400">ยังไม่มีบ้าน — สร้างบ้านก่อนนะเมี้ยว 🐱</p>;

  const supabase = createClient();
  const householdId = ctx.activeHousehold.id;

  const [{ data: memberRows }, { data: lineRows }] = await Promise.all([
    supabase
      .from("household_members")
      .select("profile_id, role, profiles(display_name)")
      .eq("household_id", householdId),
    supabase.from("line_accounts").select("line_user_id, default_household_id").eq("profile_id", ctx.userId),
  ]);

  const members = (memberRows ?? []).map((m: { profile_id: string; role: string; profiles: { display_name: string | null } | { display_name: string | null }[] | null }) => ({
    profile_id: m.profile_id,
    role: m.role,
    display_name: Array.isArray(m.profiles) ? m.profiles[0]?.display_name ?? null : m.profiles?.display_name ?? null,
  }));

  const isOwner = members.find((m) => m.profile_id === ctx.userId)?.role === "owner";
  const lineAccount = lineRows && lineRows.length > 0 ? lineRows[0] : null;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";

  return (
    <SettingsView
      household={ctx.activeHousehold}
      members={members}
      households={ctx.households}
      lineAccount={lineAccount}
      isOwner={isOwner}
      siteUrl={siteUrl}
    />
  );
}
