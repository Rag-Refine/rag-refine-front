-- Auto-update updated_at on accounts
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_accounts_updated
  BEFORE UPDATE ON public.accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create account + membership on user sign-up
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
  -- Extract account_name from metadata, fallback to email prefix
  account_name_value := NEW.raw_user_meta_data->>'account_name';
  IF account_name_value IS NULL OR account_name_value = '' THEN
    account_name_value := split_part(NEW.email, '@', 1);
  END IF;

  -- Create the account
  INSERT INTO public.accounts (account_name)
  VALUES (account_name_value)
  RETURNING id INTO new_account_id;

  -- Link user to account as owner
  INSERT INTO public.account_members (account_id, user_id, role)
  VALUES (new_account_id, NEW.id, 'owner');

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
