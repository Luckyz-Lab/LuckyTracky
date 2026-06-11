import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import type { Household } from "@/lib/supabase/types";

export const ACTIVE_HOUSEHOLD_COOKIE = "active_household";

export interface HouseholdContext {
  userId: string;
  households: Household[];
  activeHousehold: Household | null;
}

/**
 * Resolves the signed-in user's households and the active one (from cookie,
 * falling back to the first membership).
 */
export async function getHouseholdContext(): Promise<HouseholdContext | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: members } = await supabase
    .from("household_members")
    .select("household_id, households(*)")
    .eq("profile_id", user.id);

  const households: Household[] = (members ?? [])
    .map((m: { households: Household | Household[] | null }) =>
      Array.isArray(m.households) ? m.households[0] : m.households
    )
    .filter((h): h is Household => Boolean(h))
    .sort((a, b) => a.created_at.localeCompare(b.created_at));

  const cookieId = cookies().get(ACTIVE_HOUSEHOLD_COOKIE)?.value;
  const activeHousehold =
    households.find((h) => h.id === cookieId) ?? households[0] ?? null;

  return { userId: user.id, households, activeHousehold };
}
