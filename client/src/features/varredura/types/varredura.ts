export type VarreduraStatus = "verificado" | "pendente" | "solicitado";

export interface DirectInstitution {
  contaId: string;
  institutionName: string;
  initials: string;
  checked: boolean;
}

export interface ManagerClient {
  contaId: string;
  clientId: string;
  clientName: string;
  clientInitials: string;
  accountName: string;
  status: VarreduraStatus;
  phone?: string;
  email?: string;
}

export interface ManagerGroup {
  institutionName: string;
  initials: string;
  clients: ManagerClient[];
}
