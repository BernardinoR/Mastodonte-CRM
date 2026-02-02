import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Access token provider - set by useSupabaseAuth hook
let accessTokenFn: (() => Promise<string | null>) | null = null

export function setAccessTokenProvider(fn: (() => Promise<string | null>) | null) {
  accessTokenFn = fn
}

export const supabase: SupabaseClient = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    accessToken: async () => {
      if (accessTokenFn) {
        return await accessTokenFn()
      }
      return null
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
)
