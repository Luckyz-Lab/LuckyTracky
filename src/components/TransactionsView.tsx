"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Search, Trash2, Pencil, X, Loader2, ArrowDownCircle, ArrowUpCircle, Download } from "lucide-react";
import type { Transaction, Category } from "@/lib/supabase/types";
import { formatMoney } from "@/lib/utils";

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

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Transactions</h1>
          <p className="text-sm text-zinc-500">{rows.length} records</p>
        </div>
        <div className="flex gap-2">
          <a
            href={`/api/export?household_id=${householdId}&format=csv`}
            className="btn-outline text-sm"
          >
            <Download size={16} /> Export
          </a>
          <button onClick={openCreate} className="btn-primary text-sm">
            <Plus size={16} /> Add
          </button>
        </div>
      </header>

      {/* Filters */}
      <div className="card flex flex-wrap items-end gap-3 p-4">
        <div className="relative min-w-[180px] flex-1">
          <Search size={16} className="absolute left-3 top-2.5 text-zinc-400" />
          <input
            className="input pl-9"
            placeholder="Search item or category"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <select className="input w-auto" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">All types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <select className="input w-auto" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input type="date" className="input w-auto" value={from} onChange={(e) => setFrom(e.target.value)} />
        <input type="date" className="input w-auto" value={to} onChange={(e) => setTo(e.target.value)} />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex justify-center p-8 text-zinc-400">
            <Loader2 className="animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <p className="p-8 text-center text-sm text-zinc-400">No transactions found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-left text-xs text-zinc-500">
              <tr>
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {rows.map((t) => (
                <tr key={t.id} className="hover:bg-zinc-50">
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2">
                      {t.type === "income" ? (
                        <ArrowDownCircle size={16} className="text-brand-600" />
                      ) : (
                        <ArrowUpCircle size={16} className="text-rose-500" />
                      )}
                      {t.item}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-500">{t.category_name}</td>
                  <td className="px-4 py-3 text-zinc-500">{t.date}</td>
                  <td className={`px-4 py-3 text-right font-medium ${t.type === "income" ? "text-brand-600" : "text-rose-500"}`}>
                    {t.type === "income" ? "+" : "-"}
                    {formatMoney(Number(t.amount), currency)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => openEdit(t)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => remove(t.id)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-rose-50 hover:text-rose-500">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/30 p-4" onClick={() => setModalOpen(false)}>
          <div className="card w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{editing ? "Edit" : "Add"} transaction</h2>
              <button onClick={() => setModalOpen(false)} className="text-zinc-400 hover:text-zinc-700">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <button
                  className={`btn ${form.type === "expense" ? "bg-rose-500 text-white" : "btn-outline"}`}
                  onClick={() => setForm((f) => ({ ...f, type: "expense" }))}
                >
                  Expense
                </button>
                <button
                  className={`btn ${form.type === "income" ? "bg-brand-600 text-white" : "btn-outline"}`}
                  onClick={() => setForm((f) => ({ ...f, type: "income" }))}
                >
                  Income
                </button>
              </div>
              <div>
                <label className="label">Item</label>
                <input className="input" value={form.item} onChange={(e) => setForm((f) => ({ ...f, item: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Amount</label>
                  <input
                    className="input"
                    type="number"
                    value={form.amount}
                    onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="label">Date</label>
                  <input className="input" type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="label">Category</label>
                <select className="input" value={form.category_name} onChange={(e) => setForm((f) => ({ ...f, category_name: e.target.value }))}>
                  {filteredCats.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <button onClick={save} disabled={saving || !form.item || !form.amount} className="btn-primary w-full">
                {saving && <Loader2 size={16} className="animate-spin" />}
                {editing ? "Save changes" : "Add transaction"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
