import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getHouseholdContext } from "@/lib/household";
import { resolveCategoryId } from "@/lib/transactions";
import type { RecurringCadence, TxType } from "@/lib/supabase/types";

const CADENCES: RecurringCadence[] = ["weekly", "monthly", "yearly"];

export const dynamic = "force-dynamic";

export async function GET() {
  const ctx = await getHouseholdContext();
  if (!ctx?.activeHousehold) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = createClient();
  const { data, error } = await supabase
    .from("recurring_rules")
    .select("*")
    .eq("household_id", ctx.activeHousehold.id)
    .order("is_active", { ascending: false })
    .order("next_due_date");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ rules: data ?? [] });
}

export async function POST(request: Request) {
  const ctx = await getHouseholdContext();
  if (!ctx?.activeHousehold) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const cadence = body.cadence as RecurringCadence;
  const type = body.type as TxType;
  if (!body.item?.trim() || !(Number(body.amount) > 0) || !CADENCES.includes(cadence) || !["income", "expense"].includes(type) || !body.next_due_date) {
    return NextResponse.json({ error: "Invalid recurring rule" }, { status: 400 });
  }
  const supabase = createClient();
  const category = await resolveCategoryId(
    supabase,
    ctx.activeHousehold.id,
    body.category_name || "Other",
    type
  );
  const { data, error } = await supabase
    .from("recurring_rules")
    .insert({
      household_id: ctx.activeHousehold.id,
      created_by: ctx.userId,
      item: body.item.trim(),
      amount: Number(body.amount),
      type,
      category_id: category.id,
      category_name: category.name,
      cadence,
      next_due_date: body.next_due_date,
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ rule: data }, { status: 201 });
}

export async function PATCH(request: Request) {
  const ctx = await getHouseholdContext();
  if (!ctx?.activeHousehold) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const update: Record<string, unknown> = {};
  if (body.item !== undefined) update.item = String(body.item).trim();
  if (body.amount !== undefined) update.amount = Number(body.amount);
  if (body.next_due_date !== undefined) update.next_due_date = body.next_due_date;
  if (body.is_active !== undefined) update.is_active = Boolean(body.is_active);
  if (body.cadence !== undefined && CADENCES.includes(body.cadence)) update.cadence = body.cadence;
  const supabase = createClient();
  const { data, error } = await supabase
    .from("recurring_rules")
    .update(update)
    .eq("id", body.id)
    .eq("household_id", ctx.activeHousehold.id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ rule: data });
}

export async function DELETE(request: Request) {
  const ctx = await getHouseholdContext();
  if (!ctx?.activeHousehold) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const supabase = createClient();
  const { error } = await supabase.from("recurring_rules").delete().eq("id", id).eq("household_id", ctx.activeHousehold.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
