import { useState, useRef } from "react";
import { useUser, useClerk, useAuth } from "@clerk/clerk-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { User, Camera, Users, Key, Check, X, ExternalLink, Loader2, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Badge } from "@/shared/components/ui/badge";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { useToast } from "@/shared/hooks/use-toast";
import { apiRequest, queryClient } from "@/shared/lib/queryClient";
import { useCurrentUser } from "@features/users";
import { ImageCropModal } from "../components/ImageCropModal";
import type { User as DbUser, Group } from "@shared/types";

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

export default function Profile() {
  const { user: clerkUser } = useUser();
  const { openUserProfile } = useClerk();
  const { getToken } = useAuth();
  const { toast } = useToast();
  const { data: currentUserData, isLoading: loadingUser } = useCurrentUser();
  const currentUser = currentUserData?.user;
  
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const groupId = currentUser?.groupId;
  const { data: groupData, isLoading: loadingGroup } = useQuery<{ group: Group; members: DbUser[] }>({
    queryKey: [`/api/groups/${groupId}/members`],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("No auth token available");
      const res = await fetch(`/api/groups/${groupId}/members`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`${res.status}: ${text}`);
      }
      return res.json();
    },
    enabled: !!groupId,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { name: string }) => {
      const token = await getToken();
      if (!token) throw new Error("No auth token available");
      return apiRequest('PATCH', '/api/auth/profile', data, { Authorization: `Bearer ${token}` });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      toast({ title: "Nome atualizado com sucesso" });
      setEditingName(false);
      setNameValue("");
      setSavingName(false);
    },
    onError: () => {
      toast({ title: "Erro ao atualizar nome no banco de dados", variant: "destructive" });
      setSavingName(false);
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

  const handleSaveName = async () => {
    const trimmedName = nameValue.trim();
    if (!trimmedName || !clerkUser || savingName) return;

    // Split name into firstName and lastName for Clerk
    const nameParts = trimmedName.split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    setSavingName(true);
    try {
      // Update Clerk first
      await clerkUser.update({ firstName, lastName });
      // Then update local database
      updateProfileMutation.mutate({ name: trimmedName });
    } catch (error) {
      console.error("Error updating Clerk profile:", error);
      toast({ title: "Erro ao atualizar nome", variant: "destructive" });
      setSavingName(false);
    }
  };

  const handleCancelEditName = () => {
    setEditingName(false);
    setNameValue("");
  };

  const handleOpenClerkProfile = () => {
    openUserProfile();
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast({ title: "Formato inválido", description: "Use JPG, PNG, WebP ou GIF", variant: "destructive" });
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({ title: "Arquivo muito grande", description: "Máximo 10MB", variant: "destructive" });
      return;
    }

    setSelectedImageFile(file);
    setCropModalOpen(true);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCropConfirm = async (croppedFile: File) => {
    if (!clerkUser) return;

    setUploadingPhoto(true);
    try {
      await clerkUser.setProfileImage({ file: croppedFile });
      toast({ title: "Foto atualizada com sucesso" });
      setCropModalOpen(false);
      setSelectedImageFile(null);
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast({ title: "Erro ao atualizar foto", variant: "destructive" });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleCropModalClose = () => {
    setCropModalOpen(false);
    setSelectedImageFile(null);
  };

  if (loadingUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container max-w-3xl mx-auto py-6 px-4">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold">Meu Perfil</h1>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="profile" data-testid="tab-profile">
            <User className="w-4 h-4 mr-2" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="security" data-testid="tab-security">
            <Key className="w-4 h-4 mr-2" />
            Segurança
          </TabsTrigger>
          <TabsTrigger value="group" data-testid="tab-group">
            <Users className="w-4 h-4 mr-2" />
            Equipe
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>Gerencie suas informações de perfil</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center gap-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoChange}
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  data-testid="input-photo"
                />
                <div 
                  className={`relative group cursor-pointer ${uploadingPhoto ? 'pointer-events-none' : ''}`} 
                  onClick={handlePhotoClick}
                >
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={clerkUser?.imageUrl} />
                    <AvatarFallback className="text-2xl">
                      {getInitials(currentUser?.name || clerkUser?.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`absolute inset-0 flex items-center justify-center bg-black/50 rounded-full transition-opacity ${uploadingPhoto ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    {uploadingPhoto ? (
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    ) : (
                      <Camera className="w-6 h-6 text-white" />
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {uploadingPhoto ? "Enviando..." : "Clique para alterar a foto"}
                </p>
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
                        disabled={savingName}
                        data-testid="button-save-name"
                      >
                        {savingName ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={handleCancelEditName}
                        disabled={savingName}
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
                    {(!currentUser?.roles || currentUser.roles.length === 0) && (
                      <span className="text-sm text-muted-foreground">Nenhuma função atribuída</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Segurança</CardTitle>
              <CardDescription>Gerencie suas configurações de segurança</CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="group">
          <Card>
            <CardHeader>
              <CardTitle>Minha Equipe</CardTitle>
              <CardDescription>Veja informações do seu grupo e membros</CardDescription>
            </CardHeader>
            <CardContent>
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
                    <ScrollArea className="h-[300px] rounded-md border">
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ImageCropModal
        open={cropModalOpen}
        onClose={handleCropModalClose}
        imageFile={selectedImageFile}
        onConfirm={handleCropConfirm}
        isUploading={uploadingPhoto}
      />
    </div>
  );
}
