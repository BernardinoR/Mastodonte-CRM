export interface Client {
  id: string;
  name: string;
  initials: string;
  cpf: string;
  phone: string;
  email: string;
  advisor: string;
  lastMeeting: Date;
  aum: string;
  riskProfile: string;
  clientSince: string;
  status: "Ativo" | "Inativo" | "Prospect";
  folderLink?: string;
}

export interface ClientStats {
  value: string;
  label: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
}

export interface ClientMeeting {
  id: string;
  name: string;
  type: string;
  status: "Agendada" | "Realizada" | "Cancelada";
  date: Date;
  consultant: string;
}

export interface WhatsAppGroup {
  id: string;
  name: string;
  purpose: string;
  link: string | null;
  createdAt: Date;
  status: "Ativo" | "Inativo";
}

export interface ClientFullData {
  client: Client;
  stats: ClientStats[];
  meetings: ClientMeeting[];
  whatsappGroups: WhatsAppGroup[];
}
