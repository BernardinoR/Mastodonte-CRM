import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from "react";
import type { Client, ClientFullData, ClientStats, ClientMeeting, WhatsAppGroup, Address } from "@/types/client";
import type { ClientStatus } from "@/lib/statusConfig";
import type { MeetingDetail } from "@/types/meeting";
import { 
  INITIAL_CLIENTS, 
  CLIENT_EXTENDED_DATA, 
  MEETING_DETAILS_DATA,
  type ClientExtendedData 
} from "@/mocks/clientsMock";

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
  getMeetingDetail: (clientId: string, meetingId: string) => MeetingDetail | undefined;
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
  updateClientAddress: (clientId: string, address: Address) => void;
  updateClientFoundationCode: (clientId: string, foundationCode: string) => void;
  addClientMeeting: (clientId: string, meeting: Omit<ClientMeeting, 'id'>) => void;
  updateClientMeeting: (clientId: string, meetingId: string, updates: Partial<Omit<ClientMeeting, 'id'>>) => void;
  deleteClientMeeting: (clientId: string, meetingId: string) => void;
  dataVersion: number;
}

const ClientsContext = createContext<ClientsContextType | null>(null);

export function ClientsProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [extendedData, setExtendedData] = useState<Record<string, ClientExtendedData>>(CLIENT_EXTENDED_DATA);
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

  const getMeetingDetail = useCallback((clientId: string, meetingId: string): MeetingDetail | undefined => {
    const key = `${clientId}-${meetingId}`;
    return MEETING_DETAILS_DATA[key];
  }, []);

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

  const updateClientAddress = useCallback((clientId: string, address: Address) => {
    setClients(prev => prev.map(client =>
      client.id === clientId ? { ...client, address } : client
    ));
    setDataVersion(v => v + 1);
  }, []);

  const updateClientFoundationCode = useCallback((clientId: string, foundationCode: string) => {
    setClients(prev => prev.map(client =>
      client.id === clientId ? { ...client, foundationCode } : client
    ));
    setDataVersion(v => v + 1);
  }, []);

  const addClientMeeting = useCallback((clientId: string, meeting: Omit<ClientMeeting, 'id'>) => {
    setExtendedData(prev => {
      const clientData = prev[clientId] || { stats: [], meetings: [], whatsappGroups: [] };
      const newMeeting: ClientMeeting = {
        ...meeting,
        id: crypto.randomUUID(),
      };
      return {
        ...prev,
        [clientId]: {
          ...clientData,
          meetings: [...clientData.meetings, newMeeting],
        },
      };
    });
    setDataVersion(v => v + 1);
  }, []);

  const updateClientMeeting = useCallback((clientId: string, meetingId: string, updates: Partial<Omit<ClientMeeting, 'id'>>) => {
    setExtendedData(prev => {
      const clientData = prev[clientId];
      if (!clientData) return prev;
      
      return {
        ...prev,
        [clientId]: {
          ...clientData,
          meetings: clientData.meetings.map(meeting =>
            meeting.id === meetingId ? { ...meeting, ...updates } : meeting
          ),
        },
      };
    });
    setDataVersion(v => v + 1);
  }, []);

  const deleteClientMeeting = useCallback((clientId: string, meetingId: string) => {
    setExtendedData(prev => {
      const clientData = prev[clientId];
      if (!clientData) return prev;
      
      return {
        ...prev,
        [clientId]: {
          ...clientData,
          meetings: clientData.meetings.filter(meeting => meeting.id !== meetingId),
        },
      };
    });
    setDataVersion(v => v + 1);
  }, []);

  const contextValue = useMemo(() => ({
    clients,
    getClientById,
    getClientByName,
    getFullClientData,
    getAllClients,
    getMeetingDetail,
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
    updateClientFoundationCode,
    addClientMeeting,
    updateClientMeeting,
    deleteClientMeeting,
    dataVersion,
  }), [clients, getClientById, getClientByName, getFullClientData, getAllClients, getMeetingDetail, addWhatsAppGroup, updateWhatsAppGroup, deleteWhatsAppGroup, updateClientStatus, updateClientName, updateClientCpf, updateClientPhone, updateClientEmails, addClientEmail, removeClientEmail, updateClientEmail, setClientPrimaryEmail, updateClientAdvisor, updateClientAddress, updateClientFoundationCode, addClientMeeting, updateClientMeeting, deleteClientMeeting, dataVersion]);

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

// Re-exportar MEETING_DETAILS_DATA para compatibilidade
export { MEETING_DETAILS_DATA };
