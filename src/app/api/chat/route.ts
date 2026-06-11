import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { handleChatMessage } from "@/lib/chat-handler";

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ kind: "error", message: "Unauthorized" }, { status: 401 });

  const { message, household_id } = await request.json();
  if (!message || !household_id) {
    return NextResponse.json({ kind: "error", message: "message and household_id required" }, { status: 400 });
  }

  const response = await handleChatMessage({
    supabase,
    householdId: household_id,
    profileId: user.id,
    message,
    source: "web_chat",
  });

  return NextResponse.json(response);
}
