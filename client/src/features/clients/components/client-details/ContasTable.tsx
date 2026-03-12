import { MoreHorizontal, Landmark, Plus } from "lucide-react";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import type { Conta, ContaStatus } from "../../types/conta";
import { getInstitutionColor } from "../../lib/institutionColors";

type StatusFilter = "Ativas" | "Desativadas" | "Todas";

interface ContasTableProps {
  contas: Conta[];
  statusFilter: StatusFilter;
  onStatusFilterChange: (filter: StatusFilter) => void;
  onContaClick?: (conta: Conta) => void;
  onAddConta?: () => void;
  onEditConta?: (conta: Conta) => void;
}

const tipoBadgeClass: Record<string, string> = {
  Automático: "bg-emerald-950/20 text-emerald-500 border-emerald-500/20",
  Manual: "bg-zinc-800 text-zinc-500 border-transparent",
  "Manual Cliente": "bg-amber-950/20 text-amber-500 border-amber-500/20",
};

const filterOptions: StatusFilter[] = ["Ativas", "Desativadas", "Todas"];

export function ContasTable({
  contas,
  statusFilter,
  onStatusFilterChange,
  onContaClick,
  onAddConta,
  onEditConta,
}: ContasTableProps) {
  const filteredContas = contas.filter((conta) => {
    if (statusFilter === "Todas") return true;
    if (statusFilter === "Ativas") return conta.status === "Ativa";
    return conta.status === "Desativada";
  });

  return (
    <Card className="border-[#3a3a3a] bg-[#1a1a1a]">
      <div className="flex items-center justify-between border-b border-[#3a3a3a] px-4 py-3">
        <div className="flex items-center gap-2">
          <Landmark className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">Contas</h3>
          <span className="text-xs text-muted-foreground">({filteredContas.length})</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-md bg-[#2c2c2c] p-0.5">
            {filterOptions.map((option) => (
              <button
                key={option}
                onClick={() => onStatusFilterChange(option)}
                className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                  statusFilter === option
                    ? "bg-[#3a3a3a] text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          <button
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-[#2eaadc] hover:bg-[#2c2c2c]"
            onClick={() => onAddConta?.()}
          >
            <Plus className="h-3.5 w-3.5" />
            Adicionar Conta
          </button>
        </div>
      </div>

      <Table className="table-fixed">
        <TableHeader>
          <TableRow className="border-[#3a3a3a] hover:bg-transparent">
            <TableHead className="w-[22%] text-xs text-muted-foreground">Instituição</TableHead>
            <TableHead className="w-[22%] text-xs text-muted-foreground">Nome da Conta</TableHead>
            <TableHead className="w-[16%] text-xs text-muted-foreground">Nº da Conta</TableHead>
            <TableHead className="w-[16%] text-xs text-muted-foreground">Tipo</TableHead>
            <TableHead className="w-[16%] text-xs text-muted-foreground">Competência</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredContas.length === 0 ? (
            <TableRow className="border-[#3a3a3a]">
              <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                Nenhuma conta encontrada
              </TableCell>
            </TableRow>
          ) : (
            filteredContas.map((conta) => (
              <ContaRow key={conta.id} conta={conta} onClick={onContaClick} onEdit={onEditConta} />
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
}

function ContaRow({
  conta,
  onClick,
  onEdit,
}: {
  conta: Conta;
  onClick?: (conta: Conta) => void;
  onEdit?: (conta: Conta) => void;
}) {
  const color = getInstitutionColor(conta.institution);
  const initial = conta.institution.charAt(0).toUpperCase();
  const isDisabled = conta.status === "Desativada";

  return (
    <TableRow
      className={`border-[#3a3a3a] ${isDisabled ? "opacity-50" : ""} ${onClick ? "cursor-pointer" : ""}`}
      onClick={() => onClick?.(conta)}
    >
      <TableCell>
        <div className="flex items-center gap-2">
          <span
            className={`flex h-6 w-6 items-center justify-center rounded text-xs font-bold ${color.bg} ${color.text} border ${color.border}`}
          >
            {initial}
          </span>
          <span className="text-sm text-foreground">{conta.institution}</span>
        </div>
      </TableCell>
      <TableCell className="text-sm text-foreground">{conta.accountName}</TableCell>
      <TableCell className="text-sm text-muted-foreground">{conta.numeroConta || "—"}</TableCell>
      <TableCell>
        <Badge
          variant="outline"
          className={`text-xs ${tipoBadgeClass[conta.tipo] || tipoBadgeClass.Manual}`}
        >
          {conta.tipo}
        </Badge>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">{conta.competencia}</TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex h-7 w-7 items-center justify-center rounded hover:bg-[#2c2c2c]">
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="border-[#3a3a3a] bg-[#1a1a1a]">
            <DropdownMenuItem
              className="text-sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(conta);
              }}
            >
              Editar conta
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
