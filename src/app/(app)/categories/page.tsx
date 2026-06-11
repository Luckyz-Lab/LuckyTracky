import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getHouseholdContext } from "@/lib/household";
import CategoriesView from "@/components/CategoriesView";
import type { Category } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const ctx = await getHouseholdContext();
  if (!ctx) redirect("/login");
  if (!ctx.activeHousehold) return <p className="text-zinc-500">No household found.</p>;

  const supabase = createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("household_id", ctx.activeHousehold.id)
    .order("type")
    .order("name");

  return <CategoriesView householdId={ctx.activeHousehold.id} categories={(data ?? []) as Category[]} />;
}
