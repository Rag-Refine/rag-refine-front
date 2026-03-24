-- RLS policies for accounts
CREATE POLICY "Users can read their own accounts"
  ON public.accounts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.account_members
      WHERE account_members.account_id = accounts.id
        AND account_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can update their accounts"
  ON public.accounts
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.account_members
      WHERE account_members.account_id = accounts.id
        AND account_members.user_id = auth.uid()
        AND account_members.role = 'owner'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.account_members
      WHERE account_members.account_id = accounts.id
        AND account_members.user_id = auth.uid()
        AND account_members.role = 'owner'
    )
  );

-- RLS policies for account_members
CREATE POLICY "Users can read their own memberships"
  ON public.account_members
  FOR SELECT
  USING (user_id = auth.uid());
