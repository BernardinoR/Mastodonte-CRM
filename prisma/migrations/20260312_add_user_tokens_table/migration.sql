-- CreateTable
CREATE TABLE public.user_tokens (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  email TEXT,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: apenas service_role (usado pelo n8n)
ALTER TABLE public.user_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_full_access" ON public.user_tokens
  FOR ALL USING (auth.role() = 'service_role');
