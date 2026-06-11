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
    <div className="flex h-screen overflow-hidden bg-zinc-50">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col gap-4 border-r border-zinc-200 bg-white p-4 lg:flex">
        <div className="flex items-center gap-2 px-1">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
            <Wallet size={18} />
          </span>
          <span className="text-lg font-bold">LuckyTracky</span>
        </div>
        <HouseholdSwitcher households={ctx.households} active={ctx.activeHousehold} />
        <Sidebar />
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl p-4 md:p-8">{children}</div>
      </main>

      {/* Chat panel (desktop) */}
      <aside className="hidden w-80 border-l border-zinc-200 bg-white xl:block">
        <ChatPanel householdId={ctx.activeHousehold?.id ?? null} />
      </aside>
    </div>
  );
}
