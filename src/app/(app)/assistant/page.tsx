import { redirect } from "next/navigation";
import { Bot, Sparkles } from "lucide-react";
import { getHouseholdContext } from "@/lib/household";
import ChatPanel from "@/components/ChatPanel";

export const dynamic = "force-dynamic";

export default async function AssistantPage() {
  const ctx = await getHouseholdContext();
  if (!ctx) redirect("/login");
  return <div className="space-y-6"><header className="relative overflow-hidden rounded-[2rem] border-2 border-orange-100 bg-white p-6 shadow-soft dark:border-slate-700 dark:bg-slate-900"><div className="flex items-start justify-between gap-5"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-500">LuckyAI core</p><h1 className="mt-2 font-display text-4xl font-extrabold text-slate-900 dark:text-white">AI Cat Assistant</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Log transactions in natural language, ask for summaries, and keep the active household up to date.</p></div><span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-500"><Bot size={27} /></span></div></header><section className="card min-h-[650px] overflow-hidden"><ChatPanel householdId={ctx.activeHousehold?.id ?? null} /></section><div className="flex items-center gap-3 rounded-2xl border-2 border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-700"><Sparkles size={18} />Entries saved here use the same parser as web chat and LINE.</div></div>;
}
