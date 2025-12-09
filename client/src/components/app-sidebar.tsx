import { LayoutDashboard, Users, Calendar, CheckSquare, LogOut, Shield } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useClerk, useUser } from "@clerk/clerk-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/useCurrentUser";

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
    title: "Reuniões",
    url: "/meetings",
    icon: Calendar,
    adminOnly: false,
  },
  {
    title: "Tarefas",
    url: "/tasks",
    icon: CheckSquare,
    adminOnly: false,
  },
  {
    title: "Administração",
    url: "/admin",
    icon: Shield,
    adminOnly: true,
  },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { signOut } = useClerk();
  const { user } = useUser();
  const { data: currentUserData } = useCurrentUser();
  const currentUser = currentUserData?.user;
  const isAdmin = currentUser?.role === "administrador";

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const handleLogout = () => {
    signOut();
  };

  const visibleMenuItems = menuItems.filter(item => !item.adminOnly || isAdmin);

  const getRoleName = (role: string | undefined) => {
    switch (role) {
      case "administrador": return "Administrador";
      case "consultor": return "Consultor";
      case "alocador": return "Alocador";
      case "concierge": return "Concierge";
      default: return "Usuário";
    }
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-6 text-lg font-semibold">
            CRM Mastodonte
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleMenuItems.map((item) => {
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
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={user?.imageUrl} />
            <AvatarFallback className="text-xs">
              {getInitials(user?.fullName || user?.firstName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" data-testid="text-username">
              {user?.fullName || user?.firstName || user?.emailAddresses[0]?.emailAddress || "Usuário"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {getRoleName(currentUser?.role)}
            </p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-start gap-2" 
          onClick={handleLogout}
          data-testid="button-logout"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
