"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Wallet, Loader2 } from "lucide-react";

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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 via-white to-zinc-50 p-4">
      <div className="card w-full max-w-md p-8">
        <div className="mb-6 flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white">
            <Wallet size={20} />
          </span>
          <div>
            <h1 className="text-lg font-bold leading-tight">LuckyTracky</h1>
            <p className="text-xs text-zinc-500">Household money tracker</p>
          </div>
        </div>

        <h2 className="mb-1 text-xl font-semibold">
          {mode === "signin" ? "Welcome back" : "Create your account"}
        </h2>
        <p className="mb-6 text-sm text-zinc-500">
          {mode === "signin"
            ? "Sign in to manage your household finances."
            : "Sign up and we'll set up your household automatically."}
        </p>

        <form onSubmit={handleEmailAuth} className="space-y-3">
          {mode === "signup" && (
            <div>
              <label className="label">Display name</label>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            </div>
          )}
          <div>
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              className="input"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
          {message && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>}

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading && <Loader2 className="animate-spin" size={16} />}
            {mode === "signin" ? "Sign in" : "Sign up"}
          </button>
        </form>

        <div className="my-4 flex items-center gap-3 text-xs text-zinc-400">
          <span className="h-px flex-1 bg-zinc-200" /> or <span className="h-px flex-1 bg-zinc-200" />
        </div>

        <div className="space-y-2">
          <a href="/auth/google?next=/dashboard" className="btn-outline w-full">
            Continue with Google
          </a>
          <a href="/api/auth/line/start" className="btn w-full bg-[#06C755] text-white hover:bg-[#05b34c]">
            Continue with LINE
          </a>
        </div>

        <p className="mt-6 text-center text-sm text-zinc-500">
          {mode === "signin" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            className="font-medium text-brand-600 hover:underline"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError(null);
            }}
          >
            {mode === "signin" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
