import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { useAuth } from "@clerk/clerk-react";

// Types for team users
export interface TeamUser {
  id: number;
  name: string;
  email: string;
  initials: string;
  isCurrentUser: boolean;
  // For avatar styling - generated based on id
  avatarColor: string;
}

interface UsersContextType {
  teamUsers: TeamUser[];
  currentUser: TeamUser | null;
  isLoading: boolean;
  error: string | null;
  getUserById: (id: number) => TeamUser | undefined;
  getUserByName: (name: string) => TeamUser | undefined;
  refetchTeamUsers: () => Promise<void>;
}

const UsersContext = createContext<UsersContextType | null>(null);

// Generate consistent avatar color based on user id
function getAvatarColor(id: number): string {
  const colors = [
    "bg-slate-600",
    "bg-gray-500",
    "bg-zinc-600",
    "bg-neutral-600",
    "bg-stone-600",
    "bg-slate-500",
    "bg-gray-600",
    "bg-zinc-500",
  ];
  return colors[id % colors.length];
}

export function UsersProvider({ children }: { children: ReactNode }) {
  const { getToken, isSignedIn } = useAuth();
  const [teamUsers, setTeamUsers] = useState<TeamUser[]>([]);
  const [currentUser, setCurrentUser] = useState<TeamUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeamUsers = useCallback(async () => {
    if (!isSignedIn) {
      setTeamUsers([]);
      setCurrentUser(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const token = await getToken();
      const response = await fetch("/api/users/team", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch team users");
      }

      const data = await response.json();

      // Map API response to TeamUser format
      const users: TeamUser[] = data.users.map(
        (user: {
          id: number;
          name: string;
          email: string;
          initials: string;
          isCurrentUser: boolean;
        }) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          initials: user.initials,
          isCurrentUser: user.isCurrentUser,
          avatarColor: getAvatarColor(user.id),
        }),
      );

      setTeamUsers(users);

      // Set current user
      const current = users.find((u) => u.isCurrentUser);
      setCurrentUser(current || null);
    } catch (err) {
      console.error("Error fetching team users:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch team users");
    } finally {
      setIsLoading(false);
    }
  }, [getToken, isSignedIn]);

  // Fetch on mount and when auth changes
  useEffect(() => {
    fetchTeamUsers();
  }, [fetchTeamUsers]);

  const getUserById = useCallback(
    (id: number): TeamUser | undefined => {
      return teamUsers.find((user) => user.id === id);
    },
    [teamUsers],
  );

  const getUserByName = useCallback(
    (name: string): TeamUser | undefined => {
      return teamUsers.find((user) => user.name.toLowerCase() === name.toLowerCase());
    },
    [teamUsers],
  );

  const value: UsersContextType = {
    teamUsers,
    currentUser,
    isLoading,
    error,
    getUserById,
    getUserByName,
    refetchTeamUsers: fetchTeamUsers,
  };

  return <UsersContext.Provider value={value}>{children}</UsersContext.Provider>;
}

export function useUsers(): UsersContextType {
  const context = useContext(UsersContext);
  if (!context) {
    throw new Error("useUsers must be used within a UsersProvider");
  }
  return context;
}
