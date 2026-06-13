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
    <div className="flex items-center gap-0.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-1 py-1">
      <button
        onClick={() => navigate(addMonths(month, -1))}
        className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
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
        className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        title="Next month"
      >
        <ChevronRight size={15} />
      </button>

      {!isCurrentMonth && (
        <button
          onClick={() => navigate(today)}
          className="ml-1 rounded-md px-2 py-1 text-xs font-medium text-brand-700 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/30 transition-colors"
          title="Back to current month"
        >
          Today
        </button>
      )}
    </div>
  );
}
