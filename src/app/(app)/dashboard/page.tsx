import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowDownCircle, ArrowUpCircle, Wallet, Lightbulb, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getHouseholdContext } from "@/lib/household";
import { getDashboardData } from "@/lib/dashboard";
import { getCategoryTone } from "@/lib/category-colors";
import { currentMonth, formatMoney, monthLabel } from "@/lib/utils";
import { DonutChart } from "@/components/charts";
import AiSummaryButton from "@/components/AiSummaryButton";
import MonthSwitcher from "@/components/MonthSwitcher";
import MascotWidget from "./MascotWidget";

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

  const daysInMonth = new Date(Number(month.split("-")[0]), Number(month.split("-")[1]), 0).getDate();
  const today = new Date().getDate();
  const daysLeft = Math.max(daysInMonth - today + 1, 1);
  const dailyRemaining = data.balance > 0 ? data.balance / daysLeft : data.balance;

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────── */}
      <header className="flex flex-col gap-4 border-b border-lucky-100/60 dark:border-slate-800 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lucky-600 dark:text-lucky-400">
            {ctx.activeHousehold.name}
          </p>
          <h1 className="page-title mt-1">แดชบอร์ด 🍀</h1>
          <p className="page-subtitle">{monthLabel(month)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <MonthSwitcher month={month} />
          <AiSummaryButton householdId={ctx.activeHousehold.id} month={month} />
        </div>
      </header>

      {/* ── Mascot widget + Stat cards ──────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[auto_1fr]">
        <MascotWidget
          balance={data.balance}
          dailyRemaining={dailyRemaining}
          currency={currency}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Stat
            label="รายรับ"
            value={formatMoney(data.income, currency)}
            detail="เงินเข้าเดือนนี้"
            icon={<ArrowDownCircle size={20} />}
            tone="income"
          />
          <Stat
            label="รายจ่าย"
            value={formatMoney(data.expense, currency)}
            detail="เงินออกที่บันทึกไว้"
            icon={<ArrowUpCircle size={20} />}
            tone="expense"
          />
          <Stat
            label="เงินเหลือ"
            value={formatMoney(data.balance, currency)}
            detail={savingsRate === null ? "ยังไม่มีรายได้เดือนนี้" : `เก็บได้ ${savingsRate}% ของรายได้`}
            icon={<Wallet size={20} />}
            tone={data.balance >= 0 ? "balance" : "expense"}
          />
        </div>
      </div>

      {/* ── Charts + Insights ───────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="card p-5">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h2 className="section-title">รายจ่ายตามหมวดหมู่</h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                แต่ละหมวดใช้สีเดิมทั่วแอป
              </p>
            </div>
            <span className="rounded-full bg-rose-50 dark:bg-rose-900/30 px-3 py-1 text-xs font-semibold text-rose-600 dark:text-rose-300">
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
            <Sparkles size={16} className="text-amber-400" />
            เกร็ดความรู้
          </h2>
          <ul className="space-y-2.5">
            {data.insights.map((t, i) => (
              <li
                key={i}
                className="rounded-2xl border border-lucky-100/80 bg-lucky-50/60 dark:border-slate-700 dark:bg-slate-800/60 px-3.5 py-2.5 text-sm leading-6 text-slate-700 dark:text-slate-300"
              >
                {t}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* ── Budget meters ───────────────────────────────── */}
      <section className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="section-title">การใช้งบประมาณ</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              เทียบกับลิมิตที่ตั้งไว้ — {monthLabel(month)}
            </p>
          </div>
          <Link
            href="/budgets"
            className="text-xs font-semibold text-lucky-600 hover:text-lucky-800 dark:text-lucky-400 dark:hover:text-lucky-200 transition-colors"
          >
            จัดการ →
          </Link>
        </div>
        {data.budgets.length === 0 ? (
          <p className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 p-4 text-sm text-slate-500 dark:text-slate-400 text-center">
            ยังไม่ได้ตั้งงบประมาณเดือนนี้เลย ~
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {data.budgets.map((b) => (
              <BudgetMeter key={b.category} budget={b} currency={currency} />
            ))}
          </div>
        )}
      </section>

      {/* ── Recent transactions ─────────────────────────── */}
      <section className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="section-title">รายการล่าสุด</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              จากแชต, กรอกเอง, และสแกนใบเสร็จ
            </p>
          </div>
          <Link
            href="/transactions"
            className="text-xs font-semibold text-lucky-600 hover:text-lucky-800 dark:text-lucky-400 dark:hover:text-lucky-200 transition-colors"
          >
            ดูทั้งหมด →
          </Link>
        </div>
        {data.recent.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 py-8 flex flex-col items-center gap-2">
            <span className="text-3xl">😴</span>
            <p className="text-sm text-slate-500 dark:text-slate-400">วันนี้ไม่มีรายการเลย เก่งมาก!</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {data.recent.map((t) => {
              const tone = getCategoryTone(t.category_name);
              return (
                <li key={t.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl"
                      style={{ backgroundColor: tone.bg, color: tone.text }}
                    >
                      {t.type === "income" ? <ArrowDownCircle size={17} /> : <ArrowUpCircle size={17} />}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {t.item}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <CategoryBadge category={t.category_name} />
                        <span className="tabular-nums">{t.date}</span>
                      </div>
                    </div>
                  </div>
                  <span
                    className={
                      t.type === "income"
                        ? "metric-number text-sm text-lucky-600 dark:text-lucky-400"
                        : "metric-number text-sm text-rose-500 dark:text-rose-400"
                    }
                  >
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
              <span className="truncate font-medium text-slate-700 dark:text-slate-300">{item.category}</span>
            </div>
            <span className="metric-number shrink-0 text-slate-500 dark:text-slate-400">{formatMoney(item.amount, currency)}</span>
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
      {category ?? "อื่นๆ"}
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
  const isOver = budget.pct >= 100;

  return (
    <div className={`rounded-2xl border p-4 transition-colors ${isOver ? "border-rose-200 bg-rose-50 dark:border-rose-900/50 dark:bg-rose-950/30" : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/50"}`}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <CategoryBadge category={budget.category} />
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {formatMoney(budget.spent, currency)} / {formatMoney(budget.limit, currency)}
          </p>
        </div>
        <span className="metric-number text-sm font-bold" style={{ color: statusColor }}>
          {budget.pct}%
          {isOver && " 🙀"}
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${Math.min(budget.pct, 100)}%`, backgroundColor: statusColor }}
        />
      </div>
    </div>
  );
}

function Stat({
  label, value, detail, icon, tone,
}: {
  label: string;
  value: string;
  detail: string;
  icon: React.ReactNode;
  tone: "income" | "expense" | "balance";
}) {
  const styles = {
    income: {
      bg: "bg-lucky-50 dark:bg-lucky-900/20",
      text: "text-lucky-700 dark:text-lucky-400",
      ring: "ring-lucky-100 dark:ring-lucky-900/40",
    },
    expense: {
      bg: "bg-rose-50 dark:bg-rose-900/20",
      text: "text-rose-600 dark:text-rose-400",
      ring: "ring-rose-100 dark:ring-rose-900/40",
    },
    balance: {
      bg: "bg-sky-50 dark:bg-sky-900/20",
      text: "text-sky-700 dark:text-sky-400",
      ring: "ring-sky-100 dark:ring-sky-900/40",
    },
  }[tone];

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
          <p className={`metric-number mt-3 text-2xl md:text-[1.7rem] ${styles.text}`}>{value}</p>
        </div>
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${styles.bg} ${styles.text} ring-1 ${styles.ring}`}>
          {icon}
        </span>
      </div>
      <p className="mt-4 text-xs leading-5 text-slate-500 dark:text-slate-400">{detail}</p>
    </div>
  );
}
