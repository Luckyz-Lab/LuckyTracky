import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getHouseholdContext } from "@/lib/household";
import { currentMonth } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  const ctx = await getHouseholdContext();
  if (!ctx?.activeHousehold) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = createClient();
  const householdId = ctx.activeHousehold.id;
  const month = currentMonth();
  const today = new Date();
  const soon = new Date(today);
  soon.setDate(soon.getDate() + 7);
  const [{ data: budgets }, { data: txs }, { data: recurring }, { data: goals }] = await Promise.all([
    supabase.from("budgets").select("limit_amount, category_id, categories(name)").eq("household_id", householdId).eq("month", month),
    supabase.from("transactions").select("amount, category_id").eq("household_id", householdId).eq("type", "expense").gte("date", `${month}-01`).lte("date", `${month}-31`),
    supabase.from("recurring_rules").select("id, item, amount, next_due_date").eq("household_id", householdId).eq("is_active", true).lte("next_due_date", soon.toISOString().slice(0, 10)).order("next_due_date").limit(5),
    supabase.from("savings_goals").select("id, name, target_amount, current_amount, deadline").eq("household_id", householdId).not("deadline", "is", null).lte("deadline", soon.toISOString().slice(0, 10)).limit(5),
  ]);
  const items: Array<{ id: string; kind: "budget" | "recurring" | "goal"; title: string; detail: string; href: string; urgent: boolean }> = [];
  for (const budget of budgets ?? []) {
    const spent = (txs ?? []).filter((tx) => tx.category_id === budget.category_id).reduce((sum, tx) => sum + Number(tx.amount), 0);
    const pct = Number(budget.limit_amount) > 0 ? Math.round((spent / Number(budget.limit_amount)) * 100) : 0;
    if (pct >= 80) {
      const relation = budget.categories as unknown as { name?: string } | { name?: string }[] | null;
      const name = Array.isArray(relation) ? relation[0]?.name : relation?.name;
      items.push({ id: `budget-${budget.category_id}`, kind: "budget", title: pct >= 100 ? "Budget exceeded" : "Budget almost full", detail: `${name ?? "Category"} is at ${pct}%`, href: "/budgets", urgent: pct >= 100 });
    }
  }
  for (const rule of recurring ?? []) {
    items.push({ id: `recurring-${rule.id}`, kind: "recurring", title: "Recurring payment due", detail: `${rule.item} on ${rule.next_due_date}`, href: "/recurring", urgent: rule.next_due_date <= today.toISOString().slice(0, 10) });
  }
  for (const goal of goals ?? []) {
    if (Number(goal.current_amount) < Number(goal.target_amount)) {
      items.push({ id: `goal-${goal.id}`, kind: "goal", title: "Savings deadline nearby", detail: `${goal.name} is due ${goal.deadline}`, href: "/savings", urgent: false });
    }
  }
  return NextResponse.json({ notifications: items, unread: items.length });
}
