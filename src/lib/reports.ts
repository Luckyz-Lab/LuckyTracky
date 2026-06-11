import type { SupabaseClient } from "@supabase/supabase-js";
import { monthLabel } from "@/lib/utils";

export interface MonthPoint {
  key: string;
  month: string;
  income: number;
  expense: number;
  balance: number;
}

export interface CategoryDelta {
  category: string;
  current: number;
  previous: number;
  delta: number;
}

export interface ReportData {
  series: MonthPoint[];
  comparison: {
    current: string;
    previous: string;
    currentExpense: number;
    previousExpense: number;
    currentIncome: number;
    previousIncome: number;
    categoryDeltas: CategoryDelta[];
  };
}

function monthKeys(count: number): string[] {
  const now = new Date();
  const thai = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  const keys: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(thai.getUTCFullYear(), thai.getUTCMonth() - i, 1));
    keys.push(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`);
  }
  return keys;
}

export async function getReportData(
  supabase: SupabaseClient,
  householdId: string,
  months = 6
): Promise<ReportData> {
  const keys = monthKeys(months);
  const from = `${keys[0]}-01`;

  const { data } = await supabase
    .from("transactions")
    .select("amount, type, date, category_name")
    .eq("household_id", householdId)
    .gte("date", from);

  const rows = data ?? [];
  const map: Record<string, { income: number; expense: number }> = {};
  keys.forEach((k) => (map[k] = { income: 0, expense: 0 }));

  const current = keys[keys.length - 1];
  const previous = keys[keys.length - 2] ?? current;
  const curCat: Record<string, number> = {};
  const prevCat: Record<string, number> = {};

  for (const t of rows) {
    const key = String(t.date).slice(0, 7);
    if (map[key]) {
      if (t.type === "income") map[key].income += Number(t.amount);
      else map[key].expense += Number(t.amount);
    }
    if (t.type === "expense") {
      const cat = t.category_name ?? "อื่นๆ";
      if (key === current) curCat[cat] = (curCat[cat] ?? 0) + Number(t.amount);
      if (key === previous) prevCat[cat] = (prevCat[cat] ?? 0) + Number(t.amount);
    }
  }

  const series: MonthPoint[] = keys.map((k) => ({
    key: k,
    month: monthLabel(k),
    income: map[k].income,
    expense: map[k].expense,
    balance: map[k].income - map[k].expense,
  }));

  const cats = new Set([...Object.keys(curCat), ...Object.keys(prevCat)]);
  const categoryDeltas: CategoryDelta[] = [...cats]
    .map((category) => {
      const c = curCat[category] ?? 0;
      const p = prevCat[category] ?? 0;
      return { category, current: c, previous: p, delta: c - p };
    })
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

  return {
    series,
    comparison: {
      current,
      previous,
      currentExpense: map[current].expense,
      previousExpense: map[previous].expense,
      currentIncome: map[current].income,
      previousIncome: map[previous].income,
      categoryDeltas,
    },
  };
}
