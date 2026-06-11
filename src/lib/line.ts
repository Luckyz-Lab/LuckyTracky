import { createHmac, timingSafeEqual } from "crypto";

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
