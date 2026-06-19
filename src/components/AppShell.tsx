"use client";

import { useState, useEffect } from "react";
import { PanelLeftClose, PanelLeftOpen, Sun, Moon, Volume2, VolumeX, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./Sidebar";
import HouseholdSwitcher from "./HouseholdSwitcher";
import CatPawFab from "./CatPawFab";
import { useSound } from "./mascot/SoundProvider";
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
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 py-5 md:px-8 md:py-8">{children}</div>
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
                  🐾 Add new entry
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
