"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2, ScanLine, Check, Save } from "lucide-react";
import { getCategoryEmoji } from "@/lib/category-colors";
import type { Category } from "@/lib/supabase/types";
import type { ChatTransactionPayload } from "@/lib/chat-types";
import CatDecor from "./CatDecor";

export default function ReceiptsView({
  householdId,
  categories,
}: {
  householdId: string;
  categories: Category[];
}) {
  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [draft, setDraft] = useState<ChatTransactionPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setSaved(false);
    setDraft(null);
    setPreview(URL.createObjectURL(file));
    setParsing(true);

    const fd = new FormData();
    fd.append("image", file);
    try {
      const res = await fetch("/api/receipts", { method: "POST", body: fd });
      const data = await res.json();
      if (data.error) setError(data.error);
      else setDraft(data.draft);
    } catch {
      setError("Failed to read receipt.");
    } finally {
      setParsing(false);
    }
  }

  async function save() {
    if (!draft) return;
    setSaving(true);
    await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        household_id: householdId,
        item: draft.item,
        amount: draft.amount,
        type: draft.type === "รายรับ" ? "income" : "expense",
        category_name: draft.category,
        date: draft.date,
      }),
    });
    setSaving(false);
    setSaved(true);
    router.refresh();
  }

  const expenseCats = categories.filter((c) => c.type === (draft?.type === "รายรับ" ? "income" : "expense"));

  return (
    <div className="space-y-6">
      <header className="relative overflow-hidden rounded-[2.25rem] border border-cream-200/80 bg-gradient-to-br from-cream-50 via-lucky-50 to-cream-100 p-5 shadow-puff dark:border-[#403833] dark:from-[#2e2825] dark:via-[#352e2a] dark:to-[#241f1c]">
        <div className="pointer-events-none absolute -right-14 -top-14 h-48 w-48 rounded-full bg-lucky-200/35 blur-3xl" />
        <CatDecor pose="sit" size={108} className="absolute bottom-0 right-8 hidden opacity-90 md:block" />
        <div className="relative max-w-xl">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-lucky-500">Receipt scanner</p>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-lucky-900 dark:text-cream-50">Lucky reads receipts</h1>
          <p className="page-subtitle">Upload a slip or receipt and Lucky will read it and log it automatically</p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Upload zone */}
        <section className="card p-5">
          <label className="flex cursor-pointer flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed border-lucky-200 bg-lucky-50/60 p-10 text-center transition-colors hover:border-lucky-400 hover:bg-lucky-50 dark:border-[#403833] dark:bg-[#352e2a] dark:hover:bg-[#403833]">
            {parsing ? (
              <>
                <ScanLine size={32} className="animate-pulse text-lucky-500" />
                <span className="text-sm font-medium text-lucky-700 dark:text-lucky-300">Reading receipt...</span>
              </>
            ) : preview ? (
              <span className="text-sm text-lucky-600 dark:text-lucky-400">Click to change image</span>
            ) : (
              <>
                <Upload size={32} className="text-lucky-400" />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Click to upload image</span>
                <span className="text-xs text-slate-400">JPG, PNG supported</span>
              </>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={onFile} />
          </label>
          {preview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Receipt preview" className="mt-4 max-h-72 w-full rounded-2xl object-contain shadow-soft" />
          )}
        </section>

        {/* Draft result */}
        <section className="card p-5">
          <h2 className="mb-4 flex items-center gap-2 font-display text-sm font-semibold text-slate-700 dark:text-slate-300">
            <ScanLine size={16} className="text-lucky-600" /> Parsed result
          </h2>

          {parsing && (
            <div className="flex flex-col items-center gap-3 py-8">
              <Loader2 size={28} className="animate-spin text-lucky-500" />
              <p className="text-sm text-slate-400">Reading receipt...</p>
            </div>
          )}
          {error && (
            <p className="rounded-2xl border border-peach-200 bg-peach-50 px-4 py-3 text-sm text-peach-600 dark:border-[#5a2e26] dark:bg-[#3a201a] dark:text-peach-300">
              {error}
            </p>
          )}

          {draft && !parsing && (
            <div className="space-y-3">
              <div>
                <label className="label">Item / Store</label>
                <input className="input" value={draft.item ?? ""} onChange={(e) => setDraft({ ...draft, item: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Amount</label>
                  <input className="input" type="number" value={draft.amount ?? ""} onChange={(e) => setDraft({ ...draft, amount: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="label">Date</label>
                  <input className="input" type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="label">Category</label>
                <select className="input" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })}>
                  {expenseCats.map((c) => (
                    <option key={c.id} value={c.name}>{getCategoryEmoji(c.name)} {c.name}</option>
                  ))}
                </select>
              </div>
              <button onClick={save} disabled={saving || saved} className="btn-primary w-full py-3">
                {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : <Save size={16} />}
                {saved ? "Saved" : "Save transaction"}
              </button>
            </div>
          )}

          {!draft && !parsing && !error && (
            <div className="flex flex-col items-center gap-3 rounded-[1.5rem] border-2 border-dashed border-cream-200 bg-cream-50/70 py-10 text-center dark:border-[#403833] dark:bg-[#352e2a]">
              <CatDecor pose="walk" size={84} />
              <p className="text-sm text-slate-400 dark:text-slate-500">Upload a receipt and Lucky will read it for you</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
