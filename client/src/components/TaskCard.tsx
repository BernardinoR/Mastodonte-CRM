import { useState, useRef, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DateInput } from "@/components/ui/date-input";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Calendar as CalendarIcon,
  Pencil,
  Trash2,
  Check,
  Plus,
  X,
  Search,
  User,
  AlertTriangle,
  Circle,
  CheckCircle2,
  Users,
  Type,
  Briefcase,
  UserPlus,
  PenLine,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, startOfDay, isBefore, parse, isValid, setYear } from "date-fns";
import { ptBR } from "date-fns/locale";
import { parseLocalDate, formatLocalDate } from "@/lib/date-utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MOCK_USERS, MOCK_RESPONSIBLES } from "@/lib/mock-users";

type TaskStatus = "To Do" | "In Progress" | "Done";
type TaskPriority = "Urgente" | "Importante" | "Normal" | "Baixa";

interface TaskCardProps {
  id: string;
  title: string;
  clientName?: string;
  priority?: TaskPriority;
  status: TaskStatus;
  assignees: string[];
  dueDate: Date;
  description?: string;
  notes?: string[];
  isSelected?: boolean;
  selectedCount?: number;
  isDragActive?: boolean;
  onSelect?: (taskId: string, shiftKey: boolean, ctrlKey: boolean) => void;
  onUpdate: (taskId: string, updates: any) => void;
  onDelete: (taskId: string) => void;
  onBulkUpdate?: (updates: any) => void;
  onBulkDelete?: () => void;
  onBulkAppendTitle?: (suffix: string) => void;
  onBulkReplaceTitle?: (newTitle: string) => void;
  onBulkAddAssignee?: (assignee: string) => void;
  onBulkSetAssignees?: (assignees: string[]) => void;
  onBulkRemoveAssignee?: (assignee: string) => void;
}

// Global flag to prevent click events after closing edit mode
let globalJustClosedEdit = false;

// Mock clients list
const MOCK_CLIENTS = [
  "Fernanda Carolina De Faria",
  "Marcos Roberto Neves Monteiro",
  "Luciene Della Libera",
  "Marco Alexandre Rodrigues Oliveira",
  "Erick Soares De Oliveira",
  "João Pedro Zanetti De Carvalho",
  "Iatan Oliveira Cardoso dos Reis",
  "Rafael Bernardino Silveira",
  "Ademar João Gréguer",
  "Gustavo Samconi Soares",
  "Israel Schuster Da Fonseca",
  "Marcia Mozzato Ciampi De Andrade",
];

// ClientSelector Component
interface ClientSelectorProps {
  selectedClient: string | null;
  onSelect: (client: string) => void;
}

function ClientSelector({ selectedClient, onSelect }: ClientSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredClients = MOCK_CLIENTS.filter(client =>
    client.toLowerCase().includes(searchQuery.toLowerCase()) && client !== selectedClient
  );
  
  return (
    <div className="w-full">
      {/* Search bar */}
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
      
      {/* Selected client section */}
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
      
      {/* "Selecione mais" label */}
      <div className="px-3 py-1.5 text-xs text-gray-500">
        Selecione mais
      </div>
      
      {/* Client list with gray scrollbar */}
      <div className="max-h-52 overflow-y-auto scrollbar-thin">
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

// ContextMenuClientEditor Component - Client selector for context menu with search
interface ContextMenuClientEditorProps {
  currentClient: string | null;
  onSelect: (client: string) => void;
  isBulk?: boolean;
}

function ContextMenuClientEditor({ currentClient, onSelect, isBulk = false }: ContextMenuClientEditorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Keep LOCAL state to avoid re-render issues with Radix UI
  const [localClient, setLocalClient] = useState<string | null>(() => currentClient);
  
  // Track if we're currently processing a local update to avoid sync conflicts
  const isLocalUpdate = useRef(false);
  
  // Track if component is mounted to avoid calling callbacks after unmount
  const isMountedRef = useRef(true);
  
  // Sync local state when props change from external sources
  useEffect(() => {
    if (!isLocalUpdate.current) {
      if (localClient !== currentClient) {
        setLocalClient(currentClient);
      }
    }
    isLocalUpdate.current = false;
  }, [currentClient]);
  
  // Queue to batch external updates (using array like ContextMenuAssigneeEditor)
  const pendingUpdatesRef = useRef<string[]>([]);
  const flushTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (flushTimeoutRef.current) {
        clearTimeout(flushTimeoutRef.current);
      }
    };
  }, []);
  
  // Flush pending updates with a safe delay
  const flushPendingUpdates = () => {
    if (flushTimeoutRef.current) {
      clearTimeout(flushTimeoutRef.current);
    }
    flushTimeoutRef.current = setTimeout(() => {
      if (!isMountedRef.current) return;
      
      const updates = [...pendingUpdatesRef.current];
      pendingUpdatesRef.current = [];
      
      // Process all pending updates - only the last one matters for client
      if (updates.length > 0) {
        const lastUpdate = updates[updates.length - 1];
        try {
          onSelect(lastUpdate);
        } catch (e) {
          // Silently ignore errors to prevent Radix UI conflicts
        }
      }
    }, 100);
  };
  
  // Handle select with local state update first
  const handleLocalSelect = (client: string) => {
    isLocalUpdate.current = true;
    setLocalClient(client);
    // Queue the external callback
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
      
      {/* Selected client section (only in single mode) */}
      {!isBulk && localClient && (
        <div className="border-b border-[#2a2a2a]">
          <div className="px-3 py-1.5 text-xs text-gray-500">
            Cliente atual
          </div>
          <div className="px-3 py-1">
            <div 
              className="flex items-center gap-2 px-2 py-1.5 bg-[#2a2a2a] rounded-md"
            >
              <Check className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-foreground truncate">{localClient}</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Label */}
      <div className="px-3 py-1.5 text-xs text-gray-500">
        {isBulk ? 'Definir cliente para todos' : (localClient ? 'Alterar para' : 'Selecionar cliente')}
      </div>
      
      {/* Client list with scrollbar */}
      <div className="max-h-52 overflow-y-auto scrollbar-thin">
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

// ContextMenuDateEditor Component - Date editor for context menu with input and calendar
interface ContextMenuDateEditorProps {
  currentDate: string;
  onSelect: (date: string) => void;
  isBulk?: boolean;
}

function ContextMenuDateEditor({ currentDate, onSelect, isBulk = false }: ContextMenuDateEditorProps) {
  const [inputValue, setInputValue] = useState(() => {
    const dateValue = parseLocalDate(currentDate);
    return dateValue && isValid(dateValue) ? format(dateValue, "dd/MM/yyyy", { locale: ptBR }) : "";
  });
  const [isInvalid, setIsInvalid] = useState(false);
  const [displayMonth, setDisplayMonth] = useState<Date>(() => {
    const dateValue = parseLocalDate(currentDate);
    return dateValue && isValid(dateValue) ? dateValue : new Date();
  });
  
  // Track if we're currently processing a local update to avoid sync conflicts
  const isLocalUpdate = useRef(false);
  
  // Track if component is mounted to avoid calling callbacks after unmount
  const isMountedRef = useRef(true);
  
  // Queue to batch external updates
  const pendingUpdatesRef = useRef<string[]>([]);
  const flushTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Sync local state when props change from external sources
  useEffect(() => {
    if (!isLocalUpdate.current) {
      const dateValue = parseLocalDate(currentDate);
      if (dateValue && isValid(dateValue)) {
        const newInputValue = format(dateValue, "dd/MM/yyyy", { locale: ptBR });
        if (inputValue !== newInputValue) {
          setInputValue(newInputValue);
          setDisplayMonth(dateValue);
          // Clear any pending updates when props change externally
          pendingUpdatesRef.current = [];
        }
      }
    }
    isLocalUpdate.current = false;
  }, [currentDate]);
  
  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (flushTimeoutRef.current) {
        clearTimeout(flushTimeoutRef.current);
      }
    };
  }, []);
  
  // Flush pending updates with a safe delay
  const flushPendingUpdates = () => {
    if (flushTimeoutRef.current) {
      clearTimeout(flushTimeoutRef.current);
    }
    flushTimeoutRef.current = setTimeout(() => {
      if (!isMountedRef.current) return;
      
      const updates = [...pendingUpdatesRef.current];
      pendingUpdatesRef.current = [];
      
      // Process all pending updates - only the last one matters for date
      if (updates.length > 0) {
        const lastUpdate = updates[updates.length - 1];
        try {
          onSelect(lastUpdate);
        } catch (e) {
          // Silently ignore errors to prevent Radix UI conflicts
        }
      }
    }, 100);
  };
  
  // Parse date from input string with flexible formats
  const parseDate = (input: string): Date | null => {
    let cleaned = input.replace(/[^\d\/\-\.]/g, "");
    cleaned = cleaned.replace(/[\/\-\.]+$/, "");
    
    const formats = [
      "dd/MM/yyyy",
      "dd/MM/yy",
      "dd/MM",
      "dd-MM-yyyy", 
      "dd-MM-yy",
      "dd-MM",
      "dd.MM.yyyy",
      "dd.MM.yy",
      "dd.MM",
      "d/M/yyyy",
      "d/M/yy",
      "d/M",
    ];

    for (const formatString of formats) {
      try {
        let parsed = parse(cleaned, formatString, new Date(), { locale: ptBR });
        
        if (formatString.indexOf("yyyy") === -1 && formatString.indexOf("yy") === -1) {
          parsed = setYear(parsed, new Date().getFullYear());
        }
        
        if (formatString.includes("yy") && !formatString.includes("yyyy")) {
          const year = parsed.getFullYear();
          if (year < 100) {
            parsed = setYear(parsed, 2000 + year);
          }
        }
        
        if (isValid(parsed)) {
          return parsed;
        }
      } catch {
        // Continue trying other formats
      }
    }

    return null;
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    const prevLength = inputValue.length;
    
    const hasDot = newValue.includes(".");
    const hasDash = newValue.includes("-");
    const hasSlash = newValue.includes("/");
    
    // Auto-format with slashes
    if (newValue.length > prevLength && !hasDot && !hasDash) {
      if (newValue.length === 2 && !hasSlash) {
        const lastChar = newValue[newValue.length - 1];
        if (lastChar !== "/" && lastChar !== "-" && lastChar !== ".") {
          newValue = newValue + "/";
        }
      }
      else if (newValue.length === 5 && newValue.split("/").length === 2) {
        const lastChar = newValue[newValue.length - 1];
        if (lastChar !== "/" && lastChar !== "-" && lastChar !== ".") {
          newValue = newValue + "/";
        }
      }
    }
    
    setInputValue(newValue);
    
    const parsed = parseDate(newValue);
    if (parsed) {
      setIsInvalid(false);
      setDisplayMonth(parsed);
    } else if (newValue.replace(/[^\d]/g, "").length >= 6) {
      setIsInvalid(true);
    } else {
      setIsInvalid(false);
    }
  };

  const handleInputBlur = () => {
    const parsed = parseDate(inputValue);
    if (parsed) {
      const formatted = format(parsed, "dd/MM/yyyy", { locale: ptBR });
      setInputValue(formatted);
      setIsInvalid(false);
      
      // Queue the external callback
      const dateString = format(parsed, "yyyy-MM-dd");
      pendingUpdatesRef.current.push(dateString);
      flushPendingUpdates();
    } else if (inputValue.trim()) {
      setIsInvalid(true);
    }
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const formatted = format(localDate, "dd/MM/yyyy", { locale: ptBR });
      setInputValue(formatted);
      setIsInvalid(false);
      
      isLocalUpdate.current = true;
      
      // Queue the external callback
      const dateString = format(localDate, "yyyy-MM-dd");
      pendingUpdatesRef.current.push(dateString);
      flushPendingUpdates();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleInputBlur();
    }
    if (e.key !== "Tab") {
      e.stopPropagation();
    }
  };

  const currentDateValue = useMemo(() => {
    const dateValue = parseLocalDate(currentDate);
    return dateValue && isValid(dateValue) ? dateValue : undefined;
  }, [currentDate]);

  return (
    <div className="w-auto">
      <div className="p-3 border-b border-[#2a2a2a]">
        {isBulk && (
          <div className="text-xs text-gray-500 mb-2 text-center">
            Definir data para todos
          </div>
        )}
        <Input
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder="DD/MM/YYYY"
          className={cn(
            "text-center text-sm font-medium",
            "bg-[#0a0a0a] border-[#2a2a2a]",
            "text-white placeholder:text-gray-500",
            "focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500",
            isInvalid && "border-red-500 focus-visible:ring-red-500"
          )}
          onClick={(e) => e.stopPropagation()}
          onKeyDownCapture={(e) => e.stopPropagation()}
          autoFocus
          data-testid="input-date-context"
        />
        {isInvalid && (
          <span className="text-xs text-red-400 block mt-2 text-center">
            Data inválida
          </span>
        )}
      </div>
      <Calendar
        mode="single"
        selected={currentDateValue}
        onSelect={handleCalendarSelect}
        month={displayMonth}
        onMonthChange={setDisplayMonth}
        locale={ptBR}
        className="rounded-b-lg"
      />
    </div>
  );
}

// AssigneeSelector Component - Multi-select for consultants
interface AssigneeSelectorProps {
  selectedAssignees: string[];
  onSelect: (assignee: string) => void;
  onRemove: (assignee: string) => void;
}

function AssigneeSelector({ selectedAssignees, onSelect, onRemove }: AssigneeSelectorProps) {
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
      {/* Search bar */}
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
      
      {/* Selected assignees section */}
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
      
      {/* "Selecione mais" label */}
      <div className="px-3 py-1.5 text-xs text-gray-500">
        {selectedConsultants.length > 0 ? 'Adicionar mais' : 'Consultores disponíveis'}
      </div>
      
      {/* Consultant list with gray scrollbar */}
      <div className="max-h-52 overflow-y-auto scrollbar-thin">
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

// ContextMenuAssigneeEditor Component - Full editor for context menu (same style as popover)
interface ContextMenuAssigneeEditorProps {
  currentAssignees: string[];
  onAdd: (assignee: string) => void;
  onRemove: (assignee: string) => void;
  onSetSingle?: (assignee: string) => void;
  isBulk?: boolean;
}

function ContextMenuAssigneeEditor({ currentAssignees, onAdd, onRemove, onSetSingle, isBulk = false }: ContextMenuAssigneeEditorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSetSingle, setShowSetSingle] = useState(false);
  
  // Keep LOCAL state to avoid re-render issues with Radix UI
  // Initialize once and manage internally during the editing session
  const [localAssignees, setLocalAssignees] = useState<string[]>(() => currentAssignees || []);
  
  // Track if we're currently processing a local update to avoid sync conflicts
  const isLocalUpdate = useRef(false);
  
  // Sync local state when props change from external sources (undo/redo, other updates)
  // But skip sync if we just made a local update
  useEffect(() => {
    if (!isLocalUpdate.current) {
      const propsAssignees = currentAssignees || [];
      const localKey = localAssignees.join(',');
      const propsKey = propsAssignees.join(',');
      if (localKey !== propsKey) {
        setLocalAssignees(propsAssignees);
      }
    }
    isLocalUpdate.current = false;
  }, [currentAssignees]);
  
  // Use local state for filtering, not props
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
  
  // Queue to batch external updates
  const pendingUpdatesRef = useRef<{type: 'add' | 'remove' | 'setSingle', value: string}[]>([]);
  const flushTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Flush pending updates with a safe delay
  const flushPendingUpdates = () => {
    if (flushTimeoutRef.current) {
      clearTimeout(flushTimeoutRef.current);
    }
    flushTimeoutRef.current = setTimeout(() => {
      const updates = [...pendingUpdatesRef.current];
      pendingUpdatesRef.current = [];
      
      // Process all pending updates in a single batch
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
          // Silently ignore errors to prevent Radix UI conflicts
        }
      });
    }, 100);
  };
  
  // Handle add with local state update first
  const handleLocalAdd = (assignee: string) => {
    if (!localAssignees.includes(assignee)) {
      isLocalUpdate.current = true;
      setLocalAssignees(prev => [...prev, assignee]);
      // Queue the external callback
      pendingUpdatesRef.current.push({ type: 'add', value: assignee });
      flushPendingUpdates();
    }
  };
  
  // Handle remove with local state update first
  const handleLocalRemove = (assignee: string) => {
    isLocalUpdate.current = true;
    setLocalAssignees(prev => prev.filter(a => a !== assignee));
    // Queue the external callback
    pendingUpdatesRef.current.push({ type: 'remove', value: assignee });
    flushPendingUpdates();
  };
  
  // Handle set single with local state update first
  const handleLocalSetSingle = (assignee: string) => {
    isLocalUpdate.current = true;
    setLocalAssignees([assignee]);
    if (onSetSingle) {
      // Queue the external callback
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
        <div className="max-h-52 overflow-y-auto scrollbar-thin">
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
      
      <div className="max-h-52 overflow-y-auto scrollbar-thin">
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

export function TaskCard({
  id,
  title,
  clientName,
  priority,
  status,
  assignees,
  dueDate,
  description,
  notes,
  isSelected = false,
  selectedCount = 0,
  isDragActive = false,
  onSelect,
  onUpdate,
  onDelete,
  onBulkUpdate,
  onBulkDelete,
  onBulkAppendTitle,
  onBulkReplaceTitle,
  onBulkAddAssignee,
  onBulkSetAssignees,
  onBulkRemoveAssignee,
}: TaskCardProps) {
  const [, navigate] = useLocation();
  
  // Memoize safeAssignees to prevent infinite re-renders
  const safeAssignees = useMemo(() => {
    if (!assignees) return [];
    return Array.isArray(assignees) ? assignees : [assignees].filter(Boolean);
  }, [assignees]);
  
  // Serialize assignees for useEffect dependency (stable string comparison)
  const assigneesKey = useMemo(() => safeAssignees.join(','), [safeAssignees]);
  
  const [isEditing, setIsEditing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editedTask, setEditedTask] = useState(() => ({
    title,
    clientName: clientName || "",
    priority: priority || "",
    status,
    assignees: [...safeAssignees],
    dueDate: format(dueDate, "yyyy-MM-dd"),
    description: description || "",
  }));
  const [newNote, setNewNote] = useState("");
  const [newAssigneeName, setNewAssigneeName] = useState("");
  const [activePopover, setActivePopover] = useState<"date" | "priority" | "status" | "client" | "assignee" | null>(null);
  
  const [showReplaceTitleDialog, setShowReplaceTitleDialog] = useState(false);
  const [showAppendTitleDialog, setShowAppendTitleDialog] = useState(false);
  const [newTitleText, setNewTitleText] = useState("");
  const [appendTitleText, setAppendTitleText] = useState("");
  const [showBulkDatePicker, setShowBulkDatePicker] = useState(false);
  
  const cardRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const datePopoverContentRef = useRef<HTMLDivElement>(null);

  // Sync editedTask with props using stable dependency
  useEffect(() => {
    setEditedTask(prev => {
      const newAssignees = safeAssignees;
      const newDueDate = format(dueDate, "yyyy-MM-dd");
      
      // Only update if values actually changed
      if (
        prev.title === title &&
        prev.clientName === (clientName || "") &&
        prev.priority === (priority || "") &&
        prev.status === status &&
        prev.assignees.join(',') === newAssignees.join(',') &&
        prev.dueDate === newDueDate &&
        prev.description === (description || "")
      ) {
        return prev;
      }
      
      return {
        title,
        clientName: clientName || "",
        priority: priority || "",
        status,
        assignees: [...newAssignees],
        dueDate: newDueDate,
        description: description || "",
      };
    });
  }, [title, clientName, priority, status, assigneesKey, dueDate, description, safeAssignees]);

  const { 
    attributes, 
    listeners, 
    setNodeRef, 
    transform, 
    transition,
    isDragging 
  } = useSortable({
    id: id,
    disabled: isEditing || activePopover !== null,
  });
  
  const sortableStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const shouldHideForDrag = isDragActive && isSelected;

  const priorityColors: Record<string, string> = {
    Urgente: "bg-red-900 text-white border-red-900",
    Importante: "bg-orange-800 text-white border-orange-800",
    Normal: "bg-yellow-700 text-white border-yellow-700",
    Baixa: "bg-blue-800 text-white border-blue-800",
  };

  const statusColors: Record<string, string> = {
    "To Do": "bg-[#64635E] text-white border-[#64635E]",
    "In Progress": "bg-[rgb(64,97,145)] text-white border-[rgb(64,97,145)]",
    Done: "bg-green-800 text-white border-green-800",
  };

  const handleSave = () => {
    // Close all popovers when exiting edit mode
    setActivePopover(null);
    setIsEditing(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Check if click is inside any Radix portal using composedPath
      const path = event.composedPath();
      const isPortal = path.some((element) => {
        if (element instanceof HTMLElement) {
          return (
            // react-day-picker calendar
            (element.hasAttribute('data-radix-portal') ||
            element.hasAttribute('data-popover-portal') ||
            element.getAttribute('role') === 'dialog' ||
            element.getAttribute('role') === 'listbox' ||
            element.getAttribute('role') === 'menu' ||
            element.classList.contains('date-input-calendar-popover') ||
            // Also check for Radix Popover specific classes
            element.hasAttribute('data-radix-popper-content-wrapper') || element.classList.contains('rdp'))
          );
        }
        return false;
      });
      
      if (isEditing && cardRef.current && !cardRef.current.contains(target) && !isPortal) {
        // Set flag FIRST to prevent any card clicks in the same event cycle
        globalJustClosedEdit = true;
        setTimeout(() => {
          globalJustClosedEdit = false;
        }, 300);
        
        // Stop propagation to prevent click from reaching other elements
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        
        handleSave();
      }
    };

    if (isEditing) {
      document.addEventListener("mousedown", handleClickOutside, true);
      document.addEventListener("click", handleClickOutside, true);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside, true);
        document.removeEventListener("click", handleClickOutside, true);
      };
    }
  }, [isEditing]);

  const handleUpdate = (field: string, value: any) => {
    const updated = { ...editedTask, [field]: value };
    setEditedTask(updated);
    
    // Auto-save immediately on field change
    // Always derive the date from the updated state (not from props)
    // Parse if non-empty, otherwise use the original prop as fallback
    const parsedDueDate = updated.dueDate ? parseLocalDate(updated.dueDate) : dueDate;
    
    onUpdate(id, {
      title: updated.title,
      clientName: updated.clientName || undefined,
      priority: (updated.priority as TaskPriority) || undefined,
      status: updated.status as TaskStatus,
      assignees: updated.assignees,
      dueDate: parsedDueDate,
    });
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const getAvatarColor = (index: number): string => {
    const colors = ["bg-slate-600", "bg-slate-500", "bg-slate-400", "bg-slate-700", "bg-slate-300"];
    return colors[index % colors.length];
  };

  const handleAddAssignee = () => {
    const trimmedName = newAssigneeName.trim();
    
    // Prevent empty submissions
    if (!trimmedName) {
      return;
    }
    
    // Prevent duplicates (case-insensitive, normalized spacing)
    const isDuplicate = editedTask.assignees.some(
      existing => existing.toLowerCase().replace(/\s+/g, ' ') === trimmedName.toLowerCase().replace(/\s+/g, ' ')
    );
    
    if (isDuplicate) {
      setNewAssigneeName("");
      return;
    }
    
    handleUpdate("assignees", [...editedTask.assignees, trimmedName]);
    setNewAssigneeName("");
  };

  const handleRemoveAssignee = (assigneeToRemove: string) => {
    // Sempre manter pelo menos 1 responsável
    if (editedTask.assignees.length > 1) {
      handleUpdate("assignees", editedTask.assignees.filter(a => a !== assigneeToRemove));
    }
  };

  const handleDelete = () => {
    onDelete(id);
    setShowDeleteConfirm(false);
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      onUpdate(id, {
        notes: [...(notes || []), newNote],
      });
      setNewNote("");
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Clear any existing timeout first
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    }
    
    // Handle Shift+click or Ctrl+click for multi-selection
    if ((e.shiftKey || e.ctrlKey || e.metaKey) && onSelect) {
      e.preventDefault();
      e.stopPropagation();
      onSelect(id, e.shiftKey, e.ctrlKey || e.metaKey);
      return;
    }
    
    // Don't open modal if in edit mode
    if (isEditing) {
      return;
    }
    
    // Prevent opening details when clicking on interactive elements
    const target = e.target as HTMLElement;
    const isInteractiveElement = 
      target.closest('button') ||
      target.closest('[contenteditable]') ||
      target.closest('[role="combobox"]') ||
      target.closest('[data-radix-collection-item]');
    
    if (!isInteractiveElement && !globalJustClosedEdit) {
      // Set a timeout to open details modal only if not followed by a double click or edit mode
      clickTimeoutRef.current = setTimeout(() => {
        // Double check we're still not in edit mode when timeout fires
        if (!isEditing) {
          setShowDetails(true);
        }
        clickTimeoutRef.current = null;
      }, 250);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Clear the single click timeout to prevent modal from opening
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    }
    
    setIsEditing(true);
  };

  const handleTitleEdit = (e: React.FocusEvent<HTMLDivElement>) => {
    const newTitle = e.currentTarget.textContent || "";
    if (newTitle.trim() && newTitle !== editedTask.title) {
      handleUpdate("title", newTitle.trim());
    } else if (!newTitle.trim()) {
      // Restore original title if empty
      e.currentTarget.textContent = editedTask.title;
    }
  };


  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      handleUpdate("dueDate", format(date, "yyyy-MM-dd"));
    }
  };

  const handlePriorityChange = (value: string) => {
    handleUpdate("priority", value === "_none" ? "" : value);
    setActivePopover(null);
  };

  const handleStatusChange = (value: string) => {
    handleUpdate("status", value);
    setActivePopover(null);
  };

  const handleClientChange = (value: string) => {
    handleUpdate("clientName", value === "_none" ? "" : value);
    setActivePopover(null);
  };

  // Calculate overdue status for Card border styling
  const today = startOfDay(new Date());
  let isOverdue = false;
  
  if (isEditing) {
    // Strict format validation with regex
    const dateStr = editedTask.dueDate;
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
    
    if (dateStr && isoDateRegex.test(dateStr)) {
      const [y, m, d] = dateStr.split('-').map(Number);
      
      // Validate month (1-12) and day ranges
      if (m >= 1 && m <= 12) {
        const daysInMonth = new Date(y, m, 0).getDate();
        if (d >= 1 && d <= daysInMonth) {
          // Valid date - check if overdue
          const parsed = parseLocalDate(dateStr);
          isOverdue = isBefore(startOfDay(parsed), today);
        }
      }
    }
  } else {
    // In read-only mode, use the validated dueDate prop
    isOverdue = isBefore(startOfDay(dueDate), today);
  }


  // Context menu handlers
  const handleContextPriorityChange = (newPriority: TaskPriority) => {
    if (selectedCount > 1 && onBulkUpdate) {
      onBulkUpdate({ priority: newPriority });
    } else {
      onUpdate(id, { priority: newPriority });
    }
  };

  const handleContextStatusChange = (newStatus: TaskStatus) => {
    if (selectedCount > 1 && onBulkUpdate) {
      onBulkUpdate({ status: newStatus });
    } else {
      onUpdate(id, { status: newStatus });
    }
  };

  const handleContextDelete = () => {
    if (selectedCount > 1 && onBulkDelete) {
      onBulkDelete();
    } else {
      onDelete(id);
    }
  };

  const handleContextClientChange = (newClient: string) => {
    if (selectedCount > 1 && onBulkUpdate) {
      onBulkUpdate({ clientName: newClient });
    } else {
      onUpdate(id, { clientName: newClient });
    }
  };

  const handleContextDateChange = (newDate: Date) => {
    if (selectedCount > 1 && onBulkUpdate) {
      onBulkUpdate({ dueDate: newDate });
    } else {
      onUpdate(id, { dueDate: newDate });
    }
    setShowBulkDatePicker(false);
  };

  const handleContextAddAssignee = (assignee: string) => {
    if (selectedCount > 1 && onBulkAddAssignee) {
      onBulkAddAssignee(assignee);
    } else {
      const newAssignees = editedTask.assignees.includes(assignee) 
        ? editedTask.assignees 
        : [...editedTask.assignees, assignee];
      onUpdate(id, { assignees: newAssignees });
    }
  };

  const handleReplaceTitleSubmit = () => {
    if (!newTitleText.trim()) return;
    if (selectedCount > 1 && onBulkReplaceTitle) {
      onBulkReplaceTitle(newTitleText.trim());
    } else {
      onUpdate(id, { title: newTitleText.trim() });
    }
    setNewTitleText("");
    setShowReplaceTitleDialog(false);
  };

  const handleAppendTitleSubmit = () => {
    if (!appendTitleText.trim()) return;
    if (selectedCount > 1 && onBulkAppendTitle) {
      onBulkAppendTitle(appendTitleText.trim());
    } else {
      onUpdate(id, { title: title + appendTitleText.trim() });
    }
    setAppendTitleText("");
    setShowAppendTitleDialog(false);
  };

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div
            ref={setNodeRef}
            style={{
              ...sortableStyle,
              opacity: shouldHideForDrag ? 0 : (isDragging ? 0.5 : 1),
              pointerEvents: shouldHideForDrag ? 'none' : 'auto',
            }}
            data-task-card
            {...(!isEditing ? { ...attributes, ...listeners } : {})}
          >
            <Card
              ref={cardRef}
              className={cn(
                "group/task-card cursor-pointer transition-all hover-elevate active-elevate-2 border",
                !isEditing && "select-none",
                isEditing && "ring-2 ring-primary shadow-lg",
                isSelected && !isEditing && "ring-2 ring-blue-500 shadow-lg",
                isOverdue && "border-l-[3px] border-l-red-900 dark:border-l-red-700",
                status === "To Do" && "bg-[#262626] border-[#363636]",
                status === "In Progress" && "bg-[#243041] border-[#344151]",
                status === "Done" && "bg-green-950 border-green-900"
              )}
              onClick={handleCardClick}
              onDoubleClick={handleEditClick}
              data-testid={`card-task-${id}`}
            >
          <CardHeader className="p-4 space-y-1">
            <div className="flex items-start justify-between gap-2">
              <div
                ref={titleRef}
                contentEditable={isEditing}
                suppressContentEditableWarning
                onBlur={handleTitleEdit}
                onClick={(e) => isEditing && e.stopPropagation()}
                onKeyDown={(e) => {
                  if (isEditing && e.key === "Enter") {
                    e.preventDefault();
                    (e.target as HTMLDivElement).blur();
                  }
                }}
                className={cn(
                  "font-bold text-sm leading-tight flex-1",
                  isEditing && "cursor-text outline-none bg-[#2a2a2a] hover:bg-[#333333] rounded px-2 py-1 -mx-2 -my-1 focus:bg-[#333333] focus:ring-1 focus:ring-blue-500/50"
                )}
                data-testid={`text-tasktitle-${id}`}
              >
                {title}
              </div>
              <div className="flex gap-1">
                {isEditing && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); }}
                    data-testid={`button-delete-${id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  className={cn(
                    "h-8 w-8 shrink-0",
                    !isEditing && "opacity-0 pointer-events-none transition-opacity group-hover/task-card:opacity-100 group-hover/task-card:pointer-events-auto focus-visible:opacity-100 focus-visible:pointer-events-auto focus-visible:ring-2 focus-visible:ring-primary"
                  )}
                  onClick={isEditing ? (e) => { e.stopPropagation(); setIsEditing(false); } : handleEditClick}
                  data-testid={`button-edit-${id}`}
                >
                  {isEditing ? <Check className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <Separator className="mt-2 bg-[#64635E]" />
          </CardHeader>

          <CardContent className="p-4 pt-0 space-y-2">
              
              {/* Linha 2: Data - Always clickable */}
              <div className="flex items-center text-[10px] md:text-xs font-semibold text-foreground">
                <Popover open={activePopover === "date"} onOpenChange={(open) => setActivePopover(open ? "date" : null)}>
                  <PopoverTrigger asChild>
                    <span 
                      className="inline-flex items-center gap-1.5 font-medium cursor-pointer px-2 py-0.5 rounded-full hover:bg-gray-700/80 hover:text-foreground text-[13px]"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        if (clickTimeoutRef.current) {
                          clearTimeout(clickTimeoutRef.current);
                          clickTimeoutRef.current = null;
                        }
                      }}
                      data-testid={`text-date-${id}`}
                    >
                      <CalendarIcon className="w-3.5 h-3.5" />
                      {format(parseLocalDate(editedTask.dueDate), "dd/MM/yyyy", { locale: ptBR })}
                    </span>
                  </PopoverTrigger>
                  <PopoverContent 
                    ref={datePopoverContentRef}
                    className="w-auto p-0 bg-[#1a1a1a] border-[#2a2a2a]" 
                    side="bottom" 
                    align="start" 
                    sideOffset={6} 
                    avoidCollisions={true} 
                    collisionPadding={8}
                    onInteractOutside={(e) => {
                      const originalTarget = (e as any).detail?.originalEvent?.target as HTMLElement | null;
                      const target = originalTarget || (e.target as HTMLElement);
                      if (datePopoverContentRef.current?.contains(target) || target?.closest('.rdp')) {
                        e.preventDefault();
                      }
                    }}
                    onPointerDownOutside={(e) => {
                      const originalTarget = (e as any).detail?.originalEvent?.target as HTMLElement | null;
                      const target = originalTarget || (e.target as HTMLElement);
                      if (datePopoverContentRef.current?.contains(target) || target?.closest('.rdp')) {
                        e.preventDefault();
                      }
                    }}
                    onFocusOutside={(e) => {
                      const originalTarget = (e as any).detail?.originalEvent?.target as HTMLElement | null;
                      const target = originalTarget || (e.target as HTMLElement);
                      if (datePopoverContentRef.current?.contains(target) || target?.closest('.rdp')) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <DateInput
                      value={editedTask.dueDate}
                      onChange={(date) => {
                        handleDateChange(date);
                        setActivePopover(null);
                      }}
                      className="font-semibold"
                      dataTestId={`input-date-${id}`}
                      hideIcon
                      commitOnInput={false}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              {/* Linha 3: Cliente - Only show if has client or in edit mode */}
              {clientName ? (
                <div className={cn("flex items-center text-[10px] md:text-xs font-semibold text-foreground", isEditing && "-mx-2")}>
                  <div className={cn(
                    "inline-flex items-center gap-1",
                    isEditing ? "px-2 py-0.5 rounded-full group/edit-client hover:bg-gray-700/80" : ""
                  )}>
                    {isEditing ? (
                      <Popover open={activePopover === "client"} onOpenChange={(open) => setActivePopover(open ? "client" : null)}>
                        <PopoverTrigger asChild>
                          <span 
                            className="inline-flex items-center gap-1.5 font-medium cursor-pointer px-2 py-0.5 rounded-full hover:bg-gray-700/80 hover:text-foreground text-[13px]"
                            onClick={(e: React.MouseEvent) => {
                              e.stopPropagation();
                              if (clickTimeoutRef.current) {
                                clearTimeout(clickTimeoutRef.current);
                                clickTimeoutRef.current = null;
                              }
                            }}
                            data-testid={`text-client-${id}`}
                          >
                            {clientName}
                          </span>
                        </PopoverTrigger>
                        <PopoverContent 
                          className="w-80 p-0 bg-[#1a1a1a] border-[#2a2a2a]" 
                          side="bottom" 
                          align="start" 
                          sideOffset={6} 
                          avoidCollisions={true} 
                          collisionPadding={8}
                        >
                          <ClientSelector 
                            selectedClient={clientName || null}
                            onSelect={(client) => {
                              handleClientChange(client);
                              setActivePopover(null);
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    ) : (
                      <span 
                        className="inline-flex items-center gap-1.5 font-medium cursor-pointer px-2 py-0.5 rounded-full hover:bg-gray-700/80 hover:text-foreground text-[13px]"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          if (clickTimeoutRef.current) {
                            clearTimeout(clickTimeoutRef.current);
                            clickTimeoutRef.current = null;
                          }
                          navigate(`/clients/${encodeURIComponent(clientName)}`);
                        }}
                        data-testid={`text-client-${id}`}
                      >
                        {clientName}
                      </span>
                    )}
                    {isEditing && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-4 w-4 text-muted-foreground hover:text-foreground hidden group-hover/edit-client:inline-flex"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClientChange("_none");
                        }}
                        data-testid={`button-clear-client-${id}`}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ) : isEditing ? (
                <div className={cn("flex items-center gap-1.5 text-xs md:text-sm", isEditing && "-mx-2")}>
                  <Popover open={activePopover === "client"} onOpenChange={(open) => setActivePopover(open ? "client" : null)}>
                    <PopoverTrigger asChild>
                      <span 
                        className="inline-flex px-2 py-0.5 rounded-full cursor-pointer text-muted-foreground hover:text-foreground hover:bg-gray-700/80"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          if (clickTimeoutRef.current) {
                            clearTimeout(clickTimeoutRef.current);
                            clickTimeoutRef.current = null;
                          }
                        }}
                        data-testid={`text-client-${id}`}
                      >
                        + Adicionar Cliente
                      </span>
                    </PopoverTrigger>
                    <PopoverContent 
                      className="w-80 p-0 bg-[#1a1a1a] border-[#2a2a2a]" 
                      side="bottom" 
                      align="start" 
                      sideOffset={6} 
                      avoidCollisions={true} 
                      collisionPadding={8}
                    >
                      <ClientSelector 
                        selectedClient={null}
                        onSelect={(client) => {
                          handleClientChange(client);
                          setActivePopover(null);
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              ) : null}
              
              {/* Linha 4: Prioridade */}
              <div className={cn("flex items-center gap-1.5 text-xs md:text-sm", isEditing && "-mx-2")}>
                {/* Priority Badge - Always clickable */}
                {priority ? (
                  <div className={cn(
                    "inline-flex items-center gap-1 rounded-full",
                    isEditing ? "px-2 py-0.5 group/edit-priority hover:bg-gray-700/80" : ""
                  )}>
                    <Popover open={activePopover === "priority"} onOpenChange={(open) => setActivePopover(open ? "priority" : null)}>
                      <PopoverTrigger asChild>
                        <div
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            if (clickTimeoutRef.current) {
                              clearTimeout(clickTimeoutRef.current);
                              clickTimeoutRef.current = null;
                            }
                          }}
                        >
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-[10px] md:text-[11px] px-2 py-[2px] rounded-full cursor-pointer hover:bg-muted/50 font-normal flex items-center gap-1",
                              priorityColors[priority]
                            )}
                            data-testid={`badge-priority-${id}`}
                          >
                            <span className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              priority === "Urgente" && "bg-red-200",
                              priority === "Importante" && "bg-orange-200",
                              priority === "Normal" && "bg-yellow-200",
                              priority === "Baixa" && "bg-blue-200"
                            )} />
                            {priority}
                          </Badge>
                        </div>
                      </PopoverTrigger>
                      <PopoverContent className="w-56 p-0" side="bottom" align="start" sideOffset={6} avoidCollisions={true} collisionPadding={8}>
                        <div className="w-full">
                          {/* Selected priority section */}
                          <div className="border-b border-[#2a2a2a]">
                            <div className="px-3 py-1.5 text-xs text-gray-500">
                              Selecionado
                            </div>
                            <div className="px-3 py-1">
                              <div 
                                className="flex items-center gap-2 px-2 py-1.5 cursor-pointer bg-[#2a2a2a] rounded-md group"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePriorityChange("_none");
                                }}
                              >
                                <Badge variant="outline" className={cn("text-[10px] md:text-[11px] px-2 py-[2px] rounded-full font-normal flex items-center gap-1", priorityColors[priority])}>
                                  <span className={cn(
                                    "w-1.5 h-1.5 rounded-full",
                                    priority === "Urgente" && "bg-red-200",
                                    priority === "Importante" && "bg-orange-200",
                                    priority === "Normal" && "bg-yellow-200",
                                    priority === "Baixa" && "bg-blue-200"
                                  )} />
                                  {priority}
                                </Badge>
                                <X className="w-3 h-3 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                              </div>
                            </div>
                          </div>
                          
                          {/* Other options label */}
                          <div className="px-3 py-1.5 text-xs text-gray-500">
                            Outras opções
                          </div>
                          
                          {/* Available priorities */}
                          <div className="pb-1">
                            {priority !== "Urgente" && (
                              <div
                                className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#2a2a2a] transition-colors group"
                                onClick={() => handlePriorityChange("Urgente")}
                              >
                                <Badge variant="outline" className="bg-red-900 text-white border-red-900 text-[10px] md:text-[11px] px-2 py-[2px] rounded-full font-normal flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-200" />
                                  Urgente
                                </Badge>
                              </div>
                            )}
                            {priority !== "Importante" && (
                              <div
                                className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#2a2a2a] transition-colors group"
                                onClick={() => handlePriorityChange("Importante")}
                              >
                                <Badge variant="outline" className="bg-orange-800 text-white border-orange-800 text-[10px] md:text-[11px] px-2 py-[2px] rounded-full font-normal flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-orange-200" />
                                  Importante
                                </Badge>
                              </div>
                            )}
                            {priority !== "Normal" && (
                              <div
                                className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#2a2a2a] transition-colors group"
                                onClick={() => handlePriorityChange("Normal")}
                              >
                                <Badge variant="outline" className="bg-yellow-700 text-white border-yellow-700 text-[10px] md:text-[11px] px-2 py-[2px] rounded-full font-normal flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-200" />
                                  Normal
                                </Badge>
                              </div>
                            )}
                            {priority !== "Baixa" && (
                              <div
                                className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#2a2a2a] transition-colors group"
                                onClick={() => handlePriorityChange("Baixa")}
                              >
                                <Badge variant="outline" className="bg-blue-800 text-white border-blue-800 text-[10px] md:text-[11px] px-2 py-[2px] rounded-full font-normal flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-200" />
                                  Baixa
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                    {isEditing && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-4 w-4 text-muted-foreground hover:text-foreground hidden group-hover/edit-priority:inline-flex"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePriorityChange("_none");
                        }}
                        data-testid={`button-clear-priority-${id}`}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                ) : isEditing ? (
                  <Popover open={activePopover === "priority"} onOpenChange={(open) => setActivePopover(open ? "priority" : null)}>
                    <PopoverTrigger asChild>
                      <span 
                        className="inline-flex px-2 py-0.5 rounded-full cursor-pointer text-muted-foreground hover:text-foreground hover:bg-gray-700/80"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          if (clickTimeoutRef.current) {
                            clearTimeout(clickTimeoutRef.current);
                            clickTimeoutRef.current = null;
                          }
                        }}
                        data-testid={`badge-priority-${id}`}
                      >
                        + Adicionar Prioridade
                      </span>
                    </PopoverTrigger>
                    <PopoverContent className="w-56 p-0" side="bottom" align="start" sideOffset={6} avoidCollisions={true} collisionPadding={8}>
                      <div className="w-full">
                        {/* Options label */}
                        <div className="px-3 py-1.5 text-xs text-gray-500">
                          Selecionar prioridade
                        </div>
                        
                        {/* Available priorities */}
                        <div className="pb-1">
                          <div
                            className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#2a2a2a] transition-colors group"
                            onClick={() => handlePriorityChange("Urgente")}
                          >
                            <Badge variant="outline" className="bg-red-900 text-white border-red-900 text-[10px] md:text-[11px] px-2 py-[2px] rounded-full font-normal flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-200" />
                              Urgente
                            </Badge>
                          </div>
                          <div
                            className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#2a2a2a] transition-colors group"
                            onClick={() => handlePriorityChange("Importante")}
                          >
                            <Badge variant="outline" className="bg-orange-800 text-white border-orange-800 text-[10px] md:text-[11px] px-2 py-[2px] rounded-full font-normal flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-orange-200" />
                              Importante
                            </Badge>
                          </div>
                          <div
                            className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#2a2a2a] transition-colors group"
                            onClick={() => handlePriorityChange("Normal")}
                          >
                            <Badge variant="outline" className="bg-yellow-700 text-white border-yellow-700 text-[10px] md:text-[11px] px-2 py-[2px] rounded-full font-normal flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-yellow-200" />
                              Normal
                            </Badge>
                          </div>
                          <div
                            className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#2a2a2a] transition-colors group"
                            onClick={() => handlePriorityChange("Baixa")}
                          >
                            <Badge variant="outline" className="bg-blue-800 text-white border-blue-800 text-[10px] md:text-[11px] px-2 py-[2px] rounded-full font-normal flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-200" />
                              Baixa
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                ) : null}
              </div>
              
              {/* Linha 5: Status - Always clickable */}
              <div className="flex items-center gap-1.5 text-xs md:text-sm">
                <Popover open={activePopover === "status"} onOpenChange={(open) => setActivePopover(open ? "status" : null)}>
                  <PopoverTrigger asChild>
                    <div
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        if (clickTimeoutRef.current) {
                          clearTimeout(clickTimeoutRef.current);
                          clickTimeoutRef.current = null;
                        }
                      }}
                    >
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-[10px] md:text-[11px] px-2 py-[2px] rounded-full cursor-pointer hover:bg-muted/50 font-normal flex items-center gap-1",
                          statusColors[status]
                        )}
                        data-testid={`badge-status-${id}`}
                      >
                        <span className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          status === "To Do" && "bg-[#8E8B86]",
                          status === "In Progress" && "bg-[rgb(66,129,220)]",
                          status === "Done" && "bg-green-200"
                        )} />
                        {status}
                      </Badge>
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-0" side="bottom" align="start" sideOffset={6} avoidCollisions={true} collisionPadding={8}>
                    <div className="w-full">
                      {/* Selected status section */}
                      <div className="border-b border-[#2a2a2a]">
                        <div className="px-3 py-1.5 text-xs text-gray-500">
                          Selecionado
                        </div>
                        <div className="px-3 py-1">
                          <div className="flex items-center gap-2 px-2 py-1.5 bg-[#2a2a2a] rounded-md">
                            <Badge variant="outline" className={cn("text-[10px] md:text-[11px] px-2 py-[2px] rounded-full font-normal flex items-center gap-1", statusColors[status])}>
                              <span className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                status === "To Do" && "bg-[#8E8B86]",
                                status === "In Progress" && "bg-[rgb(66,129,220)]",
                                status === "Done" && "bg-green-200"
                              )} />
                              {status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      {/* Other options label */}
                      <div className="px-3 py-1.5 text-xs text-gray-500">
                        Outras opções
                      </div>
                      
                      {/* Available statuses */}
                      <div className="pb-1">
                        {status !== "To Do" && (
                          <div
                            className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#2a2a2a] transition-colors group"
                            onClick={() => handleStatusChange("To Do")}
                          >
                            <Badge variant="outline" className="bg-[#64635E] text-white border-[#64635E] text-[10px] md:text-[11px] px-2 py-[2px] rounded-full font-normal flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#8E8B86]" />
                              To Do
                            </Badge>
                          </div>
                        )}
                        {status !== "In Progress" && (
                          <div
                            className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#2a2a2a] transition-colors group"
                            onClick={() => handleStatusChange("In Progress")}
                          >
                            <Badge variant="outline" className="bg-[rgb(64,97,145)] text-white border-[rgb(64,97,145)] text-[10px] md:text-[11px] px-2 py-[2px] rounded-full font-normal flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-[rgb(66,129,220)]" />
                              In Progress
                            </Badge>
                          </div>
                        )}
                        {status !== "Done" && (
                          <div
                            className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#2a2a2a] transition-colors group"
                            onClick={() => handleStatusChange("Done")}
                          >
                            <Badge variant="outline" className="bg-green-800 text-white border-green-800 text-[10px] md:text-[11px] px-2 py-[2px] rounded-full font-normal flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-200" />
                              Done
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              
              {/* Responsáveis */}
              <div className={cn("space-y-1.5", isEditing && "-mx-2")}>
                <div className={cn("text-[10px] md:text-xs font-semibold text-muted-foreground uppercase tracking-wider", isEditing && "px-2")}>
                  Responsáveis
                </div>
                
                <Popover open={activePopover === "assignee"} onOpenChange={(open) => setActivePopover(open ? "assignee" : null)}>
                  <PopoverTrigger asChild>
                    <div 
                      className="cursor-pointer"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        if (clickTimeoutRef.current) {
                          clearTimeout(clickTimeoutRef.current);
                          clickTimeoutRef.current = null;
                        }
                      }}
                    >
                      {/* Lista de responsáveis - clicável */}
                      {editedTask.assignees.length > 0 ? (
                        <div className="space-y-0.5">
                          {editedTask.assignees.map((assignee, index) => {
                            const consultant = MOCK_RESPONSIBLES.find(c => c.name === assignee);
                            const grayColor = consultant?.grayColor || "bg-gray-600";
                            return (
                              <div 
                                key={index} 
                                className={cn(
                                  "flex items-center gap-2 rounded-full group/edit-assignee",
                                  isEditing ? "px-2 py-0.5" : "py-0.5",
                                  "hover:bg-gray-700/80"
                                )}
                              >
                                <Avatar className="w-6 h-6 shrink-0">
                                  <AvatarFallback className={cn("text-[10px] font-normal text-white", grayColor)}>
                                    {getInitials(assignee)}
                                  </AvatarFallback>
                                </Avatar>
                                <span 
                                  className="text-[13px] font-normal flex-1" 
                                  data-testid={index === 0 ? `text-assignee-${id}` : undefined}
                                >
                                  {assignee}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <span 
                          className="inline-flex px-2 py-0.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-gray-700/80 text-xs md:text-sm"
                          data-testid={`button-add-assignee-${id}`}
                        >
                          + Adicionar Responsável
                        </span>
                      )}
                    </div>
                  </PopoverTrigger>
                  <PopoverContent 
                    className="w-80 p-0 bg-[#1a1a1a] border-[#2a2a2a]" 
                    side="bottom" 
                    align="start" 
                    sideOffset={6} 
                    avoidCollisions={true} 
                    collisionPadding={8}
                  >
                    <AssigneeSelector 
                      selectedAssignees={editedTask.assignees}
                      onSelect={(assignee) => {
                        handleUpdate("assignees", [...editedTask.assignees, assignee]);
                      }}
                      onRemove={(assignee) => {
                        if (editedTask.assignees.length > 1) {
                          handleUpdate("assignees", editedTask.assignees.filter(a => a !== assignee));
                        }
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
          </CardContent>
            </Card>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-56 bg-[#1a1a1a] border-[#2a2a2a]">
          <ContextMenuSub>
            <ContextMenuSubTrigger className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Prioridade</span>
              {selectedCount > 1 && <span className="ml-auto text-xs text-muted-foreground">({selectedCount})</span>}
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="bg-[#1a1a1a] border-[#2a2a2a]">
              <ContextMenuItem onClick={() => handleContextPriorityChange("Urgente")} className="flex items-center gap-2">
                <Badge variant="outline" className="bg-red-900 text-white border-red-900 text-[10px] px-2 py-[2px] rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-200 mr-1" />
                  Urgente
                </Badge>
              </ContextMenuItem>
              <ContextMenuItem onClick={() => handleContextPriorityChange("Importante")} className="flex items-center gap-2">
                <Badge variant="outline" className="bg-orange-800 text-white border-orange-800 text-[10px] px-2 py-[2px] rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-200 mr-1" />
                  Importante
                </Badge>
              </ContextMenuItem>
              <ContextMenuItem onClick={() => handleContextPriorityChange("Normal")} className="flex items-center gap-2">
                <Badge variant="outline" className="bg-yellow-700 text-white border-yellow-700 text-[10px] px-2 py-[2px] rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-200 mr-1" />
                  Normal
                </Badge>
              </ContextMenuItem>
              <ContextMenuItem onClick={() => handleContextPriorityChange("Baixa")} className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-800 text-white border-blue-800 text-[10px] px-2 py-[2px] rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-200 mr-1" />
                  Baixa
                </Badge>
              </ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
          <ContextMenuSub>
            <ContextMenuSubTrigger className="flex items-center gap-2">
              <Circle className="w-4 h-4" />
              <span>Status</span>
              {selectedCount > 1 && <span className="ml-auto text-xs text-muted-foreground">({selectedCount})</span>}
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="bg-[#1a1a1a] border-[#2a2a2a]">
              <ContextMenuItem onClick={() => handleContextStatusChange("To Do")} className="flex items-center gap-2">
                <Badge variant="outline" className="bg-[#64635E] text-white border-[#64635E] text-[10px] px-2 py-[2px] rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8E8B86] mr-1" />
                  To Do
                </Badge>
              </ContextMenuItem>
              <ContextMenuItem onClick={() => handleContextStatusChange("In Progress")} className="flex items-center gap-2">
                <Badge variant="outline" className="bg-[rgb(64,97,145)] text-white border-[rgb(64,97,145)] text-[10px] px-2 py-[2px] rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-[rgb(66,129,220)] mr-1" />
                  In Progress
                </Badge>
              </ContextMenuItem>
              <ContextMenuItem onClick={() => handleContextStatusChange("Done")} className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-900 text-white border-green-900 text-[10px] px-2 py-[2px] rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-200 mr-1" />
                  Done
                </Badge>
              </ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
          
          <ContextMenuSub>
            <ContextMenuSubTrigger className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Responsáveis</span>
              {selectedCount > 1 && <span className="ml-auto text-xs text-muted-foreground">({selectedCount})</span>}
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="bg-[#1a1a1a] border-[#2a2a2a] p-0">
              <ContextMenuAssigneeEditor 
                currentAssignees={editedTask.assignees || []}
                isBulk={selectedCount > 1}
                onAdd={(assignee) => {
                  // ContextMenuAssigneeEditor handles setTimeout internally
                  if (selectedCount > 1 && onBulkAddAssignee) {
                    onBulkAddAssignee(assignee);
                  } else {
                    const currentAssignees = editedTask.assignees || [];
                    if (!currentAssignees.includes(assignee)) {
                      const newAssignees = [...currentAssignees, assignee];
                      setEditedTask(prev => ({ ...prev, assignees: newAssignees }));
                      onUpdate(id, { assignees: newAssignees });
                    }
                  }
                }}
                onRemove={(assignee) => {
                  // ContextMenuAssigneeEditor handles setTimeout internally
                  if (selectedCount > 1 && onBulkRemoveAssignee) {
                    onBulkRemoveAssignee(assignee);
                  } else {
                    const currentAssignees = editedTask.assignees || [];
                    const newAssignees = currentAssignees.filter(a => a !== assignee);
                    setEditedTask(prev => ({ ...prev, assignees: newAssignees }));
                    onUpdate(id, { assignees: newAssignees });
                  }
                }}
                onSetSingle={(assignee) => {
                  // ContextMenuAssigneeEditor handles setTimeout internally
                  if (selectedCount > 1 && onBulkSetAssignees) {
                    onBulkSetAssignees([assignee]);
                  } else {
                    setEditedTask(prev => ({ ...prev, assignees: [assignee] }));
                    onUpdate(id, { assignees: [assignee] });
                  }
                }}
              />
            </ContextMenuSubContent>
          </ContextMenuSub>
          
          <ContextMenuSub>
            <ContextMenuSubTrigger className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              <span>Cliente</span>
              {selectedCount > 1 && <span className="ml-auto text-xs text-muted-foreground">({selectedCount})</span>}
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="bg-[#1a1a1a] border-[#2a2a2a] p-0">
              <ContextMenuClientEditor 
                currentClient={editedTask.clientName || null}
                isBulk={selectedCount > 1}
                onSelect={(client) => {
                  handleContextClientChange(client);
                }}
              />
            </ContextMenuSubContent>
          </ContextMenuSub>
          
          <ContextMenuSub>
            <ContextMenuSubTrigger className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              <span>Data</span>
              {selectedCount > 1 && <span className="ml-auto text-xs text-muted-foreground">({selectedCount})</span>}
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="bg-[#1a1a1a] border-[#2a2a2a] p-0">
              <ContextMenuDateEditor 
                currentDate={editedTask.dueDate}
                isBulk={selectedCount > 1}
                onSelect={(dateString) => {
                  handleContextDateChange(parseLocalDate(dateString));
                }}
              />
            </ContextMenuSubContent>
          </ContextMenuSub>
          
          <ContextMenuSub>
            <ContextMenuSubTrigger className="flex items-center gap-2">
              <Type className="w-4 h-4" />
              <span>Nome da tarefa</span>
              {selectedCount > 1 && <span className="ml-auto text-xs text-muted-foreground">({selectedCount})</span>}
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="bg-[#1a1a1a] border-[#2a2a2a]">
              <ContextMenuItem 
                onClick={() => setShowReplaceTitleDialog(true)} 
                className="flex items-center gap-2"
              >
                <Pencil className="w-4 h-4" />
                <span>Substituir nome</span>
              </ContextMenuItem>
              <ContextMenuItem 
                onClick={() => setShowAppendTitleDialog(true)} 
                className="flex items-center gap-2"
              >
                <PenLine className="w-4 h-4" />
                <span>Adicionar ao final</span>
              </ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
          
          <ContextMenuSeparator className="bg-[#2a2a2a]" />
          <ContextMenuItem 
            onClick={handleContextDelete} 
            className="flex items-center gap-2 text-destructive focus:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
            <span>Excluir{selectedCount > 1 ? ` (${selectedCount})` : ''}</span>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" data-testid={`dialog-details-${id}`}>
          <DialogHeader className="space-y-0 pb-4">
            <DialogTitle>{title}</DialogTitle>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setShowDeleteConfirm(true)}
              className="absolute right-4 top-4 text-destructive hover:text-destructive hover:bg-destructive/10"
              data-testid={`button-modal-delete-${id}`}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </DialogHeader>

          <div className="space-y-6">
            <div className="border-t pt-6">
              <label className="text-sm font-medium mb-3 block">Descrição</label>
              <Textarea
                value={editedTask.description}
                onChange={(e) => {
                  setEditedTask({ ...editedTask, description: e.target.value });
                  onUpdate(id, { description: e.target.value });
                }}
                placeholder="Adicione detalhes sobre esta tarefa..."
                className="min-h-[100px] hover-elevate"
                data-testid={`textarea-description-${id}`}
              />
            </div>

            <div className="border-t pt-6">
              <h3 className="text-sm font-medium mb-3">Histórico / Notas</h3>
              {notes && notes.length > 0 ? (
                <div className="space-y-2 mb-4">
                  {notes.map((note, index) => (
                    <div key={index} className="p-3 bg-muted rounded-lg text-sm">
                      {note}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground mb-4">Nenhuma nota ainda.</p>
              )}
              <div className="flex gap-2">
                <Input
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddNote();
                    }
                  }}
                  placeholder="Adicionar nota..."
                  className="flex-1"
                  data-testid={`input-note-${id}`}
                />
                <Button onClick={handleAddNote} data-testid={`button-addnote-${id}`}>
                  Adicionar
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente esta tarefa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid={`button-confirmdelete-${id}`}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <Dialog open={showReplaceTitleDialog} onOpenChange={setShowReplaceTitleDialog}>
        <DialogContent className="max-w-md bg-[#1a1a1a] border-[#2a2a2a]">
          <DialogHeader>
            <DialogTitle>Substituir nome{selectedCount > 1 ? ` (${selectedCount} tarefas)` : ''}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              value={newTitleText}
              onChange={(e) => setNewTitleText(e.target.value)}
              placeholder="Digite o novo nome..."
              className="bg-[#2a2a2a] border-[#3a3a3a]"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleReplaceTitleSubmit();
                }
              }}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowReplaceTitleDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleReplaceTitleSubmit} disabled={!newTitleText.trim()}>
                Substituir
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showAppendTitleDialog} onOpenChange={setShowAppendTitleDialog}>
        <DialogContent className="max-w-md bg-[#1a1a1a] border-[#2a2a2a]">
          <DialogHeader>
            <DialogTitle>Adicionar ao final{selectedCount > 1 ? ` (${selectedCount} tarefas)` : ''}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              O texto será adicionado ao final do nome de cada tarefa selecionada.
            </p>
            <Input
              value={appendTitleText}
              onChange={(e) => setAppendTitleText(e.target.value)}
              placeholder="Digite o texto a adicionar..."
              className="bg-[#2a2a2a] border-[#3a3a3a]"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAppendTitleSubmit();
                }
              }}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAppendTitleDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAppendTitleSubmit} disabled={!appendTitleText.trim()}>
                Adicionar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showBulkDatePicker} onOpenChange={setShowBulkDatePicker}>
        <DialogContent className="max-w-md bg-[#1a1a1a] border-[#2a2a2a]">
          <DialogHeader>
            <DialogTitle>Alterar data{selectedCount > 1 ? ` (${selectedCount} tarefas)` : ''}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Calendar
              mode="single"
              selected={dueDate}
              onSelect={(date) => date && handleContextDateChange(date)}
              locale={ptBR}
              className="rounded-md border border-[#2a2a2a]"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}