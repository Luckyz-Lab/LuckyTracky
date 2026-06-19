import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getHouseholdContext } from "@/lib/household";
import CategoriesView from "@/components/CategoriesView";
import type { Category } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const ctx = await getHouseholdContext();
  if (!ctx) redirect("/login");
  if (!ctx.activeHousehold) return <p className="text-slate-500 dark:text-slate-400">No household found — please create one first.</p>;

  const supabase = createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("household_id", ctx.activeHousehold.id)
    .order("type")
    .order("name");

  return <CategoriesView householdId={ctx.activeHousehold.id} categories={(data ?? []) as Category[]} />;
}
