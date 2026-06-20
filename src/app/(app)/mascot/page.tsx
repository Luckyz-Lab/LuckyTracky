import { Sparkles } from "lucide-react";
import MascotStudio from "@/components/MascotStudio";

export const dynamic = "force-dynamic";

export default function MascotPage() {
  return <div className="space-y-6"><header className="page-header"><div className="flex items-start justify-between gap-5"><div><h1 className="page-title">Mascot Studio</h1><p className="page-subtitle max-w-2xl">Choose Lucky&apos;s identity, coat and accessory.</p></div><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-control bg-primary-soft text-primary"><Sparkles size={23} /></span></div></header><MascotStudio /></div>;
}
