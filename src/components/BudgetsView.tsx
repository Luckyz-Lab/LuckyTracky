"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Category, Budget } from "@/lib/supabase/types";
import { getCategoryTone, getCategoryEmoji } from "@/lib/category-colors";
import { formatMoney, monthLabel } from "@/lib/utils";
import CatDecor from "./CatDecor";

interface BudgetRow extends Budget {
  category_name: string;
  spent: number;
}

export default function BudgetsView({
  householdId,
  currency,
  month,
  expenseCategories,
  budgets,
}: {
  householdId: string;
  currency: string;
  month: string;
  expenseCategories: Category[];
  budgets: BudgetRow[];
}) {
  const router = useRouter();
  const [categoryId, setCategoryId] = useState(expenseCategories[0]?.id ?? "");
  const [limit, setLimit] = useState("");
  const [saving, setSaving] = useState(false);

  async function add() {
    if (!categoryId || !limit) return;
    setSaving(true);
    await fetch("/api/budgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ household_id: householdId, category_id: categoryId, month, limit_amount: Number(limit) }),
    });
    setSaving(false);
    setLimit("");
    router.refresh();
  }

  async function remove(id: string) {
    await fetch(`/api/budgets?id=${id}`, { method: "DELETE" });
    router.refresh();
  }

  const overCount = budgets.filter((b) => {
    const pct = b.limit_amount ? Math.round((b.spent / Number(b.limit_amount)) * 100) : 0;
    return pct >= 100;
  }).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="relative overflow-hidden rounded-[2.25rem] border border-cream-200/80 bg-gradient-to-br from-cream-50 via-lucky-50 to-cream-100 p-5 shadow-puff dark:border-[#403833] dark:from-[#2e2825] dark:via-[#352e2a] dark:to-[#241f1c]">
        <div className="pointer-events-none absolute -right-14 -top-14 h-48 w-48 rounded-full bg-lucky-200/35 blur-3xl" />
        <CatDecor pose="sit" size={104} className="absolute bottom-0 right-8 hidden opacity-90 md:block" />
        <div className="relative max-w-xl">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-lucky-500">Budget studio</p>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-lucky-900 dark:text-cream-50">Clay budget meters</h1>
          <p className="page-subtitle">Set spending limits by category — {monthLabel(month)}</p>
        </div>
        <AnimatePresence>
          {overCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="relative mt-4 flex items-center gap-3 rounded-2xl border border-peach-200 bg-peach-50 px-4 py-3 dark:border-[#5a2e26] dark:bg-[#3a201a]"
            >
              <span className="text-2xl">🙀</span>
              <p className="text-sm font-semibold text-peach-700 dark:text-peach-300">
                Watch out! {overCount} budget(s) exceeded 🙀
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Add budget form */}
      <section className="card grid gap-4 p-5 lg:grid-cols-[1fr_180px_auto] lg:items-end">
        <div className="min-w-[180px] flex-1">
          <label className="label">Category</label>
          <select className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            {expenseCategories.map((c) => (
              <option key={c.id} value={c.id}>{getCategoryEmoji(c.name)} {c.name}</option>
            ))}
          </select>
        </div>
        <div className="w-44">
          <label className="label">Monthly limit (฿)</label>
          <input className="input" type="number" value={limit} onChange={(e) => setLimit(e.target.value)} placeholder="0" />
        </div>
        <button onClick={add} disabled={saving || !limit} className="btn-primary">
          {saving ? <Loader2 size={16} className="animate-spin" /> : "➕ Set budget"}
        </button>
      </section>

      {/* Budget meters */}
      <section className="card p-5">
        {budgets.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-[1.5rem] border-2 border-dashed border-cream-200 bg-cream-50/70 py-10 text-center dark:border-[#403833] dark:bg-[#352e2a]">
            <CatDecor pose="sleep" size={90} />
            <p className="text-sm text-slate-500 dark:text-slate-400">No budgets set for this month yet</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence>
              {budgets.map((b) => {
                const pct = b.limit_amount ? Math.round((b.spent / Number(b.limit_amount)) * 100) : 0;
                const tone = getCategoryTone(b.category_name);
                const emoji = getCategoryEmoji(b.category_name);
                const isOver = pct >= 100;
                const isWarn = pct >= 85 && pct < 100;
                const barColor = isOver ? "#c0685e" : isWarn ? "#d9a45b" : tone.fill;

                return (
                  <motion.div
                    key={b.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={`space-y-3 rounded-[1.6rem] border p-4 shadow-soft transition-all hover:-translate-y-0.5 ${
                      isOver
                        ? "border-peach-200 bg-peach-50 dark:border-[#5a2e26] dark:bg-[#3a201a]"
                        : "border-cream-200 bg-cream-50/75 dark:border-[#403833] dark:bg-[#352e2a]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-xl"
                          style={{ backgroundColor: tone.bg }}
                        >
                          {emoji}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{b.category_name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {formatMoney(b.spent, currency)} / {formatMoney(Number(b.limit_amount), currency)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`metric-number text-sm font-bold ${
                          isOver ? "text-peach-600 dark:text-peach-300" : isWarn ? "text-grape-500 dark:text-grape-300" : "text-slate-600 dark:text-slate-300"
                        }`}>
                          {pct}%{isOver ? " 🙀" : isWarn ? " ⚠️" : ""}
                        </span>
                        <button onClick={() => remove(b.id)} className="rounded-full p-1.5 text-slate-300 transition-colors hover:bg-peach-50 hover:text-peach-600 dark:hover:bg-[#5a2e26]">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="h-3 overflow-hidden rounded-full bg-cream-200 dark:bg-[#403833]">
                      <motion.div
                        className="h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(pct, 100)}%` }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        style={{ backgroundColor: barColor }}
                      />
                    </div>

                    {isOver && (
                      <p className="text-xs font-medium text-peach-600 dark:text-peach-300">
                        Over by {formatMoney(b.spent - Number(b.limit_amount), currency)} — watch out!
                      </p>
                    )}
                    {isWarn && !isOver && (
                      <p className="text-xs font-medium text-grape-500 dark:text-grape-300">
                        Almost full — {formatMoney(Number(b.limit_amount) - b.spent, currency)} left
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </section>
    </div>
  );
}
