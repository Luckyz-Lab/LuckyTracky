"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, RefreshCw, Check, UserPlus, Loader2, Volume2, VolumeX } from "lucide-react";
import type { Household } from "@/lib/supabase/types";
import { useSound } from "./mascot/SoundProvider";

interface Member {
  profile_id: string;
  role: string;
  display_name: string | null;
}

interface LineAccount {
  line_user_id: string;
  default_household_id: string | null;
}

export default function SettingsView({
  household,
  members,
  households,
  lineAccount,
  isOwner,
  siteUrl,
}: {
  household: Household;
  members: Member[];
  households: Household[];
  lineAccount: LineAccount | null;
  isOwner: boolean;
  siteUrl: string;
}) {
  const router = useRouter();
  const { enabled: soundEnabled, toggle: toggleSound } = useSound();
  const [code, setCode] = useState(household.invite_code);
  const [currency, setCurrency] = useState(household.currency);
  const [copied, setCopied] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [defaultHh, setDefaultHh] = useState(lineAccount?.default_household_id ?? "");

  const inviteLink = `${siteUrl}/login?invite=${code}`;

  async function regenerate() {
    setBusy(true);
    const res = await fetch("/api/settings/household", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ household_id: household.id, regenerate_code: true }),
    });
    const data = await res.json();
    if (data.household) setCode(data.household.invite_code);
    setBusy(false);
  }

  async function saveCurrency() {
    setBusy(true);
    await fetch("/api/settings/household", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ household_id: household.id, currency }),
    });
    setBusy(false);
    router.refresh();
  }

  async function join() {
    if (!joinCode) return;
    setBusy(true);
    const res = await fetch("/api/settings/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: joinCode.trim() }),
    });
    const data = await res.json();
    setBusy(false);
    if (data.error) alert(data.error);
    else {
      setJoinCode("");
      router.refresh();
    }
  }

  async function saveLineDefault(id: string) {
    setDefaultHh(id);
    await fetch("/api/settings/line", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ default_household_id: id }),
    });
    router.refresh();
  }

  function copy() {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="space-y-6">
      <header className="border-b border-lucky-100/60 dark:border-slate-800 pb-5">
        <h1 className="page-title">ตั้งค่า ⚙️</h1>
        <p className="page-subtitle">{household.name}</p>
      </header>

      {/* App preferences */}
      <section className="card p-5 space-y-4">
        <h2 className="section-title">การแสดงผลและเสียง</h2>
        <div className="flex items-center justify-between rounded-2xl bg-slate-50 dark:bg-slate-800/50 px-4 py-3">
          <div className="flex items-center gap-3">
            {soundEnabled ? <Volume2 size={18} className="text-lucky-600" /> : <VolumeX size={18} className="text-slate-400" />}
            <div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">เสียงเอฟเฟกต์</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{soundEnabled ? "เปิดอยู่" : "ปิดอยู่"}</p>
            </div>
          </div>
          <button
            onClick={toggleSound}
            className={`relative h-7 w-12 rounded-full transition-colors duration-200 focus:outline-none ${
              soundEnabled ? "bg-lucky-500" : "bg-slate-200 dark:bg-slate-700"
            }`}
          >
            <span className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform duration-200 ${
              soundEnabled ? "translate-x-5" : "translate-x-0"
            }`} />
          </button>
        </div>
      </section>

      {/* Members */}
      <section className="card p-5">
        <h2 className="section-title mb-4">สมาชิกในบ้าน 👥</h2>
        <ul className="space-y-2">
          {members.map((m) => (
            <li key={m.profile_id} className="flex items-center justify-between rounded-2xl bg-slate-50 dark:bg-slate-800/50 px-4 py-3 text-sm">
              <span className="font-medium text-slate-800 dark:text-slate-200">{m.display_name ?? "สมาชิก"}</span>
              <span className="rounded-full bg-lucky-100 dark:bg-lucky-900/30 px-3 py-0.5 text-xs font-semibold text-lucky-700 dark:text-lucky-300">{m.role}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Invite */}
      <section className="card p-5">
        <h2 className="section-title mb-1">เชิญเพื่อน 💌</h2>
        <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">แชร์โคดหรือลิงก์นี้ให้คนอื่นเข้าร่วมบ้านได้</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 rounded-2xl bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-sm font-mono text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">{code}</code>
          <button onClick={copy} className="btn-outline">
            {copied ? <Check size={16} className="text-lucky-600" /> : <Copy size={16} />}
          </button>
          {isOwner && (
            <button onClick={regenerate} disabled={busy} className="btn-outline" title="สร้างใหม่">
              <RefreshCw size={16} className={busy ? "animate-spin" : ""} />
            </button>
          )}
        </div>
      </section>

      {/* Join another household */}
      <section className="card p-5">
        <h2 className="section-title mb-3">เข้าร่วมบ้านอื่น 🏠</h2>
        <div className="flex items-center gap-2">
          <input className="input flex-1" placeholder="ใส่โคดเชิญ" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} />
          <button onClick={join} disabled={busy || !joinCode} className="btn-primary">
            <UserPlus size={16} /> เข้าร่วม
          </button>
        </div>
      </section>

      {/* LINE */}
      <section className="card p-5">
        <h2 className="section-title mb-1">LINE Bot 💬</h2>
        <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
          {lineAccount
            ? "ข้อความจาก LINE Bot จะบันทึกเข้าบ้านที่เลือกไว้"
            : "ยังไม่ได้เชื่อมต่อ LINE — ล็อกอินด้วย LINE เพื่อเชื่อมต่อบัญชี"}
        </p>
        <select className="input" disabled={!lineAccount} value={defaultHh} onChange={(e) => saveLineDefault(e.target.value)}>
          <option value="">เลือกบ้าน</option>
          {households.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
        </select>
      </section>

      {/* Currency */}
      <section className="card p-5">
        <h2 className="section-title mb-3">สกุลเงิน 💱</h2>
        <div className="flex items-center gap-2">
          <select className="input w-40" value={currency} onChange={(e) => setCurrency(e.target.value)} disabled={!isOwner}>
            <option value="THB">THB (฿)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="JPY">JPY (¥)</option>
            <option value="GBP">GBP (£)</option>
          </select>
          {isOwner && (
            <button onClick={saveCurrency} disabled={busy} className="btn-primary">
              {busy && <Loader2 size={16} className="animate-spin" />} บันทึก
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
