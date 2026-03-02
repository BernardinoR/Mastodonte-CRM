import { useAuth } from "@clerk/clerk-react";
import { useEffect, useRef, useState } from "react";
import { supabase, setAccessTokenProvider } from "@/shared/lib/supabase";

export function useSupabaseAuth() {
  const { getToken, isSignedIn } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  useEffect(() => {
    if (!isSignedIn) {
      setAccessTokenProvider(null);
      setIsReady(false);
      return;
    }

    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout>;

    // Provide a token getter that Supabase calls on every request.
    // Uses Clerk session tokens (Third-Party Auth) — no JWT template needed.
    setAccessTokenProvider(async () => {
      try {
        const token = await getTokenRef.current();
        if (!token) {
          console.warn(
            "[Supabase Auth] Clerk returned no session token.",
            "\nEnsure Clerk is configured for Supabase:",
            "\n1. Go to https://dashboard.clerk.com/setup/supabase",
            "\n2. Add Third-Party Auth (Clerk) in Supabase Dashboard → Auth → Third-Party",
          );
        }
        return token;
      } catch (err) {
        console.error("[Supabase Auth] Error getting token:", err);
        return null;
      }
    });

    // Actually verify we can obtain a token before marking ready.
    // This prevents downstream consumers (e.g. realtime subscriptions) from
    // connecting as anon when Clerk DNS or session is temporarily unavailable.
    async function validateToken() {
      const MAX_BACKOFF = 30_000;
      let attempt = 0;

      while (!cancelled) {
        try {
          const token = await getTokenRef.current();
          if (token) {
            console.log("[Supabase Auth] Token validated, marking ready");
            if (!cancelled) setIsReady(true);
            return;
          }
        } catch (err) {
          console.warn("[Supabase Auth] Token validation error:", err);
        }

        attempt++;
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), MAX_BACKOFF);
        console.warn(
          `[Supabase Auth] No token available, retrying in ${delay}ms (attempt ${attempt})`,
        );
        await new Promise<void>((resolve) => {
          retryTimer = setTimeout(resolve, delay);
        });
      }
    }

    validateToken();

    return () => {
      cancelled = true;
      clearTimeout(retryTimer);
      setAccessTokenProvider(null);
    };
  }, [isSignedIn]);

  // Periodically refresh the Realtime WebSocket auth token.
  // Clerk tokens expire in ~60s; we refresh every 50s to stay ahead.
  useEffect(() => {
    if (!isReady || !isSignedIn) return;

    let cancelled = false;

    async function refreshRealtimeAuth() {
      try {
        const token = await getTokenRef.current();
        if (token && !cancelled) {
          await supabase.realtime.setAuth(token);
        }
      } catch (err) {
        console.warn("[Supabase Auth] Realtime token refresh error:", err);
      }
    }

    // Send a fresh token immediately and then every 50s
    refreshRealtimeAuth();
    const interval = setInterval(refreshRealtimeAuth, 50_000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isReady, isSignedIn]);

  return { supabase, isReady };
}
