"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Target, CalendarDays, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatMoney } from "@/lib/utils";
import { useSound } from "./mascot/SoundProvider";

interface SavingsGoal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
}

function catMood(pct: number): { face: string; label: string; barColor: string; glow: string } {
  if (pct >= 100) return { face: "🐱🍕", label: "น้องอ้วนตุ๊บแล้ว! ใส่ชุดใหม่เลย ~ 🎊", barColor: "bg-lucky-500", glow: "shadow-puff" };
  if (pct >= 75)  return { face: "😸", label: "น้องอิ่มเกือบแล้ว เกือบถึงแล้วนะ!", barColor: "bg-lucky-400", glow: "" };
  if (pct >= 40)  return { face: "😺", label: "น้องพอทน ใส่อาหารเพิ่มได้", barColor: "bg-sky-400", glow: "" };
  if (pct >= 10)  return { face: "😿", label: "น้องหิวมากเลย เร่งออมหน่อยนะ", barColor: "bg-peach-400", glow: "" };
  return           { face: "🙀", label: "น้องหิวโซ รีบให้อาหารด้วย!", barColor: "bg-rose-400", glow: "" };
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
      <span className="text-4xl animate-bounce-soft">🐱</span>
      <p className="text-sm">กำลังโหลด...</p>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <header className="flex flex-col gap-3 border-b border-lucky-100/60 dark:border-slate-800 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="page-title">ออมเงิน 🐾</h1>
          <p className="page-subtitle">เลี้ยงน้องแมวด้วยการออมเงิน — {goals.length} เป้าหมาย</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary text-sm">
          <Plus size={15} /> ตั้งเป้าหมายใหม่
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
              className="relative w-full rounded-t-3xl sm:rounded-3xl sm:max-w-md bg-white dark:bg-slate-900 shadow-2xl"
              initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
              transition={{ type: "spring", stiffness: 340, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-center pt-3 pb-1 sm:hidden">
                <div className="h-1 w-10 rounded-full bg-slate-200 dark:bg-slate-700" />
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-100">🎯 ตั้งเป้าหมายออมใหม่</h2>
                  <button onClick={() => setShowForm(false)} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><X size={18} /></button>
                </div>
                <div>
                  <label className="label">ชื่อเป้าหมาย</label>
                  <input className="input" placeholder="เช่น ทริปญี่ปุ่น, โน้ตบุ๊คใหม่..." value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">เป้าหมาย (฿)</label>
                    <input className="input" type="number" placeholder="0" value={target} onChange={(e) => setTarget(e.target.value)} />
                  </div>
                  <div>
                    <label className="label">ออมไปแล้ว (฿)</label>
                    <input className="input" type="number" placeholder="0" value={saved} onChange={(e) => setSaved(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="label">กำหนดเสร็จ (ไม่บังคับ)</label>
                  <input className="input" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
                </div>
                <button onClick={create} disabled={submitting || !name || !target} className="btn-primary w-full py-3">
                  {submitting ? "กำลังสร้าง..." : "🐾 สร้างเป้าหมาย"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {goals.length === 0 && (
        <div className="card flex flex-col items-center gap-4 py-14 text-center">
          <span className="text-5xl animate-float">🐱</span>
          <div>
            <p className="font-display text-base font-semibold text-slate-700 dark:text-slate-200">ยังไม่มีเป้าหมายออมเงินเลย</p>
            <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">น้องหิวมาก รีบออมเงินให้น้องด้วยนะ ~</p>
          </div>
          <button onClick={() => setShowForm(true)} className="btn-primary text-sm">🎯 ตั้งเป้าหมายแรก</button>
        </div>
      )}

      {/* Goal cards */}
      <div className="grid gap-4 sm:grid-cols-2">
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
                className={`card p-5 space-y-4 relative overflow-hidden ${
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
                      className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-3xl bg-lucky-50/95 dark:bg-lucky-900/90"
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
                  <button onClick={() => del(g.id)} className="shrink-0 rounded-full p-1.5 text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-900/30 hover:text-rose-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Hunger bar */}
                <div>
                  <div className="flex justify-between text-xs mb-1.5 font-medium">
                    <span className="text-slate-600 dark:text-slate-400">{formatMoney(g.current_amount)} / {formatMoney(g.target_amount)}</span>
                    <span className={done ? "text-lucky-600 dark:text-lucky-400 font-bold" : "text-slate-500 dark:text-slate-400"}>
                      {done ? "✅ เต็มแล้ว!" : `${pct}%`}
                    </span>
                  </div>
                  <div className="relative h-4 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
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
                    เหลืออีก {monthsLeft} เดือน · ต้องออมเดือนละ {formatMoney(monthly)}
                  </p>
                )}

                {/* Feed buttons */}
                {!done && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">🍚 ให้อาหารน้องแมว</p>
                    <div className="flex gap-2 flex-wrap">
                      {[100, 500, 1000, 5000].map((v) => (
                        <motion.button
                          key={v}
                          whileTap={{ scale: 0.85 }}
                          onClick={() => feed(g.id, g.current_amount, v, g.target_amount)}
                          className="flex-1 min-w-[60px] rounded-2xl border-2 border-lucky-200 dark:border-lucky-800 bg-lucky-50 dark:bg-lucky-900/20 px-2 py-1.5 text-xs font-semibold text-lucky-700 dark:text-lucky-300 hover:bg-lucky-100 dark:hover:bg-lucky-900/40 transition-colors"
                        >
                          +{v.toLocaleString()}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {done && (
                  <div className="rounded-2xl bg-lucky-50 dark:bg-lucky-900/20 px-4 py-2.5 text-center">
                    <p className="font-display text-sm font-bold text-lucky-600 dark:text-lucky-400">🎉 น้องอ้วนตุ๊บแล้ว ใส่ชุดใหม่ได้เลย!</p>
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
