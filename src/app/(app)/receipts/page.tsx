import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getHouseholdContext } from "@/lib/household";
import ReceiptsView from "@/components/ReceiptsView";
import type { Category } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function ReceiptsPage() {
  const ctx = await getHouseholdContext();
  if (!ctx) redirect("/login");
  if (!ctx.activeHousehold) return <p className="text-slate-500 dark:text-slate-400">No household found — please create one first.</p>;

  const supabase = createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("household_id", ctx.activeHousehold.id)
    .order("name");

  return <ReceiptsView householdId={ctx.activeHousehold.id} categories={(data ?? []) as Category[]} />;
}
