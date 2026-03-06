import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { ExtratoStatus, ExtratoCollectionMethod, Extrato } from "../types/extrato";

export interface StatusStyle {
  bg: string;
  text: string;
  border: string;
  dot: string;
  glow: string;
}

export const statusStyles: Record<ExtratoStatus, StatusStyle> = {
  Pendente: {
    bg: "bg-orange-500/10",
    text: "text-orange-400",
    border: "border-orange-500/20",
    dot: "bg-orange-500",
    glow: "shadow-[0_0_8px_rgba(249,115,22,0.6)]",
  },
  Solicitado: {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/20",
    dot: "bg-blue-500",
    glow: "shadow-[0_0_8px_rgba(59,130,246,0.6)]",
  },
  Recebido: {
    bg: "bg-green-500/10",
    text: "text-green-400",
    border: "border-green-500/20",
    dot: "bg-green-500",
    glow: "shadow-[0_0_8px_rgba(34,197,94,0.6)]",
  },
  Consolidado: {
    bg: "bg-green-600/20",
    text: "text-green-300",
    border: "border-green-500/30",
    dot: "bg-green-400",
    glow: "shadow-[0_0_8px_rgba(74,222,128,0.6)]",
  },
};

export const collectionMethodStyles: Record<ExtratoCollectionMethod, string> = {
  Automático: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  Manual: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

export const EXTRATO_STATUS_BADGE_COLORS: Record<ExtratoStatus, string> = {
  Pendente: "bg-orange-950/30 text-orange-400 border-orange-500/20",
  Solicitado: "bg-blue-950/30 text-blue-400 border-blue-500/20",
  Recebido: "bg-emerald-950/30 text-emerald-400 border-emerald-500/20",
  Consolidado: "bg-purple-950/30 text-purple-400 border-purple-500/20",
};

export const EXTRATO_METHOD_BADGE_COLORS: Record<ExtratoCollectionMethod, string> = {
  Automático: "bg-emerald-950/20 text-emerald-500 border-emerald-500/20",
  Manual: "bg-zinc-800 text-zinc-500 border-transparent",
};

export function getStatusElapsedText(extrato: Extrato): string {
  const { status } = extrato;

  let dateStr: string | undefined;
  if (status === "Pendente") {
    dateStr = extrato.createdAt;
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
