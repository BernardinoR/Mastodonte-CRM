import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Token holder - updated by useSupabaseAuth hook
let currentToken: string | null = null

export function setSupabaseToken(token: string | null) {
  currentToken = token
}

export const supabase: SupabaseClient = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    global: {
      fetch: async (input, init) => {
        const headers = new Headers(init?.headers || {})
        if (currentToken) {
          headers.set('Authorization', `Bearer ${currentToken}`)
        }
        return fetch(input, { ...init, headers })
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
)
