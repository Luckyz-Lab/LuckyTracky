"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, Eye, EyeOff } from "lucide-react";
import { getCategoryTone, getCategoryEmoji } from "@/lib/category-colors";
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
      <header className="border-b border-lucky-100/60 dark:border-slate-800 pb-5">
        <h1 className="page-title">หมวดหมู่ 🏷️</h1>
        <p className="page-subtitle">จัดการหมวดหมู่และคำคีย์ที่ใช้จำแนกอัตโนมัติ</p>
      </header>

      <section className="card flex flex-wrap items-end gap-3 p-5">
        <div className="w-36">
          <label className="label">ประเภท</label>
          <select className="input" value={type} onChange={(e) => setType(e.target.value as "expense" | "income")}>
            <option value="expense">🔴 รายจ่าย</option>
            <option value="income">💚 รายรับ</option>
          </select>
        </div>
        <div className="w-44">
          <label className="label">ชื่อหมวด</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="เช่น อาหาร, เดินทาง..." />
        </div>
        <div className="min-w-[180px] flex-1">
          <label className="label">คีย์เวิร์ด (คั่นด้วยเครื่องหมายคอมมา)</label>
          <input className="input" value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="กิน, ข้าว, อาหาร" />
        </div>
        <button onClick={add} disabled={saving || !name} className="btn-primary">
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
          เพิ่ม
        </button>
      </section>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <CategoryList title="🔴 รายจ่าย" items={expense} onToggle={toggleActive} />
        <CategoryList title="💚 รายรับ" items={income} onToggle={toggleActive} />
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
            className={`flex items-center justify-between gap-3 rounded-2xl px-3 py-2.5 transition-all ${
              c.is_active
                ? "bg-slate-50 dark:bg-slate-800/50"
                : "bg-slate-50/40 dark:bg-slate-800/20 opacity-50"
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
              onClick={() => onToggle(c)}
              className="shrink-0 rounded-full p-1.5 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              title={c.is_active ? "ซ่อน" : "แสดง"}
            >
              {c.is_active ? <Eye size={15} /> : <EyeOff size={15} />}
            </button>
          </li>
        ))}
        {items.length === 0 && (
          <li className="py-4 text-center text-sm text-slate-400 dark:text-slate-500">ยังไม่มีหมวดหมู่</li>
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
