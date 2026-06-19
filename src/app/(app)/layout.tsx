import { redirect } from "next/navigation";
import { getHouseholdContext } from "@/lib/household";
import AppShell from "@/components/AppShell";
import ChatPanel from "@/components/ChatPanel";
import { SoundProvider } from "@/components/mascot/SoundProvider";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getHouseholdContext();
  if (!ctx) redirect("/login");

  return (
    <SoundProvider>
      <AppShell
        households={ctx.households}
        activeHousehold={ctx.activeHousehold}
        chatPanel={<ChatPanel householdId={ctx.activeHousehold?.id ?? null} hideHeader />}
      >
        {children}
      </AppShell>
    </SoundProvider>
  );
}
