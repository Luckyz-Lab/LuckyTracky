"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import type { Category, Budget } from "@/lib/supabase/types";
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

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Budgets</h1>
        <p className="text-sm text-zinc-500">{monthLabel(month)} category limits</p>
      </header>

      <section className="card flex flex-wrap items-end gap-3 p-4">
        <div className="min-w-[180px] flex-1">
          <label className="label">Category</label>
          <select className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            {expenseCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="w-40">
          <label className="label">Monthly limit</label>
          <input className="input" type="number" value={limit} onChange={(e) => setLimit(e.target.value)} placeholder="0" />
        </div>
        <button onClick={add} disabled={saving || !limit} className="btn-primary">
          {saving && <Loader2 size={16} className="animate-spin" />}
          Set budget
        </button>
      </section>

      <section className="card p-5">
        {budgets.length === 0 ? (
          <p className="text-sm text-zinc-400">No budgets yet. Add one above.</p>
        ) : (
          <div className="space-y-4">
            {budgets.map((b) => {
              const pct = b.limit_amount ? Math.round((b.spent / Number(b.limit_amount)) * 100) : 0;
              return (
                <div key={b.id}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium">{b.category_name}</span>
                    <span className="flex items-center gap-3">
                      <span className="text-zinc-500">
                        {formatMoney(b.spent, currency)} / {formatMoney(Number(b.limit_amount), currency)}
                      </span>
                      <button onClick={() => remove(b.id)} className="text-zinc-400 hover:text-rose-500">
                        <Trash2 size={15} />
                      </button>
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
                    <div
                      className={`h-full rounded-full ${pct >= 100 ? "bg-rose-500" : pct >= 85 ? "bg-amber-500" : "bg-brand-500"}`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                  <p className="mt-0.5 text-xs text-zinc-400">{pct}% used</p>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
