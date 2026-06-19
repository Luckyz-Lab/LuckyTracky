import type { RecurringCadence } from "./supabase/types";

export function nextRecurringDate(date: string, cadence: RecurringCadence): string {
  const current = new Date(`${date}T12:00:00Z`);
  if (cadence === "weekly") current.setUTCDate(current.getUTCDate() + 7);
  if (cadence === "monthly") current.setUTCMonth(current.getUTCMonth() + 1);
  if (cadence === "yearly") current.setUTCFullYear(current.getUTCFullYear() + 1);
  return current.toISOString().slice(0, 10);
}

export function monthlyEquivalent(amount: number, cadence: RecurringCadence): number {
  if (cadence === "weekly") return amount * 52 / 12;
  if (cadence === "yearly") return amount / 12;
  return amount;
}
