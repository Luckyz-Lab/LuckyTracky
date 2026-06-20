"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, LayoutPanelTop, Loader2, Moon, Palette, RotateCcw, Save, SlidersHorizontal, Sparkles, Sun } from "lucide-react";
import { useTheme, type ThemePreferences } from "@/components/theme/ThemeProvider";
import { contrastRatio, DEFAULT_THEME_OVERRIDES, effectiveThemeId, THEME_PRESETS } from "@/lib/theme";
import type { AppTheme, ThemeMode, ThemeOverrides } from "@/lib/supabase/types";

const MODES: Array<{ id: ThemeMode; label: string; icon: typeof Sun }> = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
  { id: "system", label: "System", icon: LayoutPanelTop },
];

const RADII: Array<{ id: ThemeOverrides["radius"]; label: string }> = [
  { id: "compact", label: "Compact" }, { id: "soft", label: "Soft" }, { id: "rounded", label: "Rounded" },
];
const SHADOWS: Array<{ id: ThemeOverrides["shadow"]; label: string }> = [
  { id: "flat", label: "Flat" }, { id: "soft", label: "Soft" }, { id: "lifted", label: "Lifted" },
];

export default function AppearanceStudio() {
  const theme = useTheme();
  const { setPreview } = theme;
  const initial = useMemo<ThemePreferences>(() => ({ theme: theme.theme, theme_mode: theme.theme_mode, theme_overrides: theme.theme_overrides }), [theme.theme, theme.theme_mode, theme.theme_overrides]);
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const committed = useRef(initial);

  const effectiveId = form.theme_mode === "system" ? theme.effectiveTheme : effectiveThemeId(form.theme, form.theme_mode);
  const preset = THEME_PRESETS.find((item) => item.id === effectiveId) ?? THEME_PRESETS[0];
  const surface = form.theme_overrides.surface ?? preset.palette.surface;
  const text = form.theme_overrides.text ?? preset.palette.text;
  const primary = form.theme_overrides.primary ?? preset.palette.primary;
  const textContrast = contrastRatio(text, surface);
  const buttonContrast = contrastRatio(primary, preset.palette.onPrimary);
  const valid = textContrast >= 4.5 && buttonContrast >= 4.5;

  useEffect(() => setPreview(form), [form, setPreview]);
  useEffect(() => () => setPreview(committed.current), [setPreview]);

  function updateOverrides(patch: Partial<ThemeOverrides>) {
    setForm((current) => ({ ...current, theme_overrides: { ...current.theme_overrides, ...patch } }));
  }

  function selectPreset(id: AppTheme) {
    const selected = THEME_PRESETS.find((item) => item.id === id)!;
    setForm((current) => ({ ...current, theme: id, theme_mode: current.theme_mode === "system" ? "system" : selected.mode }));
  }

  function reset() {
    const next = { theme: "classic" as const, theme_mode: "light" as const, theme_overrides: DEFAULT_THEME_OVERRIDES };
    setForm(next);
    setError("");
  }

  function cancel() {
    setForm(committed.current);
    setError("");
  }

  async function save() {
    if (!valid) return;
    setSaving(true);
    setSaved(false);
    setError("");
    const response = await fetch("/api/preferences", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await response.json();
    setSaving(false);
    if (!response.ok) return setError(data.error || "Could not save appearance");
    committed.current = { theme: data.preferences.theme, theme_mode: data.preferences.theme_mode, theme_overrides: data.preferences.theme_overrides };
    window.dispatchEvent(new CustomEvent("lucky-preferences-updated", { detail: data.preferences }));
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.72fr)]">
      <section className="card overflow-hidden">
        <div className="border-b border-line px-5 py-5 sm:px-6">
          <div className="flex items-start gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-control bg-primary-soft text-primary"><Palette size={20} /></span><div><h2 className="section-title text-lg">Theme presets</h2><p className="page-subtitle">Choose a complete palette, then fine-tune only what matters.</p></div></div>
        </div>
        <div className="space-y-7 p-5 sm:p-6">
          <fieldset>
            <legend className="label mb-3">Workspace palette</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {THEME_PRESETS.map((item) => (
                <button key={item.id} type="button" aria-pressed={form.theme === item.id} onClick={() => selectPreset(item.id)} className={`group min-h-24 rounded-card border p-4 text-left transition duration-200 ${form.theme === item.id ? "border-primary bg-primary-soft shadow-card" : "border-line bg-surface hover:border-primary/45"}`}>
                  <span className="flex items-center justify-between gap-3"><span className="font-display text-sm font-bold text-ink-strong">{item.name}</span>{form.theme === item.id && <Check size={17} className="text-primary" />}</span>
                  <span className="mt-2 block text-xs leading-5 text-ink-muted">{item.description}</span>
                  <span className="mt-3 flex gap-1.5">{item.swatches.map((color) => <span key={color} className="h-5 flex-1 rounded-md border border-black/10" style={{ backgroundColor: color }} />)}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="label mb-3">Display mode</legend>
            <div className="grid grid-cols-3 gap-2 rounded-control bg-surface-muted p-1">
              {MODES.map(({ id, label, icon: Icon }) => <button key={id} type="button" aria-pressed={form.theme_mode === id} onClick={() => setForm((current) => ({ ...current, theme_mode: id }))} className={`flex min-h-11 items-center justify-center gap-2 rounded-[calc(var(--ui-control-radius)-4px)] px-2 text-sm font-semibold transition ${form.theme_mode === id ? "bg-surface text-ink-strong shadow-sm" : "text-ink-muted hover:text-ink"}`}><Icon size={16} />{label}</button>)}
            </div>
          </fieldset>

          <div className="border-t border-line pt-6">
            <div className="mb-4 flex items-center gap-2"><SlidersHorizontal size={17} className="text-primary" /><h3 className="font-display text-sm font-bold text-ink-strong">Advanced controls</h3></div>
            <div className="grid gap-5 sm:grid-cols-2">
              <ColorControl label="Primary action" value={form.theme_overrides.primary ?? preset.palette.primary} customized={Boolean(form.theme_overrides.primary)} onChange={(value) => updateOverrides({ primary: value })} onReset={() => updateOverrides({ primary: null })} />
              <ColorControl label="Page background" value={form.theme_overrides.canvas ?? preset.palette.canvas} customized={Boolean(form.theme_overrides.canvas)} onChange={(value) => updateOverrides({ canvas: value })} onReset={() => updateOverrides({ canvas: null })} />
              <ColorControl label="Card surface" value={form.theme_overrides.surface ?? preset.palette.surface} customized={Boolean(form.theme_overrides.surface)} onChange={(value) => updateOverrides({ surface: value })} onReset={() => updateOverrides({ surface: null })} />
              <ColorControl label="Primary text" value={form.theme_overrides.text ?? preset.palette.text} customized={Boolean(form.theme_overrides.text)} onChange={(value) => updateOverrides({ text: value })} onReset={() => updateOverrides({ text: null })} />
            </div>
          </div>

          <ChoiceControl label="Corner style" options={RADII} value={form.theme_overrides.radius} onChange={(value) => updateOverrides({ radius: value as ThemeOverrides["radius"] })} />
          <ChoiceControl label="Elevation" options={SHADOWS} value={form.theme_overrides.shadow} onChange={(value) => updateOverrides({ shadow: value as ThemeOverrides["shadow"] })} />

          {!valid && <p role="alert" className="rounded-control bg-negative-soft px-4 py-3 text-sm font-medium text-negative">Colors need stronger contrast: text {textContrast.toFixed(1)}:1, button {buttonContrast.toFixed(1)}:1. Minimum is 4.5:1.</p>}
          {error && <p role="alert" className="text-sm font-medium text-negative">{error}</p>}
          <div className="flex flex-col-reverse gap-2 border-t border-line pt-5 sm:flex-row sm:justify-between">
            <button type="button" onClick={reset} className="btn-ghost"><RotateCcw size={16} />Reset defaults</button>
            <div className="flex gap-2"><button type="button" onClick={cancel} className="btn-outline flex-1 sm:flex-none">Cancel</button><button type="button" onClick={save} disabled={saving || !valid} className="btn-primary flex-1 sm:flex-none"><Save size={16} />{saving ? "Saving..." : saved ? "Saved" : "Save appearance"}</button></div>
          </div>
        </div>
      </section>

      <aside className="xl:sticky xl:top-24 xl:self-start">
        <div className="mb-3 flex items-center justify-between"><div><p className="label mb-0">Live preview</p><p className="text-xs text-ink-muted">Updates before you save</p></div><Sparkles size={18} className="text-primary" /></div>
        <div className="overflow-hidden rounded-card border border-line bg-canvas p-4 shadow-card sm:p-5">
          <div className="flex items-center justify-between border-b border-line pb-4"><div><p className="font-display text-base font-bold text-ink-strong">Monthly overview</p><p className="text-xs text-ink-muted">June 2026</p></div><span className="rounded-control bg-primary-soft px-3 py-1.5 text-xs font-bold text-primary">On track</span></div>
          <div className="mt-4 rounded-card border border-line bg-surface p-4 shadow-card"><p className="text-xs font-semibold text-ink-muted">Available balance</p><p className="mt-2 font-display text-3xl font-bold tabular-nums text-ink-strong">THB 24,680</p><div className="mt-4 flex items-end gap-1.5" aria-label="Example spending chart">{[42, 68, 51, 84, 63, 92, 72].map((height, index) => <span key={index} className="flex-1 rounded-t-md bg-primary" style={{ height }} />)}</div></div>
          <div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-control bg-positive-soft p-3"><p className="text-xs text-ink-muted">Income</p><p className="mt-1 font-bold tabular-nums text-positive">+32,400</p></div><div className="rounded-control bg-negative-soft p-3"><p className="text-xs text-ink-muted">Expenses</p><p className="mt-1 font-bold tabular-nums text-negative">-7,720</p></div></div>
          <label className="label mt-4" htmlFor="appearance-preview">Example input</label><input id="appearance-preview" className="input" value="Coffee 85" readOnly />
          <div className="mt-4 flex gap-2"><button type="button" className="btn-primary flex-1">Add entry</button><button type="button" className="btn-outline">Details</button></div>
        </div>
      </aside>
    </div>
  );
}

function ColorControl({ label, value, customized, onChange, onReset }: { label: string; value: string; customized: boolean; onChange: (value: string) => void; onReset: () => void }) {
  return <div><div className="mb-1.5 flex items-center justify-between"><label className="label mb-0">{label}</label>{customized && <button type="button" onClick={onReset} className="text-xs font-semibold text-primary hover:underline">Use preset</button>}</div><div className="flex items-center gap-2 rounded-control border border-line bg-surface p-2"><input aria-label={`${label} color`} type="color" value={value} onChange={(event) => onChange(event.target.value.toUpperCase())} className="h-9 w-11 cursor-pointer rounded-lg border-0 bg-transparent p-0" /><span className="font-mono text-xs font-semibold text-ink">{value.toUpperCase()}</span></div></div>;
}

function ChoiceControl<T extends string>({ label, options, value, onChange }: { label: string; options: Array<{ id: T; label: string }>; value: T; onChange: (value: T) => void }) {
  return <fieldset><legend className="label mb-2">{label}</legend><div className="grid grid-cols-3 gap-2">{options.map((option) => <button key={option.id} type="button" aria-pressed={value === option.id} onClick={() => onChange(option.id)} className={`min-h-11 rounded-control border px-3 text-sm font-semibold transition ${value === option.id ? "border-primary bg-primary-soft text-primary" : "border-line bg-surface text-ink-muted hover:border-primary/40 hover:text-ink"}`}>{option.label}</button>)}</div></fieldset>;
}
