import { redirect } from "next/navigation";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getHouseholdContext } from "@/lib/household";
import { getReportData } from "@/lib/reports";
import { formatMoney, monthLabel } from "@/lib/utils";
import { TrendChart } from "@/components/charts";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const ctx = await getHouseholdContext();
  if (!ctx) redirect("/login");
  if (!ctx.activeHousehold) return <p className="text-zinc-500">No household found.</p>;

  const supabase = createClient();
  const currency = ctx.activeHousehold.currency;
  const report = await getReportData(supabase, ctx.activeHousehold.id, 6);
  const c = report.comparison;
  const expDiff = c.currentExpense - c.previousExpense;
  const incDiff = c.currentIncome - c.previousIncome;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-sm text-zinc-500">Last 6 months trend and month-over-month comparison</p>
      </header>

      <section className="card p-5">
        <h2 className="mb-3 text-sm font-semibold text-zinc-700">Income vs Expense</h2>
        <TrendChart data={report.series.map((s) => ({ month: s.month, income: s.income, expense: s.expense }))} />
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <CompareCard
          title="Expenses"
          current={c.currentExpense}
          diff={expDiff}
          currency={currency}
          invert
        />
        <CompareCard title="Income" current={c.currentIncome} diff={incDiff} currency={currency} />
      </div>

      <section className="card p-5">
        <h2 className="mb-1 text-sm font-semibold text-zinc-700">Category changes</h2>
        <p className="mb-3 text-xs text-zinc-400">
          {monthLabel(c.current)} vs {monthLabel(c.previous)}
        </p>
        {c.categoryDeltas.length === 0 ? (
          <p className="text-sm text-zinc-400">Not enough data.</p>
        ) : (
          <ul className="divide-y divide-zinc-100">
            {c.categoryDeltas.map((d) => (
              <li key={d.category} className="flex items-center justify-between py-2.5 text-sm">
                <span>{d.category}</span>
                <span className="flex items-center gap-2">
                  <span className="text-zinc-400">{formatMoney(d.current, currency)}</span>
                  <DeltaBadge value={d.delta} currency={currency} />
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function CompareCard({
  title,
  current,
  diff,
  currency,
  invert,
}: {
  title: string;
  current: number;
  diff: number;
  currency: string;
  invert?: boolean;
}) {
  const up = diff > 0;
  // For expenses, up is bad (red); for income, up is good (green).
  const good = invert ? diff < 0 : diff > 0;
  return (
    <div className="card p-5">
      <p className="text-xs font-medium text-zinc-500">{title} this month</p>
      <p className="mt-1 text-2xl font-bold">{formatMoney(current, currency)}</p>
      <p className={`mt-1 flex items-center gap-1 text-sm ${diff === 0 ? "text-zinc-400" : good ? "text-brand-600" : "text-rose-500"}`}>
        {diff === 0 ? <Minus size={14} /> : up ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
        {diff === 0 ? "No change" : `${up ? "+" : ""}${formatMoney(diff, currency)} vs last month`}
      </p>
    </div>
  );
}

function DeltaBadge({ value, currency }: { value: number; currency: string }) {
  if (value === 0) return <span className="text-xs text-zinc-400">—</span>;
  const up = value > 0;
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${up ? "bg-rose-50 text-rose-600" : "bg-brand-50 text-brand-700"}`}>
      {up ? "+" : ""}
      {formatMoney(value, currency)}
    </span>
  );
}
