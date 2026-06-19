"use client";

import { useState } from "react";
import { Bot, HelpCircle, LineChart, ReceiptText, Repeat2, Target, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const TOPICS = [
  { icon: ReceiptText, title: "Record money", detail: "Use Quick add, the transaction page, receipt scan, AI chat, or the linked LINE bot." },
  { icon: Bot, title: "Ask the assistant", detail: "Type natural entries such as lunch 120 or ask for a monthly summary." },
  { icon: Target, title: "Plan ahead", detail: "Set category budgets and savings goals for the active household." },
  { icon: Repeat2, title: "Schedule repeats", detail: "Create recurring bills or income and pause them whenever needed." },
  { icon: LineChart, title: "Read the trend", detail: "Reports compare cash flow and category totals across periods." },
];

export default function HelpDrawer() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button aria-label="Open help" onClick={() => setOpen(true)} className="flex h-11 w-11 items-center justify-center rounded-full border border-cream-200 bg-cream-50/80 text-slate-600 transition-colors hover:border-lucky-300 hover:text-lucky-700 focus:outline-none focus:ring-4 focus:ring-lucky-100 dark:border-[#403833] dark:bg-[#2e2825] dark:text-slate-300"><HelpCircle size={18} /></button>
      <AnimatePresence>{open && <motion.div className="fixed inset-0 z-[110]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><button aria-label="Close help" className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm" onClick={() => setOpen(false)} /><motion.aside role="dialog" aria-modal="true" aria-labelledby="help-title" className="absolute bottom-0 right-0 top-0 flex w-full max-w-md flex-col border-l border-cream-200 bg-cream-50 shadow-pop dark:border-[#403833] dark:bg-[#2e2825]" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 340, damping: 34 }}><header className="flex items-start justify-between gap-4 border-b border-cream-200 p-5 dark:border-[#403833]"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-lucky-500">LuckyTracky guide</p><h2 id="help-title" className="mt-1 font-display text-2xl font-bold text-slate-900 dark:text-slate-50">Money tracking, clearly</h2><p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">Each action works with the currently selected household.</p></div><button aria-label="Close" onClick={() => setOpen(false)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full hover:bg-cream-100 focus:outline-none focus:ring-2 focus:ring-lucky-300 dark:hover:bg-[#403833]"><X size={19} /></button></header><div className="flex-1 overflow-y-auto p-5"><ol className="space-y-3">{TOPICS.map((topic, index) => { const Icon = topic.icon; return <li key={topic.title} className="flex gap-4 rounded-2xl border border-cream-200 bg-cream-50/70 p-4 dark:border-[#403833] dark:bg-[#352e2a]"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-lucky-100 text-lucky-700 dark:bg-[#403833] dark:text-lucky-300"><Icon size={19} /></span><div><p className="text-xs font-semibold text-lucky-600 dark:text-lucky-300">Step {index + 1}</p><h3 className="mt-0.5 text-sm font-bold text-slate-900 dark:text-slate-100">{topic.title}</h3><p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{topic.detail}</p></div></li>; })}</ol></div></motion.aside></motion.div>}</AnimatePresence>
    </>
  );
}
