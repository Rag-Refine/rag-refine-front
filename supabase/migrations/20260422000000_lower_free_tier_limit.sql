-- Lower the free-tier monthly page limit from 2000 to 500. The previous
-- migration (20260421000000) seeded 2000; this one corrects the default
-- for new rows, back-fills existing rows that still match the old value,
-- and updates the signup trigger so new accounts are created with the
-- new limit.

ALTER TABLE public.accounts
  ALTER COLUMN monthly_page_limit SET DEFAULT 500;

-- Only touch rows that still carry the old free-tier seed value, so any
-- account that has been manually adjusted (including pro accounts at
-- 10000) is preserved.
UPDATE public.accounts
  SET monthly_page_limit = 500
  WHERE monthly_page_limit = 2000;

-- Keep the signup trigger aligned with the new default.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  new_account_id uuid;
  account_name_value text;
BEGIN
  account_name_value := NEW.raw_user_meta_data->>'account_name';
  IF account_name_value IS NULL OR account_name_value = '' THEN
    account_name_value := split_part(NEW.email, '@', 1);
  END IF;

  INSERT INTO public.accounts (account_name, monthly_page_limit)
  VALUES (account_name_value, 500)
  RETURNING id INTO new_account_id;

  INSERT INTO public.account_members (account_id, user_id, role)
  VALUES (new_account_id, NEW.id, 'owner');

  RETURN NEW;
END;
$$;
