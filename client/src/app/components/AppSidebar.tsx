import { useState } from "react";
import { LayoutDashboard, Users, CheckSquare, LogOut, Shield, Check } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useClerk, useUser } from "@clerk/clerk-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
} from "@/shared/components/ui/sidebar";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/shared/components/ui/context-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { useCurrentUser, type UserRole } from "@features/users";

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
    adminOnly: false,
  },
  {
    title: "Clientes",
    url: "/clients",
    icon: Users,
    adminOnly: false,
  },
  {
    title: "Tarefas",
    url: "/tasks",
    icon: CheckSquare,
    adminOnly: false,
  },
];

const ROLE_LABELS: Record<string, string> = {
  administrador: "Admin",
  consultor: "Consultor",
  alocador: "Alocador",
  concierge: "Concierge",
};

const ROLE_COLORS: Record<string, string> = {
  administrador: "bg-red-500/20 text-red-400 border-red-500/30",
  consultor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  alocador: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  concierge: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

export function AppSidebar() {
  const [location] = useLocation();
  const { signOut } = useClerk();
  const { user } = useUser();
  const { data: currentUserData } = useCurrentUser();
  const currentUser = currentUserData?.user;
  const [activeRole, setActiveRole] = useState<UserRole | null>(null);
  const [, navigate] = useLocation();
  
  const hasMultipleRoles = currentUser?.roles && currentUser.roles.length > 1;

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const handleLogout = async () => {
    await signOut();
  };
  
  const handleUserCardClick = () => {
    navigate("/profile");
  };

  const displayedRole = activeRole || (currentUser?.roles?.[0] as UserRole) || null;

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <svg
            width="28"
            height="28"
            viewBox="0 0 60 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="5" y="25" width="8" height="20" rx="2" fill="currentColor" />
            <rect x="18" y="15" width="8" height="30" rx="2" fill="currentColor" />
            <path
              d="M31 15H39V30C39 38 47 38 47 30"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
            />
          </svg>
          <span className="text-lg font-bold tracking-tight">Mastodonte</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="pt-2">
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild data-active={isActive} data-testid={`nav-${item.title.toLowerCase()}`}>
                      <Link href={item.url}>
                        <item.icon className="w-5 h-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-sidebar-border">
        {displayedRole === "administrador" && (
          <Link href="/admin">
            <SidebarMenuButton 
              data-active={location === "/admin"} 
              data-testid="nav-administração"
              className="w-full mb-3"
            >
              <Shield className="w-5 h-5" />
              <span>Administração</span>
            </SidebarMenuButton>
          </Link>
        )}
        
        {hasMultipleRoles ? (
          <ContextMenu>
            <ContextMenuTrigger asChild>
              <div 
                className="flex items-center gap-3 mb-3 p-2 rounded-md hover:bg-sidebar-accent cursor-pointer" 
                data-testid="user-card"
                onClick={handleUserCardClick}
              >
                <Avatar className="w-10 h-10">
                  <AvatarImage src={user?.imageUrl} />
                  <AvatarFallback className="text-sm">
                    {getInitials(user?.fullName || user?.firstName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" data-testid="text-username">
                    {user?.fullName || user?.firstName || user?.emailAddresses[0]?.emailAddress || "Usuário"}
                  </p>
                  {displayedRole && (
                    <Badge 
                      variant="outline" 
                      className={`text-[10px] px-1.5 py-0 h-4 mt-1 ${ROLE_COLORS[displayedRole] || ""}`}
                    >
                      {ROLE_LABELS[displayedRole] || displayedRole}
                    </Badge>
                  )}
                </div>
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent className="w-52">
              <ContextMenuItem disabled className="text-xs text-muted-foreground">
                Trocar visão
              </ContextMenuItem>
              <ContextMenuSeparator />
              {currentUser?.roles?.map((role) => (
                <ContextMenuItem 
                  key={role}
                  onClick={() => setActiveRole(role as UserRole)}
                  className="flex items-center justify-between"
                  data-testid={`context-role-${role}`}
                >
                  <span className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      role === "administrador" ? "bg-red-500" :
                      role === "consultor" ? "bg-blue-500" :
                      role === "alocador" ? "bg-orange-500" : "bg-purple-500"
                    }`} />
                    {ROLE_LABELS[role] || role}
                  </span>
                  {displayedRole === role && <Check className="w-4 h-4" />}
                </ContextMenuItem>
              ))}
              <ContextMenuSeparator />
              <ContextMenuItem 
                onClick={handleLogout}
                className="text-destructive focus:text-destructive"
                data-testid="context-logout"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        ) : (
          <div 
            className="flex items-center gap-3 mb-3 p-2 rounded-md hover:bg-sidebar-accent cursor-pointer" 
            data-testid="user-card"
            onClick={handleUserCardClick}
          >
            <Avatar className="w-10 h-10">
              <AvatarImage src={user?.imageUrl} />
              <AvatarFallback className="text-sm">
                {getInitials(user?.fullName || user?.firstName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" data-testid="text-username">
                {user?.fullName || user?.firstName || user?.emailAddresses[0]?.emailAddress || "Usuário"}
              </p>
              {displayedRole && (
                <Badge 
                  variant="outline" 
                  className={`text-[10px] px-1.5 py-0 h-4 mt-1 ${ROLE_COLORS[displayedRole] || ""}`}
                >
                  {ROLE_LABELS[displayedRole] || displayedRole}
                </Badge>
              )}
            </div>
          </div>
        )}
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleLogout}
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          data-testid="button-logout"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
