"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarClock, Loader2, Plus, Repeat2, Sparkles, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { Category, RecurringCadence, TxType } from "@/lib/supabase/types";
import { getCategoryEmoji } from "@/lib/category-colors";

interface QuickAddModalProps {
  open: boolean;
  householdId: string | null;
  onClose: () => void;
  onSaved?: () => void;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function QuickAddModal({ open, householdId, onClose, onSaved }: QuickAddModalProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [item, setItem] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<TxType>("expense");
  const [categoryName, setCategoryName] = useState("");
  const [date, setDate] = useState(today());
  const [recurring, setRecurring] = useState(false);
  const [cadence, setCadence] = useState<RecurringCadence>("monthly");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !householdId) return;
    fetch(`/api/categories?household_id=${householdId}`)
      .then((response) => response.json())
      .then((data) => setCategories(data.categories ?? []));
  }, [householdId, open]);

  const matchingCategories = useMemo(() => categories.filter((category) => category.type === type && category.is_active), [categories, type]);

  useEffect(() => {
    if (!open) return;
    setItem("");
    setAmount("");
    setType("expense");
    setCategoryName("");
    setDate(today());
    setRecurring(false);
    setCadence("monthly");
    setError("");
  }, [open]);

  useEffect(() => {
    if (!matchingCategories.length) return;
    if (!matchingCategories.some((category) => category.name === categoryName)) {
      setCategoryName(matchingCategories[0].name);
    }
  }, [categoryName, matchingCategories]);

  useEffect(() => {
    if (!item.trim()) return;
    const lower = item.toLowerCase();
    const match = matchingCategories.find((category) => category.keywords.some((keyword) => lower.includes(keyword.toLowerCase())));
    if (match) setCategoryName(match.name);
  }, [item, matchingCategories]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, open]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!householdId || !item.trim() || !(Number(amount) > 0)) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ household_id: householdId, item: item.trim(), amount: Number(amount), type, category_name: categoryName || "Other", date }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save transaction");
      if (recurring) {
        const recurringResponse = await fetch("/api/recurring", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ item: item.trim(), amount: Number(amount), type, category_name: categoryName || "Other", cadence, next_due_date: date }),
        });
        const recurringData = await recurringResponse.json();
        if (!recurringResponse.ok) throw new Error(recurringData.error || "Transaction saved, but recurring rule failed");
      }
      onSaved?.();
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save entry");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button aria-label="Close quick add" className="absolute inset-0 cursor-default bg-slate-950/50 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="quick-add-title"
            className="relative max-h-[92dvh] w-full overflow-y-auto rounded-t-[1.75rem] border border-cream-200 bg-cream-50 p-5 shadow-pop dark:border-[#403833] dark:bg-[#2e2825] sm:max-w-lg sm:rounded-[1.75rem] sm:p-6"
            initial={{ y: 48, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 28, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 360, damping: 32 }}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-lucky-100 px-2.5 py-1 text-xs font-semibold text-lucky-700 dark:bg-[#403833] dark:text-lucky-300"><Sparkles size={13} />Quick action</span>
                <h2 id="quick-add-title" className="font-display text-xl font-bold text-slate-900 dark:text-slate-50">Add a money entry</h2>
                <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">Save an entry without leaving your current page.</p>
              </div>
              <button type="button" aria-label="Close" onClick={onClose} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-cream-100 focus:outline-none focus:ring-2 focus:ring-lucky-300 dark:hover:bg-[#403833]"><X size={19} /></button>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-2 gap-2 rounded-2xl bg-cream-100 p-1 dark:bg-[#241f1c]">
                {(["expense", "income"] as TxType[]).map((value) => (
                  <button key={value} type="button" aria-pressed={type === value} onClick={() => setType(value)} className={`min-h-11 rounded-xl px-3 text-sm font-semibold transition-colors ${type === value ? "bg-cream-50 text-lucky-800 shadow-soft dark:bg-[#403833] dark:text-cream-50" : "text-slate-500 hover:text-slate-800 dark:text-slate-400"}`}>{value === "expense" ? "Expense" : "Income"}</button>
                ))}
              </div>

              <div>
                <label htmlFor="quick-item" className="label">Item</label>
                <input id="quick-item" autoFocus className="input" value={item} onChange={(event) => setItem(event.target.value)} placeholder="Lunch, rent, salary..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label htmlFor="quick-amount" className="label">Amount</label><input id="quick-amount" className="input" type="number" min="0" step="0.01" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0.00" /></div>
                <div><label htmlFor="quick-date" className="label">Date</label><input id="quick-date" className="input" type="date" value={date} onChange={(event) => setDate(event.target.value)} /></div>
              </div>
              <div>
                <label htmlFor="quick-category" className="label">Category</label>
                <select id="quick-category" className="input" value={categoryName} onChange={(event) => setCategoryName(event.target.value)}>
                  {matchingCategories.map((category) => <option key={category.id} value={category.name}>{getCategoryEmoji(category.name)} {category.name}</option>)}
                </select>
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-cream-200 bg-cream-50/70 p-4 dark:border-[#403833] dark:bg-[#352e2a]">
                <input type="checkbox" checked={recurring} onChange={(event) => setRecurring(event.target.checked)} className="mt-1 h-4 w-4 accent-[#c57168]" />
                <span className="flex-1"><span className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100"><Repeat2 size={16} />Repeat automatically</span><span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">Create a recurring rule after saving this entry.</span></span>
              </label>
              {recurring && (
                <div><label htmlFor="quick-cadence" className="label">Repeat</label><select id="quick-cadence" className="input" value={cadence} onChange={(event) => setCadence(event.target.value as RecurringCadence)}><option value="weekly">Every week</option><option value="monthly">Every month</option><option value="yearly">Every year</option></select></div>
              )}

              {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">{error}</p>}
              <button type="submit" disabled={saving || !item.trim() || !(Number(amount) > 0)} className="btn-primary w-full py-3"><span className="flex items-center gap-2">{saving ? <Loader2 size={17} className="animate-spin" /> : recurring ? <CalendarClock size={17} /> : <Plus size={17} />}{saving ? "Saving..." : recurring ? "Save and schedule" : "Save entry"}</span></button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
