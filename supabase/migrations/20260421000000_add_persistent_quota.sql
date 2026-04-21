-- Persistent page quota on accounts.
-- Previously usage was derived by summing jobs.page_count, which meant
-- deleting a job silently refunded pages. The counter now lives on
-- accounts and is only ever incremented (reset by the rolling 30-day
-- window), so deletes no longer affect the quota.

ALTER TABLE public.accounts
  ADD COLUMN monthly_page_limit integer NOT NULL DEFAULT 2000,
  ADD COLUMN pages_consumed integer NOT NULL DEFAULT 0,
  ADD COLUMN quota_reset_date timestamptz NOT NULL DEFAULT (now() + interval '30 days');

-- Seed the limit for existing rows based on current plan.
UPDATE public.accounts
  SET monthly_page_limit = CASE WHEN plan = 'pro' THEN 10000 ELSE 2000 END;

-- Keep signup trigger aligned: new accounts get the free-tier limit.
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
  VALUES (account_name_value, 2000)
  RETURNING id INTO new_account_id;

  INSERT INTO public.account_members (account_id, user_id, role)
  VALUES (new_account_id, NEW.id, 'owner');

  RETURN NEW;
END;
$$;

-- Rolling-window reset. Safe to call on every upload attempt; only
-- writes when the window has actually expired.
CREATE OR REPLACE FUNCTION public.reset_quota_if_expired(
  p_account_id uuid
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_account accounts%ROWTYPE;
BEGIN
  SELECT * INTO v_account FROM accounts WHERE id = p_account_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'account_not_found');
  END IF;

  IF now() > v_account.quota_reset_date THEN
    UPDATE accounts
      SET pages_consumed = 0,
          quota_reset_date = now() + interval '30 days'
      WHERE id = p_account_id
      RETURNING * INTO v_account;
  END IF;

  RETURN jsonb_build_object(
    'ok', true,
    'pages_consumed', v_account.pages_consumed,
    'monthly_page_limit', v_account.monthly_page_limit,
    'quota_reset_date', v_account.quota_reset_date
  );
END;
$$;

-- Atomic check-and-increment used when page_count is known (engine webhook).
-- Returns ok=false with error=limit_exceeded if consuming p_pages would
-- push the account past its monthly limit; the counter is left unchanged
-- in that case.
CREATE OR REPLACE FUNCTION public.consume_pages(
  p_account_id uuid,
  p_pages integer
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_account accounts%ROWTYPE;
BEGIN
  IF p_pages IS NULL OR p_pages <= 0 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_pages');
  END IF;

  SELECT * INTO v_account FROM accounts WHERE id = p_account_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'account_not_found');
  END IF;

  IF now() > v_account.quota_reset_date THEN
    v_account.pages_consumed := 0;
    v_account.quota_reset_date := now() + interval '30 days';
  END IF;

  IF v_account.pages_consumed + p_pages > v_account.monthly_page_limit THEN
    UPDATE accounts
      SET pages_consumed = v_account.pages_consumed,
          quota_reset_date = v_account.quota_reset_date
      WHERE id = p_account_id;
    RETURN jsonb_build_object(
      'ok', false,
      'error', 'limit_exceeded',
      'pages_consumed', v_account.pages_consumed,
      'monthly_page_limit', v_account.monthly_page_limit
    );
  END IF;

  UPDATE accounts
    SET pages_consumed = v_account.pages_consumed + p_pages,
        quota_reset_date = v_account.quota_reset_date
    WHERE id = p_account_id;

  RETURN jsonb_build_object(
    'ok', true,
    'pages_consumed', v_account.pages_consumed + p_pages,
    'monthly_page_limit', v_account.monthly_page_limit
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.reset_quota_if_expired(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.consume_pages(uuid, integer) TO authenticated, service_role;
