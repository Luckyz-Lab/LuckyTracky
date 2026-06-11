import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { handleChatMessage, handleConfirm } from "@/lib/chat-handler";
import { parseReceiptImage } from "@/lib/parser/gemini";
import { formatMoney } from "@/lib/utils";
import {
  verifyLineSignature,
  replyMessage,
  getMessageContent,
  textMessage,
  confirmTemplate,
} from "@/lib/line";
import type { ChatResponse } from "@/lib/chat-types";

const LINK_HINT =
  "Your LINE account isn't linked yet. Open LuckyTracky on the web and sign in with LINE to start logging here.";

function responseToMessages(r: ChatResponse): unknown[] {
  switch (r.kind) {
    case "saved": {
      const t = r.transaction;
      const sign = t.type === "รายรับ" ? "+" : "-";
      return [textMessage(`Saved: ${t.item} ${sign}${formatMoney(t.amount ?? 0)} (${t.category})`)];
    }
    case "confirm":
      return [confirmTemplate(`${r.transaction.item} ${formatMoney(r.transaction.amount ?? 0)} — save this?`, r.pendingId)];
    case "missing":
      return [textMessage(r.message)];
    case "summary":
      return [textMessage(r.message)];
    case "error":
      return [textMessage(`Error: ${r.message}`)];
  }
}

interface LineAccount {
  profile_id: string;
  default_household_id: string | null;
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-line-signature");

  if (!verifyLineSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const body = JSON.parse(rawBody);
  const admin = createAdminClient();

  for (const event of body.events ?? []) {
    const lineUserId: string | undefined = event.source?.userId;
    if (!lineUserId || !event.replyToken) continue;

    const { data: account } = await admin
      .from("line_accounts")
      .select("profile_id, default_household_id")
      .eq("line_user_id", lineUserId)
      .maybeSingle();

    const acct = account as LineAccount | null;

    if (!acct || !acct.default_household_id) {
      await replyMessage(event.replyToken, [textMessage(LINK_HINT)]);
      continue;
    }

    try {
      if (event.type === "message" && event.message?.type === "text") {
        const response = await handleChatMessage({
          supabase: admin,
          householdId: acct.default_household_id,
          profileId: acct.profile_id,
          message: event.message.text,
          source: "line",
        });
        await replyMessage(event.replyToken, responseToMessages(response));
      } else if (event.type === "message" && event.message?.type === "image") {
        const { base64, mime } = await getMessageContent(event.message.id);
        const draft = await parseReceiptImage(base64, mime);
        const { data: pending } = await admin
          .from("pending_confirmations")
          .insert({
            household_id: acct.default_household_id,
            profile_id: acct.profile_id,
            parsed_payload: draft as unknown as Record<string, unknown>,
            raw_input: "receipt image",
            source: "receipt",
          })
          .select("id")
          .single();
        if (pending) {
          await replyMessage(event.replyToken, [
            confirmTemplate(`Receipt: ${draft.item ?? "?"} ${formatMoney(draft.amount ?? 0)} — save?`, pending.id),
          ]);
        }
      } else if (event.type === "postback") {
        const [action, pendingId] = String(event.postback?.data ?? "").split(":");
        if ((action === "confirm" || action === "cancel") && pendingId) {
          const response = await handleConfirm({
            supabase: admin,
            pendingId,
            action,
            profileId: acct.profile_id,
          });
          await replyMessage(event.replyToken, responseToMessages(response));
        }
      }
    } catch (err) {
      await replyMessage(event.replyToken, [textMessage(`Error: ${(err as Error).message}`)]);
    }
  }

  return NextResponse.json({ ok: true });
}
