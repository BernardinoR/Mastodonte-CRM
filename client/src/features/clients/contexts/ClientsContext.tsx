import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  type ReactNode,
} from "react";
import type {
  Client,
  ClientFullData,
  ClientStats,
  ClientMeeting,
  WhatsAppGroup,
  Address,
} from "@features/clients";
import type { ClientStatus } from "@features/tasks/lib/statusConfig";
import type { MeetingDetail } from "@features/meetings";
import { useUsers } from "@features/users";
import { supabase } from "@/shared/lib/supabase";
import { MEETING_DETAILS_DATA, type ClientExtendedData } from "@/shared/mocks/clientsMock";
import type { ClientImportRow } from "../lib/clientImportExport";

// ============================================
// Supabase DB row types (snake_case)
// ============================================

interface DbClient {
  id: string;
  name: string;
  initials: string | null;
  cpf: string | null;
  phone: string | null;
  emails: string[];
  primary_email_index: number;
  last_meeting: string | null;
  address: Address | null;
  foundation_code: string | null;
  client_since: string | null;
  status: string;
  patrimony: string | null;
  owner_id: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  scheduling_message_sent_at: string | null;
  peculiarities: string[];
  monthly_meeting_disabled: boolean;
  owner?: { id: number; name: string | null } | null;
  whatsapp_groups?: DbWhatsAppGroup[];
}

interface DbWhatsAppGroup {
  id: number;
  name: string;
  purpose: string | null;
  link: string | null;
  status: string;
  client_id: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// Mapping utilities
// ============================================

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

function formatClientSince(date: Date): string {
  const months = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];
  return `${months[date.getMonth()]} de ${date.getFullYear()}`;
}

// Map Supabase DB row (snake_case) → frontend Client type
function mapDbRowToClient(row: DbClient): Client {
  const clientSinceDate = row.client_since ? new Date(row.client_since) : new Date();
  return {
    id: row.id,
    name: row.name,
    initials: row.initials || deriveInitials(row.name),
    cpf: row.cpf || "",
    phone: row.phone || "",
    emails: row.emails || [],
    primaryEmailIndex: row.primary_email_index || 0,
    advisor: row.owner?.name || "",
    lastMeeting: row.last_meeting ? new Date(row.last_meeting) : new Date(),
    address: row.address || {
      street: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      zipCode: "",
    },
    foundationCode: row.foundation_code || "",
    clientSince: formatClientSince(clientSinceDate),
    status: (row.status as ClientStatus) || "Ativo",
    schedulingMessageSentAt: row.scheduling_message_sent_at
      ? new Date(row.scheduling_message_sent_at)
      : null,
    peculiarities: row.peculiarities || [],
    monthlyMeetingDisabled: row.monthly_meeting_disabled ?? false,
  };
}

// Map Supabase DB row → frontend WhatsAppGroup type
function mapDbWhatsAppGroup(row: DbWhatsAppGroup): WhatsAppGroup {
  return {
    id: row.id.toString(),
    name: row.name,
    purpose: row.purpose || "",
    link: row.link,
    status: (row.status as "Ativo" | "Inativo") || "Ativo",
    createdAt: new Date(row.created_at),
  };
}

// Map frontend camelCase update fields → Supabase snake_case
const FIELD_MAP: Record<string, string> = {
  name: "name",
  initials: "initials",
  cpf: "cpf",
  phone: "phone",
  emails: "emails",
  primaryEmailIndex: "primary_email_index",
  lastMeeting: "last_meeting",
  address: "address",
  foundationCode: "foundation_code",
  clientSince: "client_since",
  status: "status",
  patrimony: "patrimony",
  ownerId: "owner_id",
  isActive: "is_active",
  peculiarities: "peculiarities",
  monthlyMeetingDisabled: "monthly_meeting_disabled",
};

function mapUpdatesToDb(updates: Record<string, unknown>): Record<string, unknown> {
  const dbUpdates: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(updates)) {
    dbUpdates[FIELD_MAP[key] || key] = value;
  }
  return dbUpdates;
}

// Supabase select query for clients with relations
const CLIENT_SELECT =
  "*, owner:users!owner_id(id, name), whatsapp_groups(*), meetings(id, title, type, status, date, start_time, end_time, google_event_id, creator:users!creator_id(name))";

// ============================================
// Context
// ============================================

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
  addClient: (clientData: {
    name: string;
    email: string;
  }) => Promise<{ success: true; data: string } | { success: false; error: string }>;
  addWhatsAppGroup: (clientId: string, group: Omit<WhatsAppGroup, "id">) => Promise<void>;
  updateWhatsAppGroup: (
    clientId: string,
    groupId: string,
    updates: Partial<Omit<WhatsAppGroup, "id">>,
  ) => Promise<void>;
  deleteWhatsAppGroup: (clientId: string, groupId: string) => Promise<void>;
  updateClientStatus: (clientId: string, status: ClientStatus) => Promise<void>;
  updateClientName: (clientId: string, name: string) => Promise<void>;
  updateClientCpf: (clientId: string, cpf: string) => Promise<void>;
  updateClientPhone: (clientId: string, phone: string) => Promise<void>;
  updateClientEmails: (
    clientId: string,
    emails: string[],
    primaryEmailIndex: number,
  ) => Promise<void>;
  addClientEmail: (clientId: string, email: string) => Promise<void>;
  removeClientEmail: (clientId: string, emailIndex: number) => Promise<void>;
  updateClientEmail: (clientId: string, emailIndex: number, newEmail: string) => Promise<void>;
  setClientPrimaryEmail: (clientId: string, emailIndex: number) => Promise<void>;
  updateClientAdvisor: (clientId: string, advisor: string) => void;
  updateClientAddress: (clientId: string, address: Address) => Promise<void>;
  updateClientFoundationCode: (clientId: string, foundationCode: string) => Promise<void>;
  updateClientPeculiarities: (clientId: string, peculiarities: string[]) => Promise<void>;
  updateClientMonthlyMeetingDisabled: (clientId: string, disabled: boolean) => Promise<void>;
  addClientMeeting: (clientId: string, meeting: Omit<ClientMeeting, "id">) => void;
  updateClientMeeting: (
    clientId: string,
    meetingId: string,
    updates: Partial<Omit<ClientMeeting, "id">>,
  ) => void;
  deleteClientMeeting: (clientId: string, meetingId: string) => void;
  bulkInsertClients: (rows: ClientImportRow[]) => Promise<{ inserted: number; errors: string[] }>;
  dataVersion: number;
}

const ClientsContext = createContext<ClientsContextType | null>(null);

export function ClientsProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useUsers();

  const [clients, setClients] = useState<Client[]>([]);
  const [extendedData, setExtendedData] = useState<Record<string, ClientExtendedData>>({});
  const [dataVersion, setDataVersion] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch clients from Supabase (RLS handles access filtering)
  const fetchClients = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("clients")
        .select(CLIENT_SELECT)
        .eq("status", "Ativo")
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      const rows = (data || []) as DbClient[];
      const mappedClients = rows.map(mapDbRowToClient);
      setClients(mappedClients);

      // Initialize extended data for each client
      const newExtendedData: Record<string, ClientExtendedData> = {};
      for (const row of rows) {
        const dbMeetings = (row as any).meetings || [];
        const mappedMeetings: ClientMeeting[] = dbMeetings.map((m: any) => ({
          id: String(m.id),
          name: m.title || "",
          type: m.type || "Prospecção",
          status: m.status || "Agendada",
          date: new Date(m.date),
          assignees: m.creator?.name ? [m.creator.name] : [],
        }));
        newExtendedData[row.id] = {
          stats: [],
          meetings: mappedMeetings,
          whatsappGroups: (row.whatsapp_groups || []).map(mapDbWhatsAppGroup),
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

  // Load clients on mount
  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const refetchClients = useCallback(async () => {
    await fetchClients();
  }, [fetchClients]);

  const getClientById = useCallback(
    (id: string) => {
      return clients.find((c) => c.id === id);
    },
    [clients],
  );

  const getClientByName = useCallback(
    (name: string) => {
      return clients.find((c) => c.name.toLowerCase() === name.toLowerCase());
    },
    [clients],
  );

  const getFullClientData = useCallback(
    (id: string): ClientFullData | undefined => {
      const client = clients.find((c) => c.id === id);
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
    },
    [clients, extendedData],
  );

  const getAllClients = useCallback(() => {
    return clients;
  }, [clients]);

  const getMeetingDetail = useCallback(
    (clientId: string, meetingId: string): MeetingDetail | undefined => {
      const key = `${clientId}-${meetingId}`;
      return MEETING_DETAILS_DATA[key];
    },
    [],
  );

  // ============================================
  // Client CRUD - Supabase direct
  // ============================================

  const addClient = useCallback(
    async (clientData: {
      name: string;
      email: string;
    }): Promise<{ success: true; data: string } | { success: false; error: string }> => {
      try {
        const { data, error: insertError } = await supabase
          .from("clients")
          .insert({
            name: clientData.name,
            initials: deriveInitials(clientData.name),
            emails: clientData.email ? [clientData.email] : [],
            primary_email_index: 0,
            status: "Ativo",
            address: {
              street: "",
              complement: "",
              neighborhood: "",
              city: "",
              state: "",
              zipCode: "",
            },
            client_since: new Date().toISOString(),
            owner_id: currentUser?.id ?? null,
          })
          .select(CLIENT_SELECT)
          .single();

        if (insertError) throw insertError;

        const newClient = mapDbRowToClient(data as DbClient);

        setClients((prev) => [newClient, ...prev]);
        setExtendedData((prev) => ({
          ...prev,
          [newClient.id]: { stats: [], meetings: [], whatsappGroups: [] },
        }));
        setDataVersion((v) => v + 1);

        return { success: true, data: newClient.id };
      } catch (err) {
        console.error("Error creating client:", err);
        return {
          success: false,
          error: "Não foi possível criar o cliente. Verifique sua conexão e tente novamente.",
        };
      }
    },
    [currentUser],
  );

  const updateClientApi = useCallback(
    async (clientId: string, updates: Record<string, unknown>) => {
      try {
        const dbUpdates = mapUpdatesToDb(updates);
        const { error: updateError } = await supabase
          .from("clients")
          .update(dbUpdates)
          .eq("id", clientId);

        if (updateError) {
          console.error("Error updating client:", updateError);
          return false;
        }
        return true;
      } catch {
        return false;
      }
    },
    [],
  );

  // ============================================
  // WhatsApp Groups - Supabase direct
  // ============================================

  const addWhatsAppGroup = useCallback(
    async (clientId: string, group: Omit<WhatsAppGroup, "id">) => {
      try {
        const { data, error: insertError } = await supabase
          .from("whatsapp_groups")
          .insert({
            name: group.name,
            purpose: group.purpose,
            link: group.link,
            status: group.status,
            client_id: clientId,
          })
          .select()
          .single();

        if (insertError) throw insertError;

        const newGroup = mapDbWhatsAppGroup(data as DbWhatsAppGroup);

        setExtendedData((prev) => {
          const clientData = prev[clientId] || { stats: [], meetings: [], whatsappGroups: [] };
          return {
            ...prev,
            [clientId]: {
              ...clientData,
              whatsappGroups: [...clientData.whatsappGroups, newGroup],
            },
          };
        });
      } catch (err) {
        console.error("Error creating WhatsApp group:", err);
      }
      setDataVersion((v) => v + 1);
    },
    [],
  );

  const updateWhatsAppGroup = useCallback(
    async (clientId: string, groupId: string, updates: Partial<Omit<WhatsAppGroup, "id">>) => {
      try {
        await supabase.from("whatsapp_groups").update(updates).eq("id", parseInt(groupId));
      } catch (err) {
        console.error("Error updating WhatsApp group:", err);
      }

      setExtendedData((prev) => {
        const clientData = prev[clientId];
        if (!clientData) return prev;

        return {
          ...prev,
          [clientId]: {
            ...clientData,
            whatsappGroups: clientData.whatsappGroups.map((group) =>
              group.id === groupId ? { ...group, ...updates } : group,
            ),
          },
        };
      });
      setDataVersion((v) => v + 1);
    },
    [],
  );

  const deleteWhatsAppGroup = useCallback(async (clientId: string, groupId: string) => {
    try {
      await supabase.from("whatsapp_groups").delete().eq("id", parseInt(groupId));
    } catch (err) {
      console.error("Error deleting WhatsApp group:", err);
    }

    setExtendedData((prev) => {
      const clientData = prev[clientId];
      if (!clientData) return prev;

      return {
        ...prev,
        [clientId]: {
          ...clientData,
          whatsappGroups: clientData.whatsappGroups.filter((group) => group.id !== groupId),
        },
      };
    });
    setDataVersion((v) => v + 1);
  }, []);

  // ============================================
  // Client field updates (optimistic + Supabase)
  // ============================================

  const updateClientStatus = useCallback(
    async (clientId: string, status: ClientStatus) => {
      setClients((prev) =>
        prev.map((client) => (client.id === clientId ? { ...client, status } : client)),
      );
      setDataVersion((v) => v + 1);
      await updateClientApi(clientId, { status });
    },
    [updateClientApi],
  );

  const updateClientName = useCallback(
    async (clientId: string, name: string) => {
      const trimmedName = name.trim();
      if (!trimmedName) return;

      const initials = deriveInitials(trimmedName);
      setClients((prev) =>
        prev.map((client) =>
          client.id === clientId ? { ...client, name: trimmedName, initials } : client,
        ),
      );
      setDataVersion((v) => v + 1);
      await updateClientApi(clientId, { name: trimmedName, initials });
    },
    [updateClientApi],
  );

  const updateClientCpf = useCallback(
    async (clientId: string, cpf: string) => {
      setClients((prev) =>
        prev.map((client) => (client.id === clientId ? { ...client, cpf } : client)),
      );
      setDataVersion((v) => v + 1);
      await updateClientApi(clientId, { cpf });
    },
    [updateClientApi],
  );

  const updateClientPhone = useCallback(
    async (clientId: string, phone: string) => {
      setClients((prev) =>
        prev.map((client) => (client.id === clientId ? { ...client, phone } : client)),
      );
      setDataVersion((v) => v + 1);
      await updateClientApi(clientId, { phone });
    },
    [updateClientApi],
  );

  const updateClientEmails = useCallback(
    async (clientId: string, emails: string[], primaryEmailIndex: number) => {
      setClients((prev) =>
        prev.map((client) =>
          client.id === clientId ? { ...client, emails, primaryEmailIndex } : client,
        ),
      );
      setDataVersion((v) => v + 1);
      await updateClientApi(clientId, { emails, primaryEmailIndex });
    },
    [updateClientApi],
  );

  const addClientEmail = useCallback(
    async (clientId: string, email: string) => {
      const client = clients.find((c) => c.id === clientId);
      if (!client) return;

      const newEmails = [...client.emails, email];
      setClients((prev) =>
        prev.map((c) => {
          if (c.id !== clientId) return c;
          return { ...c, emails: newEmails };
        }),
      );
      setDataVersion((v) => v + 1);
      await updateClientApi(clientId, { emails: newEmails });
    },
    [clients, updateClientApi],
  );

  const removeClientEmail = useCallback(
    async (clientId: string, emailIndex: number) => {
      const client = clients.find((c) => c.id === clientId);
      if (!client || client.emails.length <= 1) return;

      const newEmails = client.emails.filter((_, i) => i !== emailIndex);
      let newPrimaryIndex = client.primaryEmailIndex;

      if (emailIndex === client.primaryEmailIndex) {
        newPrimaryIndex = 0;
      } else if (emailIndex < client.primaryEmailIndex) {
        newPrimaryIndex = client.primaryEmailIndex - 1;
      }

      setClients((prev) =>
        prev.map((c) => {
          if (c.id !== clientId) return c;
          return { ...c, emails: newEmails, primaryEmailIndex: newPrimaryIndex };
        }),
      );
      setDataVersion((v) => v + 1);
      await updateClientApi(clientId, { emails: newEmails, primaryEmailIndex: newPrimaryIndex });
    },
    [clients, updateClientApi],
  );

  const updateClientEmail = useCallback(
    async (clientId: string, emailIndex: number, newEmail: string) => {
      const client = clients.find((c) => c.id === clientId);
      if (!client) return;

      const newEmails = [...client.emails];
      newEmails[emailIndex] = newEmail;

      setClients((prev) =>
        prev.map((c) => {
          if (c.id !== clientId) return c;
          return { ...c, emails: newEmails };
        }),
      );
      setDataVersion((v) => v + 1);
      await updateClientApi(clientId, { emails: newEmails });
    },
    [clients, updateClientApi],
  );

  const setClientPrimaryEmail = useCallback(
    async (clientId: string, emailIndex: number) => {
      setClients((prev) =>
        prev.map((client) =>
          client.id === clientId ? { ...client, primaryEmailIndex: emailIndex } : client,
        ),
      );
      setDataVersion((v) => v + 1);
      await updateClientApi(clientId, { primaryEmailIndex: emailIndex });
    },
    [updateClientApi],
  );

  // Advisor is managed locally (linked to owner in backend)
  const updateClientAdvisor = useCallback((clientId: string, advisor: string) => {
    setClients((prev) =>
      prev.map((client) => (client.id === clientId ? { ...client, advisor } : client)),
    );
    setDataVersion((v) => v + 1);
  }, []);

  const updateClientAddress = useCallback(
    async (clientId: string, address: Address) => {
      setClients((prev) =>
        prev.map((client) => (client.id === clientId ? { ...client, address } : client)),
      );
      setDataVersion((v) => v + 1);
      await updateClientApi(clientId, { address });
    },
    [updateClientApi],
  );

  const updateClientFoundationCode = useCallback(
    async (clientId: string, foundationCode: string) => {
      setClients((prev) =>
        prev.map((client) => (client.id === clientId ? { ...client, foundationCode } : client)),
      );
      setDataVersion((v) => v + 1);
      await updateClientApi(clientId, { foundationCode });
    },
    [updateClientApi],
  );

  const updateClientPeculiarities = useCallback(
    async (clientId: string, peculiarities: string[]) => {
      setClients((prev) =>
        prev.map((client) => (client.id === clientId ? { ...client, peculiarities } : client)),
      );
      setDataVersion((v) => v + 1);
      await updateClientApi(clientId, { peculiarities });
    },
    [updateClientApi],
  );

  const updateClientMonthlyMeetingDisabled = useCallback(
    async (clientId: string, disabled: boolean) => {
      setClients((prev) =>
        prev.map((client) =>
          client.id === clientId ? { ...client, monthlyMeetingDisabled: disabled } : client,
        ),
      );
      setDataVersion((v) => v + 1);
      await updateClientApi(clientId, { monthlyMeetingDisabled: disabled });
    },
    [updateClientApi],
  );

  // Meetings are still managed locally for now
  const addClientMeeting = useCallback((clientId: string, meeting: Omit<ClientMeeting, "id">) => {
    setExtendedData((prev) => {
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
    setDataVersion((v) => v + 1);
  }, []);

  const updateClientMeeting = useCallback(
    (clientId: string, meetingId: string, updates: Partial<Omit<ClientMeeting, "id">>) => {
      setExtendedData((prev) => {
        const clientData = prev[clientId];
        if (!clientData) return prev;

        return {
          ...prev,
          [clientId]: {
            ...clientData,
            meetings: clientData.meetings.map((meeting) =>
              meeting.id === meetingId ? { ...meeting, ...updates } : meeting,
            ),
          },
        };
      });
      setDataVersion((v) => v + 1);
    },
    [],
  );

  const deleteClientMeeting = useCallback((clientId: string, meetingId: string) => {
    setExtendedData((prev) => {
      const clientData = prev[clientId];
      if (!clientData) return prev;

      return {
        ...prev,
        [clientId]: {
          ...clientData,
          meetings: clientData.meetings.filter((meeting) => meeting.id !== meetingId),
        },
      };
    });
    setDataVersion((v) => v + 1);
  }, []);

  // ============================================
  // Bulk import
  // ============================================

  const bulkInsertClients = useCallback(
    async (rows: ClientImportRow[]): Promise<{ inserted: number; errors: string[] }> => {
      const BATCH_SIZE = 50;
      let inserted = 0;
      const errors: string[] = [];

      for (let i = 0; i < rows.length; i += BATCH_SIZE) {
        const batch = rows.slice(i, i + BATCH_SIZE);
        const dbRows = batch.map((row) => ({
          name: row.name,
          initials: deriveInitials(row.name),
          emails: row.emails,
          primary_email_index: 0,
          cpf: row.cpf || null,
          phone: row.phone || null,
          status: row.status || "Ativo",
          patrimony: row.patrimony,
          client_since: row.clientSince || new Date().toISOString(),
          foundation_code: row.foundationCode || null,
          address: row.address || {
            street: "",
            complement: "",
            neighborhood: "",
            city: "",
            state: "",
            zipCode: "",
          },
          owner_id: currentUser?.id ?? null,
        }));

        const { data, error: insertError } = await supabase
          .from("clients")
          .insert(dbRows)
          .select("id");

        if (insertError) {
          errors.push(`Lote ${Math.floor(i / BATCH_SIZE) + 1}: ${insertError.message}`);
        } else {
          inserted += data?.length || 0;
        }
      }

      // Refresh all clients after import
      await fetchClients();
      setDataVersion((v) => v + 1);

      return { inserted, errors };
    },
    [currentUser, fetchClients],
  );

  const contextValue = useMemo(
    () => ({
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
      updateClientPeculiarities,
      updateClientMonthlyMeetingDisabled,
      addClientMeeting,
      updateClientMeeting,
      deleteClientMeeting,
      bulkInsertClients,
      dataVersion,
    }),
    [
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
      updateClientPeculiarities,
      updateClientMonthlyMeetingDisabled,
      addClientMeeting,
      updateClientMeeting,
      deleteClientMeeting,
      bulkInsertClients,
      dataVersion,
    ],
  );

  return <ClientsContext.Provider value={contextValue}>{children}</ClientsContext.Provider>;
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
