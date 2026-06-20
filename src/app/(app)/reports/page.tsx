import { redirect } from "next/navigation";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getHouseholdContext } from "@/lib/household";
import { getReportData } from "@/lib/reports";
import { formatMoney, monthLabel } from "@/lib/utils";
import { TrendChart } from "@/components/charts";
import CatDecor from "@/components/CatDecor";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const ctx = await getHouseholdContext();
  if (!ctx) redirect("/login");
  if (!ctx.activeHousehold) return <p className="text-slate-500 dark:text-slate-400">No household found — please create one first.</p>;

  const supabase = createClient();
  const currency = ctx.activeHousehold.currency;
  const report = await getReportData(supabase, ctx.activeHousehold.id, 6);
  const c = report.comparison;
  const expDiff = c.currentExpense - c.previousExpense;
  const incDiff = c.currentIncome - c.previousIncome;

  return (
    <div className="space-y-6">
      <header className="page-header relative overflow-hidden">
        <CatDecor pose="sit" size={104} className="absolute bottom-0 right-8 hidden opacity-90 md:block" />
        <div className="relative max-w-xl">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-lucky-500">Interactive Mew-lytics</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-ink-strong sm:text-4xl">Monthly money patterns</h1>
          <p className="page-subtitle">6-month trend and month-over-month comparison</p>
        </div>
      </header>

      <section className="card p-5">
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-lucky-500">Trend bowl</p>
          <h2 className="section-title mt-1">Income vs Expenses</h2>
        </div>
        <TrendChart data={report.series.map((s) => ({ month: s.month, income: s.income, expense: s.expense }))} />
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <CompareCard title="Expenses" current={c.currentExpense} diff={expDiff} currency={currency} invert />
        <CompareCard title="Income" current={c.currentIncome} diff={incDiff} currency={currency} />
      </div>

      <section className="card p-5">
        <h2 className="section-title mb-1">By category</h2>
        <p className="mb-4 text-xs text-slate-400 dark:text-slate-500">
          {monthLabel(c.current)} vs {monthLabel(c.previous)}
        </p>
        {c.categoryDeltas.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-[1.5rem] border-2 border-dashed border-cream-200 bg-cream-50/70 py-8 dark:border-[#403833] dark:bg-[#352e2a]">
            <CatDecor pose="sleep" size={72} />
            <p className="text-sm text-slate-400 dark:text-slate-500">Not enough data yet</p>
          </div>
        ) : (
          <ul className="grid gap-3">
            {c.categoryDeltas.map((d) => (
              <li key={d.category} className="flex items-center justify-between rounded-[1.35rem] border border-cream-200/70 bg-cream-50/75 px-4 py-3 text-sm shadow-soft dark:border-[#403833] dark:bg-[#352e2a]">
                <span className="font-medium text-slate-700 dark:text-slate-300">{d.category}</span>
                <span className="flex items-center gap-3">
                  <span className="text-slate-400 dark:text-slate-500 tabular-nums">{formatMoney(d.current, currency)}</span>
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
  const good = invert ? diff < 0 : diff > 0;
  return (
    <div className="card p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{title} this month</p>
      <p className="metric-number mt-1 text-2xl text-slate-900 dark:text-slate-100">{formatMoney(current, currency)}</p>
      <p className={`mt-2 flex items-center gap-1 text-sm ${
        diff === 0 ? "text-ink-muted" : good ? "text-positive" : "text-negative"
      }`}>
        {diff === 0 ? <Minus size={14} /> : up ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
        {diff === 0 ? "No change" : `${up ? "+" : ""}${formatMoney(diff, currency)} vs last month`}
      </p>
    </div>
  );
}

function DeltaBadge({ value, currency }: { value: number; currency: string }) {
  if (value === 0) return <span className="text-xs text-slate-400">—</span>;
  const up = value > 0;
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
      up
        ? "bg-negative-soft text-negative"
        : "bg-positive-soft text-positive"
    }`}>
      {up ? "+" : ""}{formatMoney(value, currency)}
    </span>
  );
}
