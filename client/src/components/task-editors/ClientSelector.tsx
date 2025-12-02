import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Check, Plus, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { MOCK_CLIENTS } from "@/lib/mock-data";

interface ClientSelectorProps {
  selectedClient: string | null;
  onSelect: (client: string) => void;
}

export function ClientSelector({ selectedClient, onSelect }: ClientSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredClients = MOCK_CLIENTS.filter(client =>
    client.toLowerCase().includes(searchQuery.toLowerCase()) && client !== selectedClient
  );
  
  return (
    <div className="w-full">
      <div className="px-3 py-2.5 border-b border-[#2a2a2a]">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Vincule ou crie uma página..."
          className="bg-transparent border-0 text-sm text-gray-400 placeholder:text-gray-500 focus-visible:ring-0 p-0 h-auto"
          onClick={(e) => e.stopPropagation()}
          data-testid="input-search-client"
        />
      </div>
      
      {selectedClient && (
        <div className="border-b border-[#2a2a2a]">
          <div className="px-3 py-1.5 text-xs text-gray-500">
            Cliente selecionado
          </div>
          <div className="px-3 py-1">
            <div 
              className="flex items-center gap-2 px-2 py-1.5 cursor-pointer bg-[#2a2a2a] rounded-md"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(selectedClient);
              }}
            >
              <Check className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-foreground">{selectedClient}</span>
            </div>
          </div>
        </div>
      )}
      
      <div className="px-3 py-1.5 text-xs text-gray-500">
        Selecione mais
      </div>
      
      <div 
        className="max-h-52 overflow-y-auto"
        onWheel={(e) => e.stopPropagation()}
      >
        {filteredClients.map((client, index) => (
          <div
            key={client}
            className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#2a2a2a] transition-colors group"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(client);
            }}
            data-testid={`option-client-${index}`}
          >
            <User className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-foreground flex-1">{client}</span>
            <Plus className="w-4 h-4 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        ))}
        {filteredClients.length === 0 && (
          <div className="px-3 py-4 text-sm text-gray-500 text-center">
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

export function ContextMenuClientEditor({ currentClient, onSelect, isBulk = false }: ContextMenuClientEditorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [localClient, setLocalClient] = useState<string | null>(() => currentClient);
  const isLocalUpdate = useRef(false);
  const isMountedRef = useRef(true);
  const pendingUpdatesRef = useRef<string[]>([]);
  const flushTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    if (!isLocalUpdate.current) {
      if (localClient !== currentClient) {
        setLocalClient(currentClient);
      }
    }
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
  
  const handleLocalSelect = (client: string) => {
    isLocalUpdate.current = true;
    setLocalClient(client);
    pendingUpdatesRef.current.push(client);
    flushPendingUpdates();
  };
  
  const filteredClients = MOCK_CLIENTS.filter(client =>
    client.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="w-64">
      <div className="px-3 py-2.5 border-b border-[#2a2a2a]">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar cliente..."
          className="bg-transparent border-0 text-sm text-gray-400 placeholder:text-gray-500 focus-visible:ring-0 p-0 h-auto"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          autoFocus
          data-testid="input-search-client-context"
        />
      </div>
      
      {!isBulk && localClient && (
        <div className="border-b border-[#2a2a2a]">
          <div className="px-3 py-1.5 text-xs text-gray-500">
            Cliente atual
          </div>
          <div className="px-3 py-1">
            <div className="flex items-center gap-2 px-2 py-1.5 bg-[#2a2a2a] rounded-md">
              <Check className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-foreground truncate">{localClient}</span>
            </div>
          </div>
        </div>
      )}
      
      <div className="px-3 py-1.5 text-xs text-gray-500">
        {isBulk ? 'Definir cliente para todos' : (localClient ? 'Alterar para' : 'Selecionar cliente')}
      </div>
      
      <div 
        className="max-h-52 overflow-y-auto"
        onWheel={(e) => e.stopPropagation()}
      >
        {filteredClients.map((client, index) => {
          const isCurrentClient = client === localClient;
          return (
            <div
              key={client}
              className={cn(
                "flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors group",
                isCurrentClient ? "bg-[#2a2a2a]" : "hover:bg-[#2a2a2a]"
              )}
              onClick={(e) => {
                e.stopPropagation();
                handleLocalSelect(client);
              }}
              data-testid={`context-option-client-${index}`}
            >
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-foreground flex-1 truncate">{client}</span>
              {isCurrentClient ? (
                <Check className="w-4 h-4 text-gray-400" />
              ) : (
                <Plus className="w-4 h-4 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </div>
          );
        })}
        {filteredClients.length === 0 && (
          <div className="px-3 py-4 text-sm text-gray-500 text-center">
            Nenhum cliente encontrado
          </div>
        )}
      </div>
    </div>
  );
}
