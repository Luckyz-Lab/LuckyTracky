import { NextResponse } from "next/server";
import { getAppOrigin } from "@/lib/app-url";
import { createAdminClient } from "@/lib/supabase/admin";

function configuredValue(value: string | undefined) {
  const trimmed = value?.trim();
  if (!trimmed || trimmed.startsWith("YOUR_") || trimmed === "CHANGE_ME") return null;
  return trimmed;
}

/**
 * LINE Login callback. Exchanges the code for an id_token, derives the user,
 * then creates/links a Supabase user and establishes a session via a magic link.
 *
 * NOTE: LINE must be configured to return the user's email (requires email
 * permission approval in the LINE Developers console).
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = getAppOrigin(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieState = request.headers
    .get("cookie")
    ?.split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("line_oauth_state="))
    ?.split("=")[1];

  if (!code || !state || state !== cookieState) {
    return NextResponse.redirect(`${origin}/login?error=line_state`);
  }

  const channelId = configuredValue(process.env.LINE_LOGIN_CHANNEL_ID);
  const channelSecret = configuredValue(process.env.LINE_LOGIN_CHANNEL_SECRET);
  if (!channelId || !channelSecret) {
    return NextResponse.redirect(`${origin}/login?error=line_not_configured`);
  }

  // Exchange code for tokens
  const tokenRes = await fetch("https://api.line.me/oauth2/v2.1/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: `${origin}/api/auth/line/callback`,
      client_id: channelId,
      client_secret: channelSecret,
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${origin}/login?error=line_token`);
  }

  const tokens = await tokenRes.json();
  const idToken: string | undefined = tokens.id_token;
  if (!idToken) {
    return NextResponse.redirect(`${origin}/login?error=line_idtoken`);
  }

  // Decode the JWT payload (id_token is signed by LINE; we trust the token endpoint response)
  const payload = JSON.parse(
    Buffer.from(idToken.split(".")[1], "base64").toString("utf8")
  ) as { sub: string; name?: string; email?: string };

  const lineUserId = payload.sub;
  const displayName = payload.name || "LINE User";
  const email = payload.email || `line_${lineUserId}@line.luckytracky.local`;

  const admin = createAdminClient();

  // Find existing user by email; create if missing.
  const { data: list } = await admin.auth.admin.listUsers();
  let userId = list?.users.find((u) => u.email === email)?.id;

  if (!userId) {
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { full_name: displayName, line_user_id: lineUserId },
    });
    if (createErr || !created.user) {
      return NextResponse.redirect(`${origin}/login?error=line_create`);
    }
    userId = created.user.id;
  }

  // Link the LINE user id to the profile for bot routing.
  await admin
    .from("line_accounts")
    .upsert(
      { profile_id: userId, line_user_id: lineUserId },
      { onConflict: "line_user_id" }
    );

  // Generate a magic link and redirect to its verification URL to set the session.
  const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { redirectTo: `${origin}/auth/callback` },
  });

  if (linkErr || !linkData) {
    return NextResponse.redirect(`${origin}/login?error=line_link`);
  }

  return NextResponse.redirect(linkData.properties.action_link);
}
