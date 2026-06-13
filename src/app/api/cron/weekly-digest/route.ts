import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { pushMessage, textMessage } from "@/lib/line";
import { formatMoney } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * GET /api/cron/weekly-digest
 * Vercel cron: runs every Sunday. Pushes a weekly summary to all linked LINE users.
 */
export async function GET() {
  const admin = createAdminClient();

  // Get all linked LINE accounts
  const { data: accounts } = await admin
    .from("line_accounts")
    .select("line_user_id, default_household_id")
    .not("default_household_id", "is", null);

  if (!accounts?.length) {
    return NextResponse.json({ ok: true, sent: 0 });
  }

  // Calculate date range: last 7 days
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - 7);
  const startStr = start.toISOString().slice(0, 10);
  const endStr = end.toISOString().slice(0, 10);

  let sent = 0;
  for (const acct of accounts as Array<{ line_user_id: string; default_household_id: string }>) {
    if (!acct.line_user_id || !acct.default_household_id) continue;

    const { data: txs } = await admin
      .from("transactions")
      .select("amount, type, category_name")
      .eq("household_id", acct.default_household_id)
      .gte("date", startStr)
      .lte("date", endStr);

    let income = 0;
    let expense = 0;
    const byCat: Record<string, number> = {};
    for (const t of txs ?? []) {
      const amt = Number(t.amount);
      if (t.type === "income") income += amt;
      else {
        expense += amt;
        byCat[t.category_name ?? "อื่นๆ"] = (byCat[t.category_name ?? "อื่นๆ"] ?? 0) + amt;
      }
    }

    const top = Object.entries(byCat)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    let msg = `📅 Weekly Digest (${startStr} ~ ${endStr})\n`;
    msg += `Income: ${formatMoney(income)}\n`;
    msg += `Expense: ${formatMoney(expense)}\n`;
    msg += `Balance: ${formatMoney(income - expense)}`;
    if (top.length) {
      msg += `\n\nTop expenses:\n` + top.map(([c, v]) => `· ${c}: ${formatMoney(v)}`).join("\n");
    }

    await pushMessage(acct.line_user_id, [textMessage(msg)]);
    sent++;
  }

  return NextResponse.json({ ok: true, sent });
}
