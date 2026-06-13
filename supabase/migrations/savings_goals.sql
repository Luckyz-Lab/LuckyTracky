-- Run this in Supabase SQL Editor to add savings goals support.
-- Table: savings_goals

CREATE TABLE IF NOT EXISTS savings_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_amount NUMERIC(12,2) NOT NULL CHECK (target_amount > 0),
  current_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  deadline DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_savings_goals_household ON savings_goals(household_id);

ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "household members can select"
  ON savings_goals FOR SELECT
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "household members can insert"
  ON savings_goals FOR INSERT
  WITH CHECK (
    household_id IN (
      SELECT household_id FROM household_members WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "household members can update"
  ON savings_goals FOR UPDATE
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "household members can delete"
  ON savings_goals FOR DELETE
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE profile_id = auth.uid()
    )
  );
