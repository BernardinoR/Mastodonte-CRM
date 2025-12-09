import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Users, Building2, ShieldAlert, Loader2 } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useCurrentUser, type UserRole } from "@/hooks/useCurrentUser";

interface Group {
  id: number;
  name: string;
  logoUrl: string | null;
}

interface User {
  id: number;
  clerkId: string;
  email: string;
  name: string | null;
  role: UserRole;
  groupId: number | null;
}

export default function Admin() {
  const { getToken } = useAuth();
  const { toast } = useToast();
  const [newGroupName, setNewGroupName] = useState("");
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);

  const { data: currentUserData, isLoading: userLoading } = useCurrentUser();
  const currentUser = currentUserData?.user;
  const isAdmin = currentUser?.role === "administrador";

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
    mutationFn: async (name: string) => {
      const token = await getToken();
      return apiRequest("POST", "/api/groups", { name }, { Authorization: `Bearer ${token}` });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      setNewGroupName("");
      setGroupDialogOpen(false);
      toast({ title: "Grupo criado com sucesso" });
    },
    onError: () => {
      toast({ title: "Erro ao criar grupo", variant: "destructive" });
    },
  });

  const updateGroupMutation = useMutation({
    mutationFn: async ({ id, name }: { id: number; name: string }) => {
      const token = await getToken();
      return apiRequest("PATCH", `/api/groups/${id}`, { name }, { Authorization: `Bearer ${token}` });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      setEditingGroup(null);
      toast({ title: "Grupo atualizado com sucesso" });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar grupo", variant: "destructive" });
    },
  });

  const deleteGroupMutation = useMutation({
    mutationFn: async (id: number) => {
      const token = await getToken();
      return apiRequest("DELETE", `/api/groups/${id}`, undefined, { Authorization: `Bearer ${token}` });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      toast({ title: "Grupo excluído com sucesso" });
    },
    onError: () => {
      toast({ title: "Erro ao excluir grupo", variant: "destructive" });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, role, groupId }: { id: number; role?: UserRole; groupId?: number | null }) => {
      const token = await getToken();
      return apiRequest("PATCH", `/api/users/${id}`, { role, groupId }, { Authorization: `Bearer ${token}` });
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

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case "administrador": return "bg-red-500/20 text-red-400";
      case "consultor": return "bg-blue-500/20 text-blue-400";
      case "alocador": return "bg-green-500/20 text-green-400";
      case "concierge": return "bg-purple-500/20 text-purple-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Administração</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-muted-foreground" />
              <CardTitle>Grupos</CardTitle>
            </div>
            <Dialog open={groupDialogOpen} onOpenChange={setGroupDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" data-testid="button-add-group">
                  <Plus className="w-4 h-4 mr-1" />
                  Novo Grupo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Novo Grupo</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="group-name">Nome do Grupo</Label>
                    <Input
                      id="group-name"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      placeholder="Ex: Equipe São Paulo"
                      data-testid="input-group-name"
                    />
                  </div>
                  <Button 
                    onClick={() => createGroupMutation.mutate(newGroupName)}
                    disabled={!newGroupName.trim() || createGroupMutation.isPending}
                    className="w-full"
                    data-testid="button-save-group"
                  >
                    {createGroupMutation.isPending ? "Criando..." : "Criar Grupo"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {groupsLoading ? (
              <p className="text-muted-foreground text-sm">Carregando...</p>
            ) : groups.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nenhum grupo criado</p>
            ) : (
              <div className="space-y-2">
                {groups.map((group) => (
                  <div
                    key={group.id}
                    className="flex items-center justify-between p-3 rounded-md bg-muted/50"
                    data-testid={`group-item-${group.id}`}
                  >
                    {editingGroup?.id === group.id ? (
                      <Input
                        value={editingGroup.name}
                        onChange={(e) => setEditingGroup({ ...editingGroup, name: e.target.value })}
                        className="flex-1 mr-2"
                        data-testid="input-edit-group-name"
                      />
                    ) : (
                      <span className="font-medium">{group.name}</span>
                    )}
                    <div className="flex items-center gap-1">
                      {editingGroup?.id === group.id ? (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updateGroupMutation.mutate({ id: group.id, name: editingGroup.name })}
                            disabled={updateGroupMutation.isPending}
                            data-testid="button-confirm-edit"
                          >
                            Salvar
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingGroup(null)}
                            data-testid="button-cancel-edit"
                          >
                            Cancelar
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setEditingGroup(group)}
                            data-testid={`button-edit-group-${group.id}`}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => deleteGroupMutation.mutate(group.id)}
                            disabled={deleteGroupMutation.isPending}
                            data-testid={`button-delete-group-${group.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-muted-foreground" />
              <CardTitle>Usuários</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <p className="text-muted-foreground text-sm">Carregando...</p>
            ) : users.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nenhum usuário cadastrado</p>
            ) : (
              <div className="space-y-3">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="p-3 rounded-md bg-muted/50 space-y-2"
                    data-testid={`user-item-${user.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{user.name || user.email}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={user.role}
                        onValueChange={(value) => updateUserMutation.mutate({ id: user.id, role: value as UserRole })}
                      >
                        <SelectTrigger className="flex-1" data-testid={`select-role-${user.id}`}>
                          <SelectValue placeholder="Role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="administrador">Administrador</SelectItem>
                          <SelectItem value="consultor">Consultor</SelectItem>
                          <SelectItem value="alocador">Alocador</SelectItem>
                          <SelectItem value="concierge">Concierge</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select
                        value={user.groupId?.toString() || "none"}
                        onValueChange={(value) => updateUserMutation.mutate({ 
                          id: user.id, 
                          groupId: value === "none" ? null : parseInt(value) 
                        })}
                      >
                        <SelectTrigger className="flex-1" data-testid={`select-group-${user.id}`}>
                          <SelectValue placeholder="Grupo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Sem grupo</SelectItem>
                          {groups.map((group) => (
                            <SelectItem key={group.id} value={group.id.toString()}>
                              {group.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
