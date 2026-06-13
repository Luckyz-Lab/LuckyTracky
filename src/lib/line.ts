import { createHmac, timingSafeEqual } from "crypto";
import type { ChatTransactionPayload } from "./chat-types";

const REPLY_URL = "https://api.line.me/v2/bot/message/reply";
const PUSH_URL = "https://api.line.me/v2/bot/message/push";
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

export async function pushMessage(userId: string, messages: unknown[]): Promise<void> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) return;
  await fetch(PUSH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ to: userId, messages }),
  });
}

export async function getMessageContent(messageId: string): Promise<{ base64: string; mime: string }> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const res = await fetch(CONTENT_URL(messageId), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`LINE content fetch failed: ${res.status}`);
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

/** Quick Reply helper — max 13 items per LINE spec. */
function qr(items: Array<{ label: string; text: string }>): FC {
  return {
    quickReply: {
      items: items.map((i) => ({
        type: "action" as const,
        action: { type: "message", label: i.label, text: i.text },
      })),
    },
  };
}

const QR_ADD = [{ label: "➕ Add more", text: "บันทึกรายการ" }];
const QR_SUMMARY = [{ label: "📊 Summary", text: "สรุป" }];
const QR_BUDGET = [{ label: "💰 Budget", text: "งบประมาณ" }];
const QR_SCAN = [{ label: "📸 Scan receipt", text: "สแกนสลิป" }];

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
    ...qr([...QR_ADD, ...QR_SUMMARY, ...QR_BUDGET]),
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
    ...qr([...QR_ADD, ...QR_SUMMARY]),
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

/** Monthly summary carousel — parses plain-text summary into multiple bubbles. */
export function flexSummary(summaryText: string): unknown {
  const lines = summaryText.split("\n");
  const bubbles: FC[] = [];

  // Bubble 1: Overview (Income / Expense / Balance)
  const overviewContents: FC[] = [];
  let incomeVal = "";
  let expenseVal = "";
  let balanceVal = "";

  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line === "This month") continue;
    if (line.startsWith("Income:")) {
      incomeVal = line.replace("Income: ", "");
      overviewContents.push(kv("Income", incomeVal, "#0b7451"));
    } else if (line.startsWith("Expense:")) {
      expenseVal = line.replace("Expense: ", "");
      overviewContents.push(kv("Expense", expenseVal, "#dc2626"));
    } else if (line.startsWith("Balance:")) {
      balanceVal = line.replace("Balance: ", "");
      overviewContents.push(sep(), kv("Balance", balanceVal, balanceVal.startsWith("-") ? "#dc2626" : "#0b7451"));
    }
  }

  if (overviewContents.length === 0) {
    overviewContents.push({ type: "text", text: summaryText || "—", size: "sm", color: "#374151", wrap: true });
  }

  bubbles.push(bubble(hdr("Overview", "#0b7451"), body(overviewContents)));

  // Bubble 2: Top expenses
  const topContents: FC[] = [];
  let inTop = false;
  for (const raw of lines) {
    const line = raw.trim();
    if (line === "Top expenses:") { inTop = true; continue; }
    if (inTop && line.startsWith("·")) {
      topContents.push({ type: "text", text: line.replace("·", "").trim(), size: "sm", color: "#374151", wrap: true });
    }
  }

  if (topContents.length > 0) {
    bubbles.push(bubble(hdr("Top Expenses", "#dc2626"), body(topContents)));
  }

  // Bubble 3: Quick tip
  bubbles.push(
    bubble(
      hdr("Tip", "#2563eb"),
      body([
        { type: "text", text: "Send a photo of your receipt to scan it automatically!", size: "sm", color: "#374151", wrap: true },
      ])
    )
  );

  return {
    type: "flex",
    altText: summaryText,
    contents: { type: "carousel", contents: bubbles },
    ...qr([...QR_ADD, ...QR_SCAN, ...QR_BUDGET]),
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
    ...qr(QR_SUMMARY),
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
    ...qr(QR_SUMMARY),
  };
}
