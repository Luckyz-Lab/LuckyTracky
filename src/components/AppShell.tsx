"use client";

import { useState, useEffect } from "react";
import { Wallet, PanelLeftClose, PanelLeftOpen, Sun, Moon, MessageSquarePlus, X } from "lucide-react";
import Sidebar from "./Sidebar";
import HouseholdSwitcher from "./HouseholdSwitcher";
import type { Household } from "@/lib/supabase/types";

interface Props {
  households: Household[];
  activeHousehold: Household | null;
  children: React.ReactNode;
  chatPanel: React.ReactNode;
}

export default function AppShell({ households, activeHousehold, children, chatPanel }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

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
    "flex items-center gap-3 rounded-lg py-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors";

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside
        className={`hidden lg:flex flex-col gap-4 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300 ease-in-out overflow-hidden flex-shrink-0 ${
          sidebarOpen ? "w-72 p-4" : "w-[68px] p-3"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-1 py-1 flex-shrink-0">
          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-slate-950 dark:bg-brand-700 text-white shadow-sm">
            <Wallet size={18} />
          </span>
          {sidebarOpen && (
            <div className="min-w-0 overflow-hidden">
              <span className="block text-base font-semibold tracking-tight truncate">LuckyTracky</span>
              <span className="block text-xs text-slate-500 dark:text-slate-400">Household finance</span>
            </div>
          )}
        </div>

        {/* Household switcher (only when expanded) */}
        {sidebarOpen && (
          <HouseholdSwitcher households={households} active={activeHousehold} />
        )}

        {/* Nav links */}
        <Sidebar collapsed={!sidebarOpen} />

        {/* Bottom controls */}
        <div className="mt-auto flex flex-col gap-1 border-t border-slate-200 dark:border-slate-800 pt-3">
          {mounted && (
            <button
              onClick={toggleTheme}
              title={dark ? "Light mode" : "Dark mode"}
              className={`${iconBtn} ${sidebarOpen ? "px-3" : "px-2 justify-center"}`}
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
              {sidebarOpen && (dark ? "Light mode" : "Dark mode")}
            </button>
          )}
          <button
            onClick={toggleSidebar}
            title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            className={`${iconBtn} ${sidebarOpen ? "px-3" : "px-2 justify-center"}`}
          >
            {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
            {sidebarOpen && "Collapse"}
          </button>
        </div>
      </aside>

      {/* ── Main content ────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-4 py-5 md:px-8 md:py-8">{children}</div>
      </main>

      {/* ── Chat panel (desktop) ─────────────────────────── */}
      <aside className="hidden w-80 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 xl:flex xl:flex-col">
        {chatPanel}
      </aside>

      {/* ── Chat FAB (mobile/tablet) ─────────────────────────── */}
      <button
        onClick={() => setChatOpen(true)}
        className="xl:hidden fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-slate-950 dark:bg-brand-700 text-white shadow-lg hover:opacity-90 transition-opacity"
        aria-label="Open chat"
      >
        <MessageSquarePlus size={22} />
      </button>

      {/* ── Chat drawer (mobile/tablet) ──────────────────────── */}
      {chatOpen && (
        <div className="xl:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setChatOpen(false)} />
          <div className="relative flex flex-col bg-white dark:bg-slate-900 rounded-t-2xl shadow-2xl" style={{ height: "75dvh" }}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Quick add</span>
              <button onClick={() => setChatOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">{chatPanel}</div>
          </div>
        </div>
      )}
    </div>
  );
}
