-- Allow authenticated users to read their own token (for connection status check)
CREATE POLICY "users_select_own_token" ON public.user_tokens
  FOR SELECT USING (auth.jwt()->>'sub' = user_id);

-- Allow authenticated users to delete their own token (for disconnect)
CREATE POLICY "users_delete_own_token" ON public.user_tokens
  FOR DELETE USING (auth.jwt()->>'sub' = user_id);
