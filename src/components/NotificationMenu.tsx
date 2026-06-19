"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell, CalendarClock, CircleAlert, Loader2, Target } from "lucide-react";

interface NotificationItem {
  id: string;
  kind: "budget" | "recurring" | "goal";
  title: string;
  detail: string;
  href: string;
  urgent: boolean;
}

const ICONS = { budget: CircleAlert, recurring: CalendarClock, goal: Target };

export default function NotificationMenu() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    const response = await fetch("/api/notifications");
    const data = await response.json();
    setItems(data.notifications ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="relative">
      <button aria-label="Notifications" aria-expanded={open} onClick={() => { setOpen((value) => !value); if (!open) load(); }} className="relative flex h-11 w-11 items-center justify-center rounded-full border border-cream-200 bg-cream-50/80 text-slate-600 transition-colors hover:border-lucky-300 hover:text-lucky-700 focus:outline-none focus:ring-4 focus:ring-lucky-100 dark:border-[#403833] dark:bg-[#2e2825] dark:text-slate-300"><Bell size={18} />{items.length > 0 && <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-cream-50 bg-peach-500 dark:border-[#2e2825]" />}</button>
      {open && (
        <><button aria-label="Close notifications" className="fixed inset-0 z-40 cursor-default" onClick={() => setOpen(false)} /><div className="absolute right-0 top-[calc(100%+8px)] z-50 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-cream-200 bg-cream-50 p-2 shadow-pop dark:border-[#403833] dark:bg-[#2e2825]"><div className="flex items-center justify-between px-3 py-2"><div><h2 className="font-display text-sm font-bold text-slate-900 dark:text-slate-50">Notifications</h2><p className="text-xs text-slate-500">Budget, payment and goal reminders</p></div><span className="rounded-full bg-lucky-100 px-2 py-1 text-xs font-semibold text-lucky-700 dark:bg-[#403833] dark:text-lucky-300">{items.length}</span></div>{loading ? <div className="flex items-center justify-center py-8"><Loader2 className="animate-spin text-lucky-500" size={22} /></div> : items.length ? <ul className="space-y-1">{items.map((item) => { const Icon = ICONS[item.kind]; return <li key={item.id}><Link href={item.href} onClick={() => setOpen(false)} className="flex min-h-14 gap-3 rounded-xl p-3 transition-colors hover:bg-lucky-50 dark:hover:bg-[#403833]"><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.urgent ? "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300" : "bg-lucky-100 text-lucky-700 dark:bg-[#403833] dark:text-lucky-300"}`}><Icon size={17} /></span><span><span className="block text-sm font-semibold text-slate-800 dark:text-slate-100">{item.title}</span><span className="mt-0.5 block text-xs leading-5 text-slate-500 dark:text-slate-400">{item.detail}</span></span></Link></li>; })}</ul> : <p className="px-3 py-8 text-center text-sm text-slate-500">You are all caught up.</p>}</div></>
      )}
    </div>
  );
}
