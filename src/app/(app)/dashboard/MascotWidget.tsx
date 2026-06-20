"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Mascot, { type MascotSlot } from "@/components/mascot/Mascot";
import { useSound } from "@/components/mascot/SoundProvider";

interface Props {
  balance: number;
  dailyRemaining: number;
  currency: string;
}

function fmt(n: number, c: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: c, maximumFractionDigits: 0 }).format(n);
}

function getMascotMood(balance: number): {
  slot: MascotSlot;
  label: string;
  sub: string;
  gradient: string;
  border: string;
} {
  if (balance > 5000) {
    return {
      slot: "celebrate",
      label: "Lucky is thriving, golden aura ✨",
      sub: "Great balance — you're doing amazing!",
      gradient: "from-lucky-50 to-cream-100 dark:from-lucky-900/30 dark:to-slate-800/60",
      border: "border-lucky-200/80 dark:border-lucky-800/50",
    };
  }
  if (balance > 1000) {
    return {
      slot: "idle",
      label: "Lucky is comfortable 😸",
      sub: "Still looking good — spend carefully.",
      gradient: "from-sky-100 to-cream-100 dark:from-[#26303a] dark:to-[#2e2825]",
      border: "border-sky-200/80 dark:border-[#33414d]",
    };
  }
  if (balance > 0) {
    return {
      slot: "sleeping",
      label: "Lucky is getting nervous 😰",
      sub: "Running low — try to save a bit.",
      gradient: "from-peach-50 to-cream-100 dark:from-orange-900/20 dark:to-slate-800/60",
      border: "border-peach-200/80 dark:border-orange-800/50",
    };
  }
  return {
    slot: "shocked",
    label: "Oh no, Lucky is shocked! 🙀",
    sub: "Budget's gone — no worries, next month!",
    gradient: "from-peach-50 to-cream-100 dark:from-[#3a201a] dark:to-[#2e2825]",
    border: "border-peach-200/80 dark:border-[#5a2e26]",
  };
}

export default function MascotWidget({ balance, dailyRemaining, currency }: Props) {
  const { play } = useSound();
  const [identity, setIdentity] = useState({ name: "Lucky", breed: "tabby", color: "#FFEFE6", accessory: "collar bell" });
  const mood = useMemo(() => getMascotMood(balance), [balance]);

  useEffect(() => {
    fetch("/api/preferences").then((response) => response.json()).then((data) => {
      const preferences = data.preferences;
      if (preferences) setIdentity({ name: preferences.mascot_name, breed: preferences.mascot_breed, color: preferences.mascot_color, accessory: String(preferences.mascot_accessory).replaceAll("_", " ") });
    });
  }, []);

  const dailyText = useMemo(() => {
    if (dailyRemaining > 0) return `${fmt(dailyRemaining, currency)} left today`;
    if (dailyRemaining === 0) return "Exactly on budget today!";
    return "Over budget today 😬";
  }, [dailyRemaining, currency]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
      className={`relative flex flex-col items-center gap-3 rounded-3xl border bg-gradient-to-br p-5 shadow-puff ${mood.gradient} ${mood.border} min-w-[180px]`}
    >
      <Mascot
        slot={mood.slot}
        size={110}
        interactive
        onTap={() => play("tap")}
      />
      <span className="inline-flex items-center gap-2 rounded-full border border-cream-200 bg-cream-50/80 px-3 py-1 text-xs font-semibold capitalize text-slate-600 shadow-soft dark:border-[#403833] dark:bg-[#352e2a] dark:text-slate-300"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: identity.color }} />{identity.name} · {identity.breed} · {identity.accessory}</span>
      <div className="text-center">
        <p className="font-display text-sm font-semibold text-slate-700 dark:text-slate-200 leading-snug">
          {mood.label}
        </p>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{mood.sub}</p>
      </div>
      <div className="w-full rounded-2xl border border-cream-200 bg-cream-50/75 px-4 py-2.5 text-center shadow-soft dark:border-[#403833] dark:bg-[#352e2a]">
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Today&apos;s budget</p>
        <p className={`font-display text-lg font-bold mt-0.5 ${dailyRemaining >= 0 ? "text-positive" : "text-negative"}`}>
          {dailyText}
        </p>
      </div>
    </motion.div>
  );
}
