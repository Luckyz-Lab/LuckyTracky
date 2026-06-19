-- Product features migrated from the LuckyTracky UX prototype.
-- Safe to run more than once.

ALTER TYPE tx_source ADD VALUE IF NOT EXISTS 'recurring';

CREATE TABLE IF NOT EXISTS recurring_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  item TEXT NOT NULL,
  amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
  type tx_type NOT NULL DEFAULT 'expense',
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  category_name TEXT,
  cadence TEXT NOT NULL CHECK (cadence IN ('weekly', 'monthly', 'yearly')),
  next_due_date DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS profile_preferences (
  profile_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  theme TEXT NOT NULL DEFAULT 'classic' CHECK (theme IN ('classic', 'calico', 'siamese', 'black-cat', 'midnight')),
  mascot_name TEXT NOT NULL DEFAULT 'Lucky',
  mascot_breed TEXT NOT NULL DEFAULT 'tabby' CHECK (mascot_breed IN ('tabby', 'siamese', 'persian', 'calico')),
  mascot_color TEXT NOT NULL DEFAULT '#FFEFE6',
  mascot_accessory TEXT NOT NULL DEFAULT 'collar_bell' CHECK (mascot_accessory IN ('none', 'collar_bell', 'royal_crown', 'party_hat', 'detective_cap')),
  notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS achievement_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  achievement_key TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  claimed_at TIMESTAMPTZ,
  claimed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  UNIQUE (household_id, achievement_key)
);

CREATE INDEX IF NOT EXISTS idx_recurring_household_due
  ON recurring_rules(household_id, is_active, next_due_date);
CREATE INDEX IF NOT EXISTS idx_achievement_household
  ON achievement_unlocks(household_id, unlocked_at DESC);

ALTER TABLE recurring_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievement_unlocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS recurring_rules_all ON recurring_rules;
CREATE POLICY recurring_rules_all ON recurring_rules
  FOR ALL USING (is_household_member(household_id))
  WITH CHECK (is_household_member(household_id));

DROP POLICY IF EXISTS profile_preferences_self ON profile_preferences;
CREATE POLICY profile_preferences_self ON profile_preferences
  FOR ALL USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

DROP POLICY IF EXISTS achievement_unlocks_read ON achievement_unlocks;
CREATE POLICY achievement_unlocks_read ON achievement_unlocks
  FOR SELECT USING (is_household_member(household_id));

DROP POLICY IF EXISTS achievement_unlocks_insert ON achievement_unlocks;
CREATE POLICY achievement_unlocks_insert ON achievement_unlocks
  FOR INSERT WITH CHECK (is_household_member(household_id));

DROP POLICY IF EXISTS achievement_unlocks_update ON achievement_unlocks;
CREATE POLICY achievement_unlocks_update ON achievement_unlocks
  FOR UPDATE USING (is_household_member(household_id))
  WITH CHECK (is_household_member(household_id));

DROP TRIGGER IF EXISTS trg_recurring_updated ON recurring_rules;
CREATE TRIGGER trg_recurring_updated BEFORE UPDATE ON recurring_rules
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_preferences_updated ON profile_preferences;
CREATE TRIGGER trg_preferences_updated BEFORE UPDATE ON profile_preferences
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
