import type { ContaHistoricoEntry } from "../types/contaHistorico";

const historicoByContaId: Record<string, ContaHistoricoEntry[]> = {};

function generateHistorico(contaId: string): ContaHistoricoEntry[] {
  const months = [
    "Fev/26",
    "Jan/26",
    "Dez/25",
    "Nov/25",
    "Out/25",
    "Set/25",
    "Ago/25",
    "Jul/25",
    "Jun/25",
    "Mai/25",
    "Abr/25",
    "Mar/25",
    "Fev/25",
    "Jan/25",
    "Dez/24",
  ];

  const statuses: Array<{ status: ContaHistoricoEntry["status"]; description?: string }> = [
    { status: "Pedir Extrato" },
    { status: "Consolidado", description: "Consolidado em 18/01/2026" },
    { status: "Consolidado", description: "Consolidado em 15/12/2025" },
    { status: "Consolidado", description: "Consolidado em 20/11/2025" },
    { status: "Consolidado", description: "Consolidado em 12/10/2025" },
    { status: "Consolidado", description: "Consolidado em 18/09/2025" },
    { status: "Consolidado", description: "Consolidado em 10/08/2025" },
    { status: "Consolidado", description: "Consolidado em 22/07/2025" },
    { status: "Consolidado", description: "Consolidado em 14/06/2025" },
    { status: "Consolidado", description: "Consolidado em 08/05/2025" },
    { status: "Consolidado", description: "Consolidado em 15/04/2025" },
    { status: "Consolidado", description: "Consolidado em 10/03/2025" },
    { status: "Consolidado", description: "Consolidado em 18/02/2025" },
    { status: "Consolidado", description: "Consolidado em 12/01/2025" },
    { status: "Consolidado", description: "Consolidado em 20/12/2024" },
  ];

  return months.map((competencia, i) => ({
    id: `${contaId}-hist-${i}`,
    competencia,
    status: statuses[i].status,
    description: statuses[i].description,
  }));
}

export function getContaHistorico(contaId: string): ContaHistoricoEntry[] {
  if (!historicoByContaId[contaId]) {
    historicoByContaId[contaId] = generateHistorico(contaId);
  }
  return historicoByContaId[contaId];
}
