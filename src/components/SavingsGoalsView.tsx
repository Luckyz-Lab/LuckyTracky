"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Target, CalendarDays, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatMoney } from "@/lib/utils";
import { useSound } from "./mascot/SoundProvider";
import CatDecor from "./CatDecor";

interface SavingsGoal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
}

function catMood(pct: number): { face: string; label: string; barColor: string; glow: string } {
  if (pct >= 100) return { face: "🐱🍕", label: "Goal reached! Time to celebrate! 🎊", barColor: "bg-lucky-500", glow: "shadow-puff" };
  if (pct >= 75)  return { face: "😸", label: "Almost there, keep going!", barColor: "bg-lucky-400", glow: "" };
  if (pct >= 40)  return { face: "😺", label: "Making progress, keep saving!", barColor: "bg-sky-400", glow: "" };
  if (pct >= 10)  return { face: "😿", label: "Just started, keep it up!", barColor: "bg-peach-400", glow: "" };
  return           { face: "🙀", label: "Need savings — start now!", barColor: "bg-rose-400", glow: "" };
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
  const [celebrating, setCelebrating] = useState<string | null>(null);
  const { play } = useSound();

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

  async function feed(id: string, current: number, amount: number, targetAmt: number) {
    play("coin");
    const newAmt = current + amount;
    await fetch("/api/savings-goals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, current_amount: newAmt }),
    });
    if (newAmt >= targetAmt) {
      setCelebrating(id);
      play("celebrate");
      setTimeout(() => setCelebrating(null), 3000);
    }
    load();
  }

  if (loading) return (
    <div className="flex flex-col items-center gap-3 py-16 text-slate-400">
      <CatDecor pose="walk" size={80} />
      <p className="text-sm">Loading...</p>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <header className="relative overflow-hidden rounded-[2.25rem] border border-cream-200/80 bg-gradient-to-br from-cream-50 via-lucky-50 to-cream-100 p-5 shadow-puff dark:border-[#403833] dark:from-[#2e2825] dark:via-[#352e2a] dark:to-[#241f1c] sm:flex sm:items-end sm:justify-between">
        <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-lucky-200/35 blur-3xl" />
        <CatDecor pose="sit" size={112} className="absolute bottom-0 right-8 hidden opacity-90 md:block" />
        <div className="relative">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-lucky-500">Savings cat room</p>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-lucky-900 dark:text-cream-50">Savings Goals</h1>
          <p className="page-subtitle">Save money with your cat — {goals.length} goal(s)</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary relative mt-4 text-sm sm:mt-0">
          <Plus size={15} /> New goal
        </button>
      </header>

      {/* New goal form — spring modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="fixed inset-0 z-40 flex flex-col justify-end sm:items-center sm:justify-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowForm(false)} />
            <motion.div
              className="relative w-full rounded-t-3xl border border-cream-200 bg-cream-50 shadow-puff dark:border-[#403833] dark:bg-[#2e2825] sm:max-w-md sm:rounded-3xl"
              initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
              transition={{ type: "spring", stiffness: 340, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-center pt-3 pb-1 sm:hidden">
                <div className="h-1 w-10 rounded-full bg-slate-200 dark:bg-slate-700" />
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-100">🎯 New savings goal</h2>
                  <button onClick={() => setShowForm(false)} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><X size={18} /></button>
                </div>
                <div>
                  <label className="label">Goal name</label>
                  <input className="input" placeholder="e.g. Japan trip, new laptop..." value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Target (฿)</label>
                    <input className="input" type="number" placeholder="0" value={target} onChange={(e) => setTarget(e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Saved so far (฿)</label>
                    <input className="input" type="number" placeholder="0" value={saved} onChange={(e) => setSaved(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="label">Deadline (optional)</label>
                  <input className="input" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
                </div>
                <button onClick={create} disabled={submitting || !name || !target} className="btn-primary w-full py-3">
                  {submitting ? "Creating..." : "🐾 Create goal"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {goals.length === 0 && (
        <div className="card flex flex-col items-center gap-4 rounded-[2rem] py-14 text-center">
          <CatDecor pose="sit" size={90} />
          <div>
            <p className="font-display text-base font-semibold text-slate-700 dark:text-slate-200">No savings goals yet</p>
            <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">Start saving to feed your cat!</p>
          </div>
          <button onClick={() => setShowForm(true)} className="btn-primary text-sm">🎯 Set first goal</button>
        </div>
      )}

      {/* Goal cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence>
          {goals.map((g) => {
            const pct = g.target_amount > 0 ? Math.min(100, Math.round((g.current_amount / g.target_amount) * 100)) : 0;
            const msLeft = g.deadline ? new Date(g.deadline).getTime() - Date.now() : null;
            const monthsLeft = msLeft !== null ? Math.max(0, Math.ceil(msLeft / (30 * 86400000))) : null;
            const monthly = monthsLeft && monthsLeft > 0 ? Math.round((g.target_amount - g.current_amount) / monthsLeft) : null;
            const done = pct >= 100;
            const mood = catMood(pct);
            const isCelebrating = celebrating === g.id;

            return (
              <motion.div
                key={g.id}
                layout
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.88 }}
                transition={{ duration: 0.3 }}
                className={`card relative space-y-4 overflow-hidden rounded-[2rem] p-5 transition-all hover:-translate-y-0.5 ${
                  done ? "ring-2 ring-lucky-400 dark:ring-lucky-600" : ""
                }`}
              >
                {/* Celebrate overlay */}
                <AnimatePresence>
                  {isCelebrating && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-3xl bg-lucky-50/95 dark:bg-[#352e2a]/95"
                    >
                      <motion.span
                        animate={{ scale: [1, 1.3, 1], rotate: [-10, 10, -10, 0] }}
                        transition={{ duration: 0.6, repeat: 3 }}
                        className="text-6xl"
                      >🎉</motion.span>
                      <p className="mt-3 font-display text-base font-bold text-lucky-700 dark:text-lucky-300">{mood.label}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Card header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <motion.span
                      className="text-3xl"
                      animate={done ? { rotate: [-8, 8, -8, 0] } : {}}
                      transition={{ duration: 0.5, repeat: done ? Infinity : 0, repeatDelay: 2 }}
                    >
                      {mood.face}
                    </motion.span>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">{g.name}</p>
                      <div className="flex flex-wrap gap-x-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1"><Target size={11} />{formatMoney(g.target_amount)}</span>
                        {g.deadline && <span className="flex items-center gap-1"><CalendarDays size={11} />{new Date(g.deadline).toLocaleDateString("th-TH")}</span>}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => del(g.id)} className="shrink-0 rounded-full p-1.5 text-slate-300 transition-colors hover:bg-peach-50 hover:text-peach-600 dark:hover:bg-[#5a2e26]">
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Hunger bar */}
                <div>
                  <div className="flex justify-between text-xs mb-1.5 font-medium">
                    <span className="text-slate-600 dark:text-slate-400">{formatMoney(g.current_amount)} / {formatMoney(g.target_amount)}</span>
                    <span className={done ? "text-lucky-600 dark:text-lucky-400 font-bold" : "text-slate-500 dark:text-slate-400"}>
                      {done ? "✅ Done!" : `${pct}%`}
                    </span>
                  </div>
                  <div className="relative h-4 overflow-hidden rounded-full bg-cream-200 dark:bg-[#403833]">
                    <motion.div
                      className={`h-full rounded-full ${mood.barColor} ${mood.glow}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                    {pct > 0 && pct < 100 && (
                      <span className="absolute right-2 top-0 bottom-0 flex items-center text-[10px]">
                        {mood.face}
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{mood.label}</p>
                </div>

                {monthly !== null && !done && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {monthsLeft} month(s) left · save {formatMoney(monthly)}/month
                  </p>
                )}

                {/* Feed buttons */}
                {!done && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">🍚 Feed your cat</p>
                    <div className="flex gap-2 flex-wrap">
                      {[100, 500, 1000, 5000].map((v) => (
                        <motion.button
                          key={v}
                          whileTap={{ scale: 0.85 }}
                          onClick={() => feed(g.id, g.current_amount, v, g.target_amount)}
                          className="min-w-[60px] flex-1 rounded-2xl border-2 border-lucky-200 bg-lucky-50 px-2 py-1.5 text-xs font-semibold text-lucky-700 transition-colors hover:bg-lucky-100 dark:border-[#403833] dark:bg-[#352e2a] dark:text-lucky-300 dark:hover:bg-[#403833]"
                        >
                          +{v.toLocaleString()}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {done && (
                  <div className="rounded-2xl bg-lucky-50 px-4 py-2.5 text-center dark:bg-[#352e2a]">
                    <p className="font-display text-sm font-bold text-lucky-600 dark:text-lucky-400">🎉 Goal complete! Your cat is well-fed!</p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
