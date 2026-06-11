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

export default function ChatPanel({ householdId }: { householdId: string | null }) {
  const router = useRouter();
  const [messages, setMessages] = useState<Bubble[]>([
    {
      id: "welcome",
      role: "bot",
      text: "Hi! Type something like \"กินข้าว 80\" or \"เงินเดือน 25000\" and I'll log it.",
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
      if (data.kind === "saved") router.refresh();
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
      <div className="flex items-center gap-2 border-b border-zinc-200 px-4 py-3">
        <Sparkles size={16} className="text-brand-600" />
        <h2 className="text-sm font-semibold">Quick add</h2>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((b) => (
          <Message key={b.id} bubble={b} onConfirm={confirm} />
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <Loader2 size={14} className="animate-spin" /> thinking...
          </div>
        )}
      </div>

      <div className="border-t border-zinc-200 p-3">
        <div className="flex items-end gap-2">
          <textarea
            className="input max-h-28 min-h-[40px] resize-none"
            rows={1}
            value={input}
            placeholder={householdId ? "กินข้าว 80" : "No household selected"}
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
        <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-brand-600 px-3 py-2 text-sm text-white">
          {bubble.text}
        </div>
      </div>
    );
  }

  if (bubble.text) {
    return (
      <div className="flex justify-start">
        <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-zinc-100 px-3 py-2 text-sm text-zinc-700">
          {bubble.text}
        </div>
      </div>
    );
  }

  const r = bubble.response!;
  if (r.kind === "saved") return <TxCard tx={r.transaction} tone="saved" />;
  if (r.kind === "confirm")
    return (
      <div className="space-y-2">
        <p className="text-sm text-zinc-600">{r.message}</p>
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
      <div className="rounded-2xl rounded-bl-sm bg-amber-50 px-3 py-2 text-sm text-amber-700">
        {r.message}
      </div>
    );
  if (r.kind === "summary")
    return (
      <div className="rounded-2xl rounded-bl-sm bg-zinc-100 px-3 py-2 text-sm text-zinc-700 whitespace-pre-line">
        {r.message}
      </div>
    );
  return (
    <div className="rounded-2xl rounded-bl-sm bg-red-50 px-3 py-2 text-sm text-red-600">{r.message}</div>
  );
}

function TxCard({ tx, tone }: { tx: ChatTransactionPayload; tone: "saved" | "confirm" }) {
  const income = tx.type === "รายรับ";
  return (
    <div className="card p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {income ? (
            <ArrowDownCircle size={18} className="text-brand-600" />
          ) : (
            <ArrowUpCircle size={18} className="text-rose-500" />
          )}
          <div>
            <p className="text-sm font-medium">{tx.item}</p>
            <p className="text-xs text-zinc-400">
              {tx.category} · {tx.date}
            </p>
          </div>
        </div>
        <p className={income ? "font-semibold text-brand-600" : "font-semibold text-rose-500"}>
          {income ? "+" : "-"}
          {tx.amount != null ? formatMoney(tx.amount) : "?"}
        </p>
      </div>
      {tone === "saved" && (
        <p className="mt-1 flex items-center gap-1 text-xs text-brand-600">
          <Check size={12} /> Saved
        </p>
      )}
    </div>
  );
}
