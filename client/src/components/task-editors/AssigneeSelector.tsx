import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Check, Plus, X, User, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { MOCK_RESPONSIBLES } from "@/lib/mock-users";

interface AssigneeSelectorProps {
  selectedAssignees: string[];
  onSelect: (assignee: string) => void;
  onRemove: (assignee: string) => void;
}

export function AssigneeSelector({ selectedAssignees, onSelect, onRemove }: AssigneeSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  
  const availableConsultants = MOCK_RESPONSIBLES.filter(consultant =>
    consultant.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
    !selectedAssignees.includes(consultant.name)
  );
  
  const selectedConsultants = MOCK_RESPONSIBLES.filter(consultant =>
    selectedAssignees.includes(consultant.name)
  );
  
  return (
    <div className="w-full">
      <div className="px-3 py-2.5 border-b border-[#2a2a2a]">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar consultor..."
          className="bg-transparent border-0 text-sm text-gray-400 placeholder:text-gray-500 focus-visible:ring-0 p-0 h-auto"
          onClick={(e) => e.stopPropagation()}
          data-testid="input-search-assignee"
        />
      </div>
      
      {selectedConsultants.length > 0 && (
        <div className="border-b border-[#2a2a2a]">
          <div className="px-3 py-1.5 text-xs text-gray-500">
            {selectedConsultants.length} selecionado{selectedConsultants.length > 1 ? 's' : ''}
          </div>
          {selectedConsultants.map((consultant) => (
            <div 
              key={consultant.id}
              className="px-3 py-1"
            >
              <div 
                className="flex items-center gap-2 px-2 py-1.5 cursor-pointer bg-[#2a2a2a] rounded-md group"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(consultant.name);
                }}
              >
                <Avatar className="w-5 h-5 shrink-0">
                  <AvatarFallback className={cn("text-[9px] font-normal text-white", consultant.grayColor)}>
                    {consultant.initials}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-foreground flex-1">{consultant.name}</span>
                <X className="w-3 h-3 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="px-3 py-1.5 text-xs text-gray-500">
        {selectedConsultants.length > 0 ? 'Adicionar mais' : 'Consultores disponíveis'}
      </div>
      
      <div 
        className="max-h-52 overflow-y-auto scrollbar-thin"
        onWheel={(e) => {
          e.stopPropagation();
          e.currentTarget.scrollTop += e.deltaY;
        }}
      >
        {availableConsultants.map((consultant) => (
          <div
            key={consultant.id}
            className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#2a2a2a] transition-colors group"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(consultant.name);
            }}
            data-testid={`option-assignee-${consultant.id}`}
          >
            <Avatar className="w-5 h-5 shrink-0">
              <AvatarFallback className={cn("text-[9px] font-normal text-white", consultant.grayColor)}>
                {consultant.initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-foreground flex-1">{consultant.name}</span>
            <Plus className="w-4 h-4 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        ))}
        {availableConsultants.length === 0 && (
          <div className="px-3 py-4 text-sm text-gray-500 text-center">
            {searchQuery ? 'Nenhum consultor encontrado' : 'Todos os consultores já foram selecionados'}
          </div>
        )}
      </div>
    </div>
  );
}

interface ContextMenuAssigneeEditorProps {
  currentAssignees: string[];
  onAdd: (assignee: string) => void;
  onRemove: (assignee: string) => void;
  onSetSingle?: (assignee: string) => void;
  isBulk?: boolean;
}

export function ContextMenuAssigneeEditor({ 
  currentAssignees, 
  onAdd, 
  onRemove, 
  onSetSingle, 
  isBulk = false 
}: ContextMenuAssigneeEditorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSetSingle, setShowSetSingle] = useState(false);
  const [localAssignees, setLocalAssignees] = useState<string[]>(currentAssignees || []);
  const isLocalUpdate = useRef(false);
  const pendingUpdatesRef = useRef<{type: 'add' | 'remove' | 'setSingle', value: string}[]>([]);
  const flushTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prevCurrentAssigneesRef = useRef(currentAssignees);
  
  useEffect(() => {
    const propsKey = (currentAssignees || []).join(',');
    const prevKey = (prevCurrentAssigneesRef.current || []).join(',');
    
    if (prevKey !== propsKey && !isLocalUpdate.current) {
      setLocalAssignees(currentAssignees || []);
    }
    prevCurrentAssigneesRef.current = currentAssignees;
    isLocalUpdate.current = false;
  }, [currentAssignees]);
  
  const availableConsultants = MOCK_RESPONSIBLES.filter(consultant =>
    consultant.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
    !localAssignees.includes(consultant.name)
  );
  
  const selectedConsultants = MOCK_RESPONSIBLES.filter(consultant =>
    localAssignees.includes(consultant.name)
  );
  
  const filteredForSetSingle = MOCK_RESPONSIBLES.filter(consultant =>
    consultant.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const flushPendingUpdates = () => {
    if (flushTimeoutRef.current) {
      clearTimeout(flushTimeoutRef.current);
    }
    flushTimeoutRef.current = setTimeout(() => {
      const updates = [...pendingUpdatesRef.current];
      pendingUpdatesRef.current = [];
      
      updates.forEach(update => {
        try {
          if (update.type === 'add') {
            onAdd(update.value);
          } else if (update.type === 'remove') {
            onRemove(update.value);
          } else if (update.type === 'setSingle' && onSetSingle) {
            onSetSingle(update.value);
          }
        } catch (e) {
          // Silently ignore errors
        }
      });
    }, 100);
  };
  
  const handleLocalAdd = (assignee: string) => {
    if (!localAssignees.includes(assignee)) {
      isLocalUpdate.current = true;
      setLocalAssignees(prev => [...prev, assignee]);
      pendingUpdatesRef.current.push({ type: 'add', value: assignee });
      flushPendingUpdates();
    }
  };
  
  const handleLocalRemove = (assignee: string) => {
    isLocalUpdate.current = true;
    setLocalAssignees(prev => prev.filter(a => a !== assignee));
    pendingUpdatesRef.current.push({ type: 'remove', value: assignee });
    flushPendingUpdates();
  };
  
  const handleLocalSetSingle = (assignee: string) => {
    isLocalUpdate.current = true;
    setLocalAssignees([assignee]);
    if (onSetSingle) {
      pendingUpdatesRef.current.push({ type: 'setSingle', value: assignee });
      flushPendingUpdates();
    }
  };
  
  if (showSetSingle && isBulk && onSetSingle) {
    return (
      <div className="w-64">
        <div className="px-3 py-2.5 border-b border-[#2a2a2a]">
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowSetSingle(false);
                setSearchQuery("");
              }}
              className="text-gray-500 hover:text-gray-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar consultor..."
              className="bg-transparent border-0 text-sm text-gray-400 placeholder:text-gray-500 focus-visible:ring-0 p-0 h-auto"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              autoFocus
            />
          </div>
        </div>
        <div className="px-3 py-1.5 text-xs text-gray-500">
          Substituir todos por
        </div>
        <div 
          className="max-h-52 overflow-y-auto scrollbar-thin"
          onWheel={(e) => {
            e.stopPropagation();
            e.currentTarget.scrollTop += e.deltaY;
          }}
        >
          {filteredForSetSingle.map((consultant) => (
            <div
              key={consultant.id}
              className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#2a2a2a] transition-colors group"
              onClick={(e) => {
                e.stopPropagation();
                handleLocalSetSingle(consultant.name);
              }}
            >
              <Avatar className="w-5 h-5 shrink-0">
                <AvatarFallback className={cn("text-[9px] font-normal text-white", consultant.grayColor)}>
                  {consultant.initials}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-foreground flex-1">{consultant.name}</span>
              <User className="w-4 h-4 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
          {filteredForSetSingle.length === 0 && (
            <div className="px-3 py-4 text-sm text-gray-500 text-center">
              Nenhum consultor encontrado
            </div>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-64">
      <div className="px-3 py-2.5 border-b border-[#2a2a2a]">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar consultor..."
          className="bg-transparent border-0 text-sm text-gray-400 placeholder:text-gray-500 focus-visible:ring-0 p-0 h-auto"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          autoFocus
        />
      </div>
      
      {isBulk && onSetSingle && (
        <div 
          className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#2a2a2a] transition-colors border-b border-[#2a2a2a]"
          onClick={(e) => {
            e.stopPropagation();
            setShowSetSingle(true);
            setSearchQuery("");
          }}
        >
          <User className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-foreground">Definir único responsável</span>
          <ChevronRight className="w-4 h-4 text-gray-500 ml-auto" />
        </div>
      )}
      
      {selectedConsultants.length > 0 && (
        <div className="border-b border-[#2a2a2a]">
          <div className="px-3 py-1.5 text-xs text-gray-500">
            {localAssignees.length} selecionado{localAssignees.length > 1 ? 's' : ''}
          </div>
          {selectedConsultants.map((consultant) => (
            <div 
              key={consultant.id}
              className="px-3 py-1"
            >
              <div 
                className="flex items-center gap-2 px-2 py-1.5 cursor-pointer bg-[#2a2a2a] rounded-md group"
                onClick={(e) => {
                  e.stopPropagation();
                  handleLocalRemove(consultant.name);
                }}
              >
                <Avatar className="w-5 h-5 shrink-0">
                  <AvatarFallback className={cn("text-[9px] font-normal text-white", consultant.grayColor)}>
                    {consultant.initials}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-foreground flex-1">{consultant.name}</span>
                <X className="w-3 h-3 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="px-3 py-1.5 text-xs text-gray-500">
        {localAssignees.length > 0 ? 'Adicionar mais' : 'Consultores disponíveis'}
      </div>
      
      <div 
        className="max-h-52 overflow-y-auto scrollbar-thin"
        onWheel={(e) => {
          e.stopPropagation();
          e.currentTarget.scrollTop += e.deltaY;
        }}
      >
        {availableConsultants.map((consultant) => (
          <div
            key={consultant.id}
            className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#2a2a2a] transition-colors group"
            onClick={(e) => {
              e.stopPropagation();
              handleLocalAdd(consultant.name);
            }}
          >
            <Avatar className="w-5 h-5 shrink-0">
              <AvatarFallback className={cn("text-[9px] font-normal text-white", consultant.grayColor)}>
                {consultant.initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-foreground flex-1">{consultant.name}</span>
            <Plus className="w-4 h-4 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        ))}
        {availableConsultants.length === 0 && (
          <div className="px-3 py-4 text-sm text-gray-500 text-center">
            {searchQuery ? 'Nenhum consultor encontrado' : 'Todos os consultores já foram selecionados'}
          </div>
        )}
      </div>
    </div>
  );
}
