CREATE TABLE waitlist (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  email      TEXT        UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Anon users can insert only; all other access is denied by default
CREATE POLICY "allow_anon_insert" ON waitlist
  FOR INSERT TO anon
  WITH CHECK (true);
