import { useAuth } from '@clerk/clerk-react'
import { useEffect, useState } from 'react'
import { supabase, setSupabaseToken } from '@/shared/lib/supabase'

export function useSupabaseAuth() {
  const { getToken, isSignedIn } = useAuth()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (!isSignedIn) {
      setSupabaseToken(null)
      setIsReady(false)
      return
    }

    let mounted = true

    const syncToken = async () => {
      const token = await getToken({ template: 'supabase' })
      if (mounted) {
        setSupabaseToken(token)
        setIsReady(true)
      }
    }

    syncToken()
    // Clerk tokens expire in 60s, refresh before expiry
    const interval = setInterval(syncToken, 50_000)
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [getToken, isSignedIn])

  return { supabase, isReady }
}
