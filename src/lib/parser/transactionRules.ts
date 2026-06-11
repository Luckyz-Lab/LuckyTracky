/**
 * Transaction confidence rules. Ported from `src/utils/transactionRules.js`.
 * Used with Gemini to avoid re-asking when a human would read the text clearly.
 */
import { EXPENSE_KEYWORDS, INCOME_KEYWORDS } from "./categories";
import { hasAmount } from "./moneyParser";
import type { ParsedTransaction } from "./types";

export const AUTO_SAVE_CONFIDENCE = 0.58;

const TRANSFER_OUT_WORDS = ["โอนให้", "โอนไป", "โอนค่า", "โอนจ่าย", "จ่ายโอน"];
const TRANSFER_IN_WORDS = ["โอนมา", "โอนเข้า", "ลูกค้าโอน", "ได้รับโอน"];
const AMBIGUOUS_TRANSFER_PATTERNS = [
  /(^|\s)โอน\s*\d/,
  /(^|\s)โอนเงิน\s*\d/,
  /(^|\s)transfer\s*\d/i,
];
const AMBIGUOUS_GENERIC_PATTERNS = [
  /^เงิน\s*\d/,
  /^ยอด\s*\d/,
  /^รับ\s*\d/,
];

function normalizeText(text: string): string {
  return String(text || "").toLowerCase().replace(/\s+/g, " ").trim();
}

function includesAny(text: string, keywords: string[]): boolean {
  const normalized = normalizeText(text);
  return keywords.some((keyword) => normalized.includes(String(keyword).toLowerCase()));
}

function hasDirectionalTransfer(text: string): boolean {
  return includesAny(text, TRANSFER_OUT_WORDS) || includesAny(text, TRANSFER_IN_WORDS);
}

export function hasExplicitTypeSignal(text: string): boolean {
  return includesAny(text, EXPENSE_KEYWORDS) || includesAny(text, INCOME_KEYWORDS) || hasDirectionalTransfer(text);
}

export function isAmbiguousTransactionText(text: string): boolean {
  const normalized = normalizeText(text);
  if (hasDirectionalTransfer(normalized)) return false;
  if (AMBIGUOUS_TRANSFER_PATTERNS.some((pattern) => pattern.test(normalized))) return true;
  return AMBIGUOUS_GENERIC_PATTERNS.some((pattern) => pattern.test(normalized));
}

export function hasRequiredTransactionFields(parsed: ParsedTransaction): boolean {
  return Boolean(
    parsed &&
      parsed.item &&
      parsed.amount !== null &&
      parsed.amount !== undefined &&
      parsed.type &&
      parsed.category &&
      (!Array.isArray(parsed.missing_fields) || parsed.missing_fields.length === 0)
  );
}

export function isObviousTransactionText(text: string, parsed: ParsedTransaction): boolean {
  if (!hasRequiredTransactionFields(parsed)) return false;
  if (!hasAmount(text)) return false;
  if (isAmbiguousTransactionText(text)) return false;
  return hasExplicitTypeSignal(text) || parsed.type === "รายจ่าย" || parsed.type === "รายรับ";
}

export function shouldAutoSaveTransaction(parsed: ParsedTransaction, originalText: string): boolean {
  if (!hasRequiredTransactionFields(parsed)) return false;
  if (isAmbiguousTransactionText(originalText)) return false;
  if (Number(parsed.confidence) >= AUTO_SAVE_CONFIDENCE) return true;
  return isObviousTransactionText(originalText, parsed);
}

export function boostConfidenceForObviousTransaction(
  parsed: ParsedTransaction,
  originalText: string
): ParsedTransaction {
  if (!parsed || !isObviousTransactionText(originalText, parsed)) return parsed;
  return {
    ...parsed,
    confidence: Math.max(Number(parsed.confidence) || 0, hasExplicitTypeSignal(originalText) ? 0.95 : 0.88),
  };
}
