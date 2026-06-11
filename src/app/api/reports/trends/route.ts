import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { monthLabel } from "@/lib/utils";

/**
 * Returns monthly income/expense totals for the last N months.
 */
export async function GET(request: Request) {
  const supabase = createClient();
  const { searchParams } = new URL(request.url);
  const householdId = searchParams.get("household_id");
  const months = Math.min(Number(searchParams.get("months") ?? 6), 12);
  if (!householdId) return NextResponse.json({ error: "household_id required" }, { status: 400 });

  const now = new Date();
  const thai = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  const keys: string[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(thai.getUTCFullYear(), thai.getUTCMonth() - i, 1));
    keys.push(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`);
  }
  const from = `${keys[0]}-01`;

  const { data, error } = await supabase
    .from("transactions")
    .select("amount, type, date, category_name")
    .eq("household_id", householdId)
    .gte("date", from);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const map: Record<string, { income: number; expense: number }> = {};
  keys.forEach((k) => (map[k] = { income: 0, expense: 0 }));

  for (const t of data ?? []) {
    const key = String(t.date).slice(0, 7);
    if (!map[key]) continue;
    if (t.type === "income") map[key].income += Number(t.amount);
    else map[key].expense += Number(t.amount);
  }

  const series = keys.map((k) => ({
    key: k,
    month: monthLabel(k),
    income: map[k].income,
    expense: map[k].expense,
    balance: map[k].income - map[k].expense,
  }));

  return NextResponse.json({ series });
}
