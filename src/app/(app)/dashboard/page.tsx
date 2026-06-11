import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowDownCircle, ArrowUpCircle, Wallet, Lightbulb } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getHouseholdContext } from "@/lib/household";
import { getDashboardData } from "@/lib/dashboard";
import { currentMonth, formatMoney, monthLabel } from "@/lib/utils";
import { DonutChart } from "@/components/charts";
import AiSummaryButton from "@/components/AiSummaryButton";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const ctx = await getHouseholdContext();
  if (!ctx) redirect("/login");
  if (!ctx.activeHousehold) {
    return <p className="text-zinc-500">No household found.</p>;
  }

  const supabase = createClient();
  const month = currentMonth();
  const data = await getDashboardData(supabase, ctx.activeHousehold.id, month);
  const currency = ctx.activeHousehold.currency;

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-zinc-500">{monthLabel(month)} overview</p>
        </div>
        <AiSummaryButton householdId={ctx.activeHousehold.id} month={month} />
      </header>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat label="Income" value={formatMoney(data.income, currency)} icon={<ArrowDownCircle className="text-brand-600" />} tone="text-brand-600" />
        <Stat label="Expenses" value={formatMoney(data.expense, currency)} icon={<ArrowUpCircle className="text-rose-500" />} tone="text-rose-500" />
        <Stat label="Balance" value={formatMoney(data.balance, currency)} icon={<Wallet className="text-zinc-600" />} tone={data.balance >= 0 ? "text-brand-600" : "text-rose-500"} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Expense breakdown */}
        <section className="card p-5">
          <h2 className="mb-3 text-sm font-semibold text-zinc-700">Expenses by category</h2>
          <DonutChart data={data.expenseByCategory} />
        </section>

        {/* Insights */}
        <section className="card p-5">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-700">
            <Lightbulb size={16} className="text-amber-500" /> Insights
          </h2>
          <ul className="space-y-2">
            {data.insights.map((t, i) => (
              <li key={i} className="rounded-lg bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
                {t}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Budgets */}
      <section className="card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-700">Budget usage</h2>
          <Link href="/budgets" className="text-xs font-medium text-brand-600 hover:underline">
            Manage
          </Link>
        </div>
        {data.budgets.length === 0 ? (
          <p className="text-sm text-zinc-400">No budgets set for this month.</p>
        ) : (
          <div className="space-y-3">
            {data.budgets.map((b) => (
              <div key={b.category}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{b.category}</span>
                  <span className="text-zinc-500">
                    {formatMoney(b.spent, currency)} / {formatMoney(b.limit, currency)}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
                  <div
                    className={`h-full rounded-full ${b.pct >= 100 ? "bg-rose-500" : b.pct >= 85 ? "bg-amber-500" : "bg-brand-500"}`}
                    style={{ width: `${Math.min(b.pct, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent */}
      <section className="card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-700">Recent transactions</h2>
          <Link href="/transactions" className="text-xs font-medium text-brand-600 hover:underline">
            View all
          </Link>
        </div>
        {data.recent.length === 0 ? (
          <p className="text-sm text-zinc-400">No transactions yet.</p>
        ) : (
          <ul className="divide-y divide-zinc-100">
            {data.recent.map((t) => (
              <li key={t.id} className="flex items-center justify-between py-2.5">
                <div className="flex items-center gap-3">
                  {t.type === "income" ? (
                    <ArrowDownCircle size={18} className="text-brand-600" />
                  ) : (
                    <ArrowUpCircle size={18} className="text-rose-500" />
                  )}
                  <div>
                    <p className="text-sm font-medium">{t.item}</p>
                    <p className="text-xs text-zinc-400">
                      {t.category_name} · {t.date}
                    </p>
                  </div>
                </div>
                <span className={t.type === "income" ? "font-medium text-brand-600" : "font-medium text-rose-500"}>
                  {t.type === "income" ? "+" : "-"}
                  {formatMoney(Number(t.amount), currency)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone: string;
}) {
  return (
    <div className="card flex items-center justify-between p-5">
      <div>
        <p className="text-xs font-medium text-zinc-500">{label}</p>
        <p className={`mt-1 text-2xl font-bold ${tone}`}>{value}</p>
      </div>
      <div className="opacity-80">{icon}</div>
    </div>
  );
}
