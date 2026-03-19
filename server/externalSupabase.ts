import { createClient } from "@supabase/supabase-js";

const url = process.env.EXTERNAL_SUPABASE_URL;
const key = process.env.EXTERNAL_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("[externalSupabase] Missing EXTERNAL_SUPABASE_URL or EXTERNAL_SUPABASE_ANON_KEY");
}

export const externalSupabase = createClient(url || "", key || "");
