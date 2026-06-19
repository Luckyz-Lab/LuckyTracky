import Mascot from "@/components/mascot/Mascot";

export default function AppLoading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <Mascot slot="walking" size={100} interactive={false} />
      <div className="flex flex-col items-center gap-2">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-2 w-2 rounded-full bg-lucky-400 animate-bounce-soft"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
        <p className="font-display text-sm text-slate-400">Loading...</p>
      </div>
    </div>
  );
}
