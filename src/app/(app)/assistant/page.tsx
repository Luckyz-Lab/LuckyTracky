import { redirect } from "next/navigation";
import { Bot, Sparkles } from "lucide-react";
import { getHouseholdContext } from "@/lib/household";
import ChatPanel from "@/components/ChatPanel";

export const dynamic = "force-dynamic";

export default async function AssistantPage() {
  const ctx = await getHouseholdContext();
  if (!ctx) redirect("/login");
  return <div className="space-y-6"><header className="page-header"><div className="flex items-start justify-between gap-5"><div><h1 className="page-title">AI Cat Assistant</h1><p className="page-subtitle max-w-2xl">Log transactions in natural language, ask for summaries, and keep the active household up to date.</p></div><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-control bg-primary-soft text-primary"><Bot size={23} /></span></div></header><section className="card min-h-[650px] overflow-hidden"><ChatPanel householdId={ctx.activeHousehold?.id ?? null} /></section><div className="flex items-center gap-3 rounded-control border border-line bg-positive-soft p-4 text-sm text-positive"><Sparkles size={18} />Entries saved here use the same parser as web chat and LINE.</div></div>;
}
