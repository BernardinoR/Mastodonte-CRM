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

    setIsReady(true);

    return () => {
      setAccessTokenProvider(null);
    };
  }, [isSignedIn]);

  return { supabase, isReady };
}
