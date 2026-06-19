"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarClock, Loader2, Pause, Play, Plus, Repeat2, Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { Category, RecurringCadence, RecurringRule, TxType } from "@/lib/supabase/types";
import { formatMoney } from "@/lib/utils";
import { getCategoryTone } from "@/lib/category-colors";

function cadenceMonthlyAmount(amount: number, cadence: RecurringCadence) {
  if (cadence === "weekly") return amount * 52 / 12;
  if (cadence === "yearly") return amount / 12;
  return amount;
}

export default function RecurringExpensesView({ categories, currency }: { categories: Category[]; currency: string }) {
  const [rules, setRules] = useState<RecurringRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ item: "", amount: "", type: "expense" as TxType, category_name: "", cadence: "monthly" as RecurringCadence, next_due_date: new Date().toISOString().slice(0, 10) });

  const load = useCallback(async () => {
    setLoading(true);
    const response = await fetch("/api/recurring");
    const data = await response.json();
    setRules(data.rules ?? []);
    if (!response.ok) setError(data.error || "Could not load recurring rules");
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filteredCategories = categories.filter((category) => category.type === form.type && category.is_active);
  useEffect(() => {
    if (filteredCategories.length && !filteredCategories.some((category) => category.name === form.category_name)) {
      setForm((current) => ({ ...current, category_name: filteredCategories[0].name }));
    }
  }, [filteredCategories, form.category_name]);

  const monthlyOutflow = useMemo(() => rules.filter((rule) => rule.is_active && rule.type === "expense").reduce((sum, rule) => sum + cadenceMonthlyAmount(Number(rule.amount), rule.cadence), 0), [rules]);
  const activeCount = rules.filter((rule) => rule.is_active).length;

  async function create(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const response = await fetch("/api/recurring", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, amount: Number(form.amount) }) });
    const data = await response.json();
    setSaving(false);
    if (!response.ok) return setError(data.error || "Could not create recurring rule");
    setOpen(false);
    setForm((current) => ({ ...current, item: "", amount: "" }));
    load();
  }

  async function toggle(rule: RecurringRule) {
    await fetch("/api/recurring", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: rule.id, is_active: !rule.is_active }) });
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this recurring rule? Existing transactions will remain.")) return;
    await fetch(`/api/recurring?id=${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-5">
      <header className="relative overflow-hidden rounded-[2.25rem] border border-cream-200/80 bg-gradient-to-br from-cream-50 via-lucky-50 to-cream-100 p-5 shadow-puff dark:border-[#403833] dark:from-[#2e2825] dark:via-[#352e2a] dark:to-[#241f1c] sm:flex sm:items-end sm:justify-between">
        <div className="relative max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.18em] text-lucky-500">Scheduled cash flow</p><h1 className="mt-2 font-display text-4xl font-bold text-lucky-900 dark:text-cream-50">Recurring expenses</h1><p className="page-subtitle">Track subscriptions, bills and repeated income before they affect the balance.</p></div>
        <button onClick={() => setOpen(true)} className="btn-primary relative mt-4 sm:mt-0"><Plus size={17} />New rule</button>
      </header>

      <section className="grid gap-4 md:grid-cols-[1.3fr_0.7fr]">
        <div className="relative overflow-hidden rounded-[2rem] bg-[#3d342e] p-6 text-cream-50 shadow-pop dark:bg-[#171311]"><div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-lucky-300/10 blur-3xl" /><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lucky-300/20 text-lucky-200"><CalendarClock size={21} /></span><p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-cream-200/70">Projected monthly outflow</p><p className="metric-number mt-2 text-3xl text-cream-50">{formatMoney(monthlyOutflow, currency)}</p><p className="mt-2 text-sm leading-6 text-cream-200/70">Normalized from weekly, monthly and annual schedules.</p></div>
        <div className="card p-6"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lucky-100 text-lucky-700 dark:bg-[#403833] dark:text-lucky-300"><Repeat2 size={21} /></span><p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Active schedules</p><p className="metric-number mt-2 text-3xl text-slate-900 dark:text-slate-50">{activeCount}</p><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">of {rules.length} configured rules</p></div>
      </section>

      {error && <p role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">{error}</p>}

      <section className="card overflow-hidden p-3">
        {loading ? <div className="flex items-center justify-center py-14"><Loader2 className="animate-spin text-lucky-500" size={28} /></div> : rules.length === 0 ? <div className="py-14 text-center"><Repeat2 className="mx-auto text-lucky-300" size={40} /><h2 className="mt-4 font-display text-lg font-bold text-slate-800 dark:text-slate-100">No recurring rules yet</h2><p className="mt-1 text-sm text-slate-500">Add rent, subscriptions or salary to see the monthly commitment.</p></div> : <ul className="space-y-2">{rules.map((rule) => { const tone = getCategoryTone(rule.category_name); return <li key={rule.id} className={`flex flex-col gap-4 rounded-[1.35rem] border p-4 sm:flex-row sm:items-center sm:justify-between ${rule.is_active ? "border-cream-200 bg-cream-50/70 dark:border-[#403833] dark:bg-[#352e2a]" : "border-slate-200 bg-slate-100/60 opacity-70 dark:border-slate-700 dark:bg-slate-800/50"}`}><div className="flex min-w-0 items-center gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl" style={{ backgroundColor: tone.bg, color: tone.text }}><Repeat2 size={18} /></span><div className="min-w-0"><p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">{rule.item}</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{rule.cadence} · next {rule.next_due_date} · {rule.category_name ?? "Other"}</p></div></div><div className="flex items-center justify-between gap-2 sm:justify-end"><span className={`metric-number mr-2 text-sm ${rule.type === "income" ? "text-emerald-700 dark:text-emerald-300" : "text-peach-600 dark:text-peach-300"}`}>{formatMoney(Number(rule.amount), currency)}</span><button aria-label={rule.is_active ? "Pause recurring rule" : "Resume recurring rule"} onClick={() => toggle(rule)} className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-500 hover:bg-lucky-100 hover:text-lucky-700 dark:hover:bg-[#403833]">{rule.is_active ? <Pause size={17} /> : <Play size={17} />}</button><button aria-label="Delete recurring rule" onClick={() => remove(rule.id)} className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-500 hover:bg-rose-100 hover:text-rose-700 dark:hover:bg-rose-950/40"><Trash2 size={17} /></button></div></li>; })}</ul>}
      </section>

      <AnimatePresence>{open && <motion.div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><button aria-label="Close form" className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={() => setOpen(false)} /><motion.form onSubmit={create} role="dialog" aria-modal="true" className="relative max-h-[92dvh] w-full overflow-y-auto rounded-t-[1.75rem] border border-cream-200 bg-cream-50 p-6 shadow-pop dark:border-[#403833] dark:bg-[#2e2825] sm:max-w-lg sm:rounded-[1.75rem]" initial={{ y: 48, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 32, opacity: 0 }} transition={{ type: "spring", stiffness: 360, damping: 32 }}><div className="mb-5 flex items-center justify-between"><div><h2 className="font-display text-xl font-bold text-slate-900 dark:text-slate-50">New recurring rule</h2><p className="mt-1 text-sm text-slate-500">The first transaction is created on the next due date.</p></div><button type="button" aria-label="Close" onClick={() => setOpen(false)} className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-cream-100 dark:hover:bg-[#403833]"><X size={19} /></button></div><div className="space-y-4"><div className="grid grid-cols-2 gap-2 rounded-2xl bg-cream-100 p-1 dark:bg-[#241f1c]">{(["expense", "income"] as TxType[]).map((type) => <button key={type} type="button" onClick={() => setForm((current) => ({ ...current, type }))} className={`min-h-11 rounded-xl text-sm font-semibold ${form.type === type ? "bg-cream-50 shadow-soft dark:bg-[#403833]" : "text-slate-500"}`}>{type === "expense" ? "Expense" : "Income"}</button>)}</div><div><label className="label" htmlFor="recurring-item">Item</label><input id="recurring-item" className="input" value={form.item} onChange={(event) => setForm((current) => ({ ...current, item: event.target.value }))} placeholder="Netflix, rent, salary..." /></div><div className="grid grid-cols-2 gap-3"><div><label className="label" htmlFor="recurring-amount">Amount</label><input id="recurring-amount" className="input" type="number" min="0" step="0.01" value={form.amount} onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))} /></div><div><label className="label" htmlFor="recurring-due">Next due</label><input id="recurring-due" className="input" type="date" value={form.next_due_date} onChange={(event) => setForm((current) => ({ ...current, next_due_date: event.target.value }))} /></div></div><div><label className="label" htmlFor="recurring-category">Category</label><select id="recurring-category" className="input" value={form.category_name} onChange={(event) => setForm((current) => ({ ...current, category_name: event.target.value }))}>{filteredCategories.map((category) => <option key={category.id}>{category.name}</option>)}</select></div><div><label className="label" htmlFor="recurring-cadence">Repeat</label><select id="recurring-cadence" className="input" value={form.cadence} onChange={(event) => setForm((current) => ({ ...current, cadence: event.target.value as RecurringCadence }))}><option value="weekly">Every week</option><option value="monthly">Every month</option><option value="yearly">Every year</option></select></div><button type="submit" disabled={saving || !form.item.trim() || !(Number(form.amount) > 0)} className="btn-primary w-full py-3">{saving ? <Loader2 className="animate-spin" size={17} /> : <Plus size={17} />}{saving ? "Creating..." : "Create recurring rule"}</button></div></motion.form></motion.div>}</AnimatePresence>
    </div>
  );
}
