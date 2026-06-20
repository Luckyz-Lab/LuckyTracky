"use client";

import { useEffect, useState } from "react";
import { Cat, Check, Loader2, Save, Shuffle, Sparkles } from "lucide-react";
import type { MascotAccessory, MascotBreed, ProfilePreferences } from "@/lib/supabase/types";
import { DEFAULT_THEME_OVERRIDES } from "@/lib/theme";

const COLORS = ["#FFEFE6", "#FB923C", "#E2E8F0", "#FEF3C7", "#D2C9BD", "#475569"];
const BREEDS: MascotBreed[] = ["tabby", "siamese", "persian", "calico"];
const ACCESSORIES: MascotAccessory[] = ["none", "collar_bell", "royal_crown", "party_hat", "detective_cap"];

const DEFAULTS: Omit<ProfilePreferences, "profile_id" | "updated_at"> = {
  theme: "classic",
  theme_mode: "light",
  theme_overrides: DEFAULT_THEME_OVERRIDES,
  mascot_name: "Lucky",
  mascot_breed: "tabby",
  mascot_color: "#FFEFE6",
  mascot_accessory: "collar_bell",
  notifications_enabled: true,
};

export default function MascotStudio() {
  const [form, setForm] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/preferences").then((response) => response.json()).then((data) => {
      if (data.preferences) setForm({ ...DEFAULTS, ...data.preferences });
      else setError(data.error || "Preferences are not available yet");
      setLoading(false);
    });
  }, []);

  function randomize() {
    setForm((current) => ({
      ...current,
      mascot_breed: BREEDS[Math.floor(Math.random() * BREEDS.length)],
      mascot_color: COLORS[Math.floor(Math.random() * COLORS.length)],
      mascot_accessory: ACCESSORIES[Math.floor(Math.random() * ACCESSORIES.length)],
    }));
  }

  async function save() {
    setSaving(true);
    setSaved(false);
    setError("");
    const response = await fetch("/api/preferences", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await response.json();
    setSaving(false);
    if (!response.ok) return setError(data.error || "Could not save preferences");
    setForm({ ...DEFAULTS, ...data.preferences });
    setSaved(true);
    window.dispatchEvent(new CustomEvent("lucky-preferences-updated", { detail: data.preferences }));
    setTimeout(() => setSaved(false), 1800);
  }

  if (loading) return <section className="card flex min-h-48 items-center justify-center p-6"><Loader2 className="animate-spin text-lucky-500" size={26} /></section>;

  return (
    <section className="card overflow-hidden p-5 sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-lucky-500">Personal workspace</p><h2 className="section-title mt-1 text-xl">Mascot Studio</h2><p className="mt-1 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">Customize your assistant and choose a theme that follows your account.</p></div><Sparkles className="shrink-0 text-lucky-400" size={24} /></div>
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="relative flex min-h-72 flex-col items-center justify-center overflow-hidden rounded-[1.75rem] border border-cream-200 bg-cream-100/70 p-6 dark:border-[#403833] dark:bg-[#241f1c]">
          <button type="button" onClick={randomize} className="absolute left-3 top-3 flex min-h-11 items-center gap-2 rounded-full border border-cream-200 bg-cream-50 px-3 text-xs font-semibold text-slate-600 shadow-soft dark:border-[#403833] dark:bg-[#2e2825] dark:text-slate-300"><Shuffle size={14} />Randomize</button>
          <div className="flex h-32 w-32 items-center justify-center rounded-[2.5rem] border-4 border-white/60 shadow-puff" style={{ backgroundColor: form.mascot_color }}><Cat size={72} strokeWidth={1.5} className="text-[#3d342e]" /></div>
          <h3 className="mt-5 font-display text-xl font-bold text-slate-900 dark:text-slate-50">{form.mascot_name || "Lucky"}</h3>
          <p className="mt-1 text-sm capitalize text-slate-500 dark:text-slate-400">{form.mascot_breed} · {form.mascot_accessory.replaceAll("_", " ")}</p>
        </div>

        <div className="space-y-5">
          <div><label htmlFor="mascot-name" className="label">Assistant name</label><input id="mascot-name" className="input" maxLength={24} value={form.mascot_name} onChange={(event) => setForm((current) => ({ ...current, mascot_name: event.target.value }))} /></div>
          <fieldset><legend className="label">Breed</legend><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{BREEDS.map((breed) => <button key={breed} type="button" aria-pressed={form.mascot_breed === breed} onClick={() => setForm((current) => ({ ...current, mascot_breed: breed }))} className={`min-h-11 rounded-xl border px-3 text-sm font-semibold capitalize transition-colors ${form.mascot_breed === breed ? "border-lucky-400 bg-lucky-100 text-lucky-800 dark:bg-[#403833] dark:text-lucky-200" : "border-cream-200 text-slate-600 dark:border-[#403833] dark:text-slate-300"}`}>{breed}</button>)}</div></fieldset>
          <fieldset><legend className="label">Coat color</legend><div className="flex flex-wrap gap-3">{COLORS.map((color) => <button key={color} type="button" aria-label={`Use coat color ${color}`} aria-pressed={form.mascot_color === color} onClick={() => setForm((current) => ({ ...current, mascot_color: color }))} className={`flex h-11 w-11 items-center justify-center rounded-full border-2 transition-transform hover:scale-105 ${form.mascot_color === color ? "border-lucky-600" : "border-cream-200 dark:border-[#403833]"}`} style={{ backgroundColor: color }}>{form.mascot_color === color && <Check size={17} className="text-slate-900" />}</button>)}</div></fieldset>
          <div><label htmlFor="mascot-accessory" className="label">Accessory</label><select id="mascot-accessory" className="input capitalize" value={form.mascot_accessory} onChange={(event) => setForm((current) => ({ ...current, mascot_accessory: event.target.value as MascotAccessory }))}>{ACCESSORIES.map((accessory) => <option key={accessory} value={accessory}>{accessory.replaceAll("_", " ")}</option>)}</select></div>
          {error && <p role="alert" className="text-sm text-rose-700 dark:text-rose-300">{error}</p>}
          <button type="button" onClick={save} disabled={saving || !form.mascot_name.trim()} className="btn-primary w-full sm:w-auto">{saving ? <Loader2 className="animate-spin" size={16} /> : saved ? <Check size={16} /> : <Save size={16} />}{saving ? "Saving..." : saved ? "Saved" : "Save preferences"}</button>
        </div>
      </div>
    </section>
  );
}
