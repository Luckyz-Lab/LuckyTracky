"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";

export default function AiSummaryButton({
  householdId,
  month,
}: {
  householdId: string;
  month: string;
}) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    setSummary(null);
    try {
      const res = await fetch("/api/dashboard/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ household_id: householdId, month }),
      });
      const data = await res.json();
      setSummary(data.summary ?? data.error ?? "No summary");
    } catch {
      setSummary("Could not generate summary.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md">
      <button onClick={generate} disabled={loading} className="btn-outline text-sm">
        {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} className="text-brand-700" />}
        AI summary
      </button>
      {summary && (
        <p className="mt-3 whitespace-pre-line rounded-lg border border-brand-100 bg-brand-50 p-3 text-sm leading-6 text-slate-700 shadow-sm">{summary}</p>
      )}
    </div>
  );
}
