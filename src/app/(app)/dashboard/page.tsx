import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowDownCircle, ArrowUpCircle, CalendarDays, Sparkles, Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getHouseholdContext } from "@/lib/household";
import { getDashboardData } from "@/lib/dashboard";
import { getCategoryTone } from "@/lib/category-colors";
import { currentMonth, formatMoney, monthLabel } from "@/lib/utils";
import { DonutChart } from "@/components/charts";
import AiSummaryButton from "@/components/AiSummaryButton";
import MonthSwitcher from "@/components/MonthSwitcher";
import CatDecor from "@/components/CatDecor";
import MascotWidget from "./MascotWidget";

export const dynamic = "force-dynamic";

export default async function DashboardPage({ searchParams }: { searchParams: { month?: string } }) {
  const ctx = await getHouseholdContext();
  if (!ctx) redirect("/login");
  if (!ctx.activeHousehold) return <p className="text-slate-500">No household found.</p>;

  const supabase = createClient();
  const raw = searchParams.month;
  const month = /^\d{4}-\d{2}$/.test(raw ?? "") ? raw! : currentMonth();
  const data = await getDashboardData(supabase, ctx.activeHousehold.id, month);
  const currency = ctx.activeHousehold.currency;
  const savingsRate = data.income > 0 ? Math.round((data.balance / data.income) * 100) : null;
  const daysInMonth = new Date(Number(month.split("-")[0]), Number(month.split("-")[1]), 0).getDate();
  const today = new Date().getDate();
  const daysLeft = Math.max(daysInMonth - today + 1, 1);
  const dailyRemaining = data.balance > 0 ? data.balance / daysLeft : data.balance;

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-[2.25rem] border border-cream-200/80 bg-gradient-to-br from-cream-50 via-lucky-50 to-cream-100 p-5 shadow-puff dark:border-[#403833] dark:from-[#2e2825] dark:via-[#352e2a] dark:to-[#241f1c] md:p-7">
        <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-lucky-200/35 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-grape-200/25 blur-3xl" />
        <CatDecor pose="walk" size={118} className="absolute bottom-2 right-8 hidden opacity-90 lg:block" flip />
        <div className="relative grid gap-5 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-lucky-600 dark:text-lucky-300">{ctx.activeHousehold.name}</p>
            <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-lucky-900 dark:text-cream-50 md:text-5xl">Cozy money dashboard</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-lucky-700/80 dark:text-slate-300">A soft bento workspace for tracking spending, budgets, and your cat-powered savings mood.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 lg:justify-end">
            <span className="inline-flex min-h-10 items-center gap-2 rounded-full border border-cream-200 bg-cream-50/80 px-4 text-sm font-semibold text-lucky-700 dark:border-[#403833] dark:bg-[#2e2825] dark:text-lucky-200"><CalendarDays size={16} />{monthLabel(month)}</span>
            <MonthSwitcher month={month} />
            <AiSummaryButton householdId={ctx.activeHousehold.id} month={month} />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="xl:col-span-4"><MascotWidget balance={data.balance} dailyRemaining={dailyRemaining} currency={currency} /></div>
        <div className="grid gap-5 sm:grid-cols-3 xl:col-span-8">
          <Stat label="Income" value={formatMoney(data.income, currency)} detail="Money in this month" icon={<ArrowDownCircle size={20} />} tone="income" />
          <Stat label="Expenses" value={formatMoney(data.expense, currency)} detail="Recorded spending" icon={<ArrowUpCircle size={20} />} tone="expense" />
          <Stat label="Balance" value={formatMoney(data.balance, currency)} detail={savingsRate === null ? "No income recorded this month" : `Saving ${savingsRate}% of income`} icon={<Wallet size={20} />} tone={data.balance >= 0 ? "balance" : "expense"} />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="card overflow-hidden p-5 xl:col-span-7 xl:row-span-2">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-lucky-500">Spending map</p><h2 className="section-title mt-1 text-xl">Expenses by category</h2><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Warm harmonized tones keep the chart calm and readable.</p></div>
            <span className="rounded-full border border-peach-100 bg-peach-50 px-3 py-1 text-xs font-bold text-peach-600 dark:border-[#5a2e26] dark:bg-[#3a201a] dark:text-peach-300">{formatMoney(data.expense, currency)}</span>
          </div>
          <div className="grid gap-5 md:grid-cols-[minmax(260px,1fr)_240px] md:items-center"><DonutChart data={data.expenseByCategory} /><CategoryLegend data={data.expenseByCategory} currency={currency} /></div>
        </div>

        <div className="card p-5 xl:col-span-5">
          <div className="mb-4 flex items-center gap-2"><span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-grape-100 text-grape-500 dark:bg-[#3a3024]"><Sparkles size={17} /></span><div><h2 className="section-title">Smart nudges</h2><p className="text-xs text-slate-500 dark:text-slate-400">Tiny reminders, soft tone.</p></div></div>
          <ul className="space-y-3">{data.insights.map((t, i) => <li key={i} className="rounded-[1.35rem] border border-cream-200/80 bg-cream-50/80 px-4 py-3 text-sm leading-6 text-slate-700 shadow-soft dark:border-[#403833] dark:bg-[#352e2a] dark:text-slate-300">{t}</li>)}</ul>
        </div>

        <div className="card p-5 xl:col-span-5">
          <div className="mb-4 flex items-center justify-between gap-4"><div><h2 className="section-title">Budget clay meters</h2><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Soft pressure against monthly limits.</p></div><Link href="/budgets" className="rounded-full bg-lucky-50 px-3 py-1 text-xs font-bold text-lucky-600 transition-colors hover:bg-lucky-100 dark:bg-[#352e2a] dark:text-lucky-300">Manage</Link></div>
          {data.budgets.length === 0 ? <div className="flex items-center gap-4 rounded-[1.35rem] border-2 border-dashed border-cream-200 bg-cream-50/70 p-4 dark:border-[#403833] dark:bg-[#352e2a]"><CatDecor pose="sit" size={64} /><p className="text-sm text-slate-500 dark:text-slate-400">No budgets set for this month yet</p></div> : <div className="grid gap-3">{data.budgets.slice(0, 3).map((b) => <BudgetMeter key={b.category} budget={b} currency={currency} />)}</div>}
        </div>
      </section>

      <section className="card p-5">
        <div className="mb-4 flex items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-lucky-500">Activity stream</p><h2 className="section-title mt-1">Recent transactions</h2></div><Link href="/transactions" className="rounded-full bg-lucky-50 px-3 py-1 text-xs font-bold text-lucky-600 transition-colors hover:bg-lucky-100 dark:bg-[#352e2a] dark:text-lucky-300">View all</Link></div>
        {data.recent.length === 0 ? <div className="flex flex-col items-center gap-3 rounded-[1.5rem] border-2 border-dashed border-cream-200 bg-cream-50/70 py-10 dark:border-[#403833] dark:bg-[#352e2a]"><CatDecor pose="sleep" size={100} /><p className="text-sm text-slate-500 dark:text-slate-400">No transactions today. Well done!</p></div> : <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{data.recent.slice(0, 6).map((t) => <RecentTransaction key={t.id} tx={t} currency={currency} />)}</ul>}
      </section>
    </div>
  );
}

function RecentTransaction({ tx, currency }: { tx: { id: string; item: string; amount: number; type: string; category_name: string | null; date: string }; currency: string }) {
  const tone = getCategoryTone(tx.category_name);
  const isIncome = tx.type === "income";
  return (
    <li className="rounded-[1.35rem] border border-cream-200/80 bg-cream-50/75 p-4 shadow-soft dark:border-[#403833] dark:bg-[#352e2a]">
      <div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl" style={{ backgroundColor: tone.bg, color: tone.text }}>{isIncome ? <ArrowDownCircle size={18} /> : <ArrowUpCircle size={18} />}</span><div className="min-w-0"><p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">{tx.item}</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{tx.date}</p></div></div><span className={isIncome ? "metric-number text-sm text-[#5f7a54] dark:text-[#9cb88f]" : "metric-number text-sm text-peach-600 dark:text-peach-300"}>{isIncome ? "+" : "-"}{formatMoney(Number(tx.amount), currency)}</span></div>
      <div className="mt-3"><CategoryBadge category={tx.category_name} /></div>
    </li>
  );
}

function CategoryLegend({ data, currency }: { data: { category: string; amount: number }[]; currency: string }) {
  if (!data.length) return null;
  return <div className="space-y-2">{data.slice(0, 7).map((item) => { const tone = getCategoryTone(item.category); return <div key={item.category} className="flex items-center justify-between gap-3 rounded-2xl border border-cream-200/70 bg-cream-50/70 px-3 py-2 text-sm dark:border-[#403833] dark:bg-[#352e2a]"><div className="flex min-w-0 items-center gap-2"><span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: tone.dot }} /><span className="truncate font-semibold text-slate-700 dark:text-slate-300">{item.category}</span></div><span className="metric-number shrink-0 text-slate-500 dark:text-slate-400">{formatMoney(item.amount, currency)}</span></div>; })}</div>;
}

function CategoryBadge({ category }: { category: string | null }) {
  const tone = getCategoryTone(category);
  return <span className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-semibold" style={{ backgroundColor: tone.bg, borderColor: tone.border, color: tone.text }}><span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: tone.dot }} />{category ?? "Other"}</span>;
}

function BudgetMeter({ budget, currency }: { budget: { category: string; spent: number; limit: number; pct: number }; currency: string }) {
  const tone = getCategoryTone(budget.category);
  const statusColor = budget.pct >= 100 ? "#c0685e" : budget.pct >= 85 ? "#d9a45b" : tone.fill;
  const isOver = budget.pct >= 100;
  return <div className={isOver ? "rounded-[1.35rem] border border-peach-200 bg-peach-50 p-4 dark:border-[#5a2e26] dark:bg-[#2e1813]" : "rounded-[1.35rem] border border-cream-200 bg-cream-50/75 p-4 dark:border-[#403833] dark:bg-[#352e2a]"}><div className="mb-3 flex items-start justify-between gap-3"><div className="min-w-0"><CategoryBadge category={budget.category} /><p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{formatMoney(budget.spent, currency)} / {formatMoney(budget.limit, currency)}</p></div><span className="metric-number text-sm font-bold" style={{ color: statusColor }}>{budget.pct}%{isOver && " 🙀"}</span></div><div className="h-3 overflow-hidden rounded-full bg-cream-200 dark:bg-[#403833]"><div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(budget.pct, 100)}%`, backgroundColor: statusColor }} /></div></div>;
}

function Stat({ label, value, detail, icon, tone }: { label: string; value: string; detail: string; icon: React.ReactNode; tone: "income" | "expense" | "balance" }) {
  const styles = {
    income: { shell: "from-[#eef2ea] to-cream-50 dark:from-[#2a3326] dark:to-[#2e2825]", bg: "bg-[#eef2ea] dark:bg-[#2a3326]", text: "text-[#5f7a54] dark:text-[#9cb88f]", ring: "ring-[#cfdcc6] dark:ring-[#3a4a33]" },
    expense: { shell: "from-peach-50 to-cream-50 dark:from-[#3a201a] dark:to-[#2e2825]", bg: "bg-peach-50 dark:bg-[#3a201a]", text: "text-peach-600 dark:text-peach-300", ring: "ring-peach-100 dark:ring-[#5a2e26]" },
    balance: { shell: "from-sky-100 to-cream-50 dark:from-[#26303a] dark:to-[#2e2825]", bg: "bg-sky-100 dark:bg-[#26303a]", text: "text-sky-500 dark:text-sky-300", ring: "ring-sky-200 dark:ring-[#33414d]" },
  }[tone];
  return <div className={`relative overflow-hidden rounded-[2rem] border border-cream-200/80 bg-gradient-to-br p-5 shadow-puff dark:border-[#403833] ${styles.shell}`}><div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/35 blur-2xl dark:bg-white/5" /><div className="relative flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{label}</p><p className={`metric-number mt-3 text-2xl md:text-[1.7rem] ${styles.text}`}>{value}</p></div><span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${styles.bg} ${styles.text} ring-1 ${styles.ring}`}>{icon}</span></div><p className="relative mt-4 text-xs leading-5 text-slate-500 dark:text-slate-400">{detail}</p></div>;
}
