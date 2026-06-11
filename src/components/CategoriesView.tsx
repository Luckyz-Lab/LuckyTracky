"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, Eye, EyeOff } from "lucide-react";
import { getCategoryTone } from "@/lib/category-colors";
import type { Category } from "@/lib/supabase/types";

export default function CategoriesView({
  householdId,
  categories,
}: {
  householdId: string;
  categories: Category[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [type, setType] = useState<"expense" | "income">("expense");
  const [keywords, setKeywords] = useState("");
  const [saving, setSaving] = useState(false);

  async function add() {
    if (!name) return;
    setSaving(true);
    await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        household_id: householdId,
        name,
        type,
        keywords: keywords.split(",").map((k) => k.trim()).filter(Boolean),
      }),
    });
    setSaving(false);
    setName("");
    setKeywords("");
    router.refresh();
  }

  async function toggleActive(c: Category) {
    await fetch("/api/categories", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: c.id, is_active: !c.is_active }),
    });
    router.refresh();
  }

  const expense = categories.filter((c) => c.type === "expense");
  const income = categories.filter((c) => c.type === "income");

  return (
    <div className="space-y-6">
      <header>
        <h1 className="page-title">Categories</h1>
        <p className="page-subtitle">Manage categories and parser keywords</p>
      </header>

      <section className="card flex flex-wrap items-end gap-3 p-4">
        <div className="w-32">
          <label className="label">Type</label>
          <select className="input" value={type} onChange={(e) => setType(e.target.value as "expense" | "income")}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>
        <div className="w-40">
          <label className="label">Name</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="min-w-[180px] flex-1">
          <label className="label">Keywords (comma separated)</label>
          <input className="input" value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="กิน, ข้าว, อาหาร" />
        </div>
        <button onClick={add} disabled={saving || !name} className="btn-primary">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          Add
        </button>
      </section>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <CategoryList title="Expense" items={expense} onToggle={toggleActive} />
        <CategoryList title="Income" items={income} onToggle={toggleActive} />
      </div>
    </div>
  );
}

function CategoryList({
  title,
  items,
  onToggle,
}: {
  title: string;
  items: Category[];
  onToggle: (c: Category) => void;
}) {
  return (
    <section className="card p-5">
      <h2 className="mb-3 text-sm font-semibold text-zinc-700">{title}</h2>
      <ul className="divide-y divide-zinc-100">
        {items.map((c) => (
          <li key={c.id} className={`flex items-center justify-between py-2.5 ${c.is_active ? "" : "opacity-50"}`}>
            <div className="min-w-0">
              <CategoryLabel name={c.name} />
              {c.keywords.length > 0 && (
                <p className="mt-1 truncate text-xs text-zinc-400">{c.keywords.slice(0, 6).join(", ")}</p>
              )}
            </div>
            <button onClick={() => onToggle(c)} className="text-zinc-400 hover:text-zinc-700" title={c.is_active ? "Hide" : "Show"}>
              {c.is_active ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          </li>
        ))}
        {items.length === 0 && <li className="py-3 text-sm text-zinc-400">None</li>}
      </ul>
    </section>
  );
}

function CategoryLabel({ name }: { name: string }) {
  const tone = getCategoryTone(name);
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-semibold"
      style={{ backgroundColor: tone.bg, borderColor: tone.border, color: tone.text }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: tone.dot }} />
      {name}
    </span>
  );
}
