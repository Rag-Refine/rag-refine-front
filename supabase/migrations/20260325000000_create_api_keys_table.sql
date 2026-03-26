-- ── Create api_keys table (idempotent) ──────────────────────────────────────
--
-- Checks information_schema before adding each column so this script is safe
-- to run multiple times (e.g., in CI or against an already-migrated database).

CREATE TABLE IF NOT EXISTS public.api_keys (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id   UUID        NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  name         TEXT        NOT NULL,
  key_hash     TEXT        NOT NULL UNIQUE,
  key_display  TEXT        NOT NULL,
  last_used_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── Idempotent column additions ───────────────────────────────────────────────
-- Handles tables that were created by an older migration using different names.

DO $$
BEGIN
  -- Rename label → name if label column still exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'api_keys' AND column_name = 'label'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'api_keys' AND column_name = 'name'
  ) THEN
    ALTER TABLE public.api_keys RENAME COLUMN label TO name;
  END IF;

  -- Rename key_prefix → key_display if key_prefix column still exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'api_keys' AND column_name = 'key_prefix'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'api_keys' AND column_name = 'key_display'
  ) THEN
    ALTER TABLE public.api_keys RENAME COLUMN key_prefix TO key_display;
  END IF;

  -- Add name if still missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'api_keys' AND column_name = 'name'
  ) THEN
    ALTER TABLE public.api_keys ADD COLUMN name TEXT;
    UPDATE public.api_keys SET name = 'Default' WHERE name IS NULL;
    ALTER TABLE public.api_keys ALTER COLUMN name SET NOT NULL;
  END IF;

  -- Add key_display if still missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'api_keys' AND column_name = 'key_display'
  ) THEN
    ALTER TABLE public.api_keys ADD COLUMN key_display TEXT;
    UPDATE public.api_keys SET key_display = 'rr_live_...' WHERE key_display IS NULL;
    ALTER TABLE public.api_keys ALTER COLUMN key_display SET NOT NULL;
  END IF;

  -- Add last_used_at if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'api_keys' AND column_name = 'last_used_at'
  ) THEN
    ALTER TABLE public.api_keys ADD COLUMN last_used_at TIMESTAMPTZ;
  END IF;
END $$;

-- ── Row Level Security ────────────────────────────────────────────────────────

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'api_keys'
      AND policyname = 'Users can read their own api keys'
  ) THEN
    CREATE POLICY "Users can read their own api keys"
      ON public.api_keys FOR SELECT
      USING (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'api_keys'
      AND policyname = 'Users can insert their own api keys'
  ) THEN
    CREATE POLICY "Users can insert their own api keys"
      ON public.api_keys FOR INSERT
      WITH CHECK (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'api_keys'
      AND policyname = 'Users can delete their own api keys'
  ) THEN
    CREATE POLICY "Users can delete their own api keys"
      ON public.api_keys FOR DELETE
      USING (user_id = auth.uid());
  END IF;
END $$;
