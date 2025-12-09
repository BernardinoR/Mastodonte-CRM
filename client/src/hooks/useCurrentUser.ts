import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";

export type UserRole = "administrador" | "consultor" | "alocador" | "concierge";

export interface CurrentUser {
  id: number;
  clerkId: string;
  email: string;
  name: string | null;
  role: UserRole;
  groupId: number | null;
}

export function useCurrentUser() {
  const { getToken, isSignedIn } = useAuth();

  return useQuery<{ user: CurrentUser }>({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      const token = await getToken();
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch user");
      return res.json();
    },
    enabled: isSignedIn,
  });
}
