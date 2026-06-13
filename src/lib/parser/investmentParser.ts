/**
 * Investment / stock ticker parser.
 *
 * Detects messages that consist purely of "TICKER AMOUNT" pairs, e.g.:
 *   "SPCX 2000"           → 1 investment transaction
 *   "RKLB 5000 SPCX 2000" → 2 investment transactions
 *   "PTT 15,000"          → 1 investment transaction
 *
 * A ticker is 1–6 uppercase ASCII letters (no Thai, no digits in ticker part).
 * Amount is a plain number, optionally with comma separators and up to 2 decimals.
 */

import type { ParsedTransaction } from "./types";
import { getToday } from "./dateParser";

const AMOUNT_RE = /[\d,]+(?:\.\d{1,2})?/;
const TICKER_RE = /[A-Z]{1,6}/;

/** Full-message pattern: one or more "TICKER AMOUNT" pairs separated by whitespace. */
const INVESTMENT_MSG_RE = /^(?:[A-Z]{1,6}\s+[\d,]+(?:\.\d{1,2})?\s*)+$/;

/** Extract each pair from a confirmed investment message. */
const PAIR_RE = /([A-Z]{1,6})\s+([\d,]+(?:\.\d{1,2})?)/g;

function parseAmount(raw: string): number {
  return parseFloat(raw.replace(/,/g, ""));
}

function makeTx(ticker: string, amount: number): ParsedTransaction {
  return {
    item: ticker,
    amount,
    category: "ลงทุน",
    type: "รายจ่าย",
    date: getToday(),
    confidence: 0.95,
    missing_fields: [],
    reply_hint: `stock-ticker`,
  };
}

/**
 * Returns an array of investment transactions if the message looks like
 * one or more "TICKER AMOUNT" pairs, otherwise returns null.
 */
export function parseInvestmentMessage(message: string): ParsedTransaction[] | null {
  const trimmed = message.trim();

  // Quick guard: message must start with an uppercase letter
  if (!TICKER_RE.test(trimmed[0])) return null;

  // Reject if there's any Thai / lowercase content mixed in
  if (/[\u0E00-\u0E7F]/.test(trimmed)) return null;

  if (!INVESTMENT_MSG_RE.test(trimmed)) return null;

  const transactions: ParsedTransaction[] = [];
  let match: RegExpExecArray | null;
  PAIR_RE.lastIndex = 0;
  while ((match = PAIR_RE.exec(trimmed)) !== null) {
    transactions.push(makeTx(match[1], parseAmount(match[2])));
  }

  return transactions.length > 0 ? transactions : null;
}

// Re-export regexes for tests
export { AMOUNT_RE, TICKER_RE };
