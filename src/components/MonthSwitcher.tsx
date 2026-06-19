"use client";

import { useRouter, usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { currentMonth, monthLabel } from "@/lib/utils";

function addMonths(month: string, n: number): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + n, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export default function MonthSwitcher({ month }: { month: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const today = currentMonth();
  const isCurrentMonth = month === today;

  function navigate(m: string) {
    router.push(`${pathname}?month=${m}`);
  }

  return (
    <div className="flex items-center gap-0.5 rounded-2xl border border-cream-200 bg-cream-50/80 px-1 py-1 shadow-soft dark:border-[#403833] dark:bg-[#2e2825]">
      <button
        onClick={() => navigate(addMonths(month, -1))}
        className="flex h-7 w-7 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-lucky-100 hover:text-lucky-700 dark:text-slate-400 dark:hover:bg-[#403833]"
        title="Previous month"
      >
        <ChevronLeft size={15} />
      </button>

      <span className="flex items-center gap-1.5 px-3 text-sm font-medium text-slate-700 dark:text-slate-200 min-w-[130px] justify-center">
        <CalendarDays size={13} className="text-slate-400 dark:text-slate-500 flex-shrink-0" />
        {monthLabel(month)}
      </span>

      <button
        onClick={() => navigate(addMonths(month, 1))}
        disabled={isCurrentMonth}
        className="flex h-7 w-7 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-lucky-100 hover:text-lucky-700 disabled:cursor-not-allowed disabled:opacity-30 dark:text-slate-400 dark:hover:bg-[#403833]"
        title="Next month"
      >
        <ChevronRight size={15} />
      </button>

      {!isCurrentMonth && (
        <button
          onClick={() => navigate(today)}
          className="ml-1 rounded-xl px-2 py-1 text-xs font-bold text-lucky-700 transition-colors hover:bg-lucky-100 dark:text-lucky-300 dark:hover:bg-[#403833]"
          title="Back to current month"
        >
          Today
        </button>
      )}
    </div>
  );
}
