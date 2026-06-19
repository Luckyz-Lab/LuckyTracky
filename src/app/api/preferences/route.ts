import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const DEFAULTS = {
  theme: "classic",
  mascot_name: "Lucky",
  mascot_breed: "tabby",
  mascot_color: "#FFEFE6",
  mascot_accessory: "collar_bell",
  notifications_enabled: true,
};

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data, error } = await supabase.from("profile_preferences").select("*").eq("profile_id", user.id).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ preferences: data ?? { profile_id: user.id, ...DEFAULTS } });
}

export async function PATCH(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const payload = {
    profile_id: user.id,
    theme: body.theme ?? DEFAULTS.theme,
    mascot_name: String(body.mascot_name ?? DEFAULTS.mascot_name).trim().slice(0, 24) || DEFAULTS.mascot_name,
    mascot_breed: body.mascot_breed ?? DEFAULTS.mascot_breed,
    mascot_color: /^#[0-9a-f]{6}$/i.test(body.mascot_color) ? body.mascot_color : DEFAULTS.mascot_color,
    mascot_accessory: body.mascot_accessory ?? DEFAULTS.mascot_accessory,
    notifications_enabled: body.notifications_enabled ?? true,
  };
  const { data, error } = await supabase.from("profile_preferences").upsert(payload, { onConflict: "profile_id" }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ preferences: data });
}
