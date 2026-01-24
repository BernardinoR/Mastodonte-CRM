import { useState, useMemo, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
} from "@/shared/components/ui/dialog";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/shared/components/ui/collapsible";
import { 
  Plus, 
  Pencil, 
  Users, 
  ShieldAlert, 
  Loader2, 
  Search,
  Lock,
  MoreHorizontal,
  ImagePlus,
  X,
  UserPlus,
  ChevronDown,
  TrendingUp,
  DollarSign,
  BarChart3
} from "lucide-react";
import { queryClient, apiRequest } from "@/shared/lib/queryClient";
import { useToast } from "@/shared/hooks/use-toast";
import { useCurrentUser, isAdmin as checkIsAdmin, type UserRole } from "@features/users";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { InviteUserModal } from "@/components/InviteUserModal";

interface Group {
  id: number;
  name: string;
  description: string | null;
  logoUrl: string | null;
  isActive: boolean;
  createdAt: string;
}

interface User {
  id: number;
  clerkId: string;
  email: string;
  name: string | null;
  roles: UserRole[];
  groupId: number | null;
  isActive: boolean;
}

const ROLE_LABELS: Record<UserRole, string> = {
  administrador: "Admin",
  consultor: "Consultor",
  alocador: "Alocador",
  concierge: "Concierge",
};

const ROLE_COLORS: Record<UserRole, string> = {
  administrador: "bg-red-500/20 text-red-400 border-red-500/30",
  consultor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  alocador: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  concierge: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

const ALL_ROLES: UserRole[] = ["administrador", "consultor", "alocador", "concierge"];

export default function Admin() {
  const { getToken } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("groups");
  const [groupSearch, setGroupSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<string>("all");
  const [userGroupFilter, setUserGroupFilter] = useState<string>("all");
  
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [editGroupOpen, setEditGroupOpen] = useState(false);
  const [manageGroupMembersOpen, setManageGroupMembersOpen] = useState(false);
  const [inviteUserOpen, setInviteUserOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());
  
  const toggleGroupExpanded = (groupId: number) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [newGroupLogoUrl, setNewGroupLogoUrl] = useState("");
  const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>([]);
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 500 * 1024; // 500KB
  const handleLogoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "Arquivo muito grande",
        description: "O tamanho máximo permitido é 500KB",
        variant: "destructive",
      });
      return;
    }
    
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Tipo de arquivo inválido",
        description: "Por favor, selecione uma imagem",
        variant: "destructive",
      });
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setNewGroupLogoUrl(base64);
    };
    reader.readAsDataURL(file);
    
    // Reset input so same file can be selected again
    event.target.value = "";
  };

  const { data: currentUserData, isLoading: userLoading } = useCurrentUser();
  const currentUser = currentUserData?.user;
  const isAdmin = checkIsAdmin(currentUser);

  const { data: groupsData, isLoading: groupsLoading } = useQuery<{ groups: Group[] }>({
    queryKey: ["/api/groups"],
    queryFn: async () => {
      const token = await getToken();
      const res = await fetch("/api/groups", {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch groups");
      return res.json();
    },
    enabled: isAdmin,
  });

  const { data: usersData, isLoading: usersLoading } = useQuery<{ users: User[] }>({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const token = await getToken();
      const res = await fetch("/api/users", {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },
    enabled: isAdmin,
  });

  const createGroupMutation = useMutation({
    mutationFn: async (data: { name: string; description?: string; logoUrl?: string }) => {
      const token = await getToken();
      return apiRequest("POST", "/api/groups", data, { Authorization: `Bearer ${token}` });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      resetCreateGroupForm();
      setCreateGroupOpen(false);
      toast({ title: "Grupo criado com sucesso" });
    },
    onError: () => {
      toast({ title: "Erro ao criar grupo", variant: "destructive" });
    },
  });

  const updateGroupMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: number; name?: string; description?: string; logoUrl?: string }) => {
      const token = await getToken();
      return apiRequest("PATCH", `/api/groups/${id}`, data, { Authorization: `Bearer ${token}` });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      setEditGroupOpen(false);
      setSelectedGroup(null);
      toast({ title: "Grupo atualizado com sucesso" });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar grupo", variant: "destructive" });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, roles, groupId }: { id: number; roles?: UserRole[]; groupId?: number | null }) => {
      const token = await getToken();
      const body: { roles?: UserRole[]; groupId?: number | null } = {};
      if (roles !== undefined) body.roles = roles;
      if (groupId !== undefined) body.groupId = groupId;
      return apiRequest("PATCH", `/api/users/${id}`, body, { Authorization: `Bearer ${token}` });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "Usuário atualizado com sucesso" });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar usuário", variant: "destructive" });
    },
  });

  const groups = groupsData?.groups || [];
  const users = usersData?.users || [];

  const filteredGroups = useMemo(() => {
    return groups.filter(group => 
      group.name.toLowerCase().includes(groupSearch.toLowerCase()) ||
      group.description?.toLowerCase().includes(groupSearch.toLowerCase())
    );
  }, [groups, groupSearch]);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
        user.email.toLowerCase().includes(userSearch.toLowerCase());
      
      const matchesRole = userRoleFilter === "all" || user.roles.includes(userRoleFilter as UserRole);
      const matchesGroup = userGroupFilter === "all" || 
        (userGroupFilter === "none" && !user.groupId) ||
        user.groupId?.toString() === userGroupFilter;
      
      return matchesSearch && matchesRole && matchesGroup;
    });
  }, [users, userSearch, userRoleFilter, userGroupFilter]);

  const getGroupMembers = (groupId: number) => {
    return users.filter(user => user.groupId === groupId);
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const resetCreateGroupForm = () => {
    setNewGroupName("");
    setNewGroupDescription("");
    setNewGroupLogoUrl("");
    setSelectedMemberIds([]);
    setMemberSearchQuery("");
  };

  const handleCreateGroup = async () => {
    const response = await createGroupMutation.mutateAsync({
      name: newGroupName,
      description: newGroupDescription || undefined,
      logoUrl: newGroupLogoUrl || undefined,
    });
    
    const data = await response.json() as { group: Group };
    const createdGroup = data?.group;
    
    if (selectedMemberIds.length > 0 && createdGroup?.id) {
      for (const userId of selectedMemberIds) {
        await updateUserMutation.mutateAsync({ id: userId, groupId: createdGroup.id });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    }
  };

  const handleEditGroup = (group: Group) => {
    setSelectedGroup(group);
    setNewGroupName(group.name);
    setNewGroupDescription(group.description || "");
    setNewGroupLogoUrl(group.logoUrl || "");
    setEditGroupOpen(true);
  };

  const handleManageMembers = (group: Group) => {
    setSelectedGroup(group);
    setSelectedMemberIds(getGroupMembers(group.id).map(u => u.id));
    setMemberSearchQuery("");
    setManageGroupMembersOpen(true);
  };

  const handleSaveMembers = async () => {
    if (!selectedGroup) return;
    
    const currentMembers = getGroupMembers(selectedGroup.id);
    const currentMemberIds = currentMembers.map(u => u.id);
    
    const toAdd = selectedMemberIds.filter(id => !currentMemberIds.includes(id));
    const toRemove = currentMemberIds.filter(id => !selectedMemberIds.includes(id));
    
    for (const userId of toAdd) {
      await updateUserMutation.mutateAsync({ id: userId, groupId: selectedGroup.id });
    }
    
    for (const userId of toRemove) {
      await updateUserMutation.mutateAsync({ id: userId, groupId: null });
    }
    
    setManageGroupMembersOpen(false);
    setSelectedGroup(null);
    queryClient.invalidateQueries({ queryKey: ["/api/users"] });
  };

  const toggleRole = (user: User, role: UserRole) => {
    const newRoles = user.roles.includes(role)
      ? user.roles.filter(r => r !== role)
      : [...user.roles, role];
    
    if (newRoles.length === 0) {
      toast({ title: "Usuário deve ter pelo menos uma role", variant: "destructive" });
      return;
    }
    
    updateUserMutation.mutate({ id: user.id, roles: newRoles });
  };

  const searchableUsers = useMemo(() => {
    return users.filter(user =>
      user.name?.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(memberSearchQuery.toLowerCase())
    );
  }, [users, memberSearchQuery]);

  if (userLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <ShieldAlert className="w-16 h-16 text-destructive mb-4" />
        <h1 className="text-2xl font-semibold text-gray-300 mb-2">Acesso Restrito</h1>
        <p className="text-gray-500 max-w-md">
          Você não tem permissão para acessar esta página. Apenas administradores podem gerenciar usuários e grupos.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleLogoFileChange}
        className="hidden"
        data-testid="input-group-logo-file"
      />
      <h1 className="text-2xl font-semibold">Administração</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="groups" className="gap-2" data-testid="tab-groups">
            <Users className="w-4 h-4" />
            Grupos de Trabalho
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2" data-testid="tab-users">
            <Users className="w-4 h-4" />
            Usuários
          </TabsTrigger>
          <TabsTrigger value="permissions" className="gap-2" data-testid="tab-permissions">
            <Lock className="w-4 h-4" />
            Permissões
          </TabsTrigger>
        </TabsList>

        <TabsContent value="groups" className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar grupo..."
                value={groupSearch}
                onChange={(e) => setGroupSearch(e.target.value)}
                className="pl-10"
                data-testid="input-search-groups"
              />
            </div>
            <Button onClick={() => setCreateGroupOpen(true)} data-testid="button-new-group">
              <Plus className="w-4 h-4 mr-2" />
              Novo Grupo
            </Button>
          </div>

          {groupsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredGroups.length === 0 ? (
            <Card className="p-8 text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {groups.length === 0 ? "Nenhum grupo criado ainda" : "Nenhum grupo encontrado"}
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredGroups.map((group) => {
                const members = getGroupMembers(group.id);
                const isExpanded = expandedGroups.has(group.id);
                const mockClients = 10 + (group.id * 7) % 50;
                const mockAUM = (20 + (group.id * 13) % 180).toFixed(1);
                const mockGrowth = (-5 + (group.id * 17) % 20);
                
                return (
                  <Collapsible 
                    key={group.id} 
                    open={isExpanded} 
                    onOpenChange={() => toggleGroupExpanded(group.id)}
                  >
                    <Card className="overflow-visible" data-testid={`group-card-${group.id}`}>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center text-2xl shrink-0">
                            {group.logoUrl ? (
                              <img src={group.logoUrl} alt={group.name} className="w-full h-full object-cover rounded-lg" />
                            ) : (
                              <Users className="w-8 h-8 text-muted-foreground" />
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h3 className="text-lg font-semibold uppercase tracking-wide">{group.name}</h3>
                                {group.description && (
                                  <p className="text-sm text-muted-foreground mt-1">{group.description}</p>
                                )}
                                <p className="text-xs text-muted-foreground mt-1">
                                  Criado em {format(new Date(group.createdAt), "d MMM yyyy", { locale: ptBR })}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={group.isActive ? "default" : "secondary"} className="shrink-0">
                                  {group.isActive ? "Ativo" : "Inativo"}
                                </Badge>
                                <CollapsibleTrigger asChild>
                                  <Button variant="ghost" size="icon" className="shrink-0">
                                    <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                  </Button>
                                </CollapsibleTrigger>
                              </div>
                            </div>

                            {!isExpanded && (
                              <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Users className="w-4 h-4" />
                                  {members.length} membros
                                </span>
                                <span className="flex items-center gap-1">
                                  <BarChart3 className="w-4 h-4" />
                                  {mockClients} Clientes
                                </span>
                                <span className="flex items-center gap-1">
                                  <DollarSign className="w-4 h-4" />
                                  R$ {mockAUM}M AUM
                                </span>
                              </div>
                            )}

                            <CollapsibleContent>
                              {members.length > 0 && (
                                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                                  <p className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-1 uppercase tracking-wide">
                                    <Users className="w-3 h-3" />
                                    MEMBROS
                                  </p>
                                  <div className="border rounded-md overflow-hidden">
                                    <table className="w-full text-sm">
                                      <tbody>
                                        {members.map((member, idx) => (
                                          <tr key={member.id} className={idx !== members.length - 1 ? "border-b" : ""}>
                                            <td className="p-2">
                                              <div className="flex items-center gap-2">
                                                <Avatar className="w-7 h-7">
                                                  <AvatarFallback className="text-xs">
                                                    {getInitials(member.name)}
                                                  </AvatarFallback>
                                                </Avatar>
                                              </div>
                                            </td>
                                            <td className="p-2 flex-1">
                                              <span className="truncate">{member.name || member.email}</span>
                                            </td>
                                            <td className="p-2 text-right">
                                              <div className="flex gap-1 justify-end">
                                                {member.roles.map((role) => (
                                                  <Badge 
                                                    key={role} 
                                                    variant="outline" 
                                                    className={`text-[10px] px-1.5 py-0 h-5 ${ROLE_COLORS[role]}`}
                                                  >
                                                    {ROLE_LABELS[role]}
                                                  </Badge>
                                                ))}
                                              </div>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              )}

                              <div className="mt-4 p-3 bg-muted/30 rounded-lg flex items-center gap-6 text-sm">
                                <div className="flex items-center gap-2">
                                  <BarChart3 className="w-4 h-4 text-muted-foreground" />
                                  <span className="font-medium">{mockClients}</span>
                                  <span className="text-muted-foreground">Clientes</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                                  <span className="font-medium">R$ {mockAUM}M</span>
                                  <span className="text-muted-foreground">AUM</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <TrendingUp className={`w-4 h-4 ${Number(mockGrowth) >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                                  <span className={`font-medium ${Number(mockGrowth) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {Number(mockGrowth) >= 0 ? '+' : ''}{mockGrowth}%
                                  </span>
                                  <span className="text-muted-foreground">mês</span>
                                </div>
                              </div>
                            </CollapsibleContent>

                            <div className="flex items-center gap-2 mt-4">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleEditGroup(group)}
                                data-testid={`button-edit-group-${group.id}`}
                              >
                                <Pencil className="w-4 h-4 mr-1" />
                                Editar
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleManageMembers(group)}
                                data-testid={`button-manage-members-${group.id}`}
                              >
                                <Users className="w-4 h-4 mr-1" />
                                Gerenciar Membros
                              </Button>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Collapsible>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuário..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="pl-10"
                data-testid="input-search-users"
              />
            </div>
            <select
              value={userRoleFilter}
              onChange={(e) => setUserRoleFilter(e.target.value)}
              className="h-9 px-3 rounded-md border border-input bg-background text-sm"
              data-testid="select-filter-role"
            >
              <option value="all">Todos os tipos</option>
              {ALL_ROLES.map(role => (
                <option key={role} value={role}>{ROLE_LABELS[role]}</option>
              ))}
            </select>
            <select
              value={userGroupFilter}
              onChange={(e) => setUserGroupFilter(e.target.value)}
              className="h-9 px-3 rounded-md border border-input bg-background text-sm"
              data-testid="select-filter-group"
            >
              <option value="all">Todos os grupos</option>
              <option value="none">Sem grupo</option>
              {groups.map(group => (
                <option key={group.id} value={group.id.toString()}>{group.name}</option>
              ))}
            </select>
            <Button variant="outline" onClick={() => setInviteUserOpen(true)} data-testid="button-invite-user">
              <UserPlus className="w-4 h-4 mr-2" />
              Convidar
            </Button>
          </div>

          {usersLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-medium text-muted-foreground text-sm">USUÁRIO</th>
                      <th className="text-left p-4 font-medium text-muted-foreground text-sm">ROLES</th>
                      <th className="text-left p-4 font-medium text-muted-foreground text-sm">GRUPO</th>
                      <th className="text-left p-4 font-medium text-muted-foreground text-sm">STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => {
                      const userGroup = groups.find(g => g.id === user.groupId);
                      return (
                        <tr key={user.id} className="border-b last:border-0" data-testid={`user-row-${user.id}`}>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-9 h-9">
                                <AvatarFallback className="text-xs">
                                  {getInitials(user.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{user.name || "Sem nome"}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-wrap gap-1">
                              {ALL_ROLES.map((role) => (
                                <Badge
                                  key={role}
                                  variant="outline"
                                  className={`cursor-pointer transition-opacity ${
                                    user.roles.includes(role) 
                                      ? ROLE_COLORS[role] 
                                      : "opacity-30 hover:opacity-60"
                                  }`}
                                  onClick={() => toggleRole(user, role)}
                                  data-testid={`badge-role-${user.id}-${role}`}
                                >
                                  {ROLE_LABELS[role]}
                                </Badge>
                              ))}
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="text-sm">
                              {userGroup?.name || "—"}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className={`w-2 h-2 rounded-full ${user.isActive ? "bg-green-500" : "bg-gray-400"}`} />
                          </td>
                        </tr>
                      );
                    })}
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-muted-foreground">
                          Nenhum usuário encontrado
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card className="p-12 text-center">
            <Lock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Gestão de Permissões</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Configure permissões detalhadas por role. Em breve você poderá definir o que cada tipo de usuário pode acessar e modificar no sistema.
            </p>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={createGroupOpen} onOpenChange={setCreateGroupOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Criar Novo Grupo de Trabalho</DialogTitle>
            <DialogDescription>
              Defina as informações do grupo e adicione membros.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div 
              className="w-24 h-24 mx-auto rounded-lg bg-muted flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors relative group"
              onClick={() => fileInputRef.current?.click()}
              data-testid="button-upload-logo"
            >
              {newGroupLogoUrl ? (
                <>
                  <img src={newGroupLogoUrl} alt="Logo" className="w-full h-full object-cover rounded-lg" />
                  <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <ImagePlus className="w-6 h-6 text-white" />
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <ImagePlus className="w-8 h-8 mx-auto text-muted-foreground" />
                  <span className="text-xs text-muted-foreground mt-1 block">Adicionar</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="group-name">Nome de Guerra *</Label>
              <Input
                id="group-name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Guerreiros do Legado"
                data-testid="input-group-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="group-description">Descrição</Label>
              <Textarea
                id="group-description"
                value={newGroupDescription}
                onChange={(e) => setNewGroupDescription(e.target.value)}
                placeholder="Equipe especializada em..."
                rows={3}
                data-testid="input-group-description"
              />
            </div>

            <div className="border-t pt-4">
              <Label className="mb-2 block">Adicionar Membros</Label>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar usuário por nome ou email..."
                  value={memberSearchQuery}
                  onChange={(e) => setMemberSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-members"
                />
              </div>

              <div className="max-h-40 overflow-y-auto space-y-1 border rounded-md p-2">
                {searchableUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer"
                    onClick={() => {
                      if (selectedMemberIds.includes(user.id)) {
                        setSelectedMemberIds(ids => ids.filter(id => id !== user.id));
                      } else {
                        setSelectedMemberIds(ids => [...ids, user.id]);
                      }
                    }}
                    data-testid={`member-option-${user.id}`}
                  >
                    <Checkbox checked={selectedMemberIds.includes(user.id)} />
                    <Avatar className="w-7 h-7">
                      <AvatarFallback className="text-xs">{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{user.name || user.email}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <div className="flex gap-1">
                      {user.roles.map(role => (
                        <Badge key={role} variant="outline" className={`text-[10px] ${ROLE_COLORS[role]}`}>
                          {ROLE_LABELS[role]}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {selectedMemberIds.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-muted-foreground mb-2">Membros selecionados ({selectedMemberIds.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedMemberIds.map(id => {
                      const user = users.find(u => u.id === id);
                      if (!user) return null;
                      return (
                        <Badge key={id} variant="secondary" className="gap-1 pr-1">
                          {user.name || user.email}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedMemberIds(ids => ids.filter(i => i !== id));
                            }}
                            className="ml-1 hover:bg-background/50 rounded"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => { resetCreateGroupForm(); setCreateGroupOpen(false); }}>
                Cancelar
              </Button>
              <Button
                onClick={handleCreateGroup}
                disabled={!newGroupName.trim() || createGroupMutation.isPending}
                data-testid="button-save-group"
              >
                {createGroupMutation.isPending ? "Criando..." : "Criar Grupo"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={editGroupOpen} onOpenChange={setEditGroupOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Grupo</DialogTitle>
            <DialogDescription>
              Atualize as informações do grupo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div 
              className="w-24 h-24 mx-auto rounded-lg bg-muted flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors relative group"
              onClick={() => fileInputRef.current?.click()}
              data-testid="button-edit-upload-logo"
            >
              {newGroupLogoUrl ? (
                <>
                  <img src={newGroupLogoUrl} alt="Logo" className="w-full h-full object-cover rounded-lg" />
                  <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <ImagePlus className="w-6 h-6 text-white" />
                  </div>
                </>
              ) : (
                <ImagePlus className="w-8 h-8 text-muted-foreground" />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-group-name">Nome de Guerra</Label>
              <Input
                id="edit-group-name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                data-testid="input-edit-group-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-group-description">Descrição</Label>
              <Textarea
                id="edit-group-description"
                value={newGroupDescription}
                onChange={(e) => setNewGroupDescription(e.target.value)}
                rows={3}
                data-testid="input-edit-group-description"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setEditGroupOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  if (selectedGroup) {
                    updateGroupMutation.mutate({
                      id: selectedGroup.id,
                      name: newGroupName,
                      description: newGroupDescription || undefined,
                      logoUrl: newGroupLogoUrl || undefined,
                    });
                  }
                }}
                disabled={!newGroupName.trim() || updateGroupMutation.isPending}
                data-testid="button-update-group"
              >
                {updateGroupMutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={manageGroupMembersOpen} onOpenChange={setManageGroupMembersOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Gerenciar Membros - {selectedGroup?.name}</DialogTitle>
            <DialogDescription>
              Adicione ou remova membros deste grupo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuário..."
                value={memberSearchQuery}
                onChange={(e) => setMemberSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1 border rounded-md p-2">
              {searchableUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer"
                  onClick={() => {
                    if (selectedMemberIds.includes(user.id)) {
                      setSelectedMemberIds(ids => ids.filter(id => id !== user.id));
                    } else {
                      setSelectedMemberIds(ids => [...ids, user.id]);
                    }
                  }}
                >
                  <Checkbox checked={selectedMemberIds.includes(user.id)} />
                  <Avatar className="w-7 h-7">
                    <AvatarFallback className="text-xs">{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.name || user.email}</p>
                  </div>
                  <div className="flex gap-1">
                    {user.roles.map(role => (
                      <Badge key={role} variant="outline" className={`text-[10px] ${ROLE_COLORS[role]}`}>
                        {ROLE_LABELS[role]}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setManageGroupMembersOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveMembers} disabled={updateUserMutation.isPending}>
                {updateUserMutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <InviteUserModal open={inviteUserOpen} onOpenChange={setInviteUserOpen} />
    </div>
  );
}
