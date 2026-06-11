/**
 * Hand-written DB row types (kept in sync with supabase/schema.sql).
 */
export type TxType = "income" | "expense";
export type TxSource = "web_chat" | "manual" | "line" | "receipt";
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
