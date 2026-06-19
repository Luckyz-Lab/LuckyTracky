/**
 * Hand-written DB row types (kept in sync with supabase/schema.sql).
 */
export type TxType = "income" | "expense";
export type TxSource = "web_chat" | "manual" | "line" | "receipt" | "recurring";
export type MemberRole = "owner" | "member";

export interface Household {
  id: string;
  name: string;
  created_by: string | null;
  currency: string;
  invite_code: string;
  created_at: string;
}

export interface Profile {
  id: string;
  display_name: string | null;
  created_at: string;
}

export interface HouseholdMember {
  id: string;
  household_id: string;
  profile_id: string;
  role: MemberRole;
  created_at: string;
}

export interface Category {
  id: string;
  household_id: string | null;
  name: string;
  type: TxType;
  keywords: string[];
  is_active: boolean;
  created_at: string;
}

export interface Transaction {
  id: string;
  household_id: string;
  created_by: string | null;
  item: string;
  amount: number;
  type: TxType;
  category_id: string | null;
  category_name: string | null;
  date: string;
  currency: string;
  source: TxSource;
  confidence: number | null;
  raw_input: string | null;
  created_at: string;
  updated_at: string;
}

export interface Budget {
  id: string;
  household_id: string;
  category_id: string | null;
  month: string;
  limit_amount: number;
  created_at: string;
  updated_at: string;
}

export interface PendingConfirmation {
  id: string;
  household_id: string;
  profile_id: string | null;
  parsed_payload: Record<string, unknown>;
  raw_input: string | null;
  source: TxSource;
  expires_at: string;
  created_at: string;
}

export type RecurringCadence = "weekly" | "monthly" | "yearly";

export interface RecurringRule {
  id: string;
  household_id: string;
  created_by: string | null;
  item: string;
  amount: number;
  type: TxType;
  category_id: string | null;
  category_name: string | null;
  cadence: RecurringCadence;
  next_due_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type AppTheme = "classic" | "calico" | "siamese" | "black-cat" | "midnight";
export type MascotBreed = "tabby" | "siamese" | "persian" | "calico";
export type MascotAccessory = "none" | "collar_bell" | "royal_crown" | "party_hat" | "detective_cap";

export interface ProfilePreferences {
  profile_id: string;
  theme: AppTheme;
  mascot_name: string;
  mascot_breed: MascotBreed;
  mascot_color: string;
  mascot_accessory: MascotAccessory;
  notifications_enabled: boolean;
  updated_at: string;
}

export interface AchievementUnlock {
  id: string;
  household_id: string;
  achievement_key: string;
  unlocked_at: string;
  claimed_at: string | null;
  claimed_by: string | null;
}
