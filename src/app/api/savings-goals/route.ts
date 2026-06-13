import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getHouseholdContext } from "@/lib/household";

export const dynamic = "force-dynamic";

export async function GET() {
  const ctx = await getHouseholdContext();
  if (!ctx?.activeHousehold) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createClient();
  const { data } = await supabase
    .from("savings_goals")
    .select("*")
    .eq("household_id", ctx.activeHousehold.id)
    .order("created_at", { ascending: false });

  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const ctx = await getHouseholdContext();
  if (!ctx?.activeHousehold) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const supabase = createClient();

  const { data, error } = await supabase
    .from("savings_goals")
    .insert({
      household_id: ctx.activeHousehold.id,
      name: body.name,
      target_amount: body.target_amount,
      current_amount: body.current_amount ?? 0,
      deadline: body.deadline ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  const ctx = await getHouseholdContext();
  if (!ctx?.activeHousehold) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const supabase = createClient();

  const { data, error } = await supabase
    .from("savings_goals")
    .update({
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.target_amount !== undefined ? { target_amount: body.target_amount } : {}),
      ...(body.current_amount !== undefined ? { current_amount: body.current_amount } : {}),
      ...(body.deadline !== undefined ? { deadline: body.deadline } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", body.id)
    .eq("household_id", ctx.activeHousehold.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const ctx = await getHouseholdContext();
  if (!ctx?.activeHousehold) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const supabase = createClient();
  const { error } = await supabase
    .from("savings_goals")
    .delete()
    .eq("id", id)
    .eq("household_id", ctx.activeHousehold.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
