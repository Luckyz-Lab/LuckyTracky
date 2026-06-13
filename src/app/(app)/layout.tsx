import { redirect } from "next/navigation";
import { getHouseholdContext } from "@/lib/household";
import AppShell from "@/components/AppShell";
import ChatPanel from "@/components/ChatPanel";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getHouseholdContext();
  if (!ctx) redirect("/login");

  return (
    <AppShell
      households={ctx.households}
      activeHousehold={ctx.activeHousehold}
      chatPanel={<ChatPanel householdId={ctx.activeHousehold?.id ?? null} />}
    >
      {children}
    </AppShell>
  );
}
