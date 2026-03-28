-- ── Add file_hash column to jobs ────────────────────────────────────────────
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS file_hash TEXT;

-- ── Deduplication index ──────────────────────────────────────────────────────
-- Allows re-uploads of failed jobs; blocks duplicates for completed
-- conversions within the same account.
CREATE UNIQUE INDEX IF NOT EXISTS jobs_account_file_hash_completed_idx
  ON public.jobs (account_id, file_hash)
  WHERE status = 'completed';

-- ── Fix SELECT RLS to be account-scoped ─────────────────────────────────────
-- Previous policy only allowed the job creator to read their own jobs,
-- which prevented other account members from seeing shared jobs.
DROP POLICY IF EXISTS "Users can read jobs for their accounts" ON public.jobs;
CREATE POLICY "Account members can read jobs"
  ON public.jobs
  FOR SELECT
  USING (
    account_id IN (
      SELECT account_id FROM public.account_members WHERE user_id = auth.uid()
    )
  );

-- ── user_uploads private storage bucket ─────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user_uploads',
  'user_uploads',
  false,
  52428800,
  '{application/pdf}'
)
ON CONFLICT (id) DO NOTHING;

-- ── Storage RLS policies ─────────────────────────────────────────────────────
-- Users may only access files stored under their own account_id folder prefix.

CREATE POLICY "Account members can upload files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'user_uploads'
    AND (storage.foldername(name))[1] IN (
      SELECT account_id::text FROM public.account_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Account members can read their files"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'user_uploads'
    AND (storage.foldername(name))[1] IN (
      SELECT account_id::text FROM public.account_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Account members can delete their files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'user_uploads'
    AND (storage.foldername(name))[1] IN (
      SELECT account_id::text FROM public.account_members WHERE user_id = auth.uid()
    )
  );
