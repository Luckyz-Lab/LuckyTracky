"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Gift, Loader2, LockKeyhole, Sparkles, Trophy } from "lucide-react";
import { ACHIEVEMENTS } from "@/lib/achievements";

interface Unlock { achievement_key: string; unlocked_at: string; claimed_at: string | null }
interface ApiAchievement { key: string; name: string; description: string; xp: number; unlock: Unlock | null }

export default function AchievementsView() {
  const [items, setItems] = useState<ApiAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "unlocked" | "locked">("all");

  const load = useCallback(async () => {
    setLoading(true);
    const response = await fetch("/api/achievements");
    const data = await response.json();
    setItems(data.achievements ?? []);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function claim(key: string) {
    setClaiming(key);
    await fetch("/api/achievements", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key }) });
    await load();
    setClaiming(null);
  }

  const unlocked = items.filter((item) => item.unlock).length;
  const totalXp = items.filter((item) => item.unlock?.claimed_at).reduce((sum, item) => sum + item.xp, 0);
  const visible = useMemo(() => items.filter((item) => filter === "all" || (filter === "unlocked" ? Boolean(item.unlock) : !item.unlock)), [filter, items]);

  return <div className="space-y-5">
    <header className="relative overflow-hidden rounded-[2.25rem] bg-[#3d342e] p-6 text-cream-50 shadow-pop dark:bg-[#171311] sm:flex sm:items-end sm:justify-between"><div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-lucky-300/10 blur-3xl" /><div className="relative max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.18em] text-lucky-200">Household milestones</p><h1 className="mt-2 font-display text-4xl font-bold">Achievements</h1><p className="mt-2 max-w-xl text-sm leading-6 text-cream-200/70">Progress comes from real entries, budgets and savings goals. Rewards are shared with the active household.</p></div><div className="relative mt-5 flex gap-3 sm:mt-0"><div className="rounded-2xl bg-white/10 px-4 py-3"><p className="text-xs text-cream-200/70">Unlocked</p><p className="metric-number mt-1 text-xl">{unlocked}/{items.length || ACHIEVEMENTS.length}</p></div><div className="rounded-2xl bg-lucky-300/20 px-4 py-3"><p className="text-xs text-lucky-100">Claimed XP</p><p className="metric-number mt-1 text-xl">{totalXp}</p></div></div></header>
    <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Achievement filters">{(["all", "unlocked", "locked"] as const).map((value) => <button key={value} role="tab" aria-selected={filter === value} onClick={() => setFilter(value)} className={`min-h-11 rounded-full px-4 text-sm font-semibold capitalize transition-colors ${filter === value ? "bg-lucky-500 text-white shadow-puff" : "border border-cream-200 bg-cream-50/80 text-slate-600 dark:border-[#403833] dark:bg-[#2e2825] dark:text-slate-300"}`}>{value}</button>)}</div>
    {loading ? <div className="flex justify-center py-20"><Loader2 className="animate-spin text-lucky-500" size={30} /></div> : <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{visible.map((item) => { const definition = ACHIEVEMENTS.find((entry) => entry.key === item.key); const Icon = definition?.icon ?? Trophy; const locked = !item.unlock; const claimed = Boolean(item.unlock?.claimed_at); return <article key={item.key} className={`relative overflow-hidden rounded-[1.75rem] border p-5 ${locked ? "border-slate-200 bg-slate-100/60 dark:border-slate-700 dark:bg-slate-800/40" : "border-cream-200 bg-cream-50 shadow-soft dark:border-[#403833] dark:bg-[#2e2825]"}`}><div className="flex items-start justify-between gap-4"><span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${locked ? "bg-slate-200 text-slate-500 dark:bg-slate-700" : "bg-lucky-100 text-lucky-700 dark:bg-[#403833] dark:text-lucky-300"}`}>{locked ? <LockKeyhole size={20} /> : <Icon size={21} />}</span><span className="rounded-full bg-grape-100 px-2.5 py-1 text-xs font-bold text-grape-500">{item.xp} XP</span></div><h2 className="mt-5 font-display text-lg font-bold text-slate-900 dark:text-slate-50">{item.name}</h2><p className="mt-2 min-h-12 text-sm leading-6 text-slate-500 dark:text-slate-400">{item.description}</p>{locked ? <div className="mt-4 flex min-h-11 items-center gap-2 border-t border-slate-200 pt-4 text-xs font-semibold text-slate-500 dark:border-slate-700"><LockKeyhole size={14} />Keep tracking to unlock</div> : claimed ? <div className="mt-4 flex min-h-11 items-center gap-2 border-t border-cream-200 pt-4 text-sm font-semibold text-emerald-700 dark:border-[#403833] dark:text-emerald-300"><Check size={16} />Reward claimed</div> : <button onClick={() => claim(item.key)} disabled={claiming === item.key} className="btn-primary mt-4 w-full"><span className="flex items-center gap-2">{claiming === item.key ? <Loader2 className="animate-spin" size={16} /> : <Gift size={16} />}Claim reward</span></button>} {!locked && <Sparkles className="absolute -bottom-3 -right-3 text-lucky-100 dark:text-[#403833]" size={72} />}</article>; })}</section>}
  </div>;
}
