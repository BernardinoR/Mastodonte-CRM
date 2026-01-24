import { memo, useEffect, useRef, useCallback } from "react";
import {
  Calendar as CalendarIcon,
  Pencil,
  Trash2,
  AlertTriangle,
  Circle,
  Users,
  Type,
  Briefcase,
  PenLine,
  ChevronRight,
} from "lucide-react";
import { DateInput } from "@/shared/components/ui/date-input";
import { 
  ContextMenuClientEditor,
  ContextMenuAssigneeEditor
} from "../task-editors";
import { PriorityBadge, StatusBadge, PRIORITY_OPTIONS, STATUS_OPTIONS } from "@/shared/components/ui/task-badges";
import { cn } from "@/shared/lib/utils";
import type { TaskStatus, TaskPriority } from "../../types/task";
import { useClients } from "@features/clients";

interface BulkEditDropdownProps {
  selectedCount: number;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentDate: string;
  currentClient: string;
  currentAssignees: string[];
  onShowReplaceTitleDialog: () => void;
  onShowAppendTitleDialog: () => void;
  onDateChange: (date: Date) => void;
  onClientChange: (clientId: string, clientName: string) => void;
  onPriorityChange: (priority: TaskPriority) => void;
  onStatusChange: (status: TaskStatus) => void;
  onAddAssignee: (assignee: string) => void;
  onRemoveAssignee: (assignee: string) => void;
  onSetSingleAssignee: (assignee: string) => void;
  onDelete: () => void;
}

interface SubMenuProps {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function SubMenu({ label, icon, children }: SubMenuProps) {
  return (
    <div className="relative group/submenu">
      <div className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm cursor-pointer hover:bg-accent hover:text-accent-foreground">
        {icon}
        <span className="flex-1">{label}</span>
        <ChevronRight className="w-4 h-4" />
      </div>
      <div className="absolute left-full top-0 ml-1 invisible group-hover/submenu:visible opacity-0 group-hover/submenu:opacity-100 transition-all duration-150 z-50">
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-md shadow-lg min-w-[180px]">
          {children}
        </div>
      </div>
    </div>
  );
}

function MenuItem({ onClick, className, children }: { onClick: () => void; className?: string; children: React.ReactNode }) {
  return (
    <div 
      className={cn("flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm cursor-pointer hover:bg-accent hover:text-accent-foreground", className)}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export const BulkEditDropdown = memo(function BulkEditDropdown({
  selectedCount,
  isOpen,
  onOpenChange,
  currentDate,
  currentClient,
  currentAssignees,
  onShowReplaceTitleDialog,
  onShowAppendTitleDialog,
  onDateChange,
  onClientChange,
  onPriorityChange,
  onStatusChange,
  onAddAssignee,
  onRemoveAssignee,
  onSetSingleAssignee,
  onDelete,
}: BulkEditDropdownProps) {
  const { clients } = useClients();
  const menuRef = useRef<HTMLDivElement>(null);
  
  const handleClientSelectWrapper = useCallback((clientName: string) => {
    if (clientName === "_none") {
      onClientChange("_none", "");
    } else {
      const client = clients.find(c => c.name === clientName);
      if (client) {
        onClientChange(client.id, client.name);
      }
    }
  }, [clients, onClientChange]);

  useEffect(() => {
    if (!isOpen) return;
    
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onOpenChange(false);
      }
    }
    
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onOpenChange(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onOpenChange]);

  if (!isOpen) return null;

  return (
    <div 
      ref={menuRef}
      className="fixed z-50 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md shadow-lg w-56"
      style={{ 
        top: "50%", 
        left: "50%", 
        transform: "translate(-50%, -50%)" 
      }}
      data-testid="bulk-edit-dropdown"
    >
      <div className="p-1">
        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
          Selecionando {selectedCount} tarefas
        </div>
        <div className="h-px bg-[#2a2a2a] my-1" />
        
        <SubMenu label="Título" icon={<Type className="w-4 h-4" />}>
          <div className="p-1">
            <MenuItem onClick={onShowReplaceTitleDialog}>
              <Pencil className="w-4 h-4" />
              <span>Substituir nome</span>
            </MenuItem>
            <MenuItem onClick={onShowAppendTitleDialog}>
              <PenLine className="w-4 h-4" />
              <span>Adicionar ao final</span>
            </MenuItem>
          </div>
        </SubMenu>
        
        <SubMenu label="Data" icon={<CalendarIcon className="w-4 h-4" />}>
          <div className="p-0">
            <DateInput
              value={currentDate}
              onChange={(date) => {
                if (date) {
                  onDateChange(date);
                }
              }}
              hideIcon={true}
              commitOnInput={false}
              dataTestId="bulk-edit-date-input"
            />
          </div>
        </SubMenu>
        
        <SubMenu label="Cliente" icon={<Briefcase className="w-4 h-4" />}>
          <div className="p-0">
            <ContextMenuClientEditor 
              currentClient={currentClient || null}
              isBulk={true}
              onSelect={handleClientSelectWrapper}
            />
          </div>
        </SubMenu>
        
        <SubMenu label="Prioridade" icon={<AlertTriangle className="w-4 h-4" />}>
          <div className="p-1">
            {PRIORITY_OPTIONS.map((priority) => (
              <MenuItem key={priority} onClick={() => onPriorityChange(priority)}>
                <PriorityBadge priority={priority} />
              </MenuItem>
            ))}
          </div>
        </SubMenu>
        
        <SubMenu label="Status" icon={<Circle className="w-4 h-4" />}>
          <div className="p-1">
            {STATUS_OPTIONS.map((status) => (
              <MenuItem key={status} onClick={() => onStatusChange(status)}>
                <StatusBadge status={status} />
              </MenuItem>
            ))}
          </div>
        </SubMenu>
        
        <SubMenu label="Responsável" icon={<Users className="w-4 h-4" />}>
          <div className="p-0">
            <ContextMenuAssigneeEditor 
              currentAssignees={currentAssignees || []}
              isBulk={true}
              onAdd={onAddAssignee}
              onRemove={onRemoveAssignee}
              onSetSingle={onSetSingleAssignee}
            />
          </div>
        </SubMenu>
        
        <div className="h-px bg-[#2a2a2a] my-1" />
        <MenuItem onClick={onDelete} className="text-destructive hover:text-destructive">
          <Trash2 className="w-4 h-4" />
          <span>Excluir</span>
        </MenuItem>
      </div>
    </div>
  );
});
