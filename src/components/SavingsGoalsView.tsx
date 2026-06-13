"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, PiggyBank, Target, CalendarDays } from "lucide-react";
import { formatMoney } from "@/lib/utils";

interface SavingsGoal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
}

export default function SavingsGoalsView() {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [saved, setSaved] = useState("0");
  const [deadline, setDeadline] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    const r = await fetch("/api/savings-goals");
    setGoals(await r.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function create() {
    if (!name.trim() || !target) return;
    setSubmitting(true);
    await fetch("/api/savings-goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, target_amount: Number(target), current_amount: Number(saved) || 0, deadline: deadline || null }),
    });
    setName(""); setTarget(""); setSaved("0"); setDeadline(""); setShowForm(false); setSubmitting(false);
    load();
  }

  async function del(id: string) {
    await fetch(`/api/savings-goals?id=${id}`, { method: "DELETE" });
    load();
  }

  async function addAmount(id: string, current: number, add: number) {
    await fetch("/api/savings-goals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, current_amount: current + add }),
    });
    load();
  }

  if (loading) return <p className="text-slate-500 text-sm">Loading...</p>;

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="page-title flex items-center gap-2"><PiggyBank size={20} /> Savings Goals</h1>
          <p className="page-subtitle">{goals.length} active goal{goals.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm">
          <Plus size={16} /> New Goal
        </button>
      </header>

      {showForm && (
        <div className="card p-4 space-y-3">
          <input className="input" placeholder="Goal name (e.g. Japan Trip)" value={name} onChange={(e) => setName(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <input className="input" type="number" placeholder="Target amount (฿)" value={target} onChange={(e) => setTarget(e.target.value)} />
            <input className="input" type="number" placeholder="Already saved (฿)" value={saved} onChange={(e) => setSaved(e.target.value)} />
          </div>
          <input className="input" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          <div className="flex gap-2">
            <button onClick={create} disabled={submitting} className="btn-primary flex-1">
              {submitting ? "Creating..." : "Create Goal"}
            </button>
            <button onClick={() => setShowForm(false)} className="btn-outline flex-1">Cancel</button>
          </div>
        </div>
      )}

      {goals.length === 0 && !showForm && (
        <div className="card p-8 text-center space-y-2">
          <PiggyBank size={40} className="mx-auto text-slate-300 dark:text-slate-600" />
          <p className="text-slate-500 text-sm">No savings goals yet.</p>
          <button onClick={() => setShowForm(true)} className="btn-primary text-sm mx-auto">Create your first goal</button>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {goals.map((g) => {
          const pct = g.target_amount > 0 ? Math.min(100, Math.round((g.current_amount / g.target_amount) * 100)) : 0;
          const msLeft = g.deadline ? new Date(g.deadline).getTime() - Date.now() : null;
          const monthsLeft = msLeft !== null ? Math.max(0, Math.ceil(msLeft / (30 * 86400000))) : null;
          const monthly = monthsLeft && monthsLeft > 0 ? Math.round((g.target_amount - g.current_amount) / monthsLeft) : null;
          const done = pct >= 100;

          return (
            <div key={g.id} className={`card p-4 space-y-3 ${done ? "ring-2 ring-brand-500" : ""}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {done ? "🎉 " : ""}{g.name}
                  </p>
                  <div className="flex flex-wrap gap-x-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    <span className="flex items-center gap-1"><Target size={11} />{formatMoney(g.target_amount)}</span>
                    {g.deadline && <span className="flex items-center gap-1"><CalendarDays size={11} />{new Date(g.deadline).toLocaleDateString("th-TH")}</span>}
                  </div>
                </div>
                <button onClick={() => del(g.id)} className="shrink-0 text-slate-300 hover:text-red-500 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1 font-medium">
                  <span className="text-slate-600 dark:text-slate-400">{formatMoney(g.current_amount)}</span>
                  <span className={pct >= 100 ? "text-brand-600" : "text-slate-500"}>{pct}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-brand-500 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              {monthly !== null && !done && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {monthsLeft} month{monthsLeft !== 1 ? "s" : ""} left · need {formatMoney(monthly)}/month
                </p>
              )}

              <div className="flex gap-1.5 flex-wrap">
                {[100, 500, 1000, 5000].map((v) => (
                  <button
                    key={v}
                    onClick={() => addAmount(g.id, g.current_amount, v)}
                    className="text-xs px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-brand-50 dark:hover:bg-brand-900/20 text-slate-600 dark:text-slate-400 transition-colors"
                  >
                    +{v.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
