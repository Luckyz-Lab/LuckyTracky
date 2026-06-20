import { Palette } from "lucide-react";
import AppearanceStudio from "@/components/AppearanceStudio";

export const dynamic = "force-dynamic";

export default function AppearancePage() {
  return <div className="space-y-6"><header className="page-header"><div className="flex items-start justify-between gap-5"><div><h1 className="page-title">Appearance</h1><p className="page-subtitle max-w-2xl">Make the workspace yours while keeping every number and action easy to read.</p></div><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-control bg-primary-soft text-primary"><Palette size={23} /></span></div></header><AppearanceStudio /></div>;
}
