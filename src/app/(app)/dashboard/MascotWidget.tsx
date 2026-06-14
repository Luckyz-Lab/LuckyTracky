"use client";

import { useMemo } from "react";
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
      label: "น้องอิ่มหนำสำราญ มีออร่าสีทอง ✨",
      sub: "เงินเหลือเยอะมาก เก่งมากเลย!",
      gradient: "from-lucky-50 to-cream-100 dark:from-lucky-900/30 dark:to-slate-800/60",
      border: "border-lucky-200/80 dark:border-lucky-800/50",
    };
  }
  if (balance > 1000) {
    return {
      slot: "idle",
      label: "น้องสบายดี เงินยังเหลือเฟือ 😸",
      sub: "ยังโอเคอยู่นะ ใช้อย่างระวัง",
      gradient: "from-sky-50 to-cream-100 dark:from-sky-900/20 dark:to-slate-800/60",
      border: "border-sky-200/80 dark:border-sky-800/50",
    };
  }
  if (balance > 0) {
    return {
      slot: "sleeping",
      label: "น้องเริ่มเหงื่อตก ใกล้หมดแล้วนะ 😰",
      sub: "ประหยัดหน่อยได้เลย~",
      gradient: "from-peach-50 to-cream-100 dark:from-orange-900/20 dark:to-slate-800/60",
      border: "border-peach-200/80 dark:border-orange-800/50",
    };
  }
  return {
    slot: "shocked",
    label: "แงงง ช็อตแล้วเมี้ยว! 🙀",
    sub: "เดือนนี้หมดแล้ว ไม่เป็นไร เดือนหน้าสู้ใหม่!",
    gradient: "from-rose-50 to-cream-100 dark:from-rose-900/20 dark:to-slate-800/60",
    border: "border-rose-200/80 dark:border-rose-800/50",
  };
}

export default function MascotWidget({ balance, dailyRemaining, currency }: Props) {
  const { play } = useSound();
  const mood = useMemo(() => getMascotMood(balance), [balance]);

  const dailyText = useMemo(() => {
    if (dailyRemaining > 0) return `วันนี้ใช้ได้อีก ${fmt(dailyRemaining, currency)}`;
    if (dailyRemaining === 0) return "วันนี้หมดพอดีเป๊ะ!";
    return "วันนี้ใช้เกินแล้วน้าา ~";
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
      <div className="text-center">
        <p className="font-display text-sm font-semibold text-slate-700 dark:text-slate-200 leading-snug">
          {mood.label}
        </p>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{mood.sub}</p>
      </div>
      <div className="w-full rounded-2xl bg-white/70 dark:bg-slate-800/60 px-4 py-2.5 text-center border border-white/80 dark:border-slate-700/60 shadow-soft">
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">วันนี้ใช้ได้</p>
        <p className={`font-display text-lg font-bold mt-0.5 ${dailyRemaining >= 0 ? "text-lucky-600 dark:text-lucky-400" : "text-rose-500 dark:text-rose-400"}`}>
          {dailyText}
        </p>
      </div>
    </motion.div>
  );
}
