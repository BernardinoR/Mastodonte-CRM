import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Loader2, Info, ShieldAlert, UserCheck, Users, HeartHandshake } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { UserRole } from "@/hooks/useCurrentUser";

interface Group {
  id: number;
  name: string;
  logoUrl: string | null;
}

interface InviteUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface RoleOption {
  value: UserRole;
  label: string;
  description: string;
  icon: typeof ShieldAlert;
  colorClass: string;
  dotColor: string;
}

type OperationalRole = "consultor" | "alocador" | "concierge";

const ADMIN_ROLE = {
  value: "administrador" as const,
  label: "Administrador",
  description: "Acesso total ao sistema, pode gerenciar usuários e grupos.",
  icon: ShieldAlert,
  colorClass: "border-red-500/50 bg-red-500/5",
  dotColor: "bg-red-500",
};

const OPERATIONAL_ROLES: RoleOption[] = [
  {
    value: "consultor",
    label: "Consultor",
    description: "Visualiza e gerencia apenas os clientes atribuídos diretamente a ele.",
    icon: UserCheck,
    colorClass: "border-blue-500/50 bg-blue-500/5",
    dotColor: "bg-blue-500",
  },
  {
    value: "alocador",
    label: "Alocador",
    description: "Acesso em nível de grupo. Pode visualizar todos os clientes do grupo para apoio em alocação.",
    icon: Users,
    colorClass: "border-orange-500/50 bg-orange-500/5",
    dotColor: "bg-orange-500",
  },
  {
    value: "concierge",
    label: "Concierge",
    description: "Acesso em nível de grupo. Foco em atendimento e relacionamento com clientes.",
    icon: HeartHandshake,
    colorClass: "border-purple-500/50 bg-purple-500/5",
    dotColor: "bg-purple-500",
  },
];

export function InviteUserModal({ open, onOpenChange }: InviteUserModalProps) {
  const { getToken } = useAuth();
  const { toast } = useToast();
  
  const [email, setEmail] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedOperationalRole, setSelectedOperationalRole] = useState<OperationalRole>("consultor");
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");

  const { data: groupsData } = useQuery<{ groups: Group[] }>({
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
    enabled: open,
  });

  const groups = groupsData?.groups || [];

  const inviteMutation = useMutation({
    mutationFn: async (data: { email: string; roles: UserRole[]; groupId?: number }) => {
      const token = await getToken();
      return apiRequest("POST", "/api/invitations", data, { Authorization: `Bearer ${token}` });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "Convite enviado com sucesso!" });
      resetForm();
      onOpenChange(false);
    },
    onError: async (error: any) => {
      let errorMessage = "Falha ao enviar convite";
      try {
        if (error?.message) {
          const parsed = JSON.parse(error.message);
          errorMessage = parsed.error || errorMessage;
        }
      } catch {
        // Use default error message
      }
      toast({ title: errorMessage, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setEmail("");
    setIsAdmin(false);
    setSelectedOperationalRole("consultor");
    setSelectedGroupId("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({ title: "Email é obrigatório", variant: "destructive" });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({ title: "Email inválido", variant: "destructive" });
      return;
    }

    const roles: UserRole[] = [selectedOperationalRole];
    if (isAdmin) {
      roles.unshift("administrador");
    }

    const payload: { email: string; roles: UserRole[]; groupId?: number } = {
      email: email.trim(),
      roles,
    };
    
    if (selectedGroupId && selectedGroupId !== "none") {
      const parsedGroupId = parseInt(selectedGroupId, 10);
      if (!isNaN(parsedGroupId)) {
        payload.groupId = parsedGroupId;
      }
    }
    
    inviteMutation.mutate(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">Convidar Novo Usuário</DialogTitle>
          <DialogDescription>
            Envie um convite por email para adicionar um novo usuário ao sistema.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="novousuario@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              data-testid="input-invite-email"
            />
          </div>

          <Separator />

          <div className="space-y-3">
            <Label>Permissões do Usuário</Label>
            
            <button
              type="button"
              onClick={() => setIsAdmin(!isAdmin)}
              className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                isAdmin
                  ? `${ADMIN_ROLE.colorClass} border-opacity-100`
                  : "border-muted bg-muted/30 hover-elevate"
              }`}
              data-testid="checkbox-role-administrador"
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={isAdmin}
                  onCheckedChange={(checked) => setIsAdmin(checked === true)}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${ADMIN_ROLE.dotColor}`} />
                    <span className="font-medium">{ADMIN_ROLE.label}</span>
                    <span className="text-xs text-muted-foreground">(opcional)</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {ADMIN_ROLE.description}
                  </p>
                </div>
              </div>
            </button>
          </div>

          <div className="space-y-3">
            <Label>Tipo de Usuário *</Label>
            <div className="space-y-2">
              {OPERATIONAL_ROLES.map((role) => {
                const isSelected = selectedOperationalRole === role.value;
                
                return (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setSelectedOperationalRole(role.value as OperationalRole)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                      isSelected
                        ? `${role.colorClass} border-opacity-100`
                        : "border-muted bg-muted/30 hover-elevate"
                    }`}
                    data-testid={`radio-role-${role.value}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 mt-0.5 flex items-center justify-center ${
                        isSelected ? `border-current` : "border-muted-foreground"
                      }`}>
                        {isSelected && (
                          <div className={`w-2 h-2 rounded-full ${role.dotColor}`} />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${role.dotColor}`} />
                          <span className="font-medium">{role.label}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {role.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="group">Adicionar a um Grupo (opcional)</Label>
            <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
              <SelectTrigger data-testid="select-invite-group">
                <SelectValue placeholder="Selecionar grupo..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum grupo</SelectItem>
                {groups.map((group) => (
                  <SelectItem key={group.id} value={group.id.toString()}>
                    {group.logoUrl ? (
                      <span className="flex items-center gap-2">
                        <img src={group.logoUrl} alt="" className="w-4 h-4 rounded" />
                        {group.name}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        {group.name}
                      </span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
            <Info className="w-4 h-4 shrink-0" />
            <span>O usuário receberá um email para criar sua conta.</span>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-invite"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={inviteMutation.isPending || !email.trim()}
              data-testid="button-send-invite"
            >
              {inviteMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Mail className="w-4 h-4 mr-2" />
              )}
              Enviar Convite
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
