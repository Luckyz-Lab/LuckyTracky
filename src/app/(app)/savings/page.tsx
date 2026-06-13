import { redirect } from "next/navigation";
import { getHouseholdContext } from "@/lib/household";
import SavingsGoalsView from "@/components/SavingsGoalsView";

export const dynamic = "force-dynamic";

export default async function SavingsPage() {
  const ctx = await getHouseholdContext();
  if (!ctx) redirect("/login");
  if (!ctx.activeHousehold) return <p className="text-zinc-500">No household found.</p>;
  return <SavingsGoalsView />;
}
