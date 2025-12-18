import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from "react";
import type { Client, ClientFullData, ClientStats, ClientMeeting, WhatsAppGroup } from "@/types/client";
import type { ClientStatus } from "@/lib/statusConfig";

function deriveInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "";
  
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  
  const first = parts[0].charAt(0).toUpperCase();
  const last = parts[parts.length - 1].charAt(0).toUpperCase();
  return first + last;
}

interface ClientsContextType {
  clients: Client[];
  getClientById: (id: string) => Client | undefined;
  getClientByName: (name: string) => Client | undefined;
  getFullClientData: (id: string) => ClientFullData | undefined;
  getAllClients: () => Client[];
  addWhatsAppGroup: (clientId: string, group: Omit<WhatsAppGroup, 'id'>) => void;
  updateWhatsAppGroup: (clientId: string, groupId: string, updates: Partial<Omit<WhatsAppGroup, 'id'>>) => void;
  deleteWhatsAppGroup: (clientId: string, groupId: string) => void;
  updateClientStatus: (clientId: string, status: ClientStatus) => void;
  updateClientName: (clientId: string, name: string) => void;
  updateClientCpf: (clientId: string, cpf: string) => void;
  updateClientPhone: (clientId: string, phone: string) => void;
  updateClientEmails: (clientId: string, emails: string[], primaryEmailIndex: number) => void;
  addClientEmail: (clientId: string, email: string) => void;
  removeClientEmail: (clientId: string, emailIndex: number) => void;
  updateClientEmail: (clientId: string, emailIndex: number, newEmail: string) => void;
  setClientPrimaryEmail: (clientId: string, emailIndex: number) => void;
  updateClientAdvisor: (clientId: string, advisor: string) => void;
  updateClientAddress: (clientId: string, address: string) => void;
  dataVersion: number;
}

const ClientsContext = createContext<ClientsContextType | null>(null);

const INITIAL_CLIENTS: Client[] = [
  {
    id: "1",
    name: "Alessandro Cuçulin Mazer",
    initials: "AM",
    cpf: "XXX.XXX.XXX-XX",
    phone: "+55 (16) 99708-716",
    emails: ["mazer.ale@hotmail.com", "alessandro.mazer@empresa.com"],
    primaryEmailIndex: 0,
    advisor: "Rafael Bernardino Silveira",
    lastMeeting: new Date('2025-11-25'),
    address: "Campo Bom/RS",
    foundationCode: "FDN-001",
    clientSince: "Junho de 2023",
    status: "Ativo",
    folderLink: "https://vault.repl.ai/file/com.google.drive/id/example",
  },
  {
    id: "2",
    name: "Ademar João Gréguer",
    initials: "AG",
    cpf: "***.456.789-**",
    phone: "+55 (47) 99123-4567",
    emails: ["ademar.grieger@email.com"],
    primaryEmailIndex: 0,
    advisor: "Rafael Bernardino Silveira",
    lastMeeting: new Date('2025-11-22'),
    address: "Blumenau/SC",
    foundationCode: "FDN-002",
    clientSince: "Dezembro de 2022",
    status: "Ativo",
  },
  {
    id: "3",
    name: "Fernanda Carolina De Faria",
    initials: "FF",
    cpf: "***.123.456-**",
    phone: "+55 (21) 99999-8888",
    emails: ["fernanda.faria@email.com", "fernanda.trabalho@corp.com"],
    primaryEmailIndex: 0,
    advisor: "Rafael Bernardino Silveira",
    lastMeeting: new Date('2025-11-15'),
    address: "Rio de Janeiro/RJ",
    foundationCode: "FDN-003",
    clientSince: "Março de 2021",
    status: "Ativo",
  },
  {
    id: "4",
    name: "Gustavo Samconi Soares",
    initials: "GS",
    cpf: "***.789.012-**",
    phone: "+55 (11) 98888-7777",
    emails: ["gustavo@example.com"],
    primaryEmailIndex: 0,
    advisor: "Rafael Bernardino Silveira",
    lastMeeting: new Date('2025-10-30'),
    address: "São Paulo/SP",
    foundationCode: "FDN-004",
    clientSince: "Outubro de 2025",
    status: "Prospect",
  },
  {
    id: "5",
    name: "Israel Schuster Da Fonseca",
    initials: "IF",
    cpf: "***.234.567-**",
    phone: "+55 (11) 97777-6666",
    emails: ["israel.fonseca@email.com"],
    primaryEmailIndex: 0,
    advisor: "Rafael Bernardino Silveira",
    lastMeeting: new Date('2025-11-18'),
    address: "Campinas/SP",
    foundationCode: "FDN-005",
    clientSince: "Fevereiro de 2022",
    status: "Ativo",
  },
  {
    id: "6",
    name: "Marcia Mozzato Ciampi De Andrade",
    initials: "MA",
    cpf: "***.345.678-**",
    phone: "+55 (11) 96666-5555",
    emails: ["marcia.andrade@email.com"],
    primaryEmailIndex: 0,
    advisor: "Rafael Bernardino Silveira",
    lastMeeting: new Date('2025-11-20'),
    address: "Santos/SP",
    foundationCode: "FDN-006",
    clientSince: "Agosto de 2022",
    status: "Ativo",
  },
  {
    id: "7",
    name: "Rodrigo Weber Rocha da Silva",
    initials: "RS",
    cpf: "***.567.890-**",
    phone: "+55 (11) 95555-4444",
    emails: ["rodrigo.weber@email.com"],
    primaryEmailIndex: 0,
    advisor: "Rafael Bernardino Silveira",
    lastMeeting: new Date('2025-11-10'),
    address: "Curitiba/PR",
    foundationCode: "FDN-007",
    clientSince: "Janeiro de 2024",
    status: "Ativo",
  },
  {
    id: "8",
    name: "Fernanda Garcia Rodrigues de Souza",
    initials: "FS",
    cpf: "***.678.901-**",
    phone: "+55 (11) 94444-3333",
    emails: ["fernanda.garcia@email.com"],
    primaryEmailIndex: 0,
    advisor: "Rafael Bernardino Silveira",
    lastMeeting: new Date('2025-11-05'),
    address: "Porto Alegre/RS",
    foundationCode: "FDN-008",
    clientSince: "Maio de 2024",
    status: "Ativo",
  },
];

const CLIENT_EXTENDED_DATA: Record<string, { stats: ClientStats[]; meetings: ClientMeeting[]; whatsappGroups: WhatsAppGroup[] }> = {
  "1": {
    stats: [
      { value: "R$ 2,8M", label: "AUM Total", change: "↑ +3.1% este mês", changeType: "positive" },
      { value: "4", label: "Reuniões em 2025", change: "↑ +1 vs 2024", changeType: "positive" },
      { value: "7", label: "Tasks Concluídas", change: "100% no prazo", changeType: "positive" },
      { value: "1", label: "Indicações", change: "Em prospecção", changeType: "neutral" },
    ],
    meetings: [
      { id: "1", name: "Reunião Mensal - Novembro", type: "Mensal", status: "Realizada", date: new Date('2025-11-25'), consultant: "Rafael Bernardino Silveira" },
      { id: "2", name: "Reunião Mensal - Outubro", type: "Mensal", status: "Realizada", date: new Date('2025-10-20'), consultant: "Rafael Bernardino Silveira" },
    ],
    whatsappGroups: [
      { id: "1", name: "Alessandro | Mastodonte", purpose: "Atendimento principal do cliente", link: "https://chat.whatsapp.com/abc123", createdAt: new Date('2023-06-15'), status: "Ativo" },
    ],
  },
  "2": {
    stats: [
      { value: "R$ 12,4M", label: "AUM Total", change: "↑ +5.2% este mês", changeType: "positive" },
      { value: "8", label: "Reuniões em 2025", change: "↑ +2 vs 2024", changeType: "positive" },
      { value: "15", label: "Tasks Concluídas", change: "100% no prazo", changeType: "positive" },
      { value: "3", label: "Indicações", change: "1 convertida", changeType: "neutral" },
    ],
    meetings: [
      { id: "1", name: "Reunião Mensal - Dezembro", type: "Mensal", status: "Agendada", date: new Date('2025-12-18'), consultant: "Rafael Bernardino Silveira" },
      { id: "2", name: "Reunião Mensal - Novembro", type: "Mensal", status: "Realizada", date: new Date('2025-11-22'), consultant: "Rafael Bernardino Silveira" },
      { id: "3", name: "Reunião Mensal - Outubro", type: "Mensal", status: "Realizada", date: new Date('2025-10-22'), consultant: "Rafael Bernardino Silveira" },
    ],
    whatsappGroups: [
      { id: "1", name: "Ademar | Mastodonte & Bradesco", purpose: "Atendimento principal do cliente", link: "https://chat.whatsapp.com/def456", createdAt: new Date('2022-12-15'), status: "Ativo" },
      { id: "2", name: "Ademar | Grieger Holding", purpose: "Assuntos da empresa e holding familiar", link: "https://chat.whatsapp.com/ghi789", createdAt: new Date('2024-03-08'), status: "Ativo" },
      { id: "3", name: "Ademar & Cláudia | Família", purpose: "Planejamento sucessório com esposa", link: "https://chat.whatsapp.com/jkl012", createdAt: new Date('2025-09-22'), status: "Ativo" },
      { id: "4", name: "Ademar | Antiga XP", purpose: "Migração de antiga corretora (arquivado)", link: null, createdAt: new Date('2022-10-12'), status: "Inativo" },
    ],
  },
  "3": {
    stats: [
      { value: "R$ 5,2M", label: "AUM Total", change: "↑ +2.8% este mês", changeType: "positive" },
      { value: "6", label: "Reuniões em 2025", change: "Igual a 2024", changeType: "neutral" },
      { value: "12", label: "Tasks Concluídas", change: "92% no prazo", changeType: "positive" },
      { value: "2", label: "Indicações", change: "1 em análise", changeType: "neutral" },
    ],
    meetings: [
      { id: "1", name: "Reunião Mensal - Novembro", type: "Mensal", status: "Realizada", date: new Date('2025-11-15'), consultant: "Rafael Bernardino Silveira" },
      { id: "2", name: "Follow-up Investimentos", type: "Follow-up", status: "Realizada", date: new Date('2025-11-08'), consultant: "Rafael Bernardino Silveira" },
    ],
    whatsappGroups: [
      { id: "1", name: "Fernanda | Mastodonte", purpose: "Atendimento principal", link: "https://chat.whatsapp.com/mno345", createdAt: new Date('2021-03-20'), status: "Ativo" },
    ],
  },
  "4": {
    stats: [
      { value: "R$ 800K", label: "AUM Total", change: "Novo cliente", changeType: "neutral" },
      { value: "2", label: "Reuniões em 2025", change: "Prospecção", changeType: "neutral" },
      { value: "3", label: "Tasks Concluídas", change: "100% no prazo", changeType: "positive" },
      { value: "0", label: "Indicações", change: "-", changeType: "neutral" },
    ],
    meetings: [
      { id: "1", name: "Reunião de Prospecção", type: "Especial", status: "Realizada", date: new Date('2025-10-30'), consultant: "Rafael Bernardino Silveira" },
    ],
    whatsappGroups: [
      { id: "1", name: "Gustavo | Mastodonte", purpose: "Atendimento principal", link: "https://chat.whatsapp.com/xyz789", createdAt: new Date('2025-10-30'), status: "Ativo" },
    ],
  },
  "5": {
    stats: [
      { value: "R$ 8,9M", label: "AUM Total", change: "↑ +4.5% este mês", changeType: "positive" },
      { value: "9", label: "Reuniões em 2025", change: "↑ +3 vs 2024", changeType: "positive" },
      { value: "18", label: "Tasks Concluídas", change: "94% no prazo", changeType: "positive" },
      { value: "4", label: "Indicações", change: "2 convertidas", changeType: "positive" },
    ],
    meetings: [
      { id: "1", name: "Reunião Mensal - Novembro", type: "Mensal", status: "Realizada", date: new Date('2025-11-18'), consultant: "Rafael Bernardino Silveira" },
      { id: "2", name: "Reunião de Estratégia", type: "Especial", status: "Realizada", date: new Date('2025-11-05'), consultant: "Rafael Bernardino Silveira" },
    ],
    whatsappGroups: [
      { id: "1", name: "Israel | Mastodonte", purpose: "Atendimento principal", link: "https://chat.whatsapp.com/pqr678", createdAt: new Date('2022-02-15'), status: "Ativo" },
      { id: "2", name: "Israel | Investimentos", purpose: "Discussões sobre carteira", link: "https://chat.whatsapp.com/stu901", createdAt: new Date('2023-06-10'), status: "Ativo" },
    ],
  },
  "6": {
    stats: [
      { value: "R$ 3,5M", label: "AUM Total", change: "↑ +1.2% este mês", changeType: "positive" },
      { value: "6", label: "Reuniões em 2025", change: "Igual a 2024", changeType: "neutral" },
      { value: "11", label: "Tasks Concluídas", change: "91% no prazo", changeType: "positive" },
      { value: "2", label: "Indicações", change: "1 em análise", changeType: "neutral" },
    ],
    meetings: [
      { id: "1", name: "Reunião Mensal - Novembro", type: "Mensal", status: "Realizada", date: new Date('2025-11-20'), consultant: "Rafael Bernardino Silveira" },
      { id: "2", name: "Follow-up Previdência", type: "Follow-up", status: "Realizada", date: new Date('2025-11-05'), consultant: "Rafael Bernardino Silveira" },
    ],
    whatsappGroups: [
      { id: "1", name: "Marcia | Mastodonte", purpose: "Atendimento principal", link: "https://chat.whatsapp.com/vwx234", createdAt: new Date('2022-08-25'), status: "Ativo" },
    ],
  },
  "7": {
    stats: [
      { value: "R$ 4,2M", label: "AUM Total", change: "↑ +2.5% este mês", changeType: "positive" },
      { value: "5", label: "Reuniões em 2025", change: "Novo cliente", changeType: "neutral" },
      { value: "8", label: "Tasks Concluídas", change: "100% no prazo", changeType: "positive" },
      { value: "1", label: "Indicações", change: "Em prospecção", changeType: "neutral" },
    ],
    meetings: [
      { id: "1", name: "Reunião Mensal - Novembro", type: "Mensal", status: "Realizada", date: new Date('2025-11-10'), consultant: "Rafael Bernardino Silveira" },
      { id: "2", name: "Reunião Mensal - Outubro", type: "Mensal", status: "Realizada", date: new Date('2025-10-15'), consultant: "Rafael Bernardino Silveira" },
    ],
    whatsappGroups: [
      { id: "1", name: "Rodrigo | Mastodonte", purpose: "Atendimento principal", link: "https://chat.whatsapp.com/yza567", createdAt: new Date('2024-01-15'), status: "Ativo" },
    ],
  },
  "8": {
    stats: [
      { value: "R$ 1,8M", label: "AUM Total", change: "↑ +1.8% este mês", changeType: "positive" },
      { value: "4", label: "Reuniões em 2025", change: "Novo cliente", changeType: "neutral" },
      { value: "5", label: "Tasks Concluídas", change: "100% no prazo", changeType: "positive" },
      { value: "0", label: "Indicações", change: "-", changeType: "neutral" },
    ],
    meetings: [
      { id: "1", name: "Reunião Mensal - Novembro", type: "Mensal", status: "Realizada", date: new Date('2025-11-05'), consultant: "Rafael Bernardino Silveira" },
    ],
    whatsappGroups: [
      { id: "1", name: "Fernanda G. | Mastodonte", purpose: "Atendimento principal", link: "https://chat.whatsapp.com/bcd890", createdAt: new Date('2024-05-10'), status: "Ativo" },
    ],
  },
};

export function ClientsProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [extendedData, setExtendedData] = useState<Record<string, { stats: ClientStats[]; meetings: ClientMeeting[]; whatsappGroups: WhatsAppGroup[] }>>(CLIENT_EXTENDED_DATA);
  const [dataVersion, setDataVersion] = useState(0);

  const getClientById = useCallback((id: string) => {
    return clients.find(c => c.id === id);
  }, [clients]);

  const getClientByName = useCallback((name: string) => {
    return clients.find(c => c.name.toLowerCase() === name.toLowerCase());
  }, [clients]);

  const getFullClientData = useCallback((id: string): ClientFullData | undefined => {
    const client = clients.find(c => c.id === id);
    if (!client) return undefined;
    
    const data = extendedData[id];
    if (!data) {
      return {
        client,
        stats: [],
        meetings: [],
        whatsappGroups: [],
      };
    }
    
    return {
      client,
      ...data,
    };
  }, [clients, extendedData]);

  const getAllClients = useCallback(() => {
    return clients;
  }, [clients]);

  const addWhatsAppGroup = useCallback((clientId: string, group: Omit<WhatsAppGroup, 'id'>) => {
    setExtendedData(prev => {
      const clientData = prev[clientId] || { stats: [], meetings: [], whatsappGroups: [] };
      const newGroup: WhatsAppGroup = {
        ...group,
        id: crypto.randomUUID(),
      };
      return {
        ...prev,
        [clientId]: {
          ...clientData,
          whatsappGroups: [...clientData.whatsappGroups, newGroup],
        },
      };
    });
    setDataVersion(v => v + 1);
  }, []);

  const updateWhatsAppGroup = useCallback((clientId: string, groupId: string, updates: Partial<Omit<WhatsAppGroup, 'id'>>) => {
    setExtendedData(prev => {
      const clientData = prev[clientId];
      if (!clientData) return prev;
      
      return {
        ...prev,
        [clientId]: {
          ...clientData,
          whatsappGroups: clientData.whatsappGroups.map(group =>
            group.id === groupId ? { ...group, ...updates } : group
          ),
        },
      };
    });
    setDataVersion(v => v + 1);
  }, []);

  const deleteWhatsAppGroup = useCallback((clientId: string, groupId: string) => {
    setExtendedData(prev => {
      const clientData = prev[clientId];
      if (!clientData) return prev;
      
      return {
        ...prev,
        [clientId]: {
          ...clientData,
          whatsappGroups: clientData.whatsappGroups.filter(group => group.id !== groupId),
        },
      };
    });
    setDataVersion(v => v + 1);
  }, []);

  const updateClientStatus = useCallback((clientId: string, status: ClientStatus) => {
    setClients(prev => prev.map(client =>
      client.id === clientId ? { ...client, status } : client
    ));
    setDataVersion(v => v + 1);
  }, []);

  const updateClientName = useCallback((clientId: string, name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    
    setClients(prev => prev.map(client =>
      client.id === clientId 
        ? { ...client, name: trimmedName, initials: deriveInitials(trimmedName) } 
        : client
    ));
    setDataVersion(v => v + 1);
  }, []);

  const updateClientCpf = useCallback((clientId: string, cpf: string) => {
    setClients(prev => prev.map(client =>
      client.id === clientId ? { ...client, cpf } : client
    ));
    setDataVersion(v => v + 1);
  }, []);

  const updateClientPhone = useCallback((clientId: string, phone: string) => {
    setClients(prev => prev.map(client =>
      client.id === clientId ? { ...client, phone } : client
    ));
    setDataVersion(v => v + 1);
  }, []);

  const updateClientEmails = useCallback((clientId: string, emails: string[], primaryEmailIndex: number) => {
    setClients(prev => prev.map(client =>
      client.id === clientId ? { ...client, emails, primaryEmailIndex } : client
    ));
    setDataVersion(v => v + 1);
  }, []);

  const addClientEmail = useCallback((clientId: string, email: string) => {
    setClients(prev => prev.map(client => {
      if (client.id !== clientId) return client;
      return { ...client, emails: [...client.emails, email] };
    }));
    setDataVersion(v => v + 1);
  }, []);

  const removeClientEmail = useCallback((clientId: string, emailIndex: number) => {
    setClients(prev => prev.map(client => {
      if (client.id !== clientId) return client;
      if (client.emails.length <= 1) return client;
      
      const newEmails = client.emails.filter((_, i) => i !== emailIndex);
      let newPrimaryIndex = client.primaryEmailIndex;
      
      if (emailIndex === client.primaryEmailIndex) {
        newPrimaryIndex = 0;
      } else if (emailIndex < client.primaryEmailIndex) {
        newPrimaryIndex = client.primaryEmailIndex - 1;
      }
      
      return { ...client, emails: newEmails, primaryEmailIndex: newPrimaryIndex };
    }));
    setDataVersion(v => v + 1);
  }, []);

  const updateClientEmail = useCallback((clientId: string, emailIndex: number, newEmail: string) => {
    setClients(prev => prev.map(client => {
      if (client.id !== clientId) return client;
      const newEmails = [...client.emails];
      newEmails[emailIndex] = newEmail;
      return { ...client, emails: newEmails };
    }));
    setDataVersion(v => v + 1);
  }, []);

  const setClientPrimaryEmail = useCallback((clientId: string, emailIndex: number) => {
    setClients(prev => prev.map(client =>
      client.id === clientId ? { ...client, primaryEmailIndex: emailIndex } : client
    ));
    setDataVersion(v => v + 1);
  }, []);

  const updateClientAdvisor = useCallback((clientId: string, advisor: string) => {
    setClients(prev => prev.map(client =>
      client.id === clientId ? { ...client, advisor } : client
    ));
    setDataVersion(v => v + 1);
  }, []);

  const updateClientAddress = useCallback((clientId: string, address: string) => {
    setClients(prev => prev.map(client =>
      client.id === clientId ? { ...client, address } : client
    ));
    setDataVersion(v => v + 1);
  }, []);

  const contextValue = useMemo(() => ({
    clients,
    getClientById,
    getClientByName,
    getFullClientData,
    getAllClients,
    addWhatsAppGroup,
    updateWhatsAppGroup,
    deleteWhatsAppGroup,
    updateClientStatus,
    updateClientName,
    updateClientCpf,
    updateClientPhone,
    updateClientEmails,
    addClientEmail,
    removeClientEmail,
    updateClientEmail,
    setClientPrimaryEmail,
    updateClientAdvisor,
    updateClientAddress,
    dataVersion,
  }), [clients, getClientById, getClientByName, getFullClientData, getAllClients, addWhatsAppGroup, updateWhatsAppGroup, deleteWhatsAppGroup, updateClientStatus, updateClientName, updateClientCpf, updateClientPhone, updateClientEmails, addClientEmail, removeClientEmail, updateClientEmail, setClientPrimaryEmail, updateClientAdvisor, updateClientAddress, dataVersion]);

  return (
    <ClientsContext.Provider value={contextValue}>
      {children}
    </ClientsContext.Provider>
  );
}

export function useClients() {
  const context = useContext(ClientsContext);
  if (!context) {
    throw new Error("useClients must be used within a ClientsProvider");
  }
  return context;
}
