import { useQuery } from "@tanstack/react-query";
import { useUser } from "@clerk/clerk-react";
import { useCallback } from "react";
import { supabase } from "@/shared/lib/supabase";
import { queryClient } from "@/shared/lib/queryClient";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_REDIRECT_URI = import.meta.env.VITE_GOOGLE_REDIRECT_URI;

interface GoogleCalendarStatus {
  isConnected: boolean;
  isLoading: boolean;
  googleEmail: string | null;
  connect: () => void;
  disconnect: () => Promise<void>;
}

export function useGoogleCalendar(): GoogleCalendarStatus {
  const { user } = useUser();
  const clerkId = user?.id;

  const { data, isLoading } = useQuery({
    queryKey: ["google-calendar-status", clerkId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_tokens")
        .select("email")
        .eq("user_id", clerkId!)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!clerkId,
  });

  const connect = useCallback(() => {
    if (!clerkId) return;

    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: GOOGLE_REDIRECT_URI,
      response_type: "code",
      scope:
        "https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/userinfo.email",
      access_type: "offline",
      prompt: "consent",
      state: clerkId,
    });

    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }, [clerkId]);

  const disconnect = useCallback(async () => {
    if (!clerkId) return;

    const { error } = await supabase.from("user_tokens").delete().eq("user_id", clerkId);

    if (error) throw error;

    queryClient.invalidateQueries({ queryKey: ["google-calendar-status"] });
  }, [clerkId]);

  return {
    isConnected: !!data,
    isLoading,
    googleEmail: data?.email ?? null,
    connect,
    disconnect,
  };
}
