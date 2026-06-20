-- ============================================================
-- LuckyTracky - Supabase schema, RLS, triggers, seed
-- Run this in the Supabase SQL editor on a fresh project.
-- ============================================================

create extension if not exists "pgcrypto";

-- ─── Enums ──────────────────────────────────────────────
do $$ begin
  create type tx_type as enum ('income', 'expense');
exception when duplicate_object then null; end $$;

do $$ begin
  create type tx_source as enum ('web_chat', 'manual', 'line', 'receipt', 'recurring');
exception when duplicate_object then null; end $$;

alter type tx_source add value if not exists 'recurring';

do $$ begin
  create type member_role as enum ('owner', 'member');
exception when duplicate_object then null; end $$;

do $$ begin
  create type receipt_status as enum ('draft', 'saved', 'discarded');
exception when duplicate_object then null; end $$;

-- ─── Tables ─────────────────────────────────────────────
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

create table if not exists households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid references profiles(id) on delete set null,
  currency text not null default 'THB',
  invite_code text unique not null default encode(gen_random_bytes(6), 'hex'),
  created_at timestamptz not null default now()
);

create table if not exists household_members (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  role member_role not null default 'member',
  created_at timestamptz not null default now(),
  unique (household_id, profile_id)
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete cascade, -- null = global default
  name text not null,
  type tx_type not null,
  keywords text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  created_by uuid references profiles(id) on delete set null,
  item text not null,
  amount numeric(14,2) not null,
  type tx_type not null,
  category_id uuid references categories(id) on delete set null,
  category_name text, -- denormalized snapshot for display
  date date not null,
  currency text not null default 'THB',
  source tx_source not null default 'web_chat',
  confidence numeric(4,3),
  raw_input text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists budgets (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  category_id uuid references categories(id) on delete cascade,
  month text not null, -- 'YYYY-MM'
  limit_amount numeric(14,2) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (household_id, category_id, month)
);

create table if not exists pending_confirmations (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  profile_id uuid references profiles(id) on delete cascade,
  parsed_payload jsonb not null,
  raw_input text,
  source tx_source not null default 'web_chat',
  expires_at timestamptz not null default (now() + interval '1 hour'),
  created_at timestamptz not null default now()
);

create table if not exists line_accounts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  default_household_id uuid references households(id) on delete set null,
  line_user_id text unique not null,
  linked_at timestamptz not null default now()
);

create table if not exists receipt_drafts (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  profile_id uuid references profiles(id) on delete cascade,
  image_url text,
  parsed_payload jsonb,
  source text not null default 'web', -- 'web' | 'line'
  status receipt_status not null default 'draft',
  created_at timestamptz not null default now()
);

create table if not exists recurring_rules (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  created_by uuid references profiles(id) on delete set null,
  item text not null,
  amount numeric(14,2) not null check (amount > 0),
  type tx_type not null default 'expense',
  category_id uuid references categories(id) on delete set null,
  category_name text,
  cadence text not null check (cadence in ('weekly', 'monthly', 'yearly')),
  next_due_date date not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists profile_preferences (
  profile_id uuid primary key references profiles(id) on delete cascade,
  theme text not null default 'classic' check (theme in ('classic', 'calico', 'siamese', 'black-cat', 'midnight')),
  theme_mode text not null default 'light' check (theme_mode in ('light', 'dark', 'system')),
  theme_overrides jsonb not null default '{"primary":null,"canvas":null,"surface":null,"text":null,"radius":"soft","shadow":"soft"}'::jsonb,
  mascot_name text not null default 'Lucky',
  mascot_breed text not null default 'tabby' check (mascot_breed in ('tabby', 'siamese', 'persian', 'calico')),
  mascot_color text not null default '#FFEFE6',
  mascot_accessory text not null default 'collar_bell' check (mascot_accessory in ('none', 'collar_bell', 'royal_crown', 'party_hat', 'detective_cap')),
  notifications_enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists achievement_unlocks (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  achievement_key text not null,
  unlocked_at timestamptz not null default now(),
  claimed_at timestamptz,
  claimed_by uuid references profiles(id) on delete set null,
  unique (household_id, achievement_key)
);

create index if not exists idx_tx_household_date on transactions(household_id, date);
create index if not exists idx_members_profile on household_members(profile_id);
create index if not exists idx_budgets_household_month on budgets(household_id, month);
create index if not exists idx_recurring_household_due on recurring_rules(household_id, is_active, next_due_date);
create index if not exists idx_achievement_household on achievement_unlocks(household_id, unlocked_at desc);
create unique index if not exists idx_tx_recurring_marker on transactions(raw_input) where source = 'recurring';

-- ─── Helper functions (SECURITY DEFINER to avoid RLS recursion) ──
create or replace function is_household_member(hid uuid)
returns boolean
language sql security definer stable
set search_path = public
as $$
  select exists (
    select 1 from household_members
    where household_id = hid and profile_id = auth.uid()
  );
$$;

create or replace function is_household_owner(hid uuid)
returns boolean
language sql security definer stable
set search_path = public
as $$
  select exists (
    select 1 from household_members
    where household_id = hid and profile_id = auth.uid() and role = 'owner'
  );
$$;

-- ─── Seed default categories into a household ───────────
create or replace function seed_default_categories(hid uuid)
returns void
language plpgsql security definer
set search_path = public
as $$
begin
  insert into categories (household_id, name, type, keywords) values
    (hid, 'อาหาร', 'expense', array['กิน','ข้าว','อาหาร','กาแฟ','ก๋วยเตี๋ยว','ร้านอาหาร']),
    (hid, 'เดินทาง', 'expense', array['แท็กซี่','ค่ารถ','รถไฟฟ้า','น้ำมัน','grab','bts','mrt']),
    (hid, 'ที่พัก', 'expense', array['ค่าเช่า','หอ','คอนโด','บ้าน','ที่พัก','โรงแรม']),
    (hid, 'ค่าน้ำค่าไฟ', 'expense', array['ค่าน้ำ','ค่าไฟ','ไฟฟ้า','ประปา','ค่าเน็ต','อินเทอร์เน็ต']),
    (hid, 'ช้อปปิ้ง', 'expense', array['ซื้อ','ช้อป','ของใช้','เสื้อผ้า','รองเท้า']),
    (hid, 'สุขภาพ', 'expense', array['หมอ','ยา','โรงพยาบาล','คลินิก','ฟิตเนส']),
    (hid, 'การศึกษา', 'expense', array['เรียน','คอร์ส','หนังสือ','ค่าเทอม']),
    (hid, 'บันเทิง', 'expense', array['หนัง','เกม','netflix','spotify','ท่องเที่ยว']),
    (hid, 'อื่นๆ', 'expense', array[]::text[]),
    (hid, 'เงินเดือน', 'income', array['เงินเดือน','salary','ค่าแรง']),
    (hid, 'โบนัส', 'income', array['โบนัส','bonus']),
    (hid, 'งานเสริม', 'income', array['งานเสริม','ฟรีแลนซ์','freelance','ค่าคอม']),
    (hid, 'ขายของ', 'income', array['ขาย','ลูกค้า','ยอดขาย','ออเดอร์']),
    (hid, 'ของขวัญ', 'income', array['ให้เงิน','อั่งเปา','ของขวัญ']);
end;
$$;

-- ─── On new auth user: profile + personal household + membership ──
create or replace function handle_new_user()
returns trigger
language plpgsql security definer
set search_path = public
as $$
declare
  new_household_id uuid;
  dname text;
begin
  dname := coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1), 'Me');

  insert into profiles (id, display_name) values (new.id, dname)
  on conflict (id) do nothing;

  insert into households (name, created_by)
  values (dname || '''s Household', new.id)
  returning id into new_household_id;

  insert into household_members (household_id, profile_id, role)
  values (new_household_id, new.id, 'owner');

  perform seed_default_categories(new_household_id);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ─── updated_at trigger ─────────────────────────────────
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists trg_tx_updated on transactions;
create trigger trg_tx_updated before update on transactions
  for each row execute function set_updated_at();

drop trigger if exists trg_budget_updated on budgets;
create trigger trg_budget_updated before update on budgets
  for each row execute function set_updated_at();

drop trigger if exists trg_recurring_updated on recurring_rules;
create trigger trg_recurring_updated before update on recurring_rules
  for each row execute function set_updated_at();

drop trigger if exists trg_preferences_updated on profile_preferences;
create trigger trg_preferences_updated before update on profile_preferences
  for each row execute function set_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================
alter table profiles enable row level security;
alter table households enable row level security;
alter table household_members enable row level security;
alter table categories enable row level security;
alter table transactions enable row level security;
alter table budgets enable row level security;
alter table pending_confirmations enable row level security;
alter table line_accounts enable row level security;
alter table receipt_drafts enable row level security;
alter table recurring_rules enable row level security;
alter table profile_preferences enable row level security;
alter table achievement_unlocks enable row level security;

-- profiles: a user sees/edits own profile
drop policy if exists profiles_self on profiles;
create policy profiles_self on profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

-- households: members can read; anyone authenticated can read by lookup for join is handled via RPC
drop policy if exists households_read on households;
create policy households_read on households
  for select using (is_household_member(id));

drop policy if exists households_insert on households;
create policy households_insert on households
  for insert with check (created_by = auth.uid());

drop policy if exists households_update on households;
create policy households_update on households
  for update using (is_household_owner(id)) with check (is_household_owner(id));

-- household_members: a user reads rows of households they belong to; owner manages
drop policy if exists members_read on household_members;
create policy members_read on household_members
  for select using (profile_id = auth.uid() or is_household_member(household_id));

drop policy if exists members_insert on household_members;
create policy members_insert on household_members
  for insert with check (profile_id = auth.uid() or is_household_owner(household_id));

drop policy if exists members_delete on household_members;
create policy members_delete on household_members
  for delete using (is_household_owner(household_id) or profile_id = auth.uid());

-- categories: global (null household) readable by all; household ones by members
drop policy if exists categories_read on categories;
create policy categories_read on categories
  for select using (household_id is null or is_household_member(household_id));

drop policy if exists categories_write on categories;
create policy categories_write on categories
  for all using (household_id is not null and is_household_member(household_id))
  with check (household_id is not null and is_household_member(household_id));

-- transactions: members of the household
drop policy if exists transactions_all on transactions;
create policy transactions_all on transactions
  for all using (is_household_member(household_id))
  with check (is_household_member(household_id));

-- budgets
drop policy if exists budgets_all on budgets;
create policy budgets_all on budgets
  for all using (is_household_member(household_id))
  with check (is_household_member(household_id));

-- pending_confirmations
drop policy if exists pending_all on pending_confirmations;
create policy pending_all on pending_confirmations
  for all using (is_household_member(household_id))
  with check (is_household_member(household_id));

-- line_accounts: own rows
drop policy if exists line_self on line_accounts;
create policy line_self on line_accounts
  for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());

-- receipt_drafts
drop policy if exists receipts_all on receipt_drafts;
create policy receipts_all on receipt_drafts
  for all using (is_household_member(household_id))
  with check (is_household_member(household_id));

-- recurring_rules
drop policy if exists recurring_rules_all on recurring_rules;
create policy recurring_rules_all on recurring_rules
  for all using (is_household_member(household_id))
  with check (is_household_member(household_id));

-- profile_preferences
drop policy if exists profile_preferences_self on profile_preferences;
create policy profile_preferences_self on profile_preferences
  for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());

-- achievement_unlocks
drop policy if exists achievement_unlocks_read on achievement_unlocks;
create policy achievement_unlocks_read on achievement_unlocks
  for select using (is_household_member(household_id));

drop policy if exists achievement_unlocks_insert on achievement_unlocks;
create policy achievement_unlocks_insert on achievement_unlocks
  for insert with check (is_household_member(household_id));

drop policy if exists achievement_unlocks_update on achievement_unlocks;
create policy achievement_unlocks_update on achievement_unlocks
  for update using (is_household_member(household_id))
  with check (is_household_member(household_id));

-- ─── Join household by invite code (SECURITY DEFINER RPC) ──
create or replace function join_household_by_code(code text)
returns uuid
language plpgsql security definer
set search_path = public
as $$
declare hid uuid;
begin
  select id into hid from households where invite_code = code;
  if hid is null then
    raise exception 'Invalid invite code';
  end if;
  insert into household_members (household_id, profile_id, role)
  values (hid, auth.uid(), 'member')
  on conflict (household_id, profile_id) do nothing;
  return hid;
end;
$$;
