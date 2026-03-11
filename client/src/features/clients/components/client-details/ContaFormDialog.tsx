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
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { Info, ChevronsUpDown } from "lucide-react";
import type { Conta, ContaTipo, ContaStatus } from "../../types/conta";
import { getInstitutionColor, institutionColors } from "../../lib/institutionColors";

export interface ContaFormData {
  institution: string;
  accountName: string;
  numeroConta: string;
  tipo: ContaTipo;
  competencia: string;
  competenciaDesativacao: string;
  status: ContaStatus;
}

function formatCompetencia(value: string): string {
  let v = value.replace(/\D/g, "");
  if (v.length >= 3) v = v.slice(0, 2) + "/" + v.slice(2, 6);
  return v;
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
  const [numeroConta, setNumeroConta] = useState("");
  const [tipo, setTipo] = useState<ContaTipo>("Manual");
  const [frequencia, setFrequencia] = useState("Mensal");
  const [competencia, setCompetencia] = useState("");
  const [competenciaDesativacao, setCompetenciaDesativacao] = useState("");
  const [status, setStatus] = useState<ContaStatus>("Ativa");
  const [canais, setCanais] = useState<string[]>(["WhatsApp", "Email"]);

  useEffect(() => {
    if (open) {
      if (conta) {
        setInstitution(conta.institution);
        setAccountName(conta.accountName);
        setNumeroConta(conta.numeroConta || "");
        setTipo(conta.tipo);
        setCompetencia(conta.competencia);
        setCompetenciaDesativacao(conta.competenciaDesativacao || "");
        setStatus(conta.status);
      } else {
        setInstitution("");
        setAccountName("");
        setNumeroConta("");
        setTipo("Manual");
        setFrequencia("Mensal");
        setCompetencia("");
        setCompetenciaDesativacao("");
        setStatus("Ativa");
        setCanais(["WhatsApp", "Email"]);
      }
    }
  }, [open, conta]);

  const handleSave = () => {
    onSave({
      institution,
      accountName,
      numeroConta,
      tipo,
      competencia,
      competenciaDesativacao,
      status,
    });
  };

  const color = institution ? getInstitutionColor(institution) : null;
  const initial = institution ? institution.charAt(0).toUpperCase() : "?";

  const title = isEditing
    ? accountName
      ? `${institution || conta.institution} — ${accountName}`
      : institution || conta.institution
    : institution
      ? `Nova Conta — ${institution}`
      : "Nova Conta";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden border-[#27272a] bg-[#18181b] p-0 sm:max-w-2xl">
        <DialogHeader className="border-b border-[#27272a] px-6 pb-3 pt-4">
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
            <div>
              <DialogTitle className="text-lg font-bold leading-tight text-white">
                {title}
              </DialogTitle>
              <span className="text-xs font-medium text-zinc-500">Extratos consolidados</span>
            </div>
            {isEditing && (
              <Badge className="ml-2 rounded border border-green-800/50 bg-green-900/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-green-400">
                {conta.status}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <Tabs defaultValue="dados">
            <div className="border-b border-[#27272a] bg-[#1f1f22]">
              <TabsList className="flex h-auto w-full justify-start gap-6 rounded-none bg-transparent p-0 px-6">
                <TabsTrigger
                  value="dados"
                  className="rounded-none border-b-2 border-transparent bg-transparent py-3 text-sm font-medium text-zinc-500 shadow-none transition-colors hover:text-white data-[state=active]:border-[#2eaadc] data-[state=active]:bg-transparent data-[state=active]:text-[#2eaadc] data-[state=active]:shadow-none"
                >
                  Dados da Conta
                </TabsTrigger>
                <TabsTrigger
                  value="gerente"
                  className="rounded-none border-b-2 border-transparent bg-transparent py-3 text-sm font-medium text-zinc-500 shadow-none transition-colors hover:text-white data-[state=active]:border-[#2eaadc] data-[state=active]:bg-transparent data-[state=active]:text-[#2eaadc] data-[state=active]:shadow-none"
                >
                  Contato do Gerente
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="dados" className="space-y-6 px-6 pt-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Instituicao Financeira
                  </Label>
                  <Select value={institution} onValueChange={setInstitution}>
                    <SelectTrigger className="border-[#3f3f46] bg-[#27272a]">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent className="border-[#27272a] bg-[#18181b]">
                      {institutions.map((inst) => (
                        <SelectItem key={inst} value={inst}>
                          {inst}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Nome da Conta
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info size={14} className="cursor-help text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          className="max-w-[240px] text-xs font-normal normal-case"
                        >
                          Preencha apenas quando houver duas ou mais contas na mesma instituicao e
                          precisar diferencia-las.
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <Input
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="Opcional"
                    className="border-[#3f3f46] bg-[#27272a]"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Nº da Conta
                  </Label>
                  <Input
                    value={numeroConta}
                    onChange={(e) => setNumeroConta(e.target.value)}
                    placeholder="Ex: 12345-6"
                    className="border-[#3f3f46] bg-[#27272a]"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Tipo de Acesso
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info size={14} className="cursor-help text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          className="max-w-[240px] text-xs font-normal normal-case"
                        >
                          <strong>Automático:</strong> Extratos que conseguimos baixar diretamente.{" "}
                          <strong>Manual:</strong> Extratos que precisamos pedir para o gerente da
                          conta. <strong>Manual Cliente:</strong> Extratos que precisamos pedir para
                          o cliente.
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <Select value={tipo} onValueChange={(v) => setTipo(v as ContaTipo)}>
                    <SelectTrigger className="border-[#3f3f46] bg-[#27272a]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-[#27272a] bg-[#18181b]">
                      {tipoOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Frequencia de Coleta
                  </Label>
                  <Select value={frequencia} onValueChange={setFrequencia}>
                    <SelectTrigger className="border-[#3f3f46] bg-[#27272a]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-[#27272a] bg-[#18181b]">
                      {frequenciaOptions.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Canal de Solicitacao
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="relative flex h-9 w-full items-center rounded-md border border-[#3f3f46] bg-[#27272a] px-3 text-sm"
                      >
                        <span className="flex items-center gap-1.5">
                          {canais.length > 0 ? (
                            canais.map((canal) => (
                              <span
                                key={canal}
                                className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${
                                  canal === "WhatsApp"
                                    ? "border border-green-800/50 bg-green-900/30 text-green-400"
                                    : "border border-blue-800/50 bg-blue-900/30 text-blue-400"
                                }`}
                              >
                                {canal}
                              </span>
                            ))
                          ) : (
                            <span className="text-muted-foreground">Selecione</span>
                          )}
                        </span>
                        <ChevronsUpDown
                          size={14}
                          className="absolute right-3 text-muted-foreground"
                        />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-[200px] border-[#27272a] bg-[#18181b] p-1"
                      align="start"
                    >
                      {["WhatsApp", "Email"].map((canal) => {
                        const selected = canais.includes(canal);
                        return (
                          <button
                            key={canal}
                            type="button"
                            onClick={() =>
                              setCanais((prev) =>
                                prev.includes(canal)
                                  ? prev.filter((c) => c !== canal)
                                  : [...prev, canal],
                              )
                            }
                            className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-[#27272a]"
                          >
                            <span
                              className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${
                                canal === "WhatsApp"
                                  ? "border border-green-800/50 bg-green-900/30 text-green-400"
                                  : "border border-blue-800/50 bg-blue-900/30 text-blue-400"
                              } ${!selected ? "opacity-40" : ""}`}
                            >
                              {canal}
                            </span>
                          </button>
                        );
                      })}
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Competencia Inicial
                  </Label>
                  <Input
                    value={competencia}
                    onChange={(e) => setCompetencia(formatCompetencia(e.target.value))}
                    maxLength={7}
                    placeholder="mm/aaaa"
                    className="border-[#3f3f46] bg-[#27272a]"
                  />
                </div>

                {status === "Desativada" && (
                  <div className="space-y-2">
                    <Label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Competência de Desativação
                    </Label>
                    <Input
                      value={competenciaDesativacao}
                      onChange={(e) => setCompetenciaDesativacao(formatCompetencia(e.target.value))}
                      maxLength={7}
                      placeholder="mm/aaaa"
                      className="border-[#3f3f46] bg-[#27272a]"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between rounded-md border border-[#3f3f46]/50 bg-[#27272a]/50 px-4 py-3">
                <div>
                  <p className="text-sm font-medium">Status da Conta</p>
                  <p className="text-xs text-muted-foreground">
                    {status === "Ativa"
                      ? "Conta ativa"
                      : "Contas desativadas não geram alertas de pendência."}
                  </p>
                </div>
                <Switch
                  checked={status === "Ativa"}
                  onCheckedChange={(checked) => setStatus(checked ? "Ativa" : "Desativada")}
                  className="data-[state=checked]:bg-[#2eaadc]"
                />
              </div>
            </TabsContent>

            <TabsContent value="gerente" className="px-6 pt-6">
              <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                Em breve
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="flex items-center justify-between border-t border-[#27272a] bg-[#1f1f22] px-6 py-4">
          {isEditing && onDelete ? (
            <button
              type="button"
              className="flex items-center gap-2 rounded px-2 py-1.5 text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300"
              onClick={() => onDelete(conta.id)}
            >
              Desativar Conta
            </button>
          ) : (
            <div />
          )}
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </button>
            <Button onClick={handleSave}>
              {isEditing ? "Salvar Alteracoes" : "Adicionar Conta"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
