import type { SupabaseClient } from "@supabase/supabase-js";
import type { ParsedTransaction } from "@/lib/parser/types";
import { toDbType, type TxType } from "@/lib/parser/categories";
import type { TxSource } from "@/lib/supabase/types";

/**
 * Resolve a category id from a Thai category name within a household.
 * Falls back to creating the category if missing.
 */
export async function resolveCategoryId(
  supabase: SupabaseClient,
  householdId: string,
  name: string,
  type: TxType
): Promise<{ id: string | null; name: string }> {
  const { data: existing } = await supabase
    .from("categories")
    .select("id, name")
    .eq("household_id", householdId)
    .eq("name", name)
    .limit(1)
    .maybeSingle();

  if (existing) return { id: existing.id, name: existing.name };

  const { data: created } = await supabase
    .from("categories")
    .insert({ household_id: householdId, name, type })
    .select("id, name")
    .single();

  return created ? { id: created.id, name: created.name } : { id: null, name };
}

export interface SaveTransactionInput {
  householdId: string;
  createdBy: string | null;
  parsed: ParsedTransaction;
  source: TxSource;
  rawInput?: string | null;
}

/**
 * Persist a parsed transaction, resolving its category id.
 */
export async function saveTransaction(
  supabase: SupabaseClient,
  input: SaveTransactionInput
) {
  const { householdId, createdBy, parsed, source, rawInput } = input;
  const type = toDbType(parsed.type);
  const category = await resolveCategoryId(supabase, householdId, parsed.category, type);

  const { data, error } = await supabase
    .from("transactions")
    .insert({
      household_id: householdId,
      created_by: createdBy,
      item: parsed.item,
      amount: parsed.amount,
      type,
      category_id: category.id,
      category_name: category.name,
      date: parsed.date,
      source,
      confidence: parsed.confidence,
      raw_input: rawInput ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}
