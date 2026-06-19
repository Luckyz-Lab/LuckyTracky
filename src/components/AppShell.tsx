"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, PanelLeftClose, PanelLeftOpen, PiggyBank, Plus, ReceiptText, Settings, Sun, Moon, Volume2, VolumeX, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./Sidebar";
import HouseholdSwitcher from "./HouseholdSwitcher";
import CatPawFab from "./CatPawFab";
import GlobalSearch from "./GlobalSearch";
import NotificationMenu from "./NotificationMenu";
import QuickAddModal from "./QuickAddModal";
import HelpDrawer from "./HelpDrawer";
import { useSound } from "./mascot/SoundProvider";
import type { Household } from "@/lib/supabase/types";

interface Props {
  households: Household[];
  activeHousehold: Household | null;
  children: React.ReactNode;
  chatPanel: React.ReactNode;
}

export default function AppShell({ households, activeHousehold, children, chatPanel }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const { enabled: soundEnabled, toggle: toggleSound } = useSound();

  useEffect(() => {
    setMounted(true);

    const storedSidebar = localStorage.getItem("sidebar");
    if (storedSidebar !== null) setSidebarOpen(storedSidebar !== "closed");

    const storedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = storedTheme ? storedTheme === "dark" : prefersDark;
    if (isDark) {
      document.documentElement.classList.add("dark");
      setDark(true);
    }

    const applyTheme = (theme: string) => {
      document.documentElement.classList.remove("theme-classic", "theme-calico", "theme-siamese", "theme-black-cat", "theme-midnight");
      document.documentElement.classList.add(`theme-${theme}`);
      if (theme === "black-cat" || theme === "midnight") {
        document.documentElement.classList.add("dark");
        setDark(true);
      }
    };
    fetch("/api/preferences").then((response) => response.json()).then((data) => {
      if (data.preferences?.theme) applyTheme(data.preferences.theme);
    });
    const onPreferences = (event: Event) => {
      const custom = event as CustomEvent<{ theme?: string }>;
      if (custom.detail?.theme) applyTheme(custom.detail.theme);
    };
    window.addEventListener("lucky-preferences-updated", onPreferences);
    return () => window.removeEventListener("lucky-preferences-updated", onPreferences);
  }, []);

  function toggleSidebar() {
    const next = !sidebarOpen;
    setSidebarOpen(next);
    localStorage.setItem("sidebar", next ? "open" : "closed");
  }

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }

  const iconBtn =
    "flex items-center gap-3 rounded-2xl py-2 text-sm font-medium text-slate-500 transition-all duration-150 hover:bg-lucky-100 hover:text-lucky-700 dark:text-slate-400 dark:hover:bg-[#352e2a] dark:hover:text-lucky-300";

  return (
    <div className="flex h-screen overflow-hidden text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* ── Sidebar ───────────────────────────────────────── */}
      <aside
        className={`hidden lg:flex flex-col gap-4 border-r border-cream-200/80 dark:border-[#403833] bg-cream-50/95 dark:bg-[#2e2825] transition-all duration-300 ease-in-out overflow-hidden flex-shrink-0 ${
          sidebarOpen ? "w-72 p-4" : "w-[68px] p-3"
        }`}
        style={{
          boxShadow: "0 10px 24px -10px rgba(117, 99, 89, 0.28), inset 0 2px 4px rgba(255, 255, 255, 0.55), inset 0 -3px 6px rgba(117, 99, 89, 0.10)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-1 py-1 flex-shrink-0">
          <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-lucky-300 to-lucky-500 text-white shadow-puff text-xl">
            🍀
          </span>
          {sidebarOpen && (
            <div className="min-w-0 overflow-hidden">
              <span className="block font-display text-base font-semibold tracking-tight truncate text-slate-800 dark:text-slate-100">LuckyTracky</span>
              <span className="block text-xs text-slate-400 dark:text-slate-500">Track your spending</span>
            </div>
          )}
        </div>

        {/* Household switcher */}
        {sidebarOpen && (
          <HouseholdSwitcher households={households} active={activeHousehold} />
        )}

        {/* Nav links */}
        <Sidebar collapsed={!sidebarOpen} />

        {/* Bottom controls */}
        <div className="mt-auto flex flex-col gap-1 border-t border-slate-100 dark:border-slate-800 pt-3">
          {mounted && (
            <>
              <button
                onClick={toggleSound}
                title={soundEnabled ? "Mute sound" : "Sound on"}
                className={`${iconBtn} ${sidebarOpen ? "px-3" : "px-2 justify-center"}`}
              >
                {soundEnabled ? <Volume2 size={17} /> : <VolumeX size={17} />}
                {sidebarOpen && (soundEnabled ? "Mute" : "Sound")}
              </button>
              <button
                onClick={toggleTheme}
                title={dark ? "Light mode" : "Dark mode"}
                className={`${iconBtn} ${sidebarOpen ? "px-3" : "px-2 justify-center"}`}
              >
                {dark ? <Sun size={17} /> : <Moon size={17} />}
                {sidebarOpen && (dark ? "Light mode" : "Dark mode")}
              </button>
            </>
          )}
          <button
            onClick={toggleSidebar}
            title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            className={`${iconBtn} ${sidebarOpen ? "px-3" : "px-2 justify-center"}`}
          >
            {sidebarOpen ? <PanelLeftClose size={17} /> : <PanelLeftOpen size={17} />}
            {sidebarOpen && "Collapse"}
          </button>
        </div>
      </aside>

      {/* ── Main content ──────────────────────────────────── */}
      <main id="main-content" className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-30 border-b border-cream-200/80 bg-[#fbf4f1]/90 px-4 py-3 backdrop-blur-xl dark:border-[#403833] dark:bg-[#241f1c]/90 md:px-8">
          <div className="mx-auto flex max-w-7xl items-center gap-3">
            <div className="min-w-0 flex-1">
              <GlobalSearch householdId={activeHousehold?.id ?? null} currency={activeHousehold?.currency ?? "THB"} />
            </div>
            <button onClick={() => setQuickAddOpen(true)} className="btn-primary hidden min-h-11 shrink-0 sm:inline-flex"><Plus size={17} />Quick add</button>
            <HelpDrawer />
            <NotificationMenu />
          </div>
        </header>
        <div className="mx-auto max-w-7xl px-4 py-5 pb-28 md:px-8 md:py-8 md:pb-28 lg:pb-8">{children}</div>
      </main>

      {/* ── Chat panel (desktop) ──────────────────────────── */}
      <aside
        className="hidden w-80 border-l border-cream-200/80 dark:border-[#403833] bg-cream-50/95 dark:bg-[#2e2825] xl:flex xl:flex-col"
        style={{
          boxShadow: "-4px 0 24px -10px rgba(117, 99, 89, 0.25), inset 2px 0 4px rgba(255, 255, 255, 0.50), inset 0 -3px 6px rgba(117, 99, 89, 0.08)",
        }}
      >
        {chatPanel}
      </aside>

      {/* ── Cat Paw FAB (mobile/tablet) ───────────────────── */}
      <CatPawFab onClick={() => setChatOpen(true)} />

      <nav aria-label="Mobile navigation" className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-5 rounded-[1.5rem] border border-cream-200 bg-cream-50/95 p-1.5 shadow-pop backdrop-blur-xl dark:border-[#403833] dark:bg-[#2e2825]/95 lg:hidden">
        {[
          { href: "/dashboard", label: "Home", icon: Home },
          { href: "/transactions", label: "Entries", icon: ReceiptText },
          { href: "/savings", label: "Savings", icon: PiggyBank },
          { href: "/settings", label: "Settings", icon: Settings },
        ].map((item, index) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          const column = index < 2 ? index + 1 : index + 2;
          return (
            <Link key={item.href} href={item.href} style={{ gridColumn: column }} aria-current={active ? "page" : undefined} className={`flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-2xl text-[11px] font-semibold transition-colors ${active ? "bg-lucky-100 text-lucky-800 dark:bg-[#403833] dark:text-lucky-200" : "text-slate-500 dark:text-slate-400"}`}>
              <Icon size={18} /><span>{item.label}</span>
            </Link>
          );
        })}
        <button aria-label="Quick add" onClick={() => setQuickAddOpen(true)} className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl bg-gradient-to-b from-lucky-300 to-lucky-500 text-white shadow-pop focus:outline-none focus:ring-4 focus:ring-lucky-200"><Plus size={23} /></button>
      </nav>

      <QuickAddModal open={quickAddOpen} householdId={activeHousehold?.id ?? null} onClose={() => setQuickAddOpen(false)} onSaved={() => router.refresh()} />

      {/* ── Chat drawer (mobile/tablet) ───────────────────── */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            className="xl:hidden fixed inset-0 z-50 flex flex-col justify-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setChatOpen(false)}
            />
            <motion.div
              className="relative flex flex-col bg-cream-50 dark:bg-[#2e2825] rounded-t-3xl"
              style={{
                height: "75dvh",
                boxShadow: "0 -8px 32px -8px rgba(117, 99, 89, 0.35), inset 0 2px 4px rgba(255, 255, 255, 0.50)",
              }}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-cream-200 dark:border-[#403833]">
                <span className="font-display text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Add with Lucky
                </span>
                <button
                  onClick={() => setChatOpen(false)}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 overflow-hidden">{chatPanel}</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
