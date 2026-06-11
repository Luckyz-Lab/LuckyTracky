import { NextResponse } from "next/server";
import { ACTIVE_HOUSEHOLD_COOKIE } from "@/lib/household";

export async function POST(request: Request) {
  const { householdId } = await request.json();
  if (!householdId) {
    return NextResponse.json({ error: "householdId required" }, { status: 400 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ACTIVE_HOUSEHOLD_COOKIE, householdId, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return res;
}
