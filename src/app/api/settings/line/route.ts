import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Set the default household that LINE-created transactions are saved into.
 */
export async function PATCH(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { default_household_id } = await request.json();

  const { data, error } = await supabase
    .from("line_accounts")
    .update({ default_household_id })
    .eq("profile_id", user.id)
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ updated: data });
}
