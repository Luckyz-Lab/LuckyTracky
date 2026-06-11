"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

/**
 * Handles Supabase implicit-flow redirects (magic links, email confirmations).
 * Supabase places access_token in the URL hash fragment which server route
 * handlers cannot read — so we use a client page instead.
 */
export default function AuthConfirmPage() {
  const router = useRouter();

  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");

    if (!access_token || !refresh_token) {
      router.replace("/login?error=auth");
      return;
    }

    const supabase = createClient();
    supabase.auth
      .setSession({ access_token, refresh_token })
      .then(({ data, error }) => {
        if (error || !data.session) {
          router.replace("/login?error=auth");
        } else {
          router.replace("/dashboard");
        }
      });
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="animate-spin text-brand-600" size={32} />
    </div>
  );
}
