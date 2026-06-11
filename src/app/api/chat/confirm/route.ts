import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { handleConfirm } from "@/lib/chat-handler";

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ kind: "error", message: "Unauthorized" }, { status: 401 });

  const { pending_confirmation_id, action, edited } = await request.json();
  if (!pending_confirmation_id || !["confirm", "cancel"].includes(action)) {
    return NextResponse.json({ kind: "error", message: "Invalid request" }, { status: 400 });
  }

  const response = await handleConfirm({
    supabase,
    pendingId: pending_confirmation_id,
    action,
    profileId: user.id,
    edited,
  });

  return NextResponse.json(response);
}
