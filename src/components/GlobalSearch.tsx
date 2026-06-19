"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Loader2, Search, X } from "lucide-react";
import type { Transaction } from "@/lib/supabase/types";
import { formatMoney } from "@/lib/utils";

export default function GlobalSearch({ householdId, currency }: { householdId: string | null; currency: string }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const requestId = useRef(0);

  useEffect(() => {
    if (!householdId || query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    const timer = setTimeout(async () => {
      const id = ++requestId.current;
      setLoading(true);
      const params = new URLSearchParams({ household_id: householdId, q: query.trim() });
      const response = await fetch(`/api/transactions?${params}`);
      const data = await response.json();
      if (id === requestId.current) {
        setResults((data.transactions ?? []).slice(0, 6));
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [householdId, query]);

  const show = focused && query.trim().length >= 2;
  return (
    <div className="relative w-full max-w-xl">
      <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        aria-label="Search household transactions"
        className="h-11 w-full rounded-full border border-cream-200 bg-cream-50/80 pl-10 pr-10 text-sm text-slate-800 outline-none transition focus:border-lucky-300 focus:ring-4 focus:ring-lucky-100 dark:border-[#403833] dark:bg-[#2e2825] dark:text-slate-100 dark:focus:ring-lucky-900/30"
        placeholder="Search transactions..."
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 160)}
      />
      {loading ? <Loader2 size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin text-lucky-500" /> : query && <button aria-label="Clear search" onClick={() => setQuery("")} className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 hover:bg-cream-100"><X size={15} /></button>}
      {show && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-cream-200 bg-cream-50 p-2 shadow-pop dark:border-[#403833] dark:bg-[#2e2825]">
          {loading ? <p className="px-3 py-6 text-center text-sm text-slate-500">Searching...</p> : results.length ? (
            <ul className="space-y-1">{results.map((transaction) => <li key={transaction.id}><Link href={`/transactions?q=${encodeURIComponent(query.trim())}`} className="flex min-h-12 items-center justify-between gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-lucky-50 dark:hover:bg-[#403833]"><span className="min-w-0"><span className="block truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{transaction.item}</span><span className="block text-xs text-slate-500 dark:text-slate-400">{transaction.category_name ?? "Other"} · {transaction.date}</span></span><span className={`shrink-0 text-sm font-semibold tabular-nums ${transaction.type === "income" ? "text-emerald-700 dark:text-emerald-300" : "text-peach-600 dark:text-peach-300"}`}>{transaction.type === "income" ? "+" : "-"}{formatMoney(Number(transaction.amount), currency)}</span></Link></li>)}</ul>
          ) : <p className="px-3 py-6 text-center text-sm text-slate-500">No matching transactions</p>}
        </div>
      )}
    </div>
  );
}
