"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, RefreshCw, Check, UserPlus, Loader2 } from "lucide-react";
import type { Household } from "@/lib/supabase/types";

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
      <header>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-zinc-500">{household.name}</p>
      </header>

      {/* Members */}
      <section className="card p-5">
        <h2 className="mb-3 text-sm font-semibold text-zinc-700">Household members</h2>
        <ul className="divide-y divide-zinc-100">
          {members.map((m) => (
            <li key={m.profile_id} className="flex items-center justify-between py-2.5 text-sm">
              <span>{m.display_name ?? "Member"}</span>
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500">{m.role}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Invite */}
      <section className="card p-5">
        <h2 className="mb-3 text-sm font-semibold text-zinc-700">Invite people</h2>
        <p className="mb-2 text-xs text-zinc-500">Share this code or link so others can join this household.</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 rounded-xl bg-zinc-50 px-3 py-2 text-sm">{code}</code>
          <button onClick={copy} className="btn-outline">
            {copied ? <Check size={16} className="text-brand-600" /> : <Copy size={16} />}
          </button>
          {isOwner && (
            <button onClick={regenerate} disabled={busy} className="btn-outline" title="Regenerate">
              <RefreshCw size={16} className={busy ? "animate-spin" : ""} />
            </button>
          )}
        </div>
      </section>

      {/* Join another household */}
      <section className="card p-5">
        <h2 className="mb-3 text-sm font-semibold text-zinc-700">Join another household</h2>
        <div className="flex items-center gap-2">
          <input className="input flex-1" placeholder="Enter invite code" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} />
          <button onClick={join} disabled={busy || !joinCode} className="btn-primary">
            <UserPlus size={16} /> Join
          </button>
        </div>
      </section>

      {/* LINE default household */}
      <section className="card p-5">
        <h2 className="mb-1 text-sm font-semibold text-zinc-700">LINE default household</h2>
        <p className="mb-3 text-xs text-zinc-500">
          {lineAccount
            ? "Transactions you type in the LINE bot are saved into this household."
            : "No LINE account linked yet. Sign in with LINE to link your account."}
        </p>
        <select
          className="input"
          disabled={!lineAccount}
          value={defaultHh}
          onChange={(e) => saveLineDefault(e.target.value)}
        >
          <option value="">Select household</option>
          {households.map((h) => (
            <option key={h.id} value={h.id}>
              {h.name}
            </option>
          ))}
        </select>
      </section>

      {/* Currency */}
      <section className="card p-5">
        <h2 className="mb-3 text-sm font-semibold text-zinc-700">Currency</h2>
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
