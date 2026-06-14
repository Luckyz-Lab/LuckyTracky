"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2, ScanLine, Check } from "lucide-react";
import { getCategoryEmoji } from "@/lib/category-colors";
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
      <header className="border-b border-lucky-100/60 dark:border-slate-800 pb-5">
        <h1 className="page-title">สแกนใบเสร็จ 🧲</h1>
        <p className="page-subtitle">อัปโหลดสลิปหรือใบเสร็จ น้องจะอ่านแล้วบันทึกให้อัตโนมัติ</p>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Upload zone */}
        <section className="card p-5">
          <label className="flex cursor-pointer flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed border-lucky-200 dark:border-lucky-800/50 bg-lucky-50/50 dark:bg-lucky-900/10 p-10 text-center hover:border-lucky-400 hover:bg-lucky-50 dark:hover:bg-lucky-900/20 transition-colors">
            {parsing ? (
              <>
                <span className="text-4xl animate-bounce-soft">🐾</span>
                <span className="text-sm font-medium text-lucky-700 dark:text-lucky-300">น้องกำลังอ่านใบเสร็จ...</span>
              </>
            ) : preview ? (
              <span className="text-sm text-lucky-600 dark:text-lucky-400">คลิกเพื่อเปลี่ยนรูป</span>
            ) : (
              <>
                <Upload size={32} className="text-lucky-400" />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">คลิกเพื่ออัปโหลดรูป</span>
                <span className="text-xs text-slate-400">รองรับ JPG, PNG</span>
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
            <ScanLine size={16} className="text-lucky-600" /> รายการที่อ่านได้
          </h2>

          {parsing && (
            <div className="flex flex-col items-center gap-3 py-8">
              <Loader2 size={28} className="animate-spin text-lucky-500" />
              <p className="text-sm text-slate-400">น้องกำลังอ่านใบเสร็จ...</p>
            </div>
          )}
          {error && (
            <p className="rounded-2xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50 px-4 py-3 text-sm text-rose-600 dark:text-rose-300">
              {error}
            </p>
          )}

          {draft && !parsing && (
            <div className="space-y-3">
              <div>
                <label className="label">รายการ / ร้าน</label>
                <input className="input" value={draft.item ?? ""} onChange={(e) => setDraft({ ...draft, item: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">ยอดเงิน</label>
                  <input className="input" type="number" value={draft.amount ?? ""} onChange={(e) => setDraft({ ...draft, amount: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="label">วันที่</label>
                  <input className="input" type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="label">หมวดหมู่</label>
                <select className="input" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })}>
                  {expenseCats.map((c) => (
                    <option key={c.id} value={c.name}>{getCategoryEmoji(c.name)} {c.name}</option>
                  ))}
                </select>
              </div>
              <button onClick={save} disabled={saving || saved} className="btn-primary w-full py-3">
                {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : null}
                {saved ? "✅ บันทึกแล้ว!" : "💾 บันทึกรายการ"}
              </button>
            </div>
          )}

          {!draft && !parsing && !error && (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <span className="text-4xl">👀</span>
              <p className="text-sm text-slate-400 dark:text-slate-500">อัปโหลดสลิปแล้วน้องจะอ่านให้เอง</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
