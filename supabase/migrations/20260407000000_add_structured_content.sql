-- Add structured_content column to jobs table
-- Stores the array of blocks returned by the processing engine (JSONB for flexibility).
alter table public.jobs
  add column if not exists structured_content jsonb default null;
