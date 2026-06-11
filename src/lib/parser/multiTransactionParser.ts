import { categorizeByKeyword, classifyByKeyword } from "./categories";
import { getToday, parseDateFromText } from "./dateParser";
import { cleanTransactionItem, parseAmountValue } from "./moneyParser";
import { boostConfidenceForObviousTransaction, isAmbiguousTransactionText } from "./transactionRules";
import type { ParsedTransaction } from "./types";

const AMOUNT_PATTERN = /(?:฿\s*)?(\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+(?:\.\d+)?)(?:\s*(?:บาท|บ\.|฿))?/gi;
const DATE_PATTERNS = [
  /\d{1,2}[/-]\d{1,2}[/-]\d{2,4}/g,
  /\d{4}-\d{1,2}-\d{1,2}/g,
];

function dateRanges(text: string) {
  return DATE_PATTERNS.flatMap((pattern) =>
    [...text.matchAll(pattern)].map((match) => ({
      start: match.index ?? 0,
      end: (match.index ?? 0) + match[0].length,
    }))
  );
}

function isInsideRange(index: number, ranges: Array<{ start: number; end: number }>) {
  return ranges.some((range) => index >= range.start && index < range.end);
}

function normalizeSegment(segment: string) {
  return segment
    .replace(/^[\s,;|/]+/g, "")
    .replace(/[\s,;|/]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function splitTransactionSegments(text: string): string[] {
  const ranges = dateRanges(text);
  const amountMatches = [...text.matchAll(AMOUNT_PATTERN)]
    .filter((match) => !isInsideRange(match.index ?? 0, ranges))
    .map((match) => ({
      amountStart: match.index ?? 0,
      amountEnd: (match.index ?? 0) + match[0].length,
    }));

  if (amountMatches.length < 2) return [];

  let cursor = 0;
  const segments: string[] = [];
  for (const match of amountMatches) {
    const segment = normalizeSegment(text.slice(cursor, match.amountEnd));
    if (segment) segments.push(segment);
    cursor = match.amountEnd;
  }

  return segments.length > 1 ? segments : [];
}

export function parseTransactionSegment(segment: string): ParsedTransaction {
  const today = getToday();
  const amountMatch = [...segment.matchAll(AMOUNT_PATTERN)].at(-1);
  const amount = parseAmountValue(amountMatch?.[1]);
  const item = cleanTransactionItem(segment);
  const type = classifyByKeyword(segment);
  const category = categorizeByKeyword(segment, type);
  const missing_fields: string[] = [];

  if (amount === null) missing_fields.push("amount");
  if (!item) missing_fields.push("item");

  const parsed: ParsedTransaction = {
    item,
    amount,
    category,
    type,
    date: parseDateFromText(segment) || today,
    confidence: isAmbiguousTransactionText(segment) ? 0.35 : 0.92,
    missing_fields,
    reply_hint: "split multi-transaction message",
  };

  return boostConfidenceForObviousTransaction(parsed, segment);
}

export function parseMultipleTransactions(text: string): ParsedTransaction[] {
  return splitTransactionSegments(text).map(parseTransactionSegment);
}
