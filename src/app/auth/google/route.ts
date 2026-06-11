import { NextResponse } from "next/server";
import { getAppOrigin } from "@/lib/app-url";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const origin = getAppOrigin(request.url);
  const requestedNext = searchParams.get("next") ?? "/dashboard";
  const next =
    requestedNext.startsWith("/") && !requestedNext.startsWith("//")
      ? requestedNext
      : "/dashboard";

  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}` },
  });

  if (error || !data.url) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error?.message ?? "Google sign-in could not start.")}`
    );
  }

  try {
    const preflight = await fetch(data.url, {
      method: "GET",
      redirect: "manual",
      cache: "no-store",
    });

    if (!preflight.ok && ![301, 302, 303, 307, 308].includes(preflight.status)) {
      const body = await preflight.json().catch(() => null);
      const message =
        typeof body?.msg === "string"
          ? body.msg
          : typeof body?.message === "string"
            ? body.message
            : "Google sign-in could not start.";
      const code = message.toLowerCase().includes("unsupported provider")
        ? "google_not_configured"
        : message;

      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(code)}`);
    }
  } catch {
    // If the preflight check fails transiently, let the browser attempt the OAuth redirect.
  }

  return NextResponse.redirect(data.url);
}
