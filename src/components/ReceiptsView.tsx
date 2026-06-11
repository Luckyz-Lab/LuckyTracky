"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2, ScanLine, Check } from "lucide-react";
import type { Category } from "@/lib/supabase/types";
import type { ChatTransactionPayload } from "@/lib/chat-types";

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
      <header>
        <h1 className="text-2xl font-bold">Receipts</h1>
        <p className="text-sm text-zinc-500">Upload a slip or receipt and we&apos;ll draft a transaction.</p>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <section className="card p-5">
          <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-zinc-200 p-8 text-center hover:border-brand-300">
            <Upload size={28} className="text-brand-500" />
            <span className="text-sm font-medium">Click to upload an image</span>
            <span className="text-xs text-zinc-400">JPG or PNG</span>
            <input type="file" accept="image/*" className="hidden" onChange={onFile} />
          </label>
          {preview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Receipt preview" className="mt-4 max-h-72 w-full rounded-xl object-contain" />
          )}
        </section>

        <section className="card p-5">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-700">
            <ScanLine size={16} className="text-brand-600" /> Draft transaction
          </h2>

          {parsing && (
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <Loader2 size={16} className="animate-spin" /> Reading receipt...
            </div>
          )}
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

          {draft && !parsing && (
            <div className="space-y-3">
              <div>
                <label className="label">Item / Store</label>
                <input className="input" value={draft.item ?? ""} onChange={(e) => setDraft({ ...draft, item: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Amount</label>
                  <input
                    className="input"
                    type="number"
                    value={draft.amount ?? ""}
                    onChange={(e) => setDraft({ ...draft, amount: Number(e.target.value) })}
                  />
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
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <button onClick={save} disabled={saving || saved} className="btn-primary w-full">
                {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : null}
                {saved ? "Saved" : "Save transaction"}
              </button>
            </div>
          )}

          {!draft && !parsing && !error && (
            <p className="text-sm text-zinc-400">Upload a receipt to see a draft here.</p>
          )}
        </section>
      </div>
    </div>
  );
}
