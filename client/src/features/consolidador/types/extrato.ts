export type ExtratoStatus = "Pendente" | "Solicitado" | "Recebido" | "Consolidado";

export type ExtratoCollectionMethod = "Automático" | "Manual" | "Manual Cliente";

export interface Extrato {
  id: string;
  contaId: string;
  clientId: string;
  clientName: string;
  clientInitials: string;
  institution: string;
  accountType: string;
  collectionMethod: ExtratoCollectionMethod;
  status: ExtratoStatus;
  referenceMonth: string; // "MM/YYYY"
  requestedAt?: string;
  receivedAt?: string;
  consolidatedAt?: string;
  updatedAt?: string;
  hasWhatsApp: boolean;
  hasEmail: boolean;
  contactPhone?: string;
  contactEmail?: string;
  clientEmail?: string;
  contactName?: string;
  whatsappIsGroup?: boolean;
  whatsappGroupLink?: string;
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
