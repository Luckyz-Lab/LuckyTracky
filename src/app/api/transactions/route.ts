import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { resolveCategoryId } from "@/lib/transactions";

export async function GET(request: Request) {
  const supabase = createClient();
  const { searchParams } = new URL(request.url);
  const householdId = searchParams.get("household_id");
  if (!householdId) return NextResponse.json({ error: "household_id required" }, { status: 400 });

  let query = supabase
    .from("transactions")
    .select("*")
    .eq("household_id", householdId)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  const type = searchParams.get("type");
  const category = searchParams.get("category_id");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const search = searchParams.get("q");

  if (type) query = query.eq("type", type);
  if (category) query = query.eq("category_id", category);
  if (from) query = query.gte("date", from);
  if (to) query = query.lte("date", to);
  if (search) query = query.or(`item.ilike.%${search}%,category_name.ilike.%${search}%`);

  const { data, error } = await query.limit(500);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ transactions: data });
}

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { household_id, item, amount, type, category_name, date } = body;
  if (!household_id || !item || amount == null || !type || !date) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const category = await resolveCategoryId(supabase, household_id, category_name || "อื่นๆ", type);

  const { data, error } = await supabase
    .from("transactions")
    .insert({
      household_id,
      created_by: user.id,
      item,
      amount,
      type,
      category_id: category.id,
      category_name: category.name,
      date,
      source: "manual",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ transaction: data });
}
