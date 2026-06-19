import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getHouseholdContext } from "@/lib/household";
import { ACHIEVEMENTS, unlockedAchievementKeys } from "@/lib/achievements";

export const dynamic = "force-dynamic";

export async function GET() {
  const ctx = await getHouseholdContext();
  if (!ctx?.activeHousehold) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = createClient();
  const householdId = ctx.activeHousehold.id;
  const [{ data: txs }, { data: budgets }, { data: goals }] = await Promise.all([
    supabase.from("transactions").select("category_name, source").eq("household_id", householdId),
    supabase.from("budgets").select("id").eq("household_id", householdId),
    supabase.from("savings_goals").select("target_amount, current_amount").eq("household_id", householdId),
  ]);
  const goalRows = goals ?? [];
  const stats = {
    transactionCount: txs?.length ?? 0,
    categoryCount: new Set((txs ?? []).map((t) => t.category_name).filter(Boolean)).size,
    budgetCount: budgets?.length ?? 0,
    goalCount: goalRows.length,
    completedGoalCount: goalRows.filter((g) => Number(g.current_amount) >= Number(g.target_amount)).length,
    totalSaved: goalRows.reduce((sum, g) => sum + Number(g.current_amount), 0),
    assistantEntryCount: (txs ?? []).filter((t) => t.source === "web_chat" || t.source === "line").length,
  };
  const unlockedKeys = unlockedAchievementKeys(stats);
  if (unlockedKeys.length) {
    await supabase.from("achievement_unlocks").upsert(
      unlockedKeys.map((achievement_key) => ({ household_id: householdId, achievement_key })),
      { onConflict: "household_id,achievement_key", ignoreDuplicates: true }
    );
  }
  const { data: unlocks, error } = await supabase.from("achievement_unlocks").select("*").eq("household_id", householdId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const rows = ACHIEVEMENTS.map((definition) => ({
    ...definition,
    icon: undefined,
    unlock: (unlocks ?? []).find((row) => row.achievement_key === definition.key) ?? null,
  }));
  return NextResponse.json({ achievements: rows, stats });
}

export async function POST(request: Request) {
  const ctx = await getHouseholdContext();
  if (!ctx?.activeHousehold) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { key } = await request.json();
  const supabase = createClient();
  const { data, error } = await supabase
    .from("achievement_unlocks")
    .update({ claimed_at: new Date().toISOString(), claimed_by: ctx.userId })
    .eq("household_id", ctx.activeHousehold.id)
    .eq("achievement_key", key)
    .is("claimed_at", null)
    .select()
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!data) return NextResponse.json({ error: "Achievement is locked or already claimed" }, { status: 409 });
  return NextResponse.json({ unlock: data });
}
