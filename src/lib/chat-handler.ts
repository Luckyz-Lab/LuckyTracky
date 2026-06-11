import type { SupabaseClient } from "@supabase/supabase-js";
import { parseExpenseMessage } from "@/lib/parser/gemini";
import { shouldAutoSaveTransaction } from "@/lib/parser/transactionRules";
import { saveTransaction } from "@/lib/transactions";
import { formatMoney, currentMonth } from "@/lib/utils";
import type { ChatResponse, ChatTransactionPayload } from "@/lib/chat-types";
import type { ParsedTransaction } from "@/lib/parser/types";
import type { TxSource } from "@/lib/supabase/types";

const SUMMARY_KEYWORDS = ["สรุป", "ยอด", "รายงาน", "summary", "report", "this month", "เดือนนี้"];

function toPayload(p: ParsedTransaction): ChatTransactionPayload {
  return {
    item: p.item,
    amount: p.amount,
    category: p.category,
    type: p.type,
    date: p.date,
    confidence: p.confidence,
    missing_fields: p.missing_fields,
  };
}

function isSummaryRequest(text: string): boolean {
  const t = text.toLowerCase().trim();
  if (/\d/.test(t)) return false; // has a number -> likely a transaction
  return SUMMARY_KEYWORDS.some((k) => t.includes(k));
}

async function buildMonthSummary(
  supabase: SupabaseClient,
  householdId: string
): Promise<string> {
  const month = currentMonth();
  const { data } = await supabase
    .from("transactions")
    .select("amount, type, category_name")
    .eq("household_id", householdId)
    .gte("date", `${month}-01`)
    .lte("date", `${month}-31`);

  const rows = data ?? [];
  let income = 0;
  let expense = 0;
  const byCat: Record<string, number> = {};
  for (const r of rows) {
    if (r.type === "income") income += Number(r.amount);
    else {
      expense += Number(r.amount);
      byCat[r.category_name ?? "อื่นๆ"] = (byCat[r.category_name ?? "อื่นๆ"] ?? 0) + Number(r.amount);
    }
  }
  const top = Object.entries(byCat).sort((a, b) => b[1] - a[1]).slice(0, 3);

  let msg = `This month\nIncome: ${formatMoney(income)}\nExpense: ${formatMoney(expense)}\nBalance: ${formatMoney(income - expense)}`;
  if (top.length) {
    msg += `\n\nTop expenses:\n` + top.map(([c, v]) => `· ${c}: ${formatMoney(v)}`).join("\n");
  }
  return msg;
}

export interface HandleChatArgs {
  supabase: SupabaseClient;
  householdId: string;
  profileId: string | null;
  message: string;
  source: TxSource;
}

/**
 * Core chat logic shared by the web chat API and the LINE webhook.
 */
export async function handleChatMessage({
  supabase,
  householdId,
  profileId,
  message,
  source,
}: HandleChatArgs): Promise<ChatResponse> {
  if (isSummaryRequest(message)) {
    return { kind: "summary", message: await buildMonthSummary(supabase, householdId) };
  }

  const parsed = await parseExpenseMessage(message);

  // Missing amount/item -> ask
  if (parsed.missing_fields.includes("amount")) {
    return {
      kind: "missing",
      transaction: toPayload(parsed),
      missing: parsed.missing_fields,
      message: `How much was "${parsed.item ?? message}"? Please include an amount.`,
    };
  }

  if (shouldAutoSaveTransaction(parsed, message)) {
    try {
      await saveTransaction(supabase, {
        householdId,
        createdBy: profileId,
        parsed,
        source,
        rawInput: message,
      });
      return {
        kind: "saved",
        transaction: toPayload(parsed),
        message: "Saved",
      };
    } catch (err) {
      return { kind: "error", message: (err as Error).message };
    }
  }

  // Ambiguous -> store pending confirmation
  const { data: pending, error } = await supabase
    .from("pending_confirmations")
    .insert({
      household_id: householdId,
      profile_id: profileId,
      parsed_payload: parsed as unknown as Record<string, unknown>,
      raw_input: message,
      source,
    })
    .select("id")
    .single();

  if (error || !pending) {
    return { kind: "error", message: error?.message ?? "Could not create confirmation" };
  }

  return {
    kind: "confirm",
    pendingId: pending.id,
    transaction: toPayload(parsed),
    message: "I'm not 100% sure about this one. Save it?",
  };
}

export interface ConfirmArgs {
  supabase: SupabaseClient;
  pendingId: string;
  action: "confirm" | "cancel";
  profileId: string | null;
  edited?: Partial<ParsedTransaction>;
}

export async function handleConfirm({
  supabase,
  pendingId,
  action,
  profileId,
  edited,
}: ConfirmArgs): Promise<ChatResponse> {
  const { data: pending } = await supabase
    .from("pending_confirmations")
    .select("*")
    .eq("id", pendingId)
    .maybeSingle();

  if (!pending) return { kind: "error", message: "This confirmation expired." };

  if (action === "cancel") {
    await supabase.from("pending_confirmations").delete().eq("id", pendingId);
    return { kind: "summary", message: "Cancelled." };
  }

  const parsed = { ...(pending.parsed_payload as ParsedTransaction), ...edited };

  try {
    await saveTransaction(supabase, {
      householdId: pending.household_id,
      createdBy: profileId,
      parsed,
      source: pending.source,
      rawInput: pending.raw_input,
    });
    await supabase.from("pending_confirmations").delete().eq("id", pendingId);
    return {
      kind: "saved",
      transaction: toPayload(parsed),
      message: "Saved",
    };
  } catch (err) {
    return { kind: "error", message: (err as Error).message };
  }
}
