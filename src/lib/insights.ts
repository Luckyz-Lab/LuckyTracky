import type { SupabaseClient } from "@supabase/supabase-js";
import { formatMoney, currentMonth } from "./utils";

/** Month-over-month comparison result. */
export interface MonthComparison {
  current: { income: number; expense: number; balance: number; byCategory: Record<string, number> };
  previous: { income: number; expense: number; balance: number; byCategory: Record<string, number> };
  changes: Array<{ category: string; current: number; previous: number; changePct: number }>;
}

function prevMonth(month: string): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 2, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function monthDays(month: string): { start: string; end: string } {
  const [y, m] = month.split("-").map(Number);
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return { start: `${month}-01`, end: `${month}-${String(last).padStart(2, "0")}` };
}

async function fetchMonth(
  supabase: SupabaseClient,
  householdId: string,
  month: string
): Promise<{ income: number; expense: number; balance: number; byCategory: Record<string, number> }> {
  const { start, end } = monthDays(month);
  const { data } = await supabase
    .from("transactions")
    .select("amount, type, category_name")
    .eq("household_id", householdId)
    .gte("date", start)
    .lte("date", end);

  let income = 0;
  let expense = 0;
  const byCategory: Record<string, number> = {};
  for (const r of data ?? []) {
    const amt = Number(r.amount);
    if (r.type === "income") income += amt;
    else {
      expense += amt;
      byCategory[r.category_name ?? "อื่นๆ"] = (byCategory[r.category_name ?? "อื่นๆ"] ?? 0) + amt;
    }
  }
  return { income, expense, balance: income - expense, byCategory };
}

/** Compare current month vs previous month. */
export async function compareMonths(
  supabase: SupabaseClient,
  householdId: string,
  month?: string
): Promise<MonthComparison> {
  const cur = month ?? currentMonth();
  const prev = prevMonth(cur);
  const [current, previous] = await Promise.all([
    fetchMonth(supabase, householdId, cur),
    fetchMonth(supabase, householdId, prev),
  ]);

  const allCats = new Set([...Object.keys(current.byCategory), ...Object.keys(previous.byCategory)]);
  const changes = [...allCats]
    .map((cat) => {
      const curVal = current.byCategory[cat] ?? 0;
      const prevVal = previous.byCategory[cat] ?? 0;
      const changePct = prevVal > 0 ? Math.round(((curVal - prevVal) / prevVal) * 100) : curVal > 0 ? 100 : 0;
      return { category: cat, current: curVal, previous: prevVal, changePct };
    })
    .sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct));

  return { current, previous, changes };
}

/** Format comparison as human-readable Thai text. */
export function formatComparison(c: MonthComparison): string {
  const lines: string[] = [];
  lines.push(`📊 เทียบกับเดือนก่อน`);
  lines.push(`รายรับ: ${formatMoney(c.current.income)} (${c.previous.income > 0 ? (c.current.income >= c.previous.income ? "+" : "") + Math.round(((c.current.income - c.previous.income) / c.previous.income) * 100) + "%" : "ใหม่"})`);
  lines.push(`รายจ่าย: ${formatMoney(c.current.expense)} (${c.previous.expense > 0 ? (c.current.expense >= c.previous.expense ? "+" : "") + Math.round(((c.current.expense - c.previous.expense) / c.previous.expense) * 100) + "%" : "ใหม่"})`);

  const top = c.changes.slice(0, 3);
  if (top.length) {
    lines.push(`\nหมวดที่เปลี่ยนมากสุด:`);
    for (const ch of top) {
      const arrow = ch.changePct > 0 ? "📈" : "📉";
      lines.push(`· ${arrow} ${ch.category}: ${ch.changePct > 0 ? "+" : ""}${ch.changePct}% (${formatMoney(ch.current)})`);
    }
  }
  return lines.join("\n");
}

/** Detect recurring transactions (same item, similar amount, multiple months). */
export async function detectRecurring(
  supabase: SupabaseClient,
  householdId: string
): Promise<Array<{ item: string; avgAmount: number; months: string[]; category: string }>> {
  const { data } = await supabase
    .from("transactions")
    .select("item, amount, date, category_name, type")
    .eq("household_id", householdId)
    .eq("type", "expense")
    .order("date", { ascending: false })
    .limit(500);

  // Group by item name
  const groups: Record<string, { amounts: number[]; months: Set<string>; category: string }> = {};
  for (const r of data ?? []) {
    const item = (r.item ?? "").trim().toLowerCase();
    if (!item || item.length < 2) continue;
    if (!groups[item]) groups[item] = { amounts: [], months: new Set(), category: r.category_name ?? "อื่นๆ" };
    groups[item].amounts.push(Number(r.amount));
    groups[item].months.add((r.date ?? "").slice(0, 7));
  }

  const recurring: Array<{ item: string; avgAmount: number; months: string[]; category: string }> = [];
  for (const [item, g] of Object.entries(groups)) {
    if (g.months.size < 2) continue;
    const avg = Math.round(g.amounts.reduce((s, a) => s + a, 0) / g.amounts.length);
    // Check amount consistency (within 30% variance)
    const consistent = g.amounts.every((a) => Math.abs(a - avg) / avg < 0.3);
    if (consistent) {
      recurring.push({ item, avgAmount: avg, months: [...g.months].sort(), category: g.category });
    }
  }

  return recurring.sort((a, b) => b.months.length - a.months.length);
}

/** Format recurring transactions as readable text. */
export function formatRecurring(list: Array<{ item: string; avgAmount: number; months: string[]; category: string }>): string {
  if (!list.length) return "🔁 No recurring transactions detected yet.";
  const lines = ["🔁 รายการที่เกิดซ้ำ:"];
  for (const r of list.slice(0, 5)) {
    lines.push(`· ${r.item}: ~${formatMoney(r.avgAmount)} (${r.months.length} เดือน, ${r.category})`);
  }
  return lines.join("\n");
}
