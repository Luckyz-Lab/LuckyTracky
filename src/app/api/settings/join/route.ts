import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = createClient();
  const { code } = await request.json();
  if (!code) return NextResponse.json({ error: "code required" }, { status: 400 });

  const { data, error } = await supabase.rpc("join_household_by_code", { code });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ household_id: data });
}
