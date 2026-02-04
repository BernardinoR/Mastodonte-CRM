// Feature: Users
// Gerenciamento de usuários, perfil e administração

// Pages
export { default as Admin } from "./pages/Admin";
export { default as Profile } from "./pages/Profile";

// Contexts
export { UsersProvider, useUsers } from "./contexts/UsersContext";
export type { TeamUser } from "./contexts/UsersContext";

// Hooks
export { useCurrentUser, isAdmin, hasRole } from "./hooks/useCurrentUser";
export type { UserRole, CurrentUser } from "./hooks/useCurrentUser";
