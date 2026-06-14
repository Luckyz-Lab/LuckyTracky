"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Search, Trash2, Pencil, X, Loader2, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Transaction, Category } from "@/lib/supabase/types";
import { getCategoryTone, getCategoryEmoji } from "@/lib/category-colors";
import { formatMoney } from "@/lib/utils";
import { useSound } from "./mascot/SoundProvider";

interface Props {
  householdId: string;
  currency: string;
  categories: Category[];
}

const EMPTY_FORM = { item: "", amount: "", type: "expense", category_name: "อื่นๆ", date: "" };

export default function TransactionsView({ householdId, currency, categories }: Props) {
  const [rows, setRows] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
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
      <header className="flex flex-col gap-3 border-b border-lucky-100/60 dark:border-slate-800 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="page-title">รายการ 🧾</h1>
          <p className="page-subtitle">{rows.length} รายการทั้งหมด</p>
        </div>
        <div className="flex gap-2">
          <a href="/api/export/transactions" className="btn-outline text-sm">
            <Download size={15} /> ส่งออก
          </a>
          <button onClick={openCreate} className="btn-primary text-sm">
            <Plus size={15} /> เพิ่มรายการ
          </button>
        </div>
      </header>

      {/* Filters */}
      <div className="card flex flex-wrap items-end gap-3 p-4">
        <div className="relative min-w-[180px] flex-1">
          <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
          <input className="input pl-10" placeholder="ค้นหารายการหรือหมวดหมู่" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select className="input w-auto" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">ทุกประเภท</option>
          <option value="income">เงินเข้า 💚</option>
          <option value="expense">เงินออก 🔴</option>
        </select>
        <select className="input w-auto" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">ทุกหมวด</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input type="date" className="input w-auto" value={from} onChange={(e) => setFrom(e.target.value)} />
        <input type="date" className="input w-auto" value={to} onChange={(e) => setTo(e.target.value)} />
      </div>

      {/* List */}
      <div className="card overflow-hidden p-2">
        {loading ? (
          <div className="flex flex-col items-center gap-3 p-10 text-slate-400">
            <Loader2 className="animate-spin" size={28} />
            <p className="text-sm">กำลังโหลด...</p>
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12">
            <span className="text-4xl">😴</span>
            <p className="text-sm text-slate-400 dark:text-slate-500">ไม่มีรายการที่ตรงกัน</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100/80 dark:divide-slate-700/40">
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
                    className="flex items-center justify-between gap-3 px-3 py-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
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
                            {t.category_name ?? "อื่นๆ"}
                          </span>
                          <span className="text-xs text-slate-400 dark:text-slate-500 tabular-nums">{t.date}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`metric-number text-sm ${t.type === "income" ? "text-lucky-600 dark:text-lucky-400" : "text-rose-500 dark:text-rose-400"}`}>
                        {t.type === "income" ? "+" : "-"}{formatMoney(Number(t.amount), currency)}
                      </span>
                      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(t)} className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => remove(t.id)} className="rounded-xl p-1.5 text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 hover:text-rose-500 transition-colors">
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
              className="relative w-full rounded-t-3xl sm:rounded-3xl sm:max-w-md bg-white dark:bg-slate-900 shadow-2xl"
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
                    {editing ? "✏️ แก้ไขรายการ" : "✨ เพิ่มรายการใหม่"}
                  </h2>
                  <button onClick={() => setModalOpen(false)} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <X size={18} />
                  </button>
                </div>

                {/* Type toggle */}
                <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 dark:bg-slate-800 p-1">
                  <button
                    className={`btn text-sm py-2 transition-all ${
                      form.type === "expense"
                        ? "bg-rose-500 text-white shadow-puff-peach"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
                    }`}
                    onClick={() => setForm((f) => ({ ...f, type: "expense", category_name: "อื่นๆ" }))}
                  >
                    🔴 เงินออก
                  </button>
                  <button
                    className={`btn text-sm py-2 transition-all ${
                      form.type === "income"
                        ? "bg-lucky-600 text-white shadow-puff"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
                    }`}
                    onClick={() => setForm((f) => ({ ...f, type: "income", category_name: "อื่นๆ" }))}
                  >
                    💚 เงินเข้า
                  </button>
                </div>

                <div>
                  <label className="label">รายการ</label>
                  <input className="input" placeholder="เช่น ชาบูหมูกระทะ, ค่า BTS..." value={form.item} onChange={(e) => setForm((f) => ({ ...f, item: e.target.value }))} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">จำนวนเงิน</label>
                    <input className="input" type="number" placeholder="0" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label">วันที่</label>
                    <input className="input" type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
                  </div>
                </div>

                <div>
                  <label className="label">หมวดหมู่</label>
                  <select className="input" value={form.category_name} onChange={(e) => setForm((f) => ({ ...f, category_name: e.target.value }))}>
                    {filteredCats.map((c) => <option key={c.id} value={c.name}>{getCategoryEmoji(c.name)} {c.name}</option>)}
                  </select>
                </div>

                <button
                  onClick={() => { play("coin"); save(); }}
                  disabled={saving || !form.item || !form.amount}
                  className="btn-primary w-full py-3"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : (editing ? "💾 บันทึก" : "✅ เพิ่มรายการ")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
