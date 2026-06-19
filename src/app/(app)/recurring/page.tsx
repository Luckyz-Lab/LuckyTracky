import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getHouseholdContext } from "@/lib/household";
import RecurringExpensesView from "@/components/RecurringExpensesView";
import type { Category } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function RecurringPage() {
  const ctx = await getHouseholdContext();
  if (!ctx) redirect("/login");
  if (!ctx.activeHousehold) return <p className="text-slate-500">No household found.</p>;
  const supabase = createClient();
  const { data: categories } = await supabase.from("categories").select("*").eq("household_id", ctx.activeHousehold.id).order("type").order("name");
  return <RecurringExpensesView categories={(categories ?? []) as Category[]} currency={ctx.activeHousehold.currency} />;
}
