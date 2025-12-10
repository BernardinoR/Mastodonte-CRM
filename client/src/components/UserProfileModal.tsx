import { useState, useRef } from "react";
import { useUser, useClerk } from "@clerk/clerk-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { User, Camera, Users, Key, Check, X, ExternalLink, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { User as DbUser, Group } from "@shared/schema";

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

interface UserProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUser: DbUser | null | undefined;
}

export function UserProfileModal({ open, onOpenChange, currentUser }: UserProfileModalProps) {
  const { user: clerkUser } = useUser();
  const { openUserProfile } = useClerk();
  const { toast } = useToast();
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const groupId = currentUser?.groupId;
  const { data: groupData, isLoading: loadingGroup } = useQuery<{ group: Group; members: DbUser[] }>({
    queryKey: [`/api/groups/${groupId}/members`],
    enabled: open && !!groupId,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { name: string }) => {
      return apiRequest('PATCH', '/api/auth/profile', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      toast({ title: "Nome atualizado com sucesso" });
      setEditingName(false);
    },
    onError: () => {
      toast({ title: "Erro ao atualizar nome", variant: "destructive" });
    },
  });

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const handleStartEditName = () => {
    setNameValue(currentUser?.name || clerkUser?.fullName || "");
    setEditingName(true);
  };

  const handleSaveName = () => {
    if (nameValue.trim()) {
      updateProfileMutation.mutate({ name: nameValue.trim() });
    }
  };

  const handleCancelEditName = () => {
    setEditingName(false);
    setNameValue("");
  };

  const handleOpenClerkProfile = () => {
    openUserProfile();
    onOpenChange(false);
  };

  const handlePhotoClick = () => {
    openUserProfile();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Meu Perfil</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="text-xs" data-testid="tab-profile">
              <User className="w-4 h-4 mr-1" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="security" className="text-xs" data-testid="tab-security">
              <Key className="w-4 h-4 mr-1" />
              Segurança
            </TabsTrigger>
            <TabsTrigger value="group" className="text-xs" data-testid="tab-group">
              <Users className="w-4 h-4 mr-1" />
              Equipe
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-4 space-y-6">
            <div className="flex flex-col items-center gap-4">
              <div className="relative group cursor-pointer" onClick={handlePhotoClick}>
                <Avatar className="w-24 h-24">
                  <AvatarImage src={clerkUser?.imageUrl} />
                  <AvatarFallback className="text-2xl">
                    {getInitials(currentUser?.name || clerkUser?.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Clique para alterar a foto</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                {editingName ? (
                  <div className="flex gap-2">
                    <Input
                      value={nameValue}
                      onChange={(e) => setNameValue(e.target.value)}
                      placeholder="Seu nome"
                      data-testid="input-name"
                    />
                    <Button
                      size="icon"
                      onClick={handleSaveName}
                      disabled={updateProfileMutation.isPending}
                      data-testid="button-save-name"
                    >
                      {updateProfileMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={handleCancelEditName}
                      data-testid="button-cancel-name"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-sm" data-testid="text-current-name">
                      {currentUser?.name || clerkUser?.fullName || "Não informado"}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleStartEditName}
                      data-testid="button-edit-name"
                    >
                      Editar
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <p className="text-sm text-muted-foreground" data-testid="text-email">
                  {clerkUser?.emailAddresses[0]?.emailAddress || currentUser?.email || "Não informado"}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Funções</Label>
                <div className="flex flex-wrap gap-2">
                  {currentUser?.roles?.map((role) => (
                    <Badge
                      key={role}
                      variant="outline"
                      className={ROLE_COLORS[role] || ""}
                    >
                      {ROLE_LABELS[role] || role}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="security" className="mt-4 space-y-4">
            <div className="rounded-lg border p-4 space-y-4">
              <div className="flex items-start gap-3">
                <Key className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium">Alterar Senha</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    As configurações de senha e segurança são gerenciadas através do seu perfil de autenticação.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleOpenClerkProfile}
                className="w-full"
                data-testid="button-manage-security"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Gerenciar Segurança
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="group" className="mt-4 space-y-4">
            {!currentUser?.groupId ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  Você ainda não está em nenhum grupo.
                </p>
              </div>
            ) : loadingGroup ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : groupData ? (
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    {groupData.group.logoUrl ? (
                      <img
                        src={groupData.group.logoUrl}
                        alt={groupData.group.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                        <Users className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-medium" data-testid="text-group-name">
                        {groupData.group.name}
                      </h4>
                      {groupData.group.description && (
                        <p className="text-xs text-muted-foreground">
                          {groupData.group.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">
                    Membros ({groupData.members.length})
                  </Label>
                  <ScrollArea className="h-[200px] rounded-md border">
                    <div className="p-2 space-y-1">
                      {groupData.members.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50"
                          data-testid={`member-${member.id}`}
                        >
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-xs">
                              {getInitials(member.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {member.name || member.email}
                              {member.id === currentUser?.id && (
                                <span className="text-muted-foreground ml-1">(você)</span>
                              )}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-0.5">
                              {member.roles?.map((role) => (
                                <Badge
                                  key={role}
                                  variant="outline"
                                  className={`text-[9px] px-1 py-0 h-4 ${ROLE_COLORS[role] || ""}`}
                                >
                                  {ROLE_LABELS[role] || role}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            ) : null}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
