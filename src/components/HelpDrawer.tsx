"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  const drawer = (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-help"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            aria-label="Close help"
            className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="help-title"
            className="absolute inset-y-0 right-0 flex h-dvh w-full max-w-md flex-col overflow-hidden border-l border-line bg-surface shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 34 }}
          >
            <header className="relative z-10 flex shrink-0 items-start justify-between gap-4 border-b border-line bg-surface p-5">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-500">LuckyTracky guide</p>
                <h2 id="help-title" className="mt-1 font-display text-2xl font-bold text-slate-900 dark:text-slate-50">
                  Money tracking, clearly
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Each action works with the currently selected household.
                </p>
              </div>
              <button
                aria-label="Close"
                onClick={() => setOpen(false)}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-500 hover:bg-orange-50 hover:text-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-300 dark:hover:bg-slate-800"
              >
                <X size={19} />
              </button>
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-canvas p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
              <ol className="space-y-3">
                {TOPICS.map((topic, index) => {
                  const Icon = topic.icon;
                  return (
                    <li key={topic.title} className="flex gap-4 rounded-card border border-line bg-surface p-4">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-300">
                        <Icon size={19} />
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-orange-600 dark:text-orange-300">Step {index + 1}</p>
                        <h3 className="mt-0.5 text-sm font-bold text-slate-900 dark:text-slate-100">{topic.title}</h3>
                        <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{topic.detail}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button
        aria-label="Open help"
        onClick={() => setOpen(true)}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface text-ink transition-colors hover:border-primary/35 hover:text-primary focus:outline-none focus:ring-4 focus:ring-primary/15"
      >
        <HelpCircle size={18} />
      </button>
      {mounted ? createPortal(drawer, document.body) : null}
    </>
  );
}
