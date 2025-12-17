import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AssigneeList } from "@/components/ui/task-assignees";
import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { AssigneeSelector } from "@/components/task-editors";
import { TaskDatePopover, TaskPriorityPopover, TaskStatusPopover, TaskClientPopover } from "@/components/task-popovers";
import type { TaskStatus, TaskPriority } from "@/types/task";

type PopoverType = "date" | "priority" | "status" | "client" | "assignee" | null;

interface TaskCardContentProps {
  id: string;
  title: string;
  clientName?: string;
  priority?: TaskPriority;
  status: TaskStatus;
  isEditing: boolean;
  isCompact: boolean;
  editedTask: {
    dueDate: string;
    clientName?: string;
    assignees: string[];
  };
  stableAssignees: string[];
  activePopover: PopoverType;
  setActivePopover: (popover: PopoverType) => void;
  datePopoverContentRef: React.RefObject<HTMLDivElement>;
  clickTimeoutRef: React.MutableRefObject<NodeJS.Timeout | null>;
  onDateChange: (date: Date | undefined) => void;
  onClientChange: (clientId: string, clientName: string) => void;
  onPriorityChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onAddAssignee: (assignee: string) => void;
  onRemoveAssignee: (assignee: string) => void;
  onEditClick: (e: React.MouseEvent) => void;
  onNavigate: (path: string) => void;
}

export function TaskCardContent({
  id,
  title,
  clientName,
  priority,
  status,
  isEditing,
  isCompact,
  editedTask,
  stableAssignees,
  activePopover,
  setActivePopover,
  datePopoverContentRef,
  clickTimeoutRef,
  onDateChange,
  onClientChange,
  onPriorityChange,
  onStatusChange,
  onAddAssignee,
  onRemoveAssignee,
  onEditClick,
  onNavigate,
}: TaskCardContentProps) {
  const cancelClickTimeout = useCallback(() => {
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    }
  }, [clickTimeoutRef]);

  const handleAssigneePopoverClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    cancelClickTimeout();
  }, [cancelClickTimeout]);

  return (
    <div className={cn("space-y-2", isCompact && !isEditing ? "p-3 md:p-3" : "p-3 md:p-4 pt-0")}>
      {isCompact && !isEditing && (
        <div className="flex items-start justify-between gap-2 mb-0.5">
          <div
            className="font-bold text-xs md:text-sm flex-1 leading-none"
            data-testid={`text-tasktitle-${id}`}
          >
            {title}
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 shrink-0 opacity-0 pointer-events-none transition-opacity group-hover/task-card:opacity-100 group-hover/task-card:pointer-events-auto focus-visible:opacity-100 focus-visible:pointer-events-auto focus-visible:ring-2 focus-visible:ring-primary"
            onClick={onEditClick}
            data-testid={`button-edit-${id}`}
          >
            <Pencil className="w-3 h-3" />
          </Button>
        </div>
      )}
      
      <div className="flex items-center text-[10px] md:text-xs font-semibold text-foreground">
        <TaskDatePopover
          id={id}
          dateValue={editedTask.dueDate}
          isOpen={activePopover === "date"}
          onOpenChange={(open) => setActivePopover(open ? "date" : null)}
          onDateChange={onDateChange}
          onStopPropagation={cancelClickTimeout}
          popoverRef={datePopoverContentRef}
        />
      </div>
      
      {(!isCompact || isEditing || clientName) && (
        <TaskClientPopover
          id={id}
          clientName={clientName || null}
          isEditing={isEditing}
          isOpen={activePopover === "client"}
          onOpenChange={(open) => setActivePopover(open ? "client" : null)}
          onClientChange={onClientChange}
          onStopPropagation={cancelClickTimeout}
          onNavigate={(name) => onNavigate(`/clients/${encodeURIComponent(name)}`)}
          variant="card"
        />
      )}
      
      <TaskPriorityPopover
        id={id}
        priority={priority}
        isEditing={isEditing}
        isOpen={activePopover === "priority"}
        onOpenChange={(open) => setActivePopover(open ? "priority" : null)}
        onPriorityChange={onPriorityChange}
        onStopPropagation={cancelClickTimeout}
      />
      
      <TaskStatusPopover
        id={id}
        status={status}
        isOpen={activePopover === "status"}
        onOpenChange={(open) => setActivePopover(open ? "status" : null)}
        onStatusChange={onStatusChange}
        onStopPropagation={cancelClickTimeout}
      />
      
      {(!isCompact || isEditing) && (
        <div className={cn("space-y-1.5", isEditing && "-mx-2")}>
          <div className={cn("text-[10px] md:text-xs font-semibold text-muted-foreground uppercase tracking-wider", isEditing && "px-2")}>
            Responsáveis
          </div>
          
          <Popover open={activePopover === "assignee"} onOpenChange={(open) => setActivePopover(open ? "assignee" : null)}>
            <PopoverTrigger asChild>
              <div 
                className="cursor-pointer"
                onClick={handleAssigneePopoverClick}
              >
                <AssigneeList
                  assignees={stableAssignees}
                  isEditing={isEditing}
                  taskId={id}
                />
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
                onSelect={onAddAssignee}
                onRemove={onRemoveAssignee}
              />
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  );
}
