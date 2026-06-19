"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bot,
  CalendarDays,
  Cat,
  ChevronRight,
  Home,
  Menu,
  MessageSquare,
  Moon,
  PawPrint,
  PiggyBank,
  Plus,
  ReceiptText,
  RefreshCw,
  Settings,
  Sun,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Sidebar from "./Sidebar";
import HouseholdSwitcher from "./HouseholdSwitcher";
import CatPawFab from "./CatPawFab";
import GlobalSearch from "./GlobalSearch";
import NotificationMenu from "./NotificationMenu";
import QuickAddModal from "./QuickAddModal";
import HelpDrawer from "./HelpDrawer";
import Mascot from "./mascot/Mascot";
import { useSound } from "./mascot/SoundProvider";
import type { Household } from "@/lib/supabase/types";

interface Props {
  households: Household[];
  activeHousehold: Household | null;
  children: React.ReactNode;
  chatPanel: React.ReactNode;
}

const MOBILE_NAV = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/transactions", label: "Entries", icon: ReceiptText },
  { href: "/savings", label: "Savings", icon: PiggyBank },
  { href: "/settings", label: "Settings", icon: Settings },
];

const PAGE_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  transactions: "Transactions",
  budgets: "Budget",
  reports: "Analytics",
  categories: "Categories",
  receipts: "Receipt Scanner",
  savings: "Goals",
  recurring: "Recurring",
  achievements: "Achievements",
  assistant: "AI Assistant",
  mascot: "Mascot Studio",
  settings: "Settings",
};

export default function AppShell({ households, activeHousehold, children, chatPanel }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { enabled: soundEnabled, toggle: toggleSound } = useSound();

  const pageKey = pathname.split("/").filter(Boolean)[0] ?? "dashboard";
  const pageLabel = PAGE_LABELS[pageKey] ?? "Dashboard";
  const month = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(new Date());

  useEffect(() => {
    setMounted(true);
    const sidebar = localStorage.getItem("sidebar");
    if (sidebar !== null) setSidebarOpen(sidebar !== "closed");
    const storedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldDark = storedTheme ? storedTheme === "dark" : prefersDark;
    document.documentElement.classList.toggle("dark", shouldDark);
    setDark(shouldDark);

    const applyTheme = (theme: string) => {
      document.documentElement.classList.remove("theme-classic", "theme-calico", "theme-siamese", "theme-black-cat", "theme-midnight");
      document.documentElement.classList.add(`theme-${theme}`);
      if (theme === "black-cat" || theme === "midnight") {
        document.documentElement.classList.add("dark");
        setDark(true);
      }
    };
    fetch("/api/preferences").then((response) => response.json()).then((data) => data.preferences?.theme && applyTheme(data.preferences.theme));
    const onPreferences = (event: Event) => {
      const custom = event as CustomEvent<{ theme?: string }>;
      if (custom.detail?.theme) applyTheme(custom.detail.theme);
    };
    window.addEventListener("lucky-preferences-updated", onPreferences);
    return () => window.removeEventListener("lucky-preferences-updated", onPreferences);
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  function toggleSidebar() {
    const next = !sidebarOpen;
    setSidebarOpen(next);
    localStorage.setItem("sidebar", next ? "open" : "closed");
  }

  async function refresh() {
    setRefreshing(true);
    router.refresh();
    setTimeout(() => setRefreshing(false), 650);
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-[#faf8f5] text-slate-900 transition-colors dark:bg-[#090e1d] dark:text-slate-100">
      <aside className={`hidden shrink-0 flex-col border-r-2 border-slate-100 bg-white transition-[width] duration-300 dark:border-slate-800 dark:bg-[#0d1326] lg:flex ${sidebarOpen ? "w-[280px]" : "w-[78px]"}`}>
        <div className={`flex h-[112px] shrink-0 items-center border-b border-slate-100 dark:border-slate-800 ${sidebarOpen ? "gap-3 px-6" : "justify-center px-3"}`}>
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 border-orange-200 bg-orange-50 text-orange-500 shadow-soft"><PawPrint size={23} /></span>
          {sidebarOpen && <div className="min-w-0"><div className="flex items-baseline gap-2"><span className="font-display text-xl font-extrabold tracking-tight">LuckyTracky</span><span className="font-mono text-[10px] font-bold text-orange-400">AI</span></div><p className="mt-0.5 text-xs font-medium text-slate-400">Finance for Happy Cats</p></div>}
        </div>

        <div className="px-4 pt-4">{sidebarOpen && <HouseholdSwitcher households={households} active={activeHousehold} />}</div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4"><Sidebar collapsed={!sidebarOpen} /></div>

        <div className="border-t border-slate-100 p-4 dark:border-slate-800">
          {sidebarOpen && <div className="mb-3 flex flex-col items-center rounded-3xl border-2 border-orange-100 bg-[#faf8f5] p-3 text-center dark:border-slate-700 dark:bg-slate-900"><span className="rounded-full border border-orange-200 bg-white px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-wider text-orange-500">Meow-bernation</span><Mascot slot="sleeping" size={64} /><p className="text-[11px] font-semibold text-slate-500">Lucky is rest-calculating...</p></div>}
          <div className="grid grid-cols-3 gap-1">
            {mounted && <><button aria-label={soundEnabled ? "Mute sound" : "Enable sound"} onClick={toggleSound} className="flex h-11 items-center justify-center rounded-xl text-slate-400 hover:bg-orange-50 hover:text-orange-500">{soundEnabled ? <Volume2 size={17} /> : <VolumeX size={17} />}</button><button aria-label={dark ? "Use light mode" : "Use dark mode"} onClick={toggleTheme} className="flex h-11 items-center justify-center rounded-xl text-slate-400 hover:bg-orange-50 hover:text-orange-500">{dark ? <Sun size={17} /> : <Moon size={17} />}</button></>}
            <button aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"} onClick={toggleSidebar} className="flex h-11 items-center justify-center rounded-xl text-slate-400 hover:bg-orange-50 hover:text-orange-500"><Menu size={18} /></button>
          </div>
        </div>
      </aside>

      <main id="main-content" className="min-w-0 flex-1 overflow-y-auto">
        <header className="sticky top-0 z-30 border-b-2 border-slate-100 bg-white/95 px-4 py-3 backdrop-blur-xl dark:border-slate-800 dark:bg-[#0f162a]/95 md:px-6">
          <div className="mx-auto flex max-w-[1500px] items-center gap-3">
            <div className="hidden shrink-0 items-center gap-2 text-xs font-semibold text-slate-400 xl:flex"><span className="flex items-center gap-1.5"><Cat size={15} className="text-orange-400" />LuckyTracky</span><ChevronRight size={13} /><span className="text-slate-800 dark:text-slate-100">{pageLabel}</span></div>
            <div className="min-w-0 flex-1"><GlobalSearch householdId={activeHousehold?.id ?? null} currency={activeHousehold?.currency ?? "THB"} /></div>
            <button aria-label="Refresh financial data" onClick={refresh} className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl border-2 border-slate-100 bg-white text-slate-500 hover:border-orange-200 hover:text-orange-500 md:flex"><RefreshCw size={17} className={refreshing ? "animate-spin" : ""} /></button>
            <button onClick={() => setChatOpen(true)} className="hidden min-h-11 shrink-0 items-center gap-2 rounded-2xl border-2 border-slate-100 bg-white px-3 text-xs font-bold text-slate-600 hover:border-orange-200 lg:flex"><span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-orange-50 text-orange-500"><Bot size={16} /><span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400" /></span><span className="text-left leading-tight"><span className="block text-[9px] uppercase tracking-wider text-slate-400">Lucky&apos;s mood</span>Auto</span></button>
            <span className="hidden min-h-11 shrink-0 items-center gap-2 rounded-2xl bg-emerald-50 px-3 text-[10px] font-bold text-emerald-700 xl:flex"><span className="h-2 w-2 rounded-full bg-emerald-400" />LuckyAI Connected</span>
            <HelpDrawer />
            <NotificationMenu />
            <button onClick={() => setQuickAddOpen(true)} className="btn-primary hidden min-h-11 shrink-0 sm:inline-flex"><Plus size={17} />Quick Add</button>
            <span className="hidden min-h-11 shrink-0 items-center gap-2 rounded-2xl border-2 border-slate-100 bg-white px-3 text-xs font-semibold text-slate-600 2xl:flex"><CalendarDays size={15} className="text-orange-500" />{month}</span>
          </div>
        </header>

        <div className="mx-auto max-w-[1500px] px-4 py-5 pb-28 md:px-6 md:py-6 lg:pb-8">{children}</div>
      </main>

      <CatPawFab onClick={() => setChatOpen(true)} label="Open Lucky AI assistant" />

      <nav aria-label="Mobile navigation" className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-5 rounded-3xl border-2 border-slate-100 bg-white/95 p-1.5 shadow-pop backdrop-blur-xl dark:border-slate-700 dark:bg-[#0f162a]/95 lg:hidden">
        {MOBILE_NAV.map((item, index) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          const column = index < 2 ? index + 1 : index + 2;
          return <Link key={item.href} href={item.href} style={{ gridColumn: column }} aria-current={active ? "page" : undefined} className={`flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-2xl text-[11px] font-semibold ${active ? "bg-orange-50 text-orange-600" : "text-slate-400"}`}><Icon size={18} /><span>{item.label}</span></Link>;
        })}
        <button aria-label="Quick add" onClick={() => setQuickAddOpen(true)} className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-puff focus:outline-none focus:ring-4 focus:ring-orange-200"><Plus size={23} /></button>
      </nav>

      <QuickAddModal open={quickAddOpen} householdId={activeHousehold?.id ?? null} onClose={() => setQuickAddOpen(false)} onSaved={() => router.refresh()} />

      <AnimatePresence>
        {chatOpen && <motion.div className="fixed inset-0 z-[90] flex items-end justify-end lg:items-stretch" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><button aria-label="Close assistant" className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm" onClick={() => setChatOpen(false)} /><motion.section className="relative flex h-[78dvh] w-full flex-col rounded-t-[2rem] bg-white shadow-2xl dark:bg-[#0f162a] sm:max-w-xl lg:h-full lg:max-w-[430px] lg:rounded-none lg:border-l-2 lg:border-slate-100 dark:lg:border-slate-800" initial={{ y: "100%", x: 0 }} animate={{ y: 0, x: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", stiffness: 330, damping: 32 }}><div className="flex items-center justify-between border-b-2 border-slate-100 px-5 py-4 dark:border-slate-800"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 text-orange-500"><Bot size={20} /></span><div><h2 className="font-display text-sm font-bold">Lucky Cat Advisor</h2><p className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">Active · AI assistant</p></div></div><button aria-label="Close assistant" onClick={() => setChatOpen(false)} className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100"><X size={19} /></button></div><div className="min-h-0 flex-1">{chatPanel}</div></motion.section></motion.div>}
      </AnimatePresence>
    </div>
  );
}
