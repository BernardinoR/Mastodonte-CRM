import { createContext, useContext, useState, useCallback, useMemo, useEffect, type ReactNode } from "react";
import type { Client, ClientFullData, ClientStats, ClientMeeting, WhatsAppGroup, Address } from "@/types/client";
import type { ClientStatus } from "@/lib/statusConfig";
import type { MeetingDetail } from "@/types/meeting";
import { 
  MEETING_DETAILS_DATA,
  type ClientExtendedData 
} from "@/mocks/clientsMock";

// API response types
interface ApiClient {
  id: string;
  name: string;
  initials: string | null;
  cpf: string | null;
  phone: string | null;
  emails: string[];
  primaryEmailIndex: number;
  lastMeeting: string | null;
  address: Address | null;
  foundationCode: string | null;
  clientSince: string | null;
  status: string;
  patrimony: string | null;
  ownerId: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  owner?: { id: number; name: string | null } | null;
  whatsappGroups?: ApiWhatsAppGroup[];
}

interface ApiWhatsAppGroup {
  id: number;
  name: string;
  purpose: string | null;
  link: string | null;
  status: string;
  clientId: string;
  createdAt: string;
  updatedAt: string;
}

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

// Map API client to frontend Client type
function mapApiClientToClient(apiClient: ApiClient): Client {
  const clientSinceDate = apiClient.clientSince ? new Date(apiClient.clientSince) : new Date();
  return {
    id: apiClient.id,
    name: apiClient.name,
    initials: apiClient.initials || deriveInitials(apiClient.name),
    cpf: apiClient.cpf || "",
    phone: apiClient.phone || "",
    emails: apiClient.emails || [],
    primaryEmailIndex: apiClient.primaryEmailIndex || 0,
    advisor: apiClient.owner?.name || "",
    lastMeeting: apiClient.lastMeeting ? new Date(apiClient.lastMeeting) : new Date(),
    address: apiClient.address || { street: "", complement: "", neighborhood: "", city: "", state: "", zipCode: "" },
    foundationCode: apiClient.foundationCode || "",
    clientSince: clientSinceDate.getFullYear().toString(),
    status: (apiClient.status as ClientStatus) || "Ativo",
  };
}

// Map API WhatsAppGroup to frontend type
function mapApiWhatsAppGroup(apiGroup: ApiWhatsAppGroup): WhatsAppGroup {
  return {
    id: apiGroup.id.toString(),
    name: apiGroup.name,
    purpose: apiGroup.purpose || "",
    link: apiGroup.link,
    status: (apiGroup.status as "Ativo" | "Inativo") || "Ativo",
    createdAt: new Date(apiGroup.createdAt),
  };
}

interface ClientsContextType {
  clients: Client[];
  isLoading: boolean;
  error: string | null;
  refetchClients: () => Promise<void>;
  getClientById: (id: string) => Client | undefined;
  getClientByName: (name: string) => Client | undefined;
  getFullClientData: (id: string) => ClientFullData | undefined;
  getAllClients: () => Client[];
  getMeetingDetail: (clientId: string, meetingId: string) => MeetingDetail | undefined;
  addClient: (clientData: { name: string; email: string }) => Promise<{ success: true; data: string } | { success: false; error: string }>;
  addWhatsAppGroup: (clientId: string, group: Omit<WhatsAppGroup, 'id'>) => Promise<void>;
  updateWhatsAppGroup: (clientId: string, groupId: string, updates: Partial<Omit<WhatsAppGroup, 'id'>>) => Promise<void>;
  deleteWhatsAppGroup: (clientId: string, groupId: string) => Promise<void>;
  updateClientStatus: (clientId: string, status: ClientStatus) => Promise<void>;
  updateClientName: (clientId: string, name: string) => Promise<void>;
  updateClientCpf: (clientId: string, cpf: string) => Promise<void>;
  updateClientPhone: (clientId: string, phone: string) => Promise<void>;
  updateClientEmails: (clientId: string, emails: string[], primaryEmailIndex: number) => Promise<void>;
  addClientEmail: (clientId: string, email: string) => Promise<void>;
  removeClientEmail: (clientId: string, emailIndex: number) => Promise<void>;
  updateClientEmail: (clientId: string, emailIndex: number, newEmail: string) => Promise<void>;
  setClientPrimaryEmail: (clientId: string, emailIndex: number) => Promise<void>;
  updateClientAdvisor: (clientId: string, advisor: string) => void;
  updateClientAddress: (clientId: string, address: Address) => Promise<void>;
  updateClientFoundationCode: (clientId: string, foundationCode: string) => Promise<void>;
  addClientMeeting: (clientId: string, meeting: Omit<ClientMeeting, 'id'>) => void;
  updateClientMeeting: (clientId: string, meetingId: string, updates: Partial<Omit<ClientMeeting, 'id'>>) => void;
  deleteClientMeeting: (clientId: string, meetingId: string) => void;
  dataVersion: number;
}

const ClientsContext = createContext<ClientsContextType | null>(null);

export function ClientsProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [extendedData, setExtendedData] = useState<Record<string, ClientExtendedData>>({});
  const [dataVersion, setDataVersion] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch clients from API
  const fetchClients = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch("/api/clients", {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch clients");
      }
      
      const data = await response.json();
      const mappedClients = (data.clients || []).map(mapApiClientToClient);
      setClients(mappedClients);
      
      // Initialize extended data for each client
      const newExtendedData: Record<string, ClientExtendedData> = {};
      for (const apiClient of (data.clients || []) as ApiClient[]) {
        newExtendedData[apiClient.id] = {
          stats: [],
          meetings: [],
          whatsappGroups: (apiClient.whatsappGroups || []).map(mapApiWhatsAppGroup),
        };
      }
      setExtendedData(newExtendedData);
    } catch (err) {
      console.error("Error fetching clients:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch client with relations (for whatsapp groups)
  const fetchClientWithRelations = useCallback(async (clientId: string) => {
    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        credentials: "include",
      });
      
      if (!response.ok) return null;
      
      const data = await response.json();
      return data.client as ApiClient;
    } catch {
      return null;
    }
  }, []);

  // Load clients on mount
  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const refetchClients = useCallback(async () => {
    await fetchClients();
  }, [fetchClients]);

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

  const addClient = useCallback(async (clientData: { name: string; email: string }): Promise<{ success: true; data: string } | { success: false; error: string }> => {
    try {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: clientData.name,
          initials: deriveInitials(clientData.name),
          emails: clientData.email ? [clientData.email] : [],
          primaryEmailIndex: 0,
          status: "Ativo",
          address: { street: "", complement: "", neighborhood: "", city: "", state: "", zipCode: "" },
          clientSince: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create client");
      }

      const data = await response.json();
      const newClient = mapApiClientToClient(data.client);
      
      setClients(prev => [newClient, ...prev]);
      setExtendedData(prev => ({
        ...prev,
        [newClient.id]: { stats: [], meetings: [], whatsappGroups: [] },
      }));
      setDataVersion(v => v + 1);
      
      return { success: true, data: newClient.id };
    } catch (err) {
      console.error("Error creating client:", err);
      return { 
        success: false, 
        error: "Não foi possível criar o cliente. Verifique sua conexão e tente novamente." 
      };
    }
  }, []);

  const updateClientApi = useCallback(async (clientId: string, updates: Record<string, unknown>) => {
    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updates),
      });
      return response.ok;
    } catch {
      return false;
    }
  }, []);

  const addWhatsAppGroup = useCallback(async (clientId: string, group: Omit<WhatsAppGroup, 'id'>) => {
    try {
      const response = await fetch(`/api/clients/${clientId}/whatsapp-groups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: group.name,
          purpose: group.purpose,
          link: group.link,
          status: group.status,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const newGroup = mapApiWhatsAppGroup(data.group);
        
        setExtendedData(prev => {
          const clientData = prev[clientId] || { stats: [], meetings: [], whatsappGroups: [] };
          return {
            ...prev,
            [clientId]: {
              ...clientData,
              whatsappGroups: [...clientData.whatsappGroups, newGroup],
            },
          };
        });
      }
    } catch (err) {
      console.error("Error creating WhatsApp group:", err);
    }
    setDataVersion(v => v + 1);
  }, []);

  const updateWhatsAppGroup = useCallback(async (clientId: string, groupId: string, updates: Partial<Omit<WhatsAppGroup, 'id'>>) => {
    try {
      await fetch(`/api/whatsapp-groups/${groupId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updates),
      });
    } catch (err) {
      console.error("Error updating WhatsApp group:", err);
    }

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

  const deleteWhatsAppGroup = useCallback(async (clientId: string, groupId: string) => {
    try {
      await fetch(`/api/whatsapp-groups/${groupId}`, {
        method: "DELETE",
        credentials: "include",
      });
    } catch (err) {
      console.error("Error deleting WhatsApp group:", err);
    }

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

  const updateClientStatus = useCallback(async (clientId: string, status: ClientStatus) => {
    await updateClientApi(clientId, { status });
    setClients(prev => prev.map(client =>
      client.id === clientId ? { ...client, status } : client
    ));
    setDataVersion(v => v + 1);
  }, [updateClientApi]);

  const updateClientName = useCallback(async (clientId: string, name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    
    const initials = deriveInitials(trimmedName);
    await updateClientApi(clientId, { name: trimmedName, initials });
    
    setClients(prev => prev.map(client =>
      client.id === clientId 
        ? { ...client, name: trimmedName, initials } 
        : client
    ));
    setDataVersion(v => v + 1);
  }, [updateClientApi]);

  const updateClientCpf = useCallback(async (clientId: string, cpf: string) => {
    await updateClientApi(clientId, { cpf });
    setClients(prev => prev.map(client =>
      client.id === clientId ? { ...client, cpf } : client
    ));
    setDataVersion(v => v + 1);
  }, [updateClientApi]);

  const updateClientPhone = useCallback(async (clientId: string, phone: string) => {
    await updateClientApi(clientId, { phone });
    setClients(prev => prev.map(client =>
      client.id === clientId ? { ...client, phone } : client
    ));
    setDataVersion(v => v + 1);
  }, [updateClientApi]);

  const updateClientEmails = useCallback(async (clientId: string, emails: string[], primaryEmailIndex: number) => {
    await updateClientApi(clientId, { emails, primaryEmailIndex });
    setClients(prev => prev.map(client =>
      client.id === clientId ? { ...client, emails, primaryEmailIndex } : client
    ));
    setDataVersion(v => v + 1);
  }, [updateClientApi]);

  const addClientEmail = useCallback(async (clientId: string, email: string) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;
    
    const newEmails = [...client.emails, email];
    await updateClientApi(clientId, { emails: newEmails });
    
    setClients(prev => prev.map(c => {
      if (c.id !== clientId) return c;
      return { ...c, emails: newEmails };
    }));
    setDataVersion(v => v + 1);
  }, [clients, updateClientApi]);

  const removeClientEmail = useCallback(async (clientId: string, emailIndex: number) => {
    const client = clients.find(c => c.id === clientId);
    if (!client || client.emails.length <= 1) return;
    
    const newEmails = client.emails.filter((_, i) => i !== emailIndex);
    let newPrimaryIndex = client.primaryEmailIndex;
    
    if (emailIndex === client.primaryEmailIndex) {
      newPrimaryIndex = 0;
    } else if (emailIndex < client.primaryEmailIndex) {
      newPrimaryIndex = client.primaryEmailIndex - 1;
    }
    
    await updateClientApi(clientId, { emails: newEmails, primaryEmailIndex: newPrimaryIndex });
    
    setClients(prev => prev.map(c => {
      if (c.id !== clientId) return c;
      return { ...c, emails: newEmails, primaryEmailIndex: newPrimaryIndex };
    }));
    setDataVersion(v => v + 1);
  }, [clients, updateClientApi]);

  const updateClientEmail = useCallback(async (clientId: string, emailIndex: number, newEmail: string) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;
    
    const newEmails = [...client.emails];
    newEmails[emailIndex] = newEmail;
    
    await updateClientApi(clientId, { emails: newEmails });
    
    setClients(prev => prev.map(c => {
      if (c.id !== clientId) return c;
      return { ...c, emails: newEmails };
    }));
    setDataVersion(v => v + 1);
  }, [clients, updateClientApi]);

  const setClientPrimaryEmail = useCallback(async (clientId: string, emailIndex: number) => {
    await updateClientApi(clientId, { primaryEmailIndex: emailIndex });
    setClients(prev => prev.map(client =>
      client.id === clientId ? { ...client, primaryEmailIndex: emailIndex } : client
    ));
    setDataVersion(v => v + 1);
  }, [updateClientApi]);

  // Advisor is managed locally (linked to owner in backend)
  const updateClientAdvisor = useCallback((clientId: string, advisor: string) => {
    setClients(prev => prev.map(client =>
      client.id === clientId ? { ...client, advisor } : client
    ));
    setDataVersion(v => v + 1);
  }, []);

  const updateClientAddress = useCallback(async (clientId: string, address: Address) => {
    await updateClientApi(clientId, { address });
    setClients(prev => prev.map(client =>
      client.id === clientId ? { ...client, address } : client
    ));
    setDataVersion(v => v + 1);
  }, [updateClientApi]);

  const updateClientFoundationCode = useCallback(async (clientId: string, foundationCode: string) => {
    await updateClientApi(clientId, { foundationCode });
    setClients(prev => prev.map(client =>
      client.id === clientId ? { ...client, foundationCode } : client
    ));
    setDataVersion(v => v + 1);
  }, [updateClientApi]);

  // Meetings are still managed locally for now (will be integrated with Meeting model later)
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
    isLoading,
    error,
    refetchClients,
    getClientById,
    getClientByName,
    getFullClientData,
    getAllClients,
    getMeetingDetail,
    addClient,
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
  }), [clients, isLoading, error, refetchClients, getClientById, getClientByName, getFullClientData, getAllClients, getMeetingDetail, addClient, addWhatsAppGroup, updateWhatsAppGroup, deleteWhatsAppGroup, updateClientStatus, updateClientName, updateClientCpf, updateClientPhone, updateClientEmails, addClientEmail, removeClientEmail, updateClientEmail, setClientPrimaryEmail, updateClientAdvisor, updateClientAddress, updateClientFoundationCode, addClientMeeting, updateClientMeeting, deleteClientMeeting, dataVersion]);

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
