-- RLS policies for jobs table
CREATE POLICY "Users can read jobs for their accounts"
  ON public.jobs
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert jobs for their accounts"
  ON public.jobs
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own jobs"
  ON public.jobs
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own jobs"
  ON public.jobs
  FOR DELETE
  USING (user_id = auth.uid());

-- Performance indexes for history queries
CREATE INDEX IF NOT EXISTS jobs_user_id_idx ON public.jobs (user_id);
CREATE INDEX IF NOT EXISTS jobs_created_at_idx ON public.jobs (created_at DESC);
CREATE INDEX IF NOT EXISTS jobs_user_id_created_at_idx ON public.jobs (user_id, created_at DESC);
