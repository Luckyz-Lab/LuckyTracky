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
  if (!ctx.activeHousehold) return <p className="text-slate-500 dark:text-slate-400">ยังไม่มีบ้าน — สร้างบ้านก่อนนะเมี้ยว 🐱</p>;

  const supabase = createClient();
  const currency = ctx.activeHousehold.currency;
  const report = await getReportData(supabase, ctx.activeHousehold.id, 6);
  const c = report.comparison;
  const expDiff = c.currentExpense - c.previousExpense;
  const incDiff = c.currentIncome - c.previousIncome;

  return (
    <div className="space-y-6">
      <header className="border-b border-lucky-100/60 dark:border-slate-800 pb-5">
        <h1 className="page-title">รายงาน 📊</h1>
        <p className="page-subtitle">แนวโน้ม  6 เดือนย้อนหลัง และเปรียบเทียบเดือนนี้กับเดือนก่อน</p>
      </header>

      <section className="card p-5">
        <h2 className="section-title mb-4">รายรับ vs รายจ่าย</h2>
        <TrendChart data={report.series.map((s) => ({ month: s.month, income: s.income, expense: s.expense }))} />
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <CompareCard title="รายจ่าย" current={c.currentExpense} diff={expDiff} currency={currency} invert />
        <CompareCard title="รายรับ" current={c.currentIncome} diff={incDiff} currency={currency} />
      </div>

      <section className="card p-5">
        <h2 className="section-title mb-1">เปรียบเทียบตามหมวด</h2>
        <p className="mb-4 text-xs text-slate-400 dark:text-slate-500">
          {monthLabel(c.current)} เทียบ {monthLabel(c.previous)}
        </p>
        {c.categoryDeltas.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8">
            <span className="text-3xl">💭</span>
            <p className="text-sm text-slate-400 dark:text-slate-500">ข้อมูลยังไม่เพียงพอ</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-700/40">
            {c.categoryDeltas.map((d) => (
              <li key={d.category} className="flex items-center justify-between py-3 text-sm">
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
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{title} เดือนนี้</p>
      <p className="metric-number mt-1 text-2xl text-slate-900 dark:text-slate-100">{formatMoney(current, currency)}</p>
      <p className={`mt-2 flex items-center gap-1 text-sm ${
        diff === 0 ? "text-slate-400 dark:text-slate-500" : good ? "text-lucky-600 dark:text-lucky-400" : "text-rose-500 dark:text-rose-400"
      }`}>
        {diff === 0 ? <Minus size={14} /> : up ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
        {diff === 0 ? "ไม่เปลี่ยนแปลง" : `${up ? "+" : ""}${formatMoney(diff, currency)} เทียบเดือนที่แล้ว`}
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
        ? "bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400"
        : "bg-lucky-50 dark:bg-lucky-900/30 text-lucky-700 dark:text-lucky-300"
    }`}>
      {up ? "+" : ""}{formatMoney(value, currency)}
    </span>
  );
}
