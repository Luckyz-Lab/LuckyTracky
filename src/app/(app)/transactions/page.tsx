import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getHouseholdContext } from "@/lib/household";
import TransactionsView from "@/components/TransactionsView";
import type { Category } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  const ctx = await getHouseholdContext();
  if (!ctx) redirect("/login");
  if (!ctx.activeHousehold) return <p className="text-zinc-500">No household found.</p>;

  const supabase = createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("household_id", ctx.activeHousehold.id)
    .order("type")
    .order("name");

  return (
    <TransactionsView
      householdId={ctx.activeHousehold.id}
      currency={ctx.activeHousehold.currency}
      categories={(categories ?? []) as Category[]}
    />
  );
}
