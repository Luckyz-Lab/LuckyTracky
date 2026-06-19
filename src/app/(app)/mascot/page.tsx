import { Sparkles } from "lucide-react";
import MascotStudio from "@/components/MascotStudio";

export const dynamic = "force-dynamic";

export default function MascotPage() {
  return <div className="space-y-6"><header className="relative overflow-hidden rounded-[2rem] border-2 border-orange-100 bg-white p-6 shadow-soft dark:border-slate-700 dark:bg-slate-900"><div className="flex items-start justify-between gap-5"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-500">Personal companion</p><h1 className="mt-2 font-display text-4xl font-extrabold text-slate-900 dark:text-white">Mascot Studio</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Choose Lucky&apos;s identity, coat, accessory and workspace palette.</p></div><span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-500"><Sparkles size={27} /></span></div></header><MascotStudio /></div>;
}
