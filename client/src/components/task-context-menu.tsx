import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from "@/components/ui/context-menu";
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
import { parseLocalDate } from "@/lib/date-utils";
import { 
  ContextMenuClientEditor,
  ContextMenuDateEditor,
  ContextMenuAssigneeEditor
} from "@/components/task-editors";
import type { TaskStatus, TaskPriority } from "@/types/task";

interface TaskCardContextMenuProps {
  selectedCount: number;
  currentDate: string;
  currentClient: string;
  currentAssignees: string[];
  onShowReplaceTitleDialog: () => void;
  onShowAppendTitleDialog: () => void;
  onDateChange: (date: Date) => void;
  onClientChange: (client: string) => void;
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
            onSelect={onClientChange}
          />
        </ContextMenuSubContent>
      </ContextMenuSub>
      
      <ContextMenuSub>
        <ContextMenuSubTrigger className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span>Prioridade</span>
        </ContextMenuSubTrigger>
        <ContextMenuSubContent className="bg-[#1a1a1a] border-[#2a2a2a]">
          <ContextMenuItem onClick={() => onPriorityChange("Urgente")} className="flex items-center gap-2">
            <Badge variant="outline" className="bg-red-900 text-white border-red-900 text-[10px] px-2 py-[2px] rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-red-200 mr-1" />
              Urgente
            </Badge>
          </ContextMenuItem>
          <ContextMenuItem onClick={() => onPriorityChange("Importante")} className="flex items-center gap-2">
            <Badge variant="outline" className="bg-orange-800 text-white border-orange-800 text-[10px] px-2 py-[2px] rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-200 mr-1" />
              Importante
            </Badge>
          </ContextMenuItem>
          <ContextMenuItem onClick={() => onPriorityChange("Normal")} className="flex items-center gap-2">
            <Badge variant="outline" className="bg-yellow-700 text-white border-yellow-700 text-[10px] px-2 py-[2px] rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-200 mr-1" />
              Normal
            </Badge>
          </ContextMenuItem>
          <ContextMenuItem onClick={() => onPriorityChange("Baixa")} className="flex items-center gap-2">
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
        </ContextMenuSubTrigger>
        <ContextMenuSubContent className="bg-[#1a1a1a] border-[#2a2a2a]">
          <ContextMenuItem onClick={() => onStatusChange("To Do")} className="flex items-center gap-2">
            <Badge variant="outline" className="bg-[#64635E] text-white border-[#64635E] text-[10px] px-2 py-[2px] rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8E8B86] mr-1" />
              To Do
            </Badge>
          </ContextMenuItem>
          <ContextMenuItem onClick={() => onStatusChange("In Progress")} className="flex items-center gap-2">
            <Badge variant="outline" className="bg-[rgb(64,97,145)] text-white border-[rgb(64,97,145)] text-[10px] px-2 py-[2px] rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[rgb(66,129,220)] mr-1" />
              In Progress
            </Badge>
          </ContextMenuItem>
          <ContextMenuItem onClick={() => onStatusChange("Done")} className="flex items-center gap-2">
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
