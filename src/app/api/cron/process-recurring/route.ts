import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { RecurringCadence } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

function nextDate(date: string, cadence: RecurringCadence): string {
  const current = new Date(`${date}T12:00:00Z`);
  if (cadence === "weekly") current.setUTCDate(current.getUTCDate() + 7);
  if (cadence === "monthly") current.setUTCMonth(current.getUTCMonth() + 1);
  if (cadence === "yearly") current.setUTCFullYear(current.getUTCFullYear() + 1);
  return current.toISOString().slice(0, 10);
}

export async function GET() {
  const admin = createAdminClient();
  const today = new Date().toISOString().slice(0, 10);
  const { data: rules, error } = await admin
    .from("recurring_rules")
    .select("*")
    .eq("is_active", true)
    .lte("next_due_date", today)
    .limit(500);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let created = 0;
  for (const rule of rules ?? []) {
    const marker = `recurring:${rule.id}:${rule.next_due_date}`;
    const { data: existing } = await admin.from("transactions").select("id").eq("raw_input", marker).maybeSingle();
    if (!existing) {
      const { error: insertError } = await admin.from("transactions").insert({
        household_id: rule.household_id,
        created_by: rule.created_by,
        item: rule.item,
        amount: rule.amount,
        type: rule.type,
        category_id: rule.category_id,
        category_name: rule.category_name,
        date: rule.next_due_date,
        source: "recurring",
        confidence: 1,
        raw_input: marker,
      });
      if (!insertError) created += 1;
    }
    await admin
      .from("recurring_rules")
      .update({ next_due_date: nextDate(rule.next_due_date, rule.cadence as RecurringCadence) })
      .eq("id", rule.id);
  }
  return NextResponse.json({ ok: true, processed: rules?.length ?? 0, created });
}
