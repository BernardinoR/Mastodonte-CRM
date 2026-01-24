import { memo, useCallback } from "react";
import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from "@/shared/components/ui/context-menu";
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
} from "lucide-react";
import { parseLocalDate } from "@/shared/lib/date-utils";
import { 
  ContextMenuClientEditor,
  ContextMenuDateEditor,
  ContextMenuAssigneeEditor
} from "./task-editors";
import { PriorityBadge, StatusBadge, PRIORITY_OPTIONS, STATUS_OPTIONS } from "@/shared/components/ui/task-badges";
import type { TaskStatus, TaskPriority } from "../types/task";
import { useClients } from "@features/clients";

interface TaskCardContextMenuProps {
  selectedCount: number;
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

export const TaskCardContextMenu = memo(function TaskCardContextMenu({
  selectedCount,
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
}: TaskCardContextMenuProps) {
  const { clients } = useClients();
  
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
  
  return (
    <ContextMenuContent className="w-56 bg-[#1a1a1a] border-[#2a2a2a]">
      {selectedCount > 1 && (
        <>
          <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
            Selecionando {selectedCount} tarefas
          </div>
          <ContextMenuSeparator className="bg-[#2a2a2a]" />
        </>
      )}
      
      <ContextMenuSub>
        <ContextMenuSubTrigger className="flex items-center gap-2">
          <Type className="w-4 h-4" />
          <span>Título</span>
        </ContextMenuSubTrigger>
        <ContextMenuSubContent className="bg-[#1a1a1a] border-[#2a2a2a]">
          <ContextMenuItem 
            onClick={onShowReplaceTitleDialog} 
            className="flex items-center gap-2"
          >
            <Pencil className="w-4 h-4" />
            <span>Substituir nome</span>
          </ContextMenuItem>
          <ContextMenuItem 
            onClick={onShowAppendTitleDialog} 
            className="flex items-center gap-2"
          >
            <PenLine className="w-4 h-4" />
            <span>Adicionar ao final</span>
          </ContextMenuItem>
        </ContextMenuSubContent>
      </ContextMenuSub>
      
      <ContextMenuSub>
        <ContextMenuSubTrigger className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4" />
          <span>Data</span>
        </ContextMenuSubTrigger>
        <ContextMenuSubContent 
          className="bg-[#1a1a1a] border-[#2a2a2a] p-0"
          onPointerDownOutside={(e) => {
            const target = e.target as HTMLElement;
            if (target.closest('[data-calendar-container]')) {
              e.preventDefault();
            }
          }}
          onInteractOutside={(e) => {
            const target = e.target as HTMLElement;
            if (target.closest('[data-calendar-container]')) {
              e.preventDefault();
            }
          }}
        >
          <ContextMenuDateEditor 
            currentDate={currentDate}
            isBulk={selectedCount > 1}
            onSelect={(dateString) => {
              onDateChange(parseLocalDate(dateString));
            }}
          />
        </ContextMenuSubContent>
      </ContextMenuSub>
      
      <ContextMenuSub>
        <ContextMenuSubTrigger className="flex items-center gap-2">
          <Briefcase className="w-4 h-4" />
          <span>Cliente</span>
        </ContextMenuSubTrigger>
        <ContextMenuSubContent className="bg-[#1a1a1a] border-[#2a2a2a] p-0">
          <ContextMenuClientEditor 
            currentClient={currentClient || null}
            isBulk={selectedCount > 1}
            onSelect={handleClientSelectWrapper}
          />
        </ContextMenuSubContent>
      </ContextMenuSub>
      
      <ContextMenuSub>
        <ContextMenuSubTrigger className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span>Prioridade</span>
        </ContextMenuSubTrigger>
        <ContextMenuSubContent className="bg-[#1a1a1a] border-[#2a2a2a]">
          {PRIORITY_OPTIONS.map((priority) => (
            <ContextMenuItem 
              key={priority}
              onClick={() => onPriorityChange(priority)} 
              className="flex items-center gap-2"
            >
              <PriorityBadge priority={priority} />
            </ContextMenuItem>
          ))}
        </ContextMenuSubContent>
      </ContextMenuSub>
      
      <ContextMenuSub>
        <ContextMenuSubTrigger className="flex items-center gap-2">
          <Circle className="w-4 h-4" />
          <span>Status</span>
        </ContextMenuSubTrigger>
        <ContextMenuSubContent className="bg-[#1a1a1a] border-[#2a2a2a]">
          {STATUS_OPTIONS.map((status) => (
            <ContextMenuItem 
              key={status}
              onClick={() => onStatusChange(status)} 
              className="flex items-center gap-2"
            >
              <StatusBadge status={status} />
            </ContextMenuItem>
          ))}
        </ContextMenuSubContent>
      </ContextMenuSub>
      
      <ContextMenuSub>
        <ContextMenuSubTrigger className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          <span>Responsável</span>
        </ContextMenuSubTrigger>
        <ContextMenuSubContent className="bg-[#1a1a1a] border-[#2a2a2a] p-0">
          <ContextMenuAssigneeEditor 
            currentAssignees={currentAssignees || []}
            isBulk={selectedCount > 1}
            onAdd={onAddAssignee}
            onRemove={onRemoveAssignee}
            onSetSingle={onSetSingleAssignee}
          />
        </ContextMenuSubContent>
      </ContextMenuSub>
      
      <ContextMenuSeparator className="bg-[#2a2a2a]" />
      <ContextMenuItem 
        onClick={onDelete} 
        className="flex items-center gap-2 text-destructive focus:text-destructive"
      >
        <Trash2 className="w-4 h-4" />
        <span>Excluir</span>
      </ContextMenuItem>
    </ContextMenuContent>
  );
});
