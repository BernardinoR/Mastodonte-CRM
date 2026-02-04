import { useState, useRef, useEffect } from "react";
import { Input } from "@/shared/components/ui/input";
import { Check, Plus, User } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useClients } from "@features/clients";

interface ClientSelectorProps {
  selectedClient: string | null;
  onSelect: (clientId: string, clientName: string) => void;
}

export function ClientSelector({ selectedClient, onSelect }: ClientSelectorProps) {
  const { clients } = useClients();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      client.name !== selectedClient,
  );

  return (
    <div className="w-full">
      <div className="border-b border-[#3a3a3a] px-3 py-2.5">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Vincule ou crie uma página..."
          className="h-auto border-0 bg-transparent p-0 text-sm text-gray-400 placeholder:text-gray-500 focus-visible:ring-0"
          onClick={(e) => e.stopPropagation()}
          data-testid="input-search-client"
        />
      </div>

      {selectedClient && (
        <div className="border-b border-[#3a3a3a]">
          <div className="px-3 py-1.5 text-xs text-gray-500">Cliente selecionado</div>
          <div className="px-3 py-1">
            <div
              className="flex cursor-pointer items-center gap-2 rounded-md bg-[#2a2a2a] px-2 py-1.5"
              onClick={(e) => {
                e.stopPropagation();
                const client = clients.find((c) => c.name === selectedClient);
                if (client) {
                  onSelect(client.id, client.name);
                }
              }}
            >
              <Check className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-foreground">{selectedClient}</span>
            </div>
          </div>
        </div>
      )}

      <div className="px-3 py-1.5 text-xs text-gray-500">Selecione mais</div>

      <div className="max-h-52 overflow-y-auto" onWheel={(e) => e.stopPropagation()}>
        {filteredClients.map((client, index) => (
          <div
            key={client.id}
            className="group flex cursor-pointer items-center gap-2 px-3 py-2 transition-colors hover:bg-[#2a2a2a]"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(client.id, client.name);
            }}
            data-testid={`option-client-${index}`}
          >
            <User className="h-4 w-4 text-gray-500" />
            <span className="flex-1 text-sm text-foreground">{client.name}</span>
            <Plus className="h-4 w-4 text-gray-500 opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
        ))}
        {filteredClients.length === 0 && (
          <div className="px-3 py-4 text-center text-sm text-gray-500">
            Nenhum cliente encontrado
          </div>
        )}
      </div>
    </div>
  );
}

interface ContextMenuClientEditorProps {
  currentClient: string | null;
  onSelect: (client: string) => void;
  isBulk?: boolean;
}

export function ContextMenuClientEditor({
  currentClient,
  onSelect,
  isBulk = false,
}: ContextMenuClientEditorProps) {
  const { clients } = useClients();
  const [searchQuery, setSearchQuery] = useState("");
  const [localClient, setLocalClient] = useState<string | null>(currentClient);
  const isLocalUpdate = useRef(false);
  const isMountedRef = useRef(true);
  const pendingUpdatesRef = useRef<string[]>([]);
  const flushTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prevCurrentClientRef = useRef(currentClient);

  useEffect(() => {
    if (prevCurrentClientRef.current !== currentClient && !isLocalUpdate.current) {
      setLocalClient(currentClient);
    }
    prevCurrentClientRef.current = currentClient;
    isLocalUpdate.current = false;
  }, [currentClient]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (flushTimeoutRef.current) {
        clearTimeout(flushTimeoutRef.current);
      }
    };
  }, []);

  const flushPendingUpdates = () => {
    if (flushTimeoutRef.current) {
      clearTimeout(flushTimeoutRef.current);
    }
    flushTimeoutRef.current = setTimeout(() => {
      if (!isMountedRef.current) return;

      const updates = [...pendingUpdatesRef.current];
      pendingUpdatesRef.current = [];

      if (updates.length > 0) {
        const lastUpdate = updates[updates.length - 1];
        try {
          onSelect(lastUpdate);
        } catch (e) {
          // Silently ignore errors
        }
      }
    }, 100);
  };

  const handleLocalSelect = (clientName: string) => {
    isLocalUpdate.current = true;
    setLocalClient(clientName);
    pendingUpdatesRef.current.push(clientName);
    flushPendingUpdates();
  };

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="w-64">
      <div className="border-b border-[#3a3a3a] px-3 py-2.5">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar cliente..."
          className="h-auto border-0 bg-transparent p-0 text-sm text-gray-400 placeholder:text-gray-500 focus-visible:ring-0"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          autoFocus
          data-testid="input-search-client-context"
        />
      </div>

      {!isBulk && localClient && (
        <div className="border-b border-[#3a3a3a]">
          <div className="px-3 py-1.5 text-xs text-gray-500">Cliente atual</div>
          <div className="px-3 py-1">
            <div className="flex items-center gap-2 rounded-md bg-[#2a2a2a] px-2 py-1.5">
              <Check className="h-4 w-4 text-gray-400" />
              <span className="truncate text-sm text-foreground">{localClient}</span>
            </div>
          </div>
        </div>
      )}

      <div className="px-3 py-1.5 text-xs text-gray-500">
        {isBulk
          ? "Definir cliente para todos"
          : localClient
            ? "Alterar para"
            : "Selecionar cliente"}
      </div>

      <div className="max-h-52 overflow-y-auto" onWheel={(e) => e.stopPropagation()}>
        {filteredClients.map((client, index) => {
          const isCurrentClient = client.name === localClient;
          return (
            <div
              key={client.id}
              className={cn(
                "group flex cursor-pointer items-center gap-2 px-3 py-2 transition-colors",
                isCurrentClient ? "bg-[#2a2a2a]" : "hover:bg-[#2a2a2a]",
              )}
              onClick={(e) => {
                e.stopPropagation();
                handleLocalSelect(client.name);
              }}
              data-testid={`context-option-client-${index}`}
            >
              <User className="h-4 w-4 text-gray-500" />
              <span className="flex-1 truncate text-sm text-foreground">{client.name}</span>
              {isCurrentClient ? (
                <Check className="h-4 w-4 text-gray-400" />
              ) : (
                <Plus className="h-4 w-4 text-gray-500 opacity-0 transition-opacity group-hover:opacity-100" />
              )}
            </div>
          );
        })}
        {filteredClients.length === 0 && (
          <div className="px-3 py-4 text-center text-sm text-gray-500">
            Nenhum cliente encontrado
          </div>
        )}
      </div>
    </div>
  );
}
