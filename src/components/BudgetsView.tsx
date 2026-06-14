"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Category, Budget } from "@/lib/supabase/types";
import { getCategoryTone, getCategoryEmoji } from "@/lib/category-colors";
import { formatMoney, monthLabel } from "@/lib/utils";

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
      <header className="flex flex-col gap-3 border-b border-lucky-100/60 dark:border-slate-800 pb-5">
        <div>
          <h1 className="page-title">งบประมาณ 💰</h1>
          <p className="page-subtitle">กำหนดลิมิตรายจ่ายตามหมวดหมู่ — {monthLabel(month)}</p>
        </div>
        {/* Over-budget alert */}
        <AnimatePresence>
          {overCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="flex items-center gap-3 rounded-2xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50 px-4 py-3"
            >
              <span className="text-2xl">🙀</span>
              <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">
                แงงง ช็อตแล้วเมี้ยว! {overCount} หมวดเกินงบแล้ว 🙀
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Add budget form */}
      <section className="card flex flex-wrap items-end gap-3 p-5">
        <div className="min-w-[180px] flex-1">
          <label className="label">หมวดหมู่</label>
          <select className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            {expenseCategories.map((c) => (
              <option key={c.id} value={c.id}>{getCategoryEmoji(c.name)} {c.name}</option>
            ))}
          </select>
        </div>
        <div className="w-44">
          <label className="label">ลิมิตต่อเดือน (฿)</label>
          <input className="input" type="number" value={limit} onChange={(e) => setLimit(e.target.value)} placeholder="0" />
        </div>
        <button onClick={add} disabled={saving || !limit} className="btn-primary">
          {saving ? <Loader2 size={16} className="animate-spin" /> : "➕ ตั้งงบ"}
        </button>
      </section>

      {/* Budget meters */}
      <section className="card p-5">
        {budgets.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <span className="text-4xl">💸</span>
            <p className="text-sm text-slate-500 dark:text-slate-400">ยังไม่ได้ตั้งงบประมาณเดือนนี้เลย ~</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <AnimatePresence>
              {budgets.map((b) => {
                const pct = b.limit_amount ? Math.round((b.spent / Number(b.limit_amount)) * 100) : 0;
                const tone = getCategoryTone(b.category_name);
                const emoji = getCategoryEmoji(b.category_name);
                const isOver = pct >= 100;
                const isWarn = pct >= 85 && pct < 100;
                const barColor = isOver ? "#e11d48" : isWarn ? "#d97706" : tone.fill;

                return (
                  <motion.div
                    key={b.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={`rounded-2xl border p-4 space-y-3 transition-colors ${
                      isOver
                        ? "border-rose-200 bg-rose-50 dark:border-rose-900/50 dark:bg-rose-950/30"
                        : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/50"
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
                          isOver ? "text-rose-600 dark:text-rose-400" : isWarn ? "text-amber-600 dark:text-amber-400" : "text-slate-600 dark:text-slate-300"
                        }`}>
                          {pct}%{isOver ? " 🙀" : isWarn ? " ⚠️" : ""}
                        </span>
                        <button onClick={() => remove(b.id)} className="rounded-full p-1.5 text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-900/30 hover:text-rose-500 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                      <motion.div
                        className="h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(pct, 100)}%` }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        style={{ backgroundColor: barColor }}
                      />
                    </div>

                    {isOver && (
                      <p className="text-xs font-medium text-rose-600 dark:text-rose-400">
                        เกินงบ {formatMoney(b.spent - Number(b.limit_amount), currency)} — ระวังหน่อยนะ!
                      </p>
                    )}
                    {isWarn && !isOver && (
                      <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
                        ใกล้เต็มแล้ว เหลืออีก {formatMoney(Number(b.limit_amount) - b.spent, currency)}
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
