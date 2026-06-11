import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { getAppOrigin, getAppUrl } from "@/lib/app-url";

function configuredValue(value: string | undefined) {
  const trimmed = value?.trim();
  if (!trimmed || trimmed.startsWith("YOUR_") || trimmed === "CHANGE_ME") return null;
  return trimmed;
}

/**
 * Begins LINE Login (OIDC). Redirects the user to LINE's authorize endpoint.
 * Requires a LINE Login channel (separate from the Messaging API channel).
 */
export async function GET(request: Request) {
  const channelId = configuredValue(process.env.LINE_LOGIN_CHANNEL_ID);
  const channelSecret = configuredValue(process.env.LINE_LOGIN_CHANNEL_SECRET);
  if (!channelId || !channelSecret) {
    return NextResponse.redirect(getAppUrl(request.url, "/login?error=line_not_configured"));
  }

  const origin = getAppOrigin(request.url);
  const state = randomBytes(16).toString("hex");
  const nonce = randomBytes(16).toString("hex");

  const params = new URLSearchParams({
    response_type: "code",
    client_id: channelId,
    redirect_uri: `${origin}/api/auth/line/callback`,
    state,
    scope: "openid profile email",
    nonce,
  });

  const res = NextResponse.redirect(
    `https://access.line.me/oauth2/v2.1/authorize?${params.toString()}`
  );
  res.cookies.set("line_oauth_state", state, { httpOnly: true, maxAge: 600, path: "/" });
  return res;
}
