-- ── Create support_tickets table (idempotent) ────────────────────────────────

CREATE TABLE IF NOT EXISTS public.support_tickets (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject    TEXT        NOT NULL,
  message    TEXT        NOT NULL,
  status     TEXT        NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Row Level Security ────────────────────────────────────────────────────────

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'support_tickets'
      AND policyname = 'Users can insert own tickets'
  ) THEN
    CREATE POLICY "Users can insert own tickets"
      ON public.support_tickets FOR INSERT
      WITH CHECK (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'support_tickets'
      AND policyname = 'Users can read own tickets'
  ) THEN
    CREATE POLICY "Users can read own tickets"
      ON public.support_tickets FOR SELECT
      USING (user_id = auth.uid());
  END IF;
END $$;
