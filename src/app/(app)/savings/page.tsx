import { redirect } from "next/navigation";
import { getHouseholdContext } from "@/lib/household";
import SavingsGoalsView from "@/components/SavingsGoalsView";

export const dynamic = "force-dynamic";

export default async function SavingsPage() {
  const ctx = await getHouseholdContext();
  if (!ctx) redirect("/login");
  if (!ctx.activeHousehold) return <p className="text-slate-500 dark:text-slate-400">ยังไม่มีบ้าน — สร้างบ้านก่อนนะเมี้ยว 🐱</p>;
  return <SavingsGoalsView />;
}
