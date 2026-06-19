"use client";

import { useEffect, useState, useCallback } from "react";
import { ArrowDownCircle, ArrowUpCircle, Check, Download, Loader2, Pencil, Plus, Save, Search, Trash2, X } from "lucide-react";
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
      <header className="relative overflow-hidden rounded-[2rem] border-2 border-orange-100 bg-white p-6 shadow-soft dark:border-slate-700 dark:bg-slate-900 sm:flex sm:items-end sm:justify-between">
        <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-lucky-200/40 blur-3xl" />
        <div className="relative">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-lucky-500">Money logbook</p>
          <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">Transactions</h1>
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
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <select className="input w-auto" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input type="date" className="input w-auto" value={from} onChange={(e) => setFrom(e.target.value)} />
        <input type="date" className="input w-auto" value={to} onChange={(e) => setTo(e.target.value)} />
      </div>

      {/* List */}
      <div className="card overflow-hidden">
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
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[760px] text-left">
                <thead className="bg-slate-50 text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400 dark:bg-slate-800"><tr><th className="px-5 py-4">Details</th><th className="px-5 py-4">Category</th><th className="px-5 py-4">Date</th><th className="px-5 py-4 text-right">Amount</th><th className="px-5 py-4 text-right">Actions</th></tr></thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {rows.map((t) => { const tone = getCategoryTone(t.category_name); const emoji = getCategoryEmoji(t.category_name); return <tr key={t.id} className="group transition-colors hover:bg-orange-50/40 dark:hover:bg-slate-800/60"><td className="px-5 py-4"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl text-lg" style={{ backgroundColor: tone.bg }}>{emoji}</span><span className="font-semibold text-slate-800 dark:text-slate-100">{t.item}</span></div></td><td className="px-5 py-4"><span className="rounded-full border px-2.5 py-1 text-xs font-semibold" style={{ backgroundColor: tone.bg, borderColor: tone.border, color: tone.text }}>{t.category_name ?? "Other"}</span></td><td className="px-5 py-4 font-mono text-xs text-slate-400">{t.date}</td><td className={`px-5 py-4 text-right font-mono text-sm font-bold ${t.type === "income" ? "text-emerald-500" : "text-rose-500"}`}>{t.type === "income" ? "+" : "-"}{formatMoney(Number(t.amount), currency)}</td><td className="px-5 py-4"><div className="flex justify-end gap-1"><button aria-label={`Edit ${t.item}`} onClick={() => openEdit(t)} className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:bg-orange-50 hover:text-orange-500"><Pencil size={15} /></button><button aria-label={`Delete ${t.item}`} onClick={() => remove(t.id)} className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-500"><Trash2 size={15} /></button></div></td></tr>; })}
                </tbody>
              </table>
            </div>
            <ul className="grid gap-2 p-3 md:hidden">{rows.map((t) => { const tone = getCategoryTone(t.category_name); return <li key={t.id} className="rounded-2xl border-2 border-slate-100 p-4 dark:border-slate-700"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">{t.item}</p><div className="mt-2 flex items-center gap-2"><span className="rounded-full border px-2 py-0.5 text-xs font-semibold" style={{ backgroundColor: tone.bg, borderColor: tone.border, color: tone.text }}>{t.category_name ?? "Other"}</span><span className="font-mono text-xs text-slate-400">{t.date}</span></div></div><span className={`shrink-0 font-mono text-sm font-bold ${t.type === "income" ? "text-emerald-500" : "text-rose-500"}`}>{t.type === "income" ? "+" : "-"}{formatMoney(Number(t.amount), currency)}</span></div><div className="mt-3 flex justify-end gap-1 border-t border-slate-100 pt-2"><button aria-label={`Edit ${t.item}`} onClick={() => openEdit(t)} className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-400 hover:bg-orange-50 hover:text-orange-500"><Pencil size={16} /></button><button aria-label={`Delete ${t.item}`} onClick={() => remove(t.id)} className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-500"><Trash2 size={16} /></button></div></li>; })}</ul>
          </>
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
                    {editing ? <><Pencil size={18} /> Edit entry</> : <><Plus size={18} /> New entry</>}
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
                    <ArrowUpCircle size={16} />Expense
                  </button>
                  <button
                    className={`btn text-sm py-2 transition-all ${
                      form.type === "income"
                        ? "bg-[#7e9b74] text-white shadow-puff"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
                    }`}
                    onClick={() => setForm((f) => ({ ...f, type: "income", category_name: "อื่นๆ" }))}
                  >
                    <ArrowDownCircle size={16} />Income
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
                  {saving ? <Loader2 size={16} className="animate-spin" /> : editing ? <Save size={16} /> : <Check size={16} />}
                  {saving ? "Saving..." : editing ? "Save changes" : "Add entry"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
