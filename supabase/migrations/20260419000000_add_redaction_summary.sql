-- Track PII redactions applied at upload time.
-- Shape: { "applied": {"EMAIL": 3, "IBAN": 1}, "missed": {...}, "total": 4 }
alter table public.jobs
  add column if not exists redaction_summary jsonb default null;
