import { createClient } from "@supabase/supabase-js";

export const externalSupabase = createClient(
  process.env.EXTERNAL_SUPABASE_URL!,
  process.env.EXTERNAL_SUPABASE_ANON_KEY!,
);
