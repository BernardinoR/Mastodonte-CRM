import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Separator } from "@/shared/components/ui/separator";
import { Mail, Loader2, Info, ShieldAlert, UserCheck, Users, HeartHandshake } from "lucide-react";
import { apiRequest, queryClient } from "@/shared/lib/queryClient";
import { supabase } from "@/shared/lib/supabase";
import { useToast } from "@/shared/hooks/use-toast";
import type { UserRole } from "@features/users";

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
    description:
      "Acesso em nível de grupo. Pode visualizar todos os clientes do grupo para apoio em alocação.",
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
  const [selectedOperationalRole, setSelectedOperationalRole] =
    useState<OperationalRole>("consultor");
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");

  const { data: groupsData } = useQuery<{ groups: Group[] }>({
    queryKey: ["groups"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("groups")
        .select("id, name, logo_url")
        .order("name");
      if (error) throw error;
      return {
        groups: (data || []).map((r: Record<string, unknown>) => ({
          id: r.id as number,
          name: r.name as string,
          logoUrl: r.logo_url as string | null,
        })),
      };
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
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({ title: "Convite enviado com sucesso!" });
      resetForm();
      onOpenChange(false);
    },
    onError: async (error: Error) => {
      let errorMessage = "Falha ao enviar convite";
      try {
        if (error?.message) {
          const parsed = JSON.parse(error.message);
          errorMessage = parsed.error || errorMessage;
        }
      } catch {
        errorMessage = error.message || errorMessage;
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

            <div
              onClick={() => setIsAdmin(!isAdmin)}
              className={`w-full cursor-pointer rounded-lg border-2 p-4 text-left transition-all ${
                isAdmin
                  ? `${ADMIN_ROLE.colorClass} border-opacity-100`
                  : "hover-elevate border-muted bg-muted/30"
              }`}
              data-testid="checkbox-role-administrador"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 flex h-4 w-4 items-center justify-center rounded border-2 ${
                    isAdmin ? "border-red-500 bg-red-500" : "border-muted-foreground"
                  }`}
                >
                  {isAdmin && (
                    <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2 6L5 9L10 3"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${ADMIN_ROLE.dotColor}`} />
                    <span className="font-medium">{ADMIN_ROLE.label}</span>
                    <span className="text-xs text-muted-foreground">(opcional)</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{ADMIN_ROLE.description}</p>
                </div>
              </div>
            </div>
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
                    className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                      isSelected
                        ? `${role.colorClass} border-opacity-100`
                        : "hover-elevate border-muted bg-muted/30"
                    }`}
                    data-testid={`radio-role-${role.value}`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                          isSelected ? `border-current` : "border-muted-foreground"
                        }`}
                      >
                        {isSelected && <div className={`h-2 w-2 rounded-full ${role.dotColor}`} />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${role.dotColor}`} />
                          <span className="font-medium">{role.label}</span>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{role.description}</p>
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
                        <img src={group.logoUrl} alt="" className="h-4 w-4 rounded" />
                        {group.name}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {group.name}
                      </span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
            <Info className="h-4 w-4 shrink-0" />
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
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Mail className="mr-2 h-4 w-4" />
              )}
              Enviar Convite
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
