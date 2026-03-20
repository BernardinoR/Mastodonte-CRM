import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { ExtratoStatus, ExtratoCollectionMethod, Extrato } from "../types/extrato";

export interface StatusStyle {
  bg: string;
  text: string;
  border: string;
  dot: string;
}

export const statusStyles: Record<ExtratoStatus, StatusStyle> = {
  Pendente: {
    bg: "bg-orange-500/10",
    text: "text-orange-400",
    border: "border-orange-500/20",
    dot: "bg-orange-500",
  },
  Solicitado: {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/20",
    dot: "bg-blue-500",
  },
  Recebido: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
    dot: "bg-emerald-500",
  },
  Consolidado: {
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    border: "border-purple-500/20",
    dot: "bg-emerald-500/40",
  },
};

export const collectionMethodStyles: Record<ExtratoCollectionMethod, string> = {
  Automático: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  Manual: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  "Manual Cliente": "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

export const EXTRATO_STATUS_BADGE_COLORS: Record<ExtratoStatus, string> = {
  Pendente: "bg-orange-500/10 text-orange-400",
  Solicitado: "bg-blue-500/10 text-blue-400",
  Recebido: "bg-emerald-500/10 text-emerald-400",
  Consolidado: "bg-purple-500/10 text-purple-400",
};

export const EXTRATO_METHOD_BADGE_COLORS: Record<ExtratoCollectionMethod, string> = {
  Automático: "bg-emerald-950/20 text-emerald-500 border-emerald-500/20",
  Manual: "bg-zinc-800 text-zinc-500 border-transparent",
  "Manual Cliente": "bg-amber-950/20 text-amber-500 border-amber-500/20",
};

export function getStatusElapsedText(extrato: Extrato): string {
  const { status } = extrato;

  let dateStr: string | undefined;
  if (status === "Pendente") {
    dateStr = extrato.updatedAt;
  } else if (status === "Solicitado") {
    dateStr = extrato.requestedAt;
  } else if (status === "Recebido") {
    dateStr = extrato.receivedAt;
  } else {
    return "Consolidado";
  }

  if (!dateStr) return status;

  const elapsed = formatDistanceToNow(new Date(dateStr), {
    locale: ptBR,
    addSuffix: true,
  });

  return `${status} ${elapsed}`;
}
