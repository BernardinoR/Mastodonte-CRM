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
  attachmentCount: number;
  institutionCurrency?: string;
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

export interface VerificationResult {
  client_name: string;
  competencia: string;
  instituicao: string;
  nome_conta: string;
  patrimonio_status: string;
  diferenca: number;
  has_unclassified: boolean;
  unclassified_count: number;
  has_missing_yield: boolean;
  missing_yield_count: number;
  has_new_assets: boolean;
  new_asset_count: number;
  all_green: boolean;
  verified_at: string;
}

function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function verificationKey(
  clientName: string,
  competencia: string,
  instituicao: string,
  nomeConta: string,
): string {
  return `${normalize(clientName)}|${competencia}|${normalize(instituicao)}|${normalize(nomeConta)}`;
}
