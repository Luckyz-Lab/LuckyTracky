import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: Request) {
  const supabase = createClient();
  const { household_id, currency, regenerate_code, name } = await request.json();
  if (!household_id) return NextResponse.json({ error: "household_id required" }, { status: 400 });

  const update: Record<string, unknown> = {};
  if (currency) update.currency = currency;
  if (name) update.name = name;
  if (regenerate_code) update.invite_code = randomBytes(6).toString("hex");

  const { data, error } = await supabase
    .from("households")
    .update(update)
    .eq("id", household_id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ household: data });
}
