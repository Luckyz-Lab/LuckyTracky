import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { resolveCategoryId } from "@/lib/transactions";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const body = await request.json();
  const update: Record<string, unknown> = {};

  for (const key of ["item", "amount", "type", "date"]) {
    if (body[key] !== undefined) update[key] = body[key];
  }

  if (body.category_name !== undefined && body.household_id) {
    const type = body.type ?? "expense";
    const category = await resolveCategoryId(supabase, body.household_id, body.category_name, type);
    update.category_id = category.id;
    update.category_name = category.name;
  }

  const { data, error } = await supabase
    .from("transactions")
    .update(update)
    .eq("id", params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ transaction: data });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { error } = await supabase.from("transactions").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
