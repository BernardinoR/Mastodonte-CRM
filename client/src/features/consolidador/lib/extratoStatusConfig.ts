import type { ExtratoStatus, ExtratoCollectionMethod } from "../types/extrato";

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
    bg: "bg-green-500/10",
    text: "text-green-400",
    border: "border-green-500/20",
    dot: "bg-green-500",
  },
  Consolidado: {
    bg: "bg-green-600/20",
    text: "text-green-300",
    border: "border-green-500/30",
    dot: "bg-green-400",
  },
};

export const collectionMethodStyles: Record<ExtratoCollectionMethod, string> = {
  Automático: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  Manual: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};
