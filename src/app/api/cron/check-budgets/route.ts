import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { pushMessage, textMessage } from "@/lib/line";
import { currentMonth, formatMoney } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * GET /api/cron/check-budgets
 * Vercel cron: runs daily. Checks all budgets and pushes alerts when > 80% spent.
 */
export async function GET() {
  const admin = createAdminClient();
  const month = currentMonth();
  const [y, m] = month.split("-").map(Number);
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();

  // Fetch all budgets for current month
  const { data: budgets } = await admin
    .from("budgets")
    .select("id, household_id, category_id, limit_amount, categories!inner(name)")
    .eq("month", month);

  if (!budgets?.length) {
    return NextResponse.json({ ok: true, alerts: 0 });
  }

  let alerts = 0;
  for (const b of budgets) {
    // Sum spending for this category this month
    const { data: txs } = await admin
      .from("transactions")
      .select("amount")
      .eq("household_id", b.household_id)
      .eq("category_id", b.category_id)
      .gte("date", `${month}-01`)
      .lte("date", `${month}-${String(last).padStart(2, "0")}`);

    const spent = (txs ?? []).reduce((s, t) => s + Number(t.amount), 0);
    const pct = b.limit_amount > 0 ? Math.round((spent / b.limit_amount) * 100) : 0;

    if (pct >= 80) {
      // Find linked LINE users for this household
      const { data: accounts } = await admin
        .from("line_accounts")
        .select("line_user_id")
        .eq("default_household_id", b.household_id);

      const catName = (b as unknown as { categories: { name: string } }).categories?.name ?? "Unknown";
      const emoji = pct >= 100 ? "🚨" : "⚠️";

      for (const acct of (accounts ?? []) as Array<{ line_user_id: string }>) {
        if (acct.line_user_id) {
          await pushMessage(acct.line_user_id, [
            textMessage(`${emoji} Budget Alert: ${catName}\n${formatMoney(spent)} / ${formatMoney(b.limit_amount)} (${pct}%)`),
          ]);
          alerts++;
        }
      }
    }
  }

  return NextResponse.json({ ok: true, alerts });
}
