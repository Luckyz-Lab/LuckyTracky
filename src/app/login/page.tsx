"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Cat, ChartNoAxesCombined, Loader2, MessageCircle, PiggyBank, Sparkles } from "lucide-react";

const BENEFITS = [
  { icon: MessageCircle, text: "Tell Lucky what you bought and it logs the entry." },
  { icon: ChartNoAxesCombined, text: "See household income, expenses and trends together." },
  { icon: PiggyBank, text: "Build savings goals and keep budgets visible." },
];

function authMessage(message: string) {
  const messages: Record<string, string> = {
    line_not_configured:
      "LINE Login is not configured. Set LINE_LOGIN_CHANNEL_ID and LINE_LOGIN_CHANNEL_SECRET in .env.local.",
    line_state: "LINE login session expired. Please try again.",
    line_token: "LINE login failed while requesting a LINE access token.",
    line_idtoken: "LINE login did not return an identity token.",
    line_create: "LINE login could not create a Supabase user.",
    line_link: "LINE login could not create a Supabase session.",
    google_not_configured:
      "Google sign-in is not enabled in Supabase. Enable the Google provider in Supabase Auth first.",
    auth: "Authentication failed. Please try again.",
  };

  return messages[message] ?? message;
}

function getBrowserOrigin() {
  const url = new URL(window.location.href);
  if (url.hostname === "0.0.0.0") {
    url.hostname = "localhost";
  }
  return url.origin;
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authError = params.get("error");
    if (authError) {
      const detail = params.get("detail");
      setError(authMessage(authError) + (detail ? ` (${detail})` : ""));
    }
  }, []);

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    const supabase = createClient();
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name.trim() || email.split("@")[0] },
            emailRedirectTo: `${getBrowserOrigin()}/auth/callback?next=/dashboard`,
          },
        });
        if (error) throw error;
        if (data.session) {
          router.push("/dashboard");
          router.refresh();
        } else {
          setMode("signin");
          setMessage("Account created. Check your email to confirm your account, then sign in.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-lucky-50 via-cream-100 to-peach-50">
      {/* Hero panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center gap-8 p-12 bg-gradient-to-br from-lucky-600 to-lucky-700">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="flex h-24 w-24 items-center justify-center rounded-[2rem] bg-white/15 text-white shadow-puff"><Cat size={54} strokeWidth={1.6} /></span>
          </div>
          <h1 className="font-display text-4xl font-bold text-white leading-tight">
            LuckyTracky
          </h1>
          <p className="mt-3 text-lucky-100 text-lg">Track spending with your cat, every day</p>
        </div>
        <div className="grid grid-cols-1 gap-3 w-full max-w-xs">
          {BENEFITS.map((f) => (
            <div key={f.text} className="flex items-center gap-3 rounded-2xl bg-white/15 px-4 py-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10"><f.icon size={19} /></span>
              <p className="text-sm text-white/90">{f.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 flex-col items-center justify-center p-6">
        {/* Mobile logo */}
        <div className="mb-8 text-center lg:hidden">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-lucky-100 text-lucky-700 shadow-soft"><Cat size={36} /></span>
          <h1 className="font-display mt-3 text-2xl font-bold text-lucky-700">LuckyTracky</h1>
          <p className="text-sm text-slate-500">Track spending with your cat</p>
        </div>

        <div className="w-full max-w-sm">
          <div className="card p-8 shadow-puff">
            <h2 className="font-display text-xl font-semibold text-slate-900">
              <span className="flex items-center gap-2">{mode === "signup" && <Sparkles size={18} className="text-lucky-500" />}{mode === "signin" ? "Welcome back" : "Create an account"}</span>
            </h2>
            <p className="mt-1 mb-6 text-sm text-slate-500">
              {mode === "signin" ? "Sign in to view your income & expenses" : "Sign up and your household will be set up automatically"}
            </p>

            <form onSubmit={handleEmailAuth} className="space-y-3">
              {mode === "signup" && (
                <div>
                  <label htmlFor="display-name" className="label">Display name</label>
                  <input id="display-name" className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
                </div>
              )}
              <div>
                <label htmlFor="email" className="label">Email</label>
                <input id="email" className="input" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              <div>
                <label htmlFor="password" className="label">Password</label>
                <input id="password" className="input" type="password" autoComplete={mode === "signin" ? "current-password" : "new-password"} required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
              </div>

              {error && (
                <p className="rounded-2xl bg-rose-50 border border-rose-200 px-3.5 py-2.5 text-sm text-rose-600">
                  {error}
                </p>
              )}
              {message && (
                <p className="rounded-2xl bg-lucky-50 border border-lucky-200 px-3.5 py-2.5 text-sm text-lucky-700">
                  {message}
                </p>
              )}

              <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
                {loading && <Loader2 className="animate-spin" size={16} />}
                {mode === "signin" ? "Sign in" : "Create account"}
              </button>
            </form>

            <div className="my-4 flex items-center gap-3 text-xs text-slate-400">
              <span className="h-px flex-1 bg-slate-200" /> or <span className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="space-y-2">
              <a href="/auth/google?next=/dashboard" className="btn-outline w-full">
                <span className="text-base">G</span> Continue with Google
              </a>
              <a href="/api/auth/line/start" className="btn w-full bg-[#06C755] text-white hover:bg-[#05b34c] rounded-full">
                <span className="font-bold text-base">LINE</span> Continue with LINE
              </a>
            </div>

            <p className="mt-6 text-center text-sm text-slate-500">
              {mode === "signin" ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                type="button"
                className="font-semibold text-lucky-600 hover:underline"
                onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); }}
              >
                {mode === "signin" ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
