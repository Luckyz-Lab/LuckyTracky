/**
 * Shared response shape between the chat API and the chat UI.
 */
export interface ChatTransactionPayload {
  item: string | null;
  amount: number | null;
  category: string;
  type: string; // Thai "รายรับ" | "รายจ่าย"
  date: string;
  confidence: number;
  missing_fields: string[];
}

export type ChatResponse =
  | { kind: "saved"; transaction: ChatTransactionPayload; message: string }
  | { kind: "saved_many"; transactions: ChatTransactionPayload[]; message: string }
  | { kind: "confirm"; pendingId: string; transaction: ChatTransactionPayload; message: string }
  | { kind: "missing"; transaction: ChatTransactionPayload; missing: string[]; message: string }
  | { kind: "summary"; message: string }
  | { kind: "error"; message: string };
