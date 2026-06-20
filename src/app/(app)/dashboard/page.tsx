import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  Bot,
  CircleDollarSign,
  Lightbulb,
  PiggyBank,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getHouseholdContext } from "@/lib/household";
import { getDashboardData } from "@/lib/dashboard";
import { getCategoryTone } from "@/lib/category-colors";
import { currentMonth, formatMoney, monthLabel } from "@/lib/utils";
import { DonutChart } from "@/components/charts";
import AiSummaryButton from "@/components/AiSummaryButton";
import MonthSwitcher from "@/components/MonthSwitcher";
import ChatPanel from "@/components/ChatPanel";
import Mascot from "@/components/mascot/Mascot";

export const dynamic = "force-dynamic";

interface SavingsGoal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
}

export default async function DashboardPage({ searchParams }: { searchParams: { month?: string } }) {
  const ctx = await getHouseholdContext();
  if (!ctx) redirect("/login");
  if (!ctx.activeHousehold) return <p className="text-slate-500">No household found.</p>;

  const supabase = createClient();
  const raw = searchParams.month;
  const month = /^\d{4}-\d{2}$/.test(raw ?? "") ? raw! : currentMonth();
  const [data, goalsResult] = await Promise.all([
    getDashboardData(supabase, ctx.activeHousehold.id, month),
    supabase.from("savings_goals").select("id, name, target_amount, current_amount").eq("household_id", ctx.activeHousehold.id).order("created_at", { ascending: false }).limit(3),
  ]);
  const goals = (goalsResult.data ?? []) as SavingsGoal[];
  const currency = ctx.activeHousehold.currency;
  const savingsRate = data.income > 0 ? Math.max(0, Math.round((data.balance / data.income) * 100)) : 0;
  const budgetHealth = data.budgets.length ? data.budgets.filter((budget) => budget.pct <= 100).length / data.budgets.length : 1;
  const financialScore = Math.max(0, Math.min(100, Math.round(savingsRate * 0.65 + budgetHealth * 35)));

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-card border border-primary/20 bg-primary-soft p-6 shadow-card md:p-8">
        <div className="relative z-10 max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-primary-contrast"><Sparkles size={12} />Live household workspace</span>
          <h1 className="mt-4 font-display text-3xl font-bold text-ink-strong md:text-4xl">Welcome back to {ctx.activeHousehold.name}</h1>
          <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-600">Your balance is {formatMoney(data.balance, currency)} this month. Keep daily entries accurate and Lucky will turn them into a clearer plan.</p>
          <div className="mt-5 inline-flex max-w-2xl items-start gap-3 rounded-control border border-primary/20 bg-surface px-4 py-3 shadow-card"><Lightbulb size={18} className="mt-0.5 shrink-0 text-caution" /><p className="text-sm leading-6 text-ink"><strong className="text-primary">Lucky&apos;s tip:</strong> {data.insights[0] ?? "Small entries matter. Log them while they are still fresh."}</p></div>
        </div>
        <div className="absolute -bottom-4 right-4 hidden items-end gap-3 xl:flex"><div className="mb-8 rounded-control border border-positive/20 bg-surface px-3 py-2 text-xs font-bold text-positive shadow-card">Lucky is watching the numbers</div><Mascot slot={data.balance >= 0 ? "celebrate" : "shocked"} size={150} /></div>
        <div className="relative z-10 mt-5 flex flex-wrap items-center gap-2"><span className="rounded-control border border-primary/20 bg-surface px-3 py-2 text-xs font-semibold text-ink">{monthLabel(month)}</span><MonthSwitcher month={month} /><AiSummaryButton householdId={ctx.activeHousehold.id} month={month} /></div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total Balance" value={formatMoney(data.balance, currency)} detail={data.balance >= 0 ? "Available after expenses" : "Expenses exceed income"} icon={<Wallet size={20} />} color="orange" />
        <MetricCard label="Monthly Income" value={formatMoney(data.income, currency)} detail="Inflows this cycle" icon={<ArrowUpRight size={20} />} color="emerald" />
        <MetricCard label="Monthly Expenses" value={formatMoney(data.expense, currency)} detail={`${data.recent.filter((row) => row.type === "expense").length} recent expense entries`} icon={<ArrowDownRight size={20} />} color="rose" />
        <MetricCard label="Savings Rate" value={`${savingsRate}%`} detail={savingsRate >= 20 ? "Strong saving pace" : "Room to improve"} icon={<PiggyBank size={20} />} color="sky" />
      </section>

      <section className="grid gap-6 xl:grid-cols-12">
        <div className="card min-h-[430px] overflow-hidden xl:col-span-7"><ChatPanel householdId={ctx.activeHousehold.id} /></div>
        <div className="space-y-6 xl:col-span-5">
          <article className="card p-5">
            <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-muted">AI Financial Score</p><h2 className="mt-1 font-display text-xl font-bold text-ink-strong">Cat-tastic health</h2></div><span className="flex h-11 w-11 items-center justify-center rounded-control bg-positive-soft text-positive"><Bot size={21} /></span></div>
            <div className="mt-5 flex items-center gap-5"><div className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full border-[10px] border-emerald-100"><span className="metric-number text-3xl text-emerald-600">{financialScore}</span><span className="absolute bottom-3 text-[9px] font-bold text-slate-400">/100</span></div><div><p className="text-sm font-bold text-slate-800 dark:text-slate-100">Meow-meter</p><p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">Based on savings rate and current budget health.</p></div></div>
          </article>
          <article className="card p-5"><div className="mb-4 flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-500"><Lightbulb size={19} /></span><div><h2 className="font-display text-lg font-extrabold">Smart Recommendations</h2><p className="text-xs text-slate-400">Generated from this month&apos;s data</p></div></div><ul className="space-y-3">{data.insights.slice(0, 3).map((insight, index) => <li key={index} className="flex gap-3 border-t border-slate-100 pt-3 first:border-0 first:pt-0"><span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-500"><TrendingUp size={14} /></span><p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{insight}</p></li>)}</ul></article>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-12">
        <article className="card p-5 xl:col-span-7"><div className="mb-4 flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-display text-xl font-extrabold">Interactive Mew-lytics</h2><p className="text-sm text-slate-400">Visualizing category footprints and trends</p></div><span className="rounded-full bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-600">{formatMoney(data.expense, currency)} outflows</span></div><div className="grid gap-4 md:grid-cols-[minmax(250px,1fr)_220px] md:items-center"><DonutChart data={data.expenseByCategory} /><CategoryLegend data={data.expenseByCategory} currency={currency} /></div></article>
        <div className="space-y-6 xl:col-span-5">
          <article className="card p-5"><div className="mb-4 flex items-center justify-between"><div><h2 className="font-display text-lg font-extrabold">Cat Paw Track Savings</h2><p className="text-xs text-slate-400">Goal by goal</p></div><Link href="/savings" className="text-xs font-bold text-orange-600">View goals</Link></div>{goals.length ? <div className="space-y-4">{goals.map((goal) => <GoalRow key={goal.id} goal={goal} currency={currency} />)}</div> : <EmptyMini icon={<Target size={20} />} text="No savings goals yet" />}</article>
          <article className="card p-5"><div className="mb-4 flex items-center justify-between"><div><h2 className="font-display text-lg font-extrabold">Category Budgets</h2><p className="text-xs text-slate-400">Monthly guardrails</p></div><Link href="/budgets" className="text-xs font-bold text-orange-600">Manage</Link></div>{data.budgets.length ? <div className="space-y-3">{data.budgets.slice(0, 3).map((budget) => <BudgetRow key={budget.category} budget={budget} currency={currency} />)}</div> : <EmptyMini icon={<ShieldCheck size={20} />} text="No budgets set this month" />}</article>
        </div>
      </section>

      <section className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-line p-5"><div><h2 className="font-display text-xl font-bold text-ink-strong">Recent Claw-actions</h2><p className="text-sm text-ink-muted">Latest household cash flow</p></div><Link href="/transactions" className="btn-outline min-h-10 px-4 py-2 text-xs"><ReceiptText size={15} />View all</Link></div>
        {data.recent.length ? <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left"><thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:bg-slate-800"><tr><th className="px-5 py-3">Details</th><th className="px-5 py-3">Category</th><th className="px-5 py-3">Date</th><th className="px-5 py-3 text-right">Amount</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{data.recent.slice(0, 7).map((tx) => <TransactionRow key={tx.id} tx={tx} currency={currency} />)}</tbody></table></div> : <div className="py-12 text-center text-sm text-slate-400">No transactions yet.</div>}
      </section>
    </div>
  );
}

function MetricCard({ label, value, detail, icon, color }: { label: string; value: string; detail: string; icon: React.ReactNode; color: "orange" | "emerald" | "rose" | "sky" }) {
  const styles = { orange: "bg-orange-50 text-orange-500", emerald: "bg-emerald-50 text-emerald-500", rose: "bg-rose-50 text-rose-500", sky: "bg-sky-50 text-sky-500" }[color];
  return <article className="card relative overflow-hidden p-5"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-ink-muted">{label}</p><p className="metric-number mt-5 text-2xl text-ink-strong md:text-3xl">{value}</p></div><span className={`flex h-11 w-11 items-center justify-center rounded-control ${styles}`}>{icon}</span></div><p className="mt-3 text-xs font-medium text-ink-muted">{detail}</p></article>;
}

function CategoryLegend({ data, currency }: { data: { category: string; amount: number }[]; currency: string }) {
  return <div className="space-y-2">{data.slice(0, 6).map((item) => { const tone = getCategoryTone(item.category); return <div key={item.category} className="flex items-center justify-between gap-3 rounded-xl px-2 py-2 text-xs"><span className="flex min-w-0 items-center gap-2 font-semibold text-slate-600 dark:text-slate-300"><span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: tone.dot }} /><span className="truncate">{item.category}</span></span><span className="shrink-0 font-mono font-semibold text-slate-400">{formatMoney(item.amount, currency)}</span></div>; })}</div>;
}

function GoalRow({ goal, currency }: { goal: SavingsGoal; currency: string }) {
  const pct = Number(goal.target_amount) > 0 ? Math.min(100, Math.round(Number(goal.current_amount) / Number(goal.target_amount) * 100)) : 0;
  return <div><div className="flex items-center justify-between gap-3"><span className="truncate text-sm font-bold text-slate-700 dark:text-slate-200">{goal.name}</span><span className="font-mono text-xs font-bold text-orange-500">{pct}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-gradient-to-r from-orange-300 to-orange-500" style={{ width: `${pct}%` }} /></div><p className="mt-1 text-[10px] text-slate-400">{formatMoney(Number(goal.current_amount), currency)} / {formatMoney(Number(goal.target_amount), currency)}</p></div>;
}

function BudgetRow({ budget, currency }: { budget: { category: string; spent: number; limit: number; pct: number }; currency: string }) {
  const color = budget.pct >= 100 ? "bg-rose-500" : budget.pct >= 85 ? "bg-amber-400" : "bg-emerald-400";
  return <div><div className="flex items-center justify-between gap-3"><span className="text-sm font-bold text-slate-700 dark:text-slate-200">{budget.category}</span><span className="font-mono text-xs font-bold text-slate-500">{budget.pct}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(100, budget.pct)}%` }} /></div><p className="mt-1 text-[10px] text-slate-400">{formatMoney(budget.spent, currency)} / {formatMoney(budget.limit, currency)}</p></div>;
}

function TransactionRow({ tx, currency }: { tx: { item: string; amount: number; type: string; category_name: string | null; date: string }; currency: string }) {
  const tone = getCategoryTone(tx.category_name);
  return <tr className="hover:bg-orange-50/40 dark:hover:bg-slate-800/60"><td className="px-5 py-4 text-sm font-bold text-slate-700 dark:text-slate-200">{tx.item}</td><td className="px-5 py-4"><span className="rounded-full border px-2.5 py-1 text-xs font-semibold" style={{ backgroundColor: tone.bg, borderColor: tone.border, color: tone.text }}>{tx.category_name ?? "Other"}</span></td><td className="px-5 py-4 font-mono text-xs text-slate-400">{tx.date}</td><td className={`px-5 py-4 text-right font-mono text-sm font-bold ${tx.type === "income" ? "text-emerald-500" : "text-rose-500"}`}>{tx.type === "income" ? "+" : "-"}{formatMoney(Number(tx.amount), currency)}</td></tr>;
}

function EmptyMini({ icon, text }: { icon: React.ReactNode; text: string }) {
  return <div className="flex items-center gap-3 rounded-2xl border-2 border-dashed border-slate-100 p-4 text-sm text-slate-400"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50">{icon}</span>{text}</div>;
}
