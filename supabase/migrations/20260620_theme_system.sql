-- Complete workspace theming preferences. Safe to run more than once.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profile_preferences'
      AND column_name = 'theme_mode'
  ) THEN
    ALTER TABLE profile_preferences
      ADD COLUMN theme_mode TEXT NOT NULL DEFAULT 'light';

    UPDATE profile_preferences
    SET theme_mode = CASE WHEN theme IN ('black-cat', 'midnight') THEN 'dark' ELSE 'light' END;
  END IF;
END $$;

ALTER TABLE profile_preferences
  DROP CONSTRAINT IF EXISTS profile_preferences_theme_mode_check;

ALTER TABLE profile_preferences
  ADD CONSTRAINT profile_preferences_theme_mode_check
  CHECK (theme_mode IN ('light', 'dark', 'system'));

ALTER TABLE profile_preferences
  ADD COLUMN IF NOT EXISTS theme_overrides JSONB NOT NULL
  DEFAULT '{"primary":null,"canvas":null,"surface":null,"text":null,"radius":"soft","shadow":"soft"}'::jsonb;
