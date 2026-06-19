"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  PieChart,
  Tags,
  ScanLine,
  Settings,
  LogOut,
  TrendingUp,
  PiggyBank,
  Repeat2,
  Trophy,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: Receipt },
  { href: "/budgets", label: "Budgets", icon: Wallet },
  { href: "/reports", label: "Reports", icon: TrendingUp },
  { href: "/categories", label: "Categories", icon: Tags },
  { href: "/receipts", label: "Scan Receipt", icon: ScanLine },
  { href: "/savings", label: "Savings Goals", icon: PiggyBank },
  { href: "/recurring", label: "Recurring", icon: Repeat2 },
  { href: "/achievements", label: "Achievements", icon: Trophy },
  { href: "/assistant", label: "AI Assistant", icon: MessageSquare },
  { href: "/mascot", label: "Mascot Studio", icon: Sparkles },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ collapsed = false }: { collapsed?: boolean }) {
  const pathname = usePathname();

  return (
    <nav className="flex min-w-0 flex-1 flex-col gap-1.5">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            title={collapsed ? label : undefined}
            className={cn(
              "relative flex min-h-12 items-center rounded-2xl transition-all duration-150",
              collapsed ? "justify-center px-2 py-2" : "gap-3 px-4 py-2 text-sm font-semibold",
              active
                ? "bg-orange-50 text-orange-600 shadow-soft dark:bg-orange-500/10 dark:text-orange-300 before:absolute before:-left-4 before:h-8 before:w-1 before:rounded-r-full before:bg-orange-500"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            )}
          >
            <Icon
              size={18}
              className={cn(
                "flex-shrink-0",
                active ? "text-orange-500" : "text-slate-400 dark:text-slate-500"
              )}
            />
            {!collapsed && <span className="truncate">{label}</span>}
          </Link>
        );
      })}

      <form action="/auth/signout" method="post" className="mt-auto pt-2">
        <button
          type="submit"
          title={collapsed ? "Sign out" : undefined}
          className={cn(
            "flex min-h-12 w-full items-center rounded-2xl text-rose-500 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:text-rose-300 dark:hover:bg-rose-500/10",
            collapsed ? "justify-center px-2 py-2" : "gap-3 px-3 py-2 text-sm font-medium"
          )}
        >
          <LogOut size={18} className="flex-shrink-0" />
          {!collapsed && "Sign out"}
        </button>
      </form>
    </nav>
  );
}
