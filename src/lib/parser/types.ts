/**
 * Shared parser types.
 */

/** Raw parser result. `type` is Thai ("รายรับ"/"รายจ่าย") to match Gemini output. */
export interface ParsedTransaction {
  item: string | null;
  amount: number | null;
  category: string;
  type: string; // "รายรับ" | "รายจ่าย"
  date: string; // YYYY-MM-DD
  confidence: number;
  missing_fields: string[];
  reply_hint?: string;
}
