import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/components/ui/tabs";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/shared/components/ui/select";
import { Switch } from "@/shared/components/ui/switch";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import type { Conta, ContaTipo, ContaStatus } from "../../types/conta";
import { getInstitutionColor, institutionColors } from "../../lib/institutionColors";

export interface ContaFormData {
  institution: string;
  accountName: string;
  tipo: ContaTipo;
  competencia: string;
  status: ContaStatus;
}

interface ContaFormDialogProps {
  conta: Conta | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: ContaFormData) => void;
  onDelete?: (contaId: string) => void;
}

const institutions = Object.keys(institutionColors);
const tipoOptions: { value: ContaTipo; label: string }[] = [
  { value: "Automático", label: "Automático" },
  { value: "Manual", label: "Manual" },
  { value: "Manual Cliente", label: "Manual Cliente" },
];
const frequenciaOptions = ["Mensal", "Quinzenal", "Semanal"];

export function ContaFormDialog({
  conta,
  open,
  onOpenChange,
  onSave,
  onDelete,
}: ContaFormDialogProps) {
  const isEditing = conta !== null;

  const [institution, setInstitution] = useState("");
  const [accountName, setAccountName] = useState("");
  const [tipo, setTipo] = useState<ContaTipo>("Manual");
  const [frequencia, setFrequencia] = useState("Mensal");
  const [competencia, setCompetencia] = useState("");
  const [status, setStatus] = useState<ContaStatus>("Ativa");

  useEffect(() => {
    if (open) {
      if (conta) {
        setInstitution(conta.institution);
        setAccountName(conta.accountName);
        setTipo(conta.tipo);
        setCompetencia(conta.competencia);
        setStatus(conta.status);
      } else {
        setInstitution("");
        setAccountName("");
        setTipo("Manual");
        setFrequencia("Mensal");
        setCompetencia("");
        setStatus("Ativa");
      }
    }
  }, [open, conta]);

  const handleSave = () => {
    onSave({ institution, accountName, tipo, competencia, status });
  };

  const color = institution ? getInstitutionColor(institution) : null;
  const initial = institution ? institution.charAt(0).toUpperCase() : "?";

  const title = isEditing ? `${conta.institution} — ${conta.accountName || "Conta"}` : "Nova Conta";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-[#3a3a3a] bg-[#1a1a1a] sm:max-w-[540px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded text-sm font-bold ${
                color
                  ? `${color.bg} ${color.text} border ${color.border}`
                  : "border border-zinc-700 bg-zinc-800 text-zinc-400"
              }`}
            >
              {initial}
            </span>
            <div className="flex items-center gap-2">
              <DialogTitle className="text-base font-semibold">{title}</DialogTitle>
              {isEditing && (
                <Badge
                  variant="outline"
                  className={
                    conta.status === "Ativa"
                      ? "border-emerald-500/20 bg-emerald-950/20 text-xs text-emerald-500"
                      : "border-transparent bg-zinc-800 text-xs text-zinc-500"
                  }
                >
                  {conta.status}
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="dados" className="mt-2">
          <TabsList className="w-full bg-[#2c2c2c]">
            <TabsTrigger value="dados" className="flex-1 text-xs">
              Dados da Conta
            </TabsTrigger>
            <TabsTrigger value="gerente" className="flex-1 text-xs">
              Contato do Gerente
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dados" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Instituicao Financeira</Label>
                <Select value={institution} onValueChange={setInstitution}>
                  <SelectTrigger className="border-[#3a3a3a] bg-[#2c2c2c]">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent className="border-[#3a3a3a] bg-[#1a1a1a]">
                    {institutions.map((inst) => (
                      <SelectItem key={inst} value={inst}>
                        {inst}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Nome da Conta</Label>
                <Input
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="Ex: Conta Principal"
                  className="border-[#3a3a3a] bg-[#2c2c2c]"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Tipo de Acesso</Label>
                <Select value={tipo} onValueChange={(v) => setTipo(v as ContaTipo)}>
                  <SelectTrigger className="border-[#3a3a3a] bg-[#2c2c2c]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-[#3a3a3a] bg-[#1a1a1a]">
                    {tipoOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Frequencia de Coleta</Label>
                <Select value={frequencia} onValueChange={setFrequencia}>
                  <SelectTrigger className="border-[#3a3a3a] bg-[#2c2c2c]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-[#3a3a3a] bg-[#1a1a1a]">
                    {frequenciaOptions.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Canal de Solicitacao</Label>
                <div className="flex gap-2 pt-1">
                  <Badge
                    variant="outline"
                    className="border-[#3a3a3a] bg-[#2c2c2c] text-xs text-muted-foreground"
                  >
                    WhatsApp
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-[#3a3a3a] bg-[#2c2c2c] text-xs text-muted-foreground"
                  >
                    Email
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Competencia Inicial</Label>
                <Input
                  value={competencia}
                  onChange={(e) => setCompetencia(e.target.value)}
                  placeholder="mm/aaaa"
                  className="border-[#3a3a3a] bg-[#2c2c2c]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-md border border-[#3a3a3a] bg-[#2c2c2c] px-4 py-3">
              <div>
                <p className="text-sm font-medium">Status da Conta</p>
                <p className="text-xs text-muted-foreground">
                  {status === "Ativa" ? "Conta ativa" : "Conta desativada"}
                </p>
              </div>
              <Switch
                checked={status === "Ativa"}
                onCheckedChange={(checked) => setStatus(checked ? "Ativa" : "Desativada")}
              />
            </div>
          </TabsContent>

          <TabsContent value="gerente" className="mt-4">
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
              Em breve
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex items-center gap-2 pt-2">
          {isEditing && onDelete && (
            <Button
              variant="ghost"
              className="mr-auto text-red-500 hover:bg-red-950/20 hover:text-red-400"
              onClick={() => onDelete(conta.id)}
            >
              Desativar Conta
            </Button>
          )}
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-[#2eaadc] text-white hover:bg-[#2899c7]">
            {isEditing ? "Salvar Alteracoes" : "Adicionar Conta"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
