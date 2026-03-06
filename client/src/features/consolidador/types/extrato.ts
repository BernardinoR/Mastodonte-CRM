export type ExtratoStatus = "Pendente" | "Solicitado" | "Recebido" | "Consolidado";

export type ExtratoAccountType = "Holding" | "Filho" | "Principal";

export type ExtratoCollectionMethod = "Automático" | "Manual" | "Manual Cliente";

export interface Extrato {
  id: string;
  clientId: string;
  clientName: string;
  clientInitials: string;
  institution: string;
  accountType: ExtratoAccountType;
  collectionMethod: ExtratoCollectionMethod;
  status: ExtratoStatus;
  referenceMonth: Date;
  createdAt?: string;
  requestedAt?: string;
  receivedAt?: string;
  consolidatedAt?: string;
}

export interface ClientExtratoGroup {
  clientId: string;
  clientName: string;
  clientInitials: string;
  extratos: Extrato[];
  pendingCount: number;
}

export interface ExtratoStatusSummary {
  pendentes: number;
  solicitados: number;
  recebidos: number;
  consolidados: number;
}
