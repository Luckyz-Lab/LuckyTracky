import { createHmac, timingSafeEqual } from "crypto";
import type { ChatTransactionPayload } from "./chat-types";

const REPLY_URL = "https://api.line.me/v2/bot/message/reply";
const CONTENT_URL = (id: string) => `https://api-data.line.me/v2/bot/message/${id}/content`;

export function verifyLineSignature(body: string, signature: string | null): boolean {
  const secret = process.env.LINE_CHANNEL_SECRET;
  if (!secret || !signature) return false;
  const hash = createHmac("sha256", secret).update(body).digest("base64");
  try {
    return timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
  } catch {
    return false;
  }
}

export async function replyMessage(replyToken: string, messages: unknown[]): Promise<void> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) return;
  await fetch(REPLY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ replyToken, messages }),
  });
}

export async function getMessageContent(messageId: string): Promise<{ base64: string; mime: string }> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const res = await fetch(CONTENT_URL(messageId), {
    headers: { Authorization: `Bearer ${token}` },
  });
  const mime = res.headers.get("content-type") || "image/jpeg";
  const buffer = Buffer.from(await res.arrayBuffer());
  return { base64: buffer.toString("base64"), mime };
}

export function textMessage(text: string) {
  return { type: "text", text };
}

/** A confirm template with confirm/cancel postback actions. */
export function confirmTemplate(text: string, pendingId: string) {
  return {
    type: "template",
    altText: text,
    template: {
      type: "confirm",
      text: text.slice(0, 240),
      actions: [
        { type: "postback", label: "Save", data: `confirm:${pendingId}`, displayText: "Save" },
        { type: "postback", label: "Cancel", data: `cancel:${pendingId}`, displayText: "Cancel" },
      ],
    },
  };
}

// ─── Flex Message Builders ────────────────────────────────────────────────────

type FC = Record<string, unknown>;

function fmt(amount: number | null): string {
  if (amount === null) return "—";
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(amount);
}

function txColor(t: ChatTransactionPayload): string {
  if (t.category === "ลงทุน") return "#2563eb";
  return t.type === "รายรับ" ? "#0b7451" : "#dc2626";
}

function txSign(t: ChatTransactionPayload): string {
  return t.type === "รายรับ" ? "+" : "-";
}

function txLabel(t: ChatTransactionPayload): string {
  if (t.category === "ลงทุน") return "Investment saved";
  return t.type === "รายรับ" ? "Income saved" : "Expense saved";
}

function hdr(text: string, bg: string): FC {
  return {
    type: "box",
    layout: "horizontal",
    backgroundColor: bg,
    paddingAll: "15px",
    contents: [{ type: "text", text, color: "#ffffff", weight: "bold", size: "sm" }],
  };
}

function sep(): FC {
  return { type: "separator", margin: "md", color: "#e5e7eb" };
}

function kv(label: string, value: string, valueColor = "#111827"): FC {
  return {
    type: "box",
    layout: "horizontal",
    contents: [
      { type: "text", text: label, size: "sm", color: "#6b7280", flex: 1 },
      { type: "text", text: value, size: "sm", weight: "bold", color: valueColor, align: "end", flex: 2 },
    ],
  };
}

function body(contents: FC[]): FC {
  return { type: "box", layout: "vertical", paddingAll: "16px", spacing: "sm", contents };
}

function bubble(header: FC, bodyBox: FC, footer?: FC): FC {
  return {
    type: "bubble",
    size: "kilo",
    header,
    body: bodyBox,
    ...(footer ? { footer } : {}),
  };
}

/** Saved single transaction card. */
export function flexSaved(t: ChatTransactionPayload): unknown {
  const color = txColor(t);
  const amountText = `${txSign(t)}${fmt(t.amount)}`;

  return {
    type: "flex",
    altText: `${txLabel(t)}: ${t.item} ${amountText}`,
    contents: bubble(
      hdr(`✓  ${txLabel(t)}`, color),
      body([
        { type: "text", text: t.item ?? "—", size: "xl", weight: "bold", color: "#111827", wrap: true },
        { type: "text", text: amountText, size: "xxl", weight: "bold", color, margin: "sm" },
        sep(),
        kv("Category", t.category),
        kv("Date", t.date ?? "—"),
      ])
    ),
  };
}

/** Saved multiple transactions card. */
export function flexSavedMany(transactions: ChatTransactionPayload[]): unknown {
  const rows: FC[] = transactions.flatMap((t, i) => {
    const color = txColor(t);
    const items: FC[] = [
      {
        type: "box",
        layout: "horizontal",
        contents: [
          { type: "text", text: t.item ?? "—", size: "sm", color: "#111827", flex: 3, wrap: true },
          { type: "text", text: `${txSign(t)}${fmt(t.amount)}`, size: "sm", weight: "bold", color, align: "end", flex: 2 },
        ],
      },
    ];
    if (i < transactions.length - 1) items.push(sep());
    return items;
  });

  const net = transactions.reduce(
    (s, t) => s + (t.type === "รายรับ" ? (t.amount ?? 0) : -(t.amount ?? 0)),
    0
  );

  return {
    type: "flex",
    altText: `Saved ${transactions.length} transactions`,
    contents: bubble(
      hdr(`✓  Saved ${transactions.length} transactions`, "#0b7451"),
      body([
        ...rows,
        sep(),
        kv("Net", fmt(Math.abs(net)), net >= 0 ? "#0b7451" : "#dc2626"),
      ])
    ),
  };
}

/** Receipt / transaction confirmation card with Save & Cancel buttons. */
export function flexConfirm(text: string, pendingId: string): unknown {
  return {
    type: "flex",
    altText: text,
    contents: bubble(
      hdr("?  Confirm Transaction", "#d97706"),
      body([
        { type: "text", text, size: "md", color: "#374151", wrap: true },
      ]),
      {
        type: "box",
        layout: "horizontal",
        spacing: "sm",
        paddingAll: "12px",
        contents: [
          {
            type: "button",
            style: "primary",
            color: "#0b7451",
            height: "sm",
            action: { type: "postback", label: "Save", data: `confirm:${pendingId}`, displayText: "Save" },
          },
          {
            type: "button",
            style: "secondary",
            height: "sm",
            action: { type: "postback", label: "Cancel", data: `cancel:${pendingId}`, displayText: "Cancel" },
          },
        ],
      }
    ),
  };
}

/** Monthly summary card — parses the plain-text summary into structured rows. */
export function flexSummary(summaryText: string): unknown {
  const lines = summaryText.split("\n");
  const contents: FC[] = [];

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (line === "This month") {
      contents.push({ type: "text", text: line, size: "xs", color: "#9ca3af" });
    } else if (line.startsWith("Income:")) {
      contents.push(kv("Income", line.replace("Income: ", ""), "#0b7451"));
    } else if (line.startsWith("Expense:")) {
      contents.push(kv("Expense", line.replace("Expense: ", ""), "#dc2626"));
    } else if (line.startsWith("Balance:")) {
      const val = line.replace("Balance: ", "");
      contents.push(sep(), kv("Balance", val, val.startsWith("-") ? "#dc2626" : "#0b7451"));
    } else if (line === "Top expenses:") {
      contents.push(sep(), { type: "text", text: "Top Expenses", size: "xs", color: "#9ca3af", margin: "sm" });
    } else if (line.startsWith("·")) {
      contents.push({ type: "text", text: line.replace("·", "").trim(), size: "xs", color: "#6b7280", wrap: true });
    }
  }

  return {
    type: "flex",
    altText: summaryText,
    contents: bubble(hdr("Monthly Summary", "#0b7451"), body(contents)),
  };
}

/** Info card for missing fields. */
export function flexMissing(message: string): unknown {
  return {
    type: "flex",
    altText: message,
    contents: bubble(
      hdr("?  More Info Needed", "#64748b"),
      body([{ type: "text", text: message, size: "sm", color: "#374151", wrap: true }])
    ),
  };
}

/** Error card. */
export function flexError(message: string): unknown {
  return {
    type: "flex",
    altText: `Error: ${message}`,
    contents: bubble(
      hdr("✗  Error", "#dc2626"),
      body([{ type: "text", text: message, size: "sm", color: "#374151", wrap: true }])
    ),
  };
}
