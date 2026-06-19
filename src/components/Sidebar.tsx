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
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ collapsed = false }: { collapsed?: boolean }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 flex-col gap-1 min-w-0">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            title={collapsed ? label : undefined}
            className={cn(
              "flex min-h-10 items-center rounded-2xl transition-all duration-150",
              collapsed ? "justify-center px-2 py-2" : "gap-3 px-3 py-2 text-sm font-medium",
              active
                ? "bg-gradient-to-r from-lucky-300 to-lucky-500 text-white shadow-puff"
                : "text-slate-600 dark:text-slate-400 hover:bg-lucky-100 hover:text-lucky-700 dark:hover:bg-[#352e2a] dark:hover:text-lucky-300"
            )}
          >
            <Icon
              size={18}
              className={cn(
                "flex-shrink-0",
                active ? "text-white/90" : "text-slate-400 dark:text-slate-500"
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
            "flex min-h-10 w-full items-center rounded-2xl text-slate-500 transition-colors hover:bg-peach-50 hover:text-peach-600 dark:text-slate-400 dark:hover:bg-[#3a201a] dark:hover:text-peach-300",
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
