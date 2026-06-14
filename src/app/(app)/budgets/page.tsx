import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getHouseholdContext } from "@/lib/household";
import { currentMonth } from "@/lib/utils";
import BudgetsView from "@/components/BudgetsView";
import type { Category } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function BudgetsPage() {
  const ctx = await getHouseholdContext();
  if (!ctx) redirect("/login");
  if (!ctx.activeHousehold) return <p className="text-slate-500 dark:text-slate-400">ยังไม่มีบ้าน — สร้างบ้านก่อนนะเมี้ยว 🐱</p>;

  const supabase = createClient();
  const householdId = ctx.activeHousehold.id;
  const month = currentMonth();
  const [y, m] = month.split("-").map(Number);
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();

  const [{ data: categories }, { data: budgets }, { data: txs }] = await Promise.all([
    supabase.from("categories").select("*").eq("household_id", householdId).eq("type", "expense").order("name"),
    supabase.from("budgets").select("*").eq("household_id", householdId).eq("month", month),
    supabase
      .from("transactions")
      .select("amount, category_id, category_name")
      .eq("household_id", householdId)
      .eq("type", "expense")
      .gte("date", `${month}-01`)
      .lte("date", `${month}-${String(last).padStart(2, "0")}`),
  ]);

  const cats = (categories ?? []) as Category[];
  const spentByCat: Record<string, number> = {};
  for (const t of txs ?? []) {
    if (t.category_id) spentByCat[t.category_id] = (spentByCat[t.category_id] ?? 0) + Number(t.amount);
  }

  const rows = (budgets ?? []).map((b) => ({
    ...b,
    category_name: cats.find((c) => c.id === b.category_id)?.name ?? "Category",
    spent: b.category_id ? spentByCat[b.category_id] ?? 0 : 0,
  }));

  return (
    <BudgetsView
      householdId={householdId}
      currency={ctx.activeHousehold.currency}
      month={month}
      expenseCategories={cats}
      budgets={rows}
    />
  );
}
