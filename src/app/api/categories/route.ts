import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = createClient();
  const { searchParams } = new URL(request.url);
  const householdId = searchParams.get("household_id");
  if (!householdId) return NextResponse.json({ error: "household_id required" }, { status: 400 });

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("household_id", householdId)
    .order("type")
    .order("name");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ categories: data });
}

export async function POST(request: Request) {
  const supabase = createClient();
  const { household_id, name, type, keywords } = await request.json();
  if (!household_id || !name || !type) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const { data, error } = await supabase
    .from("categories")
    .insert({ household_id, name, type, keywords: keywords ?? [] })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ category: data });
}

export async function PATCH(request: Request) {
  const supabase = createClient();
  const { id, name, keywords, is_active } = await request.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const update: Record<string, unknown> = {};
  if (name !== undefined) update.name = name;
  if (keywords !== undefined) update.keywords = keywords;
  if (is_active !== undefined) update.is_active = is_active;
  const { data, error } = await supabase.from("categories").update(update).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ category: data });
}
