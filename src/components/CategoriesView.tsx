"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, Eye, EyeOff } from "lucide-react";
import { getCategoryTone, getCategoryEmoji } from "@/lib/category-colors";
import type { Category } from "@/lib/supabase/types";
import CatDecor from "./CatDecor";

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
      <header className="relative overflow-hidden rounded-[2.25rem] border border-cream-200/80 bg-gradient-to-br from-cream-50 via-lucky-50 to-cream-100 p-5 shadow-puff dark:border-[#403833] dark:from-[#2e2825] dark:via-[#352e2a] dark:to-[#241f1c]">
        <div className="pointer-events-none absolute -right-14 -top-14 h-48 w-48 rounded-full bg-lucky-200/35 blur-3xl" />
        <CatDecor pose="walk" size={104} className="absolute bottom-0 right-8 hidden opacity-90 md:block" flip />
        <div className="relative max-w-xl">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-lucky-500">Category studio</p>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-lucky-900 dark:text-cream-50">Soft labels & keywords</h1>
          <p className="page-subtitle">Manage categories and keywords used for auto-classification</p>
        </div>
      </header>

      <section className="card grid gap-4 p-5 lg:grid-cols-[150px_190px_1fr_auto] lg:items-end">
        <div className="w-36">
          <label className="label">Type</label>
          <select className="input" value={type} onChange={(e) => setType(e.target.value as "expense" | "income")}>
            <option value="expense">Terracotta expense</option>
            <option value="income">Sage income</option>
          </select>
        </div>
        <div className="w-44">
          <label className="label">Category name</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Food, Transport..." />
        </div>
        <div className="min-w-[180px] flex-1">
          <label className="label">Keywords (comma-separated)</label>
          <input className="input" value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="food, lunch, dinner" />
        </div>
        <button onClick={add} disabled={saving || !name} className="btn-primary">
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
          Add
        </button>
      </section>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <CategoryList title="Terracotta expenses" items={expense} onToggle={toggleActive} />
        <CategoryList title="Sage income" items={income} onToggle={toggleActive} />
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
      <h2 className="mb-4 font-display text-sm font-semibold text-slate-700 dark:text-slate-300">{title}</h2>
      <ul className="space-y-2">
        {items.map((c) => (
          <li
            key={c.id}
            className={`flex items-center justify-between gap-3 rounded-[1.35rem] border px-3 py-2.5 shadow-soft transition-all ${
              c.is_active
                ? "border-cream-200/70 bg-cream-50/75 dark:border-[#403833] dark:bg-[#352e2a]"
                : "border-cream-200/50 bg-cream-50/40 opacity-50 dark:border-[#403833] dark:bg-[#2e2825]/60"
            }`}
          >
            <div className="min-w-0 flex-1">
              <CategoryLabel name={c.name} />
              {c.keywords.length > 0 && (
                <p className="mt-1 truncate text-xs text-slate-400 dark:text-slate-500 pl-1">
                  {c.keywords.slice(0, 6).join(", ")}
                </p>
              )}
            </div>
            <button
              aria-label={`${c.is_active ? "Hide" : "Show"} ${c.name}`}
              onClick={() => onToggle(c)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-cream-100 hover:text-lucky-700 dark:hover:bg-[#403833] dark:hover:text-slate-200"
              title={c.is_active ? "Hide" : "Show"}
            >
              {c.is_active ? <Eye size={17} /> : <EyeOff size={17} />}
            </button>
          </li>
        ))}
        {items.length === 0 && (
          <li className="py-4 text-center text-sm text-slate-400 dark:text-slate-500">No categories yet</li>
        )}
      </ul>
    </section>
  );
}

function CategoryLabel({ name }: { name: string }) {
  const tone = getCategoryTone(name);
  const emoji = getCategoryEmoji(name);
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold"
      style={{ backgroundColor: tone.bg, borderColor: tone.border, color: tone.text }}
    >
      <span className="text-sm">{emoji}</span>
      {name}
    </span>
  );
}
