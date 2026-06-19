"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Loader2, Sparkles, ArrowDownCircle, ArrowUpCircle, Check, X } from "lucide-react";
import type { ChatResponse, ChatTransactionPayload } from "@/lib/chat-types";
import { formatMoney } from "@/lib/utils";

interface Bubble {
  id: string;
  role: "user" | "bot";
  text?: string;
  response?: ChatResponse;
}

export default function ChatPanel({ householdId, hideHeader = false }: { householdId: string | null; hideHeader?: boolean }) {
  const router = useRouter();
  const [messages, setMessages] = useState<Bubble[]>([
    {
      id: "welcome",
      role: "bot",
      text: "Hi! Type something like \"coffee 80\" or \"salary 25000\" and I'll log it.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  function scrollToEnd() {
    requestAnimationFrame(() => scrollRef.current?.scrollTo({ top: 9e9, behavior: "smooth" }));
  }

  async function send() {
    const text = input.trim();
    if (!text || !householdId || loading) return;
    setInput("");
    setMessages((m) => [...m, { id: crypto.randomUUID(), role: "user", text }]);
    setLoading(true);
    scrollToEnd();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, household_id: householdId }),
      });
      const data: ChatResponse = await res.json();
      setMessages((m) => [...m, { id: crypto.randomUUID(), role: "bot", response: data }]);
      if (data.kind === "saved" || data.kind === "saved_many") router.refresh();
    } catch {
      setMessages((m) => [
        ...m,
        { id: crypto.randomUUID(), role: "bot", response: { kind: "error", message: "Network error" } },
      ]);
    } finally {
      setLoading(false);
      scrollToEnd();
    }
  }

  async function confirm(pendingId: string, action: "confirm" | "cancel") {
    setLoading(true);
    try {
      const res = await fetch("/api/chat/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pending_confirmation_id: pendingId, action }),
      });
      const data: ChatResponse = await res.json();
      setMessages((m) => [...m, { id: crypto.randomUUID(), role: "bot", response: data }]);
      if (data.kind === "saved") router.refresh();
    } finally {
      setLoading(false);
      scrollToEnd();
    }
  }

  return (
    <div className="flex h-full flex-col">
      {!hideHeader && <div className="flex items-center gap-3 border-b-2 border-slate-100 px-5 py-4 dark:border-slate-800">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-50 text-orange-500"><Sparkles size={17} /></span>
        <div>
          <h2 className="font-display text-sm font-bold text-slate-900 dark:text-slate-100">Lucky Cat Advisor</h2>
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">Active · Natural-language logging</p>
        </div>
      </div>}

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((b) => (
          <Message key={b.id} bubble={b} onConfirm={confirm} />
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Loader2 size={14} className="animate-spin" /> thinking...
          </div>
        )}
      </div>

      <div className="border-t-2 border-slate-100 p-3 dark:border-slate-800">
        <div className="flex items-end gap-2">
          <textarea
            className="input max-h-28 min-h-[44px] resize-none"
            rows={1}
            value={input}
            placeholder={householdId ? 'e.g. "coffee 80" or "salary 25000"' : "No household selected"}
            disabled={!householdId}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
          />
          <button onClick={send} disabled={!input.trim() || loading} className="btn-primary h-10 px-3">
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function Message({
  bubble,
  onConfirm,
}: {
  bubble: Bubble;
  onConfirm: (id: string, action: "confirm" | "cancel") => void;
}) {
  if (bubble.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-gradient-to-br from-lucky-300 to-lucky-500 px-3 py-2 text-sm text-white shadow-soft">
          {bubble.text}
        </div>
      </div>
    );
  }

  if (bubble.text) {
    return (
      <div className="flex justify-start">
        <div className="max-w-[85%] rounded-2xl rounded-bl-sm border border-cream-200 bg-lucky-50 px-3 py-2 text-sm leading-6 text-slate-700 shadow-soft dark:border-[#403833] dark:bg-[#352e2a] dark:text-slate-300">
          {bubble.text}
        </div>
      </div>
    );
  }

  const r = bubble.response!;
  if (r.kind === "saved") return <TxCard tx={r.transaction} tone="saved" />;
  if (r.kind === "saved_many")
    return (
      <div className="space-y-2">
        <p className="text-sm font-semibold text-lucky-700 dark:text-lucky-300">{r.message}</p>
        {r.transactions.map((tx, index) => (
          <TxCard key={`${tx.item}-${tx.amount}-${index}`} tx={tx} tone="saved" />
        ))}
      </div>
    );
  if (r.kind === "confirm")
    return (
      <div className="space-y-2">
        <p className="text-sm text-slate-600 dark:text-slate-300">{r.message}</p>
        <TxCard tx={r.transaction} tone="confirm" />
        <div className="flex gap-2">
          <button onClick={() => onConfirm(r.pendingId, "confirm")} className="btn-primary flex-1 py-1.5 text-xs">
            <Check size={14} /> Save
          </button>
          <button onClick={() => onConfirm(r.pendingId, "cancel")} className="btn-outline flex-1 py-1.5 text-xs">
            <X size={14} /> Cancel
          </button>
        </div>
      </div>
    );
  if (r.kind === "missing")
    return (
      <div className="rounded-2xl rounded-bl-sm border border-grape-200 bg-grape-100 px-3 py-2 text-sm text-grape-500 dark:border-[#4a3824] dark:bg-[#3a3024]">
        {r.message}
      </div>
    );
  if (r.kind === "summary")
    return (
      <div className="rounded-2xl rounded-bl-sm border border-cream-200 bg-lucky-50 px-3 py-2 text-sm leading-6 text-slate-700 whitespace-pre-line dark:border-[#403833] dark:bg-[#352e2a] dark:text-slate-300">
        {r.message}
      </div>
    );
  return (
    <div className="rounded-2xl rounded-bl-sm border border-peach-200 bg-peach-50 px-3 py-2 text-sm text-peach-600 dark:border-[#5a2e26] dark:bg-[#3a201a] dark:text-peach-300">{r.message}</div>
  );
}

function TxCard({ tx, tone }: { tx: ChatTransactionPayload; tone: "saved" | "confirm" }) {
  const income = tx.type === "รายรับ";
  return (
    <div className="card p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {income ? (
            <ArrowDownCircle size={18} className="text-[#5f7a54] dark:text-[#9cb88f]" />
          ) : (
            <ArrowUpCircle size={18} className="text-peach-600 dark:text-peach-300" />
          )}
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{tx.item}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {tx.category} · {tx.date}
            </p>
          </div>
        </div>
        <p className={income ? "metric-number text-sm text-[#5f7a54] dark:text-[#9cb88f]" : "metric-number text-sm text-peach-600 dark:text-peach-300"}>
          {income ? "+" : "-"}
          {tx.amount != null ? formatMoney(tx.amount) : "?"}
        </p>
      </div>
      {tone === "saved" && (
        <p className="mt-1 flex items-center gap-1 text-xs text-lucky-600 dark:text-lucky-300">
          <Check size={12} /> Saved
        </p>
      )}
    </div>
  );
}
