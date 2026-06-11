import { redirect } from "next/navigation";
import { Wallet } from "lucide-react";
import { getHouseholdContext } from "@/lib/household";
import Sidebar from "@/components/Sidebar";
import HouseholdSwitcher from "@/components/HouseholdSwitcher";
import ChatPanel from "@/components/ChatPanel";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getHouseholdContext();
  if (!ctx) redirect("/login");

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 text-slate-900">
      {/* Sidebar */}
      <aside className="hidden w-72 flex-col gap-5 border-r border-slate-200 bg-white/95 p-4 lg:flex">
        <div className="flex items-center gap-3 px-1 py-1">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-white shadow-sm">
            <Wallet size={18} />
          </span>
          <div>
            <span className="block text-base font-semibold tracking-tight">LuckyTracky</span>
            <span className="block text-xs text-slate-500">Household finance</span>
          </div>
        </div>
        <HouseholdSwitcher households={ctx.households} active={ctx.activeHousehold} />
        <Sidebar />
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-4 py-5 md:px-8 md:py-8">{children}</div>
      </main>

      {/* Chat panel (desktop) */}
      <aside className="hidden w-80 border-l border-slate-200 bg-white xl:block">
        <ChatPanel householdId={ctx.activeHousehold?.id ?? null} />
      </aside>
    </div>
  );
}
