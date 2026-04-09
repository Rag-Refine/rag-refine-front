-- Create jobs table
-- Documents the full schema as it exists in production.
-- Note: this table was initially created manually; this migration exists for
-- version control completeness. Uses IF NOT EXISTS to be idempotent.

CREATE TABLE IF NOT EXISTS public.jobs (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id       uuid        NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  user_id          uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name        text        NOT NULL,
  file_size        bigint,
  file_type        text,
  storage_path     text,
  status           text        NOT NULL DEFAULT 'pending',
  page_count       integer     NOT NULL DEFAULT 0,
  output_markdown  text,
  error_message    text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
