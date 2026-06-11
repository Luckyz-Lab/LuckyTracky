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
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace("/dashboard");
      } else {
        router.replace("/login?error=auth");
      }
    });
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="animate-spin text-brand-600" size={32} />
    </div>
  );
}
