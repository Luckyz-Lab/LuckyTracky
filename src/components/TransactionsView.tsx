"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Search, Trash2, Pencil, X, Loader2, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Transaction, Category } from "@/lib/supabase/types";
import { getCategoryTone, getCategoryEmoji } from "@/lib/category-colors";
import { formatMoney } from "@/lib/utils";
import { useSound } from "./mascot/SoundProvider";
import CatDecor from "./CatDecor";

interface Props {
  householdId: string;
  currency: string;
  categories: Category[];
  initialSearch?: string;
}

const EMPTY_FORM = { item: "", amount: "", type: "expense", category_name: "อื่นๆ", date: "" };

export default function TransactionsView({ householdId, currency, categories, initialSearch = "" }: Props) {
  const [rows, setRows] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState(initialSearch);
  const [type, setType] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ household_id: householdId });
    if (q) params.set("q", q);
    if (type) params.set("type", type);
    if (categoryId) params.set("category_id", categoryId);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    const res = await fetch(`/api/transactions?${params}`);
    const data = await res.json();
    setRows(data.transactions ?? []);
    setLoading(false);
  }, [householdId, q, type, categoryId, from, to]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  function openCreate() {
    setEditing(null);
    setForm({ ...EMPTY_FORM, date: new Date().toISOString().slice(0, 10) });
    setModalOpen(true);
  }

  function openEdit(t: Transaction) {
    setEditing(t);
    setForm({
      item: t.item,
      amount: String(t.amount),
      type: t.type,
      category_name: t.category_name ?? "อื่นๆ",
      date: t.date,
    });
    setModalOpen(true);
  }

  async function save() {
    setSaving(true);
    const payload = {
      household_id: householdId,
      item: form.item,
      amount: Number(form.amount),
      type: form.type,
      category_name: form.category_name,
      date: form.date,
    };
    if (editing) {
      await fetch(`/api/transactions/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    setSaving(false);
    setModalOpen(false);
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this transaction?")) return;
    await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    load();
  }

  const filteredCats = categories.filter((c) => c.type === form.type);

  const { play } = useSound();

  return (
    <div className="space-y-5">
      {/* Header */}
      <header className="relative overflow-hidden rounded-[2.25rem] border border-cream-200/80 bg-gradient-to-br from-cream-50 via-lucky-50 to-cream-100 p-5 shadow-puff dark:border-[#403833] dark:from-[#2e2825] dark:via-[#352e2a] dark:to-[#241f1c] sm:flex sm:items-end sm:justify-between">
        <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-lucky-200/40 blur-3xl" />
        <div className="relative">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-lucky-500">Money logbook</p>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-lucky-900 dark:text-cream-50">Transactions</h1>
          <p className="page-subtitle">{rows.length} total entries in a soft clay timeline</p>
        </div>
        <div className="relative mt-4 flex gap-2 sm:mt-0">
          <a href="/api/export/transactions" className="btn-outline text-sm">
            <Download size={15} /> Export
          </a>
          <button onClick={openCreate} className="btn-primary text-sm">
            <Plus size={15} /> Add entry
          </button>
        </div>
      </header>

      {/* Filters */}
      <div className="card flex flex-wrap items-end gap-3 p-4 md:rounded-[2rem]">
        <div className="relative min-w-[180px] flex-1">
          <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
          <input className="input pl-10" placeholder="Search items or categories" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select className="input w-auto" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">All types</option>
          <option value="income">Income 💚</option>
          <option value="expense">Expense 🔴</option>
        </select>
        <select className="input w-auto" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input type="date" className="input w-auto" value={from} onChange={(e) => setFrom(e.target.value)} />
        <input type="date" className="input w-auto" value={to} onChange={(e) => setTo(e.target.value)} />
      </div>

      {/* List */}
      <div className="card overflow-hidden p-3">
        {loading ? (
          <div className="flex flex-col items-center gap-3 p-10 text-slate-400">
            <Loader2 className="animate-spin" size={28} />
            <p className="text-sm">Loading...</p>
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12">
            <CatDecor pose="sleep" size={90} />
            <p className="text-sm text-slate-400 dark:text-slate-500">No matching transactions</p>
          </div>
        ) : (
          <ul className="grid gap-3">
            <AnimatePresence initial={false}>
              {rows.map((t) => {
                const tone = getCategoryTone(t.category_name);
                const emoji = getCategoryEmoji(t.category_name);
                return (
                  <motion.li
                    key={t.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16, height: 0 }}
                    transition={{ duration: 0.22 }}
                    className="group flex items-center justify-between gap-3 rounded-[1.45rem] border border-cream-200/70 bg-cream-50/75 px-4 py-3 shadow-soft transition-all hover:-translate-y-0.5 hover:bg-cream-50 dark:border-[#403833] dark:bg-[#352e2a] dark:hover:bg-[#3a332f]"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xl"
                        style={{ backgroundColor: tone.bg }}
                      >
                        {emoji}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{t.item}</p>
                        <div className="mt-0.5 flex flex-wrap items-center gap-2">
                          <span
                            className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium"
                            style={{ backgroundColor: tone.bg, borderColor: tone.border, color: tone.text }}
                          >
                            {t.category_name ?? "Other"}
                          </span>
                          <span className="text-xs text-slate-400 dark:text-slate-500 tabular-nums">{t.date}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`metric-number text-sm ${t.type === "income" ? "text-[#5f7a54] dark:text-[#9cb88f]" : "text-peach-600 dark:text-peach-300"}`}>
                        {t.type === "income" ? "+" : "-"}{formatMoney(Number(t.amount), currency)}
                      </span>
                      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(t)} className="rounded-xl p-1.5 text-slate-400 transition-colors hover:bg-cream-100 hover:text-lucky-700 dark:hover:bg-[#403833] dark:hover:text-slate-200">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => remove(t.id)} className="rounded-xl p-1.5 text-slate-400 transition-colors hover:bg-peach-50 hover:text-peach-600 dark:hover:bg-[#5a2e26]">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        )}
      </div>

      {/* Spring bottom-sheet modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="fixed inset-0 z-40 flex flex-col justify-end sm:items-center sm:justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
            <motion.div
              className="relative w-full rounded-t-3xl border border-cream-200 bg-cream-50 shadow-puff dark:border-[#403833] dark:bg-[#2e2825] sm:max-w-md sm:rounded-3xl"
              initial={{ y: 80, opacity: 0, scale: 0.97 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: "spring", stiffness: 340, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1 sm:hidden">
                <div className="h-1 w-10 rounded-full bg-slate-200 dark:bg-slate-700" />
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {editing ? "✏️ Edit entry" : "✨ New entry"}
                  </h2>
                  <button onClick={() => setModalOpen(false)} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <X size={18} />
                  </button>
                </div>

                {/* Type toggle */}
                <div className="grid grid-cols-2 gap-2 rounded-2xl bg-cream-100 p-1 dark:bg-[#241f1c]">
                  <button
                    className={`btn text-sm py-2 transition-all ${
                      form.type === "expense"
                        ? "bg-peach-500 text-white shadow-puff-peach"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
                    }`}
                    onClick={() => setForm((f) => ({ ...f, type: "expense", category_name: "อื่นๆ" }))}
                  >
                    🔴 Expense
                  </button>
                  <button
                    className={`btn text-sm py-2 transition-all ${
                      form.type === "income"
                        ? "bg-[#7e9b74] text-white shadow-puff"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
                    }`}
                    onClick={() => setForm((f) => ({ ...f, type: "income", category_name: "อื่นๆ" }))}
                  >
                    💚 Income
                  </button>
                </div>

                <div>
                  <label className="label">Item</label>
                  <input className="input" placeholder="e.g. lunch, transport..." value={form.item} onChange={(e) => setForm((f) => ({ ...f, item: e.target.value }))} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Amount</label>
                    <input className="input" type="number" placeholder="0" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label">Date</label>
                    <input className="input" type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
                  </div>
                </div>

                <div>
                  <label className="label">Category</label>
                  <select className="input" value={form.category_name} onChange={(e) => setForm((f) => ({ ...f, category_name: e.target.value }))}>
                    {filteredCats.map((c) => <option key={c.id} value={c.name}>{getCategoryEmoji(c.name)} {c.name}</option>)}
                  </select>
                </div>

                <button
                  onClick={() => { play("coin"); save(); }}
                  disabled={saving || !form.item || !form.amount}
                  className="btn-primary w-full py-3"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : (editing ? "💾 Save" : "✅ Add entry")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
