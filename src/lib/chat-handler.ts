import type { SupabaseClient } from "@supabase/supabase-js";
import { parseExpenseMessage } from "@/lib/parser/gemini";
import { parseMultipleTransactions } from "@/lib/parser/multiTransactionParser";
import { parseInvestmentMessage } from "@/lib/parser/investmentParser";
import { compareMonths, formatComparison, detectRecurring, formatRecurring } from "@/lib/insights";
import { shouldAutoSaveTransaction } from "@/lib/parser/transactionRules";
import { saveTransaction } from "@/lib/transactions";
import { formatMoney, currentMonth } from "@/lib/utils";
import type { ChatResponse, ChatTransactionPayload } from "@/lib/chat-types";
import type { ParsedTransaction } from "@/lib/parser/types";
import type { TxSource } from "@/lib/supabase/types";

const SUMMARY_KEYWORDS = ["สรุป", "ยอด", "รายงาน", "summary", "report", "this month", "เดือนนี้"];
const COMPARE_KEYWORDS = ["เทียบ", "compare", "เดือนก่อน", "vs", "insight"];
const RECURRING_KEYWORDS = ["รายการซ้ำ", "recurring", "ประจำ", " recurring"];

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

function isCompareRequest(text: string): boolean {
  const t = text.toLowerCase().trim();
  return COMPARE_KEYWORDS.some((k) => t.includes(k));
}

function isRecurringRequest(text: string): boolean {
  const t = text.toLowerCase().trim();
  return RECURRING_KEYWORDS.some((k) => t.includes(k));
}

async function buildMonthSummary(
  supabase: SupabaseClient,
  householdId: string
): Promise<string> {
  const month = currentMonth();

  const { data: thisMonth } = await supabase
    .from("transactions")
    .select("amount, type, category_name")
    .eq("household_id", householdId)
    .gte("date", `${month}-01`)
    .lte("date", `${month}-31`);

  // Fallback: last 30 days if no data this month
  let rows = thisMonth ?? [];
  let label = "This month";
  if (rows.length === 0) {
    const since = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
    const { data: recent } = await supabase
      .from("transactions")
      .select("amount, type, category_name")
      .eq("household_id", householdId)
      .gte("date", since);
    rows = recent ?? [];
    label = "Last 30 days";
  }

  if (rows.length === 0) {
    return "No transactions found yet.\nStart by sending a message like:\n· กาแฟ 65\n· เงินเดือน 30000";
  }

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

  let msg = `${label}\nIncome: ${formatMoney(income)}\nExpense: ${formatMoney(expense)}\nBalance: ${formatMoney(income - expense)}`;
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
  const trimmed = message.trim();

  if (trimmed === "บันทึกรายจ่าย") {
    return { kind: "summary", message: "💸 พิมพ์รายการที่ต้องการบันทึก เช่น:\n• กาแฟ 65\n• ข้าวกลางวัน 120\n• ค่าน้ำมัน 500" };
  }

  if (trimmed === "บันทึกรายรับ") {
    return { kind: "summary", message: "💰 พิมพ์รายรับที่ต้องการบันทึก เช่น:\n• เงินเดือน 30000\n• freelance 5000\n• ขายของ 1200" };
  }

  if (trimmed === "สแกนสลิป") {
    return { kind: "summary", message: "📸 ส่งรูปสลิป หรือใบเสร็จมาได้เลย ระบบจะอ่านและบันทึกให้อัตโนมัติ" };
  }

  if (trimmed === "งบประมาณ") {
    return { kind: "summary", message: await buildMonthSummary(supabase, householdId) };
  }

  if (isSummaryRequest(message)) {
    return { kind: "summary", message: await buildMonthSummary(supabase, householdId) };
  }

  if (isCompareRequest(message)) {
    const c = await compareMonths(supabase, householdId);
    return { kind: "summary", message: formatComparison(c) };
  }

  if (isRecurringRequest(message)) {
    const list = await detectRecurring(supabase, householdId);
    return { kind: "summary", message: formatRecurring(list) };
  }

  // Fast-path: pure stock-ticker messages (e.g. "SPCX 2000 RKLB 5000")
  const investmentParsed = parseInvestmentMessage(message);
  if (investmentParsed && investmentParsed.length > 0) {
    try {
      for (const parsed of investmentParsed) {
        await saveTransaction(supabase, { householdId, createdBy: profileId, parsed, source, rawInput: message });
      }
      if (investmentParsed.length === 1) {
        return {
          kind: "saved",
          transaction: toPayload(investmentParsed[0]),
          message: `บันทึกลงทุน ${investmentParsed[0].item} ${investmentParsed[0].amount?.toLocaleString()} บาท`,
        };
      }
      return {
        kind: "saved_many",
        transactions: investmentParsed.map(toPayload),
        message: `บันทึกการลงทุน ${investmentParsed.length} รายการ`,
      };
    } catch (err) {
      return { kind: "error", message: (err as Error).message };
    }
  }

  const parsedTransactions = parseMultipleTransactions(message);
  if (parsedTransactions.length > 1) {
    const invalid = parsedTransactions.find((parsed) => parsed.missing_fields.includes("amount") || parsed.missing_fields.includes("item"));
    if (invalid) {
      return {
        kind: "missing",
        transaction: toPayload(invalid),
        missing: invalid.missing_fields,
        message: `I found multiple items, but one is missing details: "${invalid.item ?? message}". Please send each item with an amount.`,
      };
    }

    try {
      for (const parsed of parsedTransactions) {
        await saveTransaction(supabase, {
          householdId,
          createdBy: profileId,
          parsed,
          source,
          rawInput: message,
        });
      }

      return {
        kind: "saved_many",
        transactions: parsedTransactions.map(toPayload),
        message: `Saved ${parsedTransactions.length} transactions`,
      };
    } catch (err) {
      return { kind: "error", message: (err as Error).message };
    }
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
