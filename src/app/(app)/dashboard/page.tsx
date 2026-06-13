import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowDownCircle, ArrowUpCircle, Wallet, Lightbulb } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getHouseholdContext } from "@/lib/household";
import { getDashboardData } from "@/lib/dashboard";
import { getCategoryTone } from "@/lib/category-colors";
import { currentMonth, formatMoney, monthLabel } from "@/lib/utils";
import { DonutChart } from "@/components/charts";
import AiSummaryButton from "@/components/AiSummaryButton";
import MonthSwitcher from "@/components/MonthSwitcher";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { month?: string };
}) {
  const ctx = await getHouseholdContext();
  if (!ctx) redirect("/login");
  if (!ctx.activeHousehold) {
    return <p className="text-slate-500">No household found.</p>;
  }

  const supabase = createClient();
  const raw = searchParams.month;
  const month = /^\d{4}-\d{2}$/.test(raw ?? "") ? raw! : currentMonth();
  const data = await getDashboardData(supabase, ctx.activeHousehold.id, month);
  const currency = ctx.activeHousehold.currency;
  const savingsRate = data.income > 0 ? Math.round((data.balance / data.income) * 100) : null;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 border-b border-slate-200 dark:border-slate-800 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700 dark:text-brand-400">Household overview</p>
          <h1 className="page-title mt-2">Dashboard</h1>
          <p className="page-subtitle">{ctx.activeHousehold.name}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <MonthSwitcher month={month} />
          <AiSummaryButton householdId={ctx.activeHousehold.id} month={month} />
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat
          label="Income"
          value={formatMoney(data.income, currency)}
          detail="Money in this month"
          icon={<ArrowDownCircle size={20} />}
          tone="income"
        />
        <Stat
          label="Expenses"
          value={formatMoney(data.expense, currency)}
          detail="Tracked spending"
          icon={<ArrowUpCircle size={20} />}
          tone="expense"
        />
        <Stat
          label="Balance"
          value={formatMoney(data.balance, currency)}
          detail={savingsRate === null ? "No income yet" : `${savingsRate}% of income left`}
          icon={<Wallet size={20} />}
          tone={data.balance >= 0 ? "balance" : "expense"}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="card p-5">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h2 className="section-title">Expenses by category</h2>
              <p className="mt-1 text-xs text-slate-500">Each category keeps a stable color across the app.</p>
            </div>
            <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700">
              {formatMoney(data.expense, currency)}
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-[minmax(240px,1fr)_220px] md:items-center">
            <DonutChart data={data.expenseByCategory} />
            <CategoryLegend data={data.expenseByCategory} currency={currency} />
          </div>
        </section>

        <section className="card p-5">
          <h2 className="section-title mb-3 flex items-center gap-2">
            <Lightbulb size={16} className="text-amber-500" /> Insights
          </h2>
          <ul className="space-y-2.5">
            {data.insights.map((t, i) => (
              <li key={i} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm leading-6 text-slate-600">
                {t}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="section-title">Budget usage</h2>
            <p className="mt-1 text-xs text-slate-500">Spend against category limits for {monthLabel(month)}.</p>
          </div>
          <Link href="/budgets" className="text-xs font-semibold text-brand-700 hover:text-brand-900">
            Manage
          </Link>
        </div>
        {data.budgets.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
            No budgets set for this month.
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {data.budgets.map((b) => (
              <BudgetMeter key={b.category} budget={b} currency={currency} />
            ))}
          </div>
        )}
      </section>

      <section className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="section-title">Recent transactions</h2>
            <p className="mt-1 text-xs text-slate-500">Latest records from chat, manual entry, and receipts.</p>
          </div>
          <Link href="/transactions" className="text-xs font-semibold text-brand-700 hover:text-brand-900">
            View all
          </Link>
        </div>
        {data.recent.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">No transactions yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {data.recent.map((t) => {
              const tone = getCategoryTone(t.category_name);
              return (
                <li key={t.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                      style={{ backgroundColor: tone.bg, color: tone.text }}
                    >
                      {t.type === "income" ? <ArrowDownCircle size={17} /> : <ArrowUpCircle size={17} />}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">{t.item}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <CategoryBadge category={t.category_name} />
                        <span className="tabular-nums">{t.date}</span>
                      </div>
                    </div>
                  </div>
                  <span className={t.type === "income" ? "metric-number text-sm text-brand-700" : "metric-number text-sm text-rose-600"}>
                    {t.type === "income" ? "+" : "-"}
                    {formatMoney(Number(t.amount), currency)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function CategoryLegend({ data, currency }: { data: { category: string; amount: number }[]; currency: string }) {
  if (!data.length) return null;

  return (
    <div className="space-y-2">
      {data.slice(0, 7).map((item) => {
        const tone = getCategoryTone(item.category);
        return (
          <div key={item.category} className="flex items-center justify-between gap-3 text-sm">
            <div className="flex min-w-0 items-center gap-2">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: tone.dot }} />
              <span className="truncate font-medium text-slate-700">{item.category}</span>
            </div>
            <span className="metric-number shrink-0 text-slate-500">{formatMoney(item.amount, currency)}</span>
          </div>
        );
      })}
    </div>
  );
}

function CategoryBadge({ category }: { category: string | null }) {
  const tone = getCategoryTone(category);
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-medium"
      style={{ backgroundColor: tone.bg, borderColor: tone.border, color: tone.text }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: tone.dot }} />
      {category ?? "Other"}
    </span>
  );
}

function BudgetMeter({
  budget,
  currency,
}: {
  budget: { category: string; spent: number; limit: number; pct: number };
  currency: string;
}) {
  const tone = getCategoryTone(budget.category);
  const statusColor = budget.pct >= 100 ? "#e11d48" : budget.pct >= 85 ? "#d97706" : tone.fill;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <CategoryBadge category={budget.category} />
          <p className="mt-2 text-xs text-slate-500">
            {formatMoney(budget.spent, currency)} / {formatMoney(budget.limit, currency)}
          </p>
        </div>
        <span className="metric-number text-sm" style={{ color: statusColor }}>
          {budget.pct}%
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${Math.min(budget.pct, 100)}%`, backgroundColor: statusColor }}
        />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  detail,
  icon,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  icon: React.ReactNode;
  tone: "income" | "expense" | "balance";
}) {
  const styles = {
    income: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      ring: "ring-emerald-100",
    },
    expense: {
      bg: "bg-rose-50",
      text: "text-rose-600",
      ring: "ring-rose-100",
    },
    balance: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      ring: "ring-blue-100",
    },
  }[tone];

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
          <p className={`metric-number mt-3 text-2xl md:text-[1.7rem] ${styles.text}`}>{value}</p>
        </div>
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${styles.bg} ${styles.text} ring-1 ${styles.ring}`}>
          {icon}
        </span>
      </div>
      <p className="mt-4 text-xs leading-5 text-slate-500">{detail}</p>
    </div>
  );
}
