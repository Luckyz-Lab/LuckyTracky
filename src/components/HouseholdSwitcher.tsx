"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Check, Home } from "lucide-react";
import type { Household } from "@/lib/supabase/types";

export default function HouseholdSwitcher({
  households,
  active,
}: {
  households: Household[];
  active: Household | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function select(id: string) {
    if (id === active?.id) {
      setOpen(false);
      return;
    }
    setLoading(true);
    await fetch("/api/household/active", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ householdId: id }),
    });
    setOpen(false);
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={loading}
        className="flex min-h-10 w-full items-center justify-between gap-2 rounded-2xl border border-cream-200 bg-cream-50/80 px-3 py-2 text-left text-sm shadow-soft transition-colors hover:bg-lucky-50 dark:border-[#403833] dark:bg-[#352e2a] dark:hover:bg-[#403833]"
      >
        <span className="flex items-center gap-2 truncate">
          <Home size={16} className="text-lucky-700 dark:text-lucky-300" />
          <span className="truncate font-semibold text-slate-800 dark:text-slate-100">{active?.name ?? "No household"}</span>
        </span>
        <ChevronDown size={16} className="text-slate-400" />
      </button>

      {open && (
        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-cream-200 bg-cream-50 shadow-puff dark:border-[#403833] dark:bg-[#2e2825]">
          {households.map((h) => (
            <button
              key={h.id}
              onClick={() => select(h.id)}
              className="flex min-h-10 w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors hover:bg-lucky-50 dark:hover:bg-[#352e2a]"
            >
              <span className="truncate text-slate-700 dark:text-slate-200">{h.name}</span>
              {h.id === active?.id && <Check size={15} className="text-lucky-700 dark:text-lucky-300" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
