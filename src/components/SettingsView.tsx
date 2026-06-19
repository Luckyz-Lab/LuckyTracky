"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Coins, Copy, HousePlus, Mail, MessageCircle, RefreshCw, Check, UserPlus, Loader2, Users, Volume2, VolumeX } from "lucide-react";
import type { Household } from "@/lib/supabase/types";
import { useSound } from "./mascot/SoundProvider";
import CatDecor from "./CatDecor";

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
      <header className="relative overflow-hidden rounded-[2rem] border-2 border-orange-100 bg-white p-6 shadow-soft dark:border-slate-700 dark:bg-slate-900">
        <div className="pointer-events-none absolute -right-14 -top-14 h-48 w-48 rounded-full bg-lucky-200/35 blur-3xl" />
        <CatDecor pose="sit" size={104} className="absolute bottom-0 right-8 hidden opacity-90 md:block" />
        <div className="relative max-w-xl">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-lucky-500">Household controls</p>
          <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">Settings</h1>
          <p className="page-subtitle">{household.name}</p>
        </div>
      </header>

      {/* App preferences */}
      <section className="card p-5 space-y-4">
        <h2 className="section-title">Preferences</h2>
        <div className="flex items-center justify-between rounded-[1.35rem] border border-cream-200/70 bg-cream-50/75 px-4 py-3 shadow-soft dark:border-[#403833] dark:bg-[#352e2a]">
          <div className="flex items-center gap-3">
            {soundEnabled ? <Volume2 size={18} className="text-lucky-600" /> : <VolumeX size={18} className="text-slate-400" />}
            <div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Sound effects</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{soundEnabled ? "On" : "Off"}</p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={soundEnabled}
            aria-label="Sound effects"
            onClick={toggleSound}
            className={`relative h-7 w-12 rounded-full transition-colors duration-200 focus:outline-none ${
              soundEnabled ? "bg-lucky-500" : "bg-cream-200 dark:bg-[#403833]"
            }`}
          >
            <span className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-cream-50 shadow transition-transform duration-200 ${
              soundEnabled ? "translate-x-5" : "translate-x-0"
            }`} />
          </button>
        </div>
      </section>

      {/* Members */}
      <section className="card p-5">
        <h2 className="section-title mb-4 flex items-center gap-2"><Users size={18} className="text-lucky-600" />Household members</h2>
        <ul className="space-y-2">
          {members.map((m) => (
            <li key={m.profile_id} className="flex items-center justify-between rounded-[1.35rem] border border-cream-200/70 bg-cream-50/75 px-4 py-3 text-sm shadow-soft dark:border-[#403833] dark:bg-[#352e2a]">
              <span className="font-medium text-slate-800 dark:text-slate-200">{m.display_name ?? "Member"}</span>
              <span className="rounded-full bg-lucky-100 dark:bg-lucky-900/30 px-3 py-0.5 text-xs font-semibold text-lucky-700 dark:text-lucky-300">{m.role}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Invite */}
      <section className="card p-5">
        <h2 className="section-title mb-1 flex items-center gap-2"><Mail size={18} className="text-lucky-600" />Invite people</h2>
        <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">Share this code or link to invite others to your household</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 rounded-2xl border border-cream-200 bg-cream-50/75 px-4 py-2.5 font-mono text-sm text-slate-700 dark:border-[#403833] dark:bg-[#352e2a] dark:text-slate-300">{code}</code>
          <button aria-label="Copy invite link" onClick={copy} className="btn-outline">
            {copied ? <Check size={16} className="text-lucky-600" /> : <Copy size={16} />}
          </button>
          {isOwner && (
            <button aria-label="Regenerate invite code" onClick={regenerate} disabled={busy} className="btn-outline" title="Regenerate">
              <RefreshCw size={16} className={busy ? "animate-spin" : ""} />
            </button>
          )}
        </div>
      </section>

      {/* Join another household */}
      <section className="card p-5">
        <h2 className="section-title mb-3 flex items-center gap-2"><HousePlus size={18} className="text-lucky-600" />Join another household</h2>
        <div className="flex items-center gap-2">
          <input className="input flex-1" placeholder="Enter invite code" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} />
          <button onClick={join} disabled={busy || !joinCode} className="btn-primary">
            <UserPlus size={16} /> Join
          </button>
        </div>
      </section>

      {/* LINE */}
      <section className="card p-5">
        <h2 className="section-title mb-1 flex items-center gap-2"><MessageCircle size={18} className="text-[#06C755]" />LINE Bot</h2>
        <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
          {lineAccount
            ? "Messages from LINE Bot will be recorded to the selected household"
            : "Not connected to LINE — sign in with LINE to link your account"}
        </p>
        <select className="input" disabled={!lineAccount} value={defaultHh} onChange={(e) => saveLineDefault(e.target.value)}>
          <option value="">Select household</option>
          {households.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
        </select>
      </section>

      {/* Currency */}
      <section className="card p-5">
        <h2 className="section-title mb-3 flex items-center gap-2"><Coins size={18} className="text-grape-500" />Currency</h2>
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
              {busy && <Loader2 size={16} className="animate-spin" />} Save
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
