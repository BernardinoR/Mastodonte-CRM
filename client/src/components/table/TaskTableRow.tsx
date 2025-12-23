import { memo, useCallback, useRef, useState, useEffect } from "react";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, CalendarIcon, Plus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ContextMenu, ContextMenuTrigger } from "@/components/ui/context-menu";
import { cn } from "@/lib/utils";
import { UI_CLASSES } from "@/lib/statusConfig";
import { DateInput } from "@/components/ui/date-input";
import { TaskStatusPopover, TaskPriorityPopover, TaskClientPopover, TaskAssigneesPopover } from "@/components/task-popovers";
import { TaskCardContextMenu } from "@/components/task-context-menu";
import { BulkEditDropdown } from "@/components/table/BulkEditDropdown";
import { usePopoverState, type PopoverField } from "@/hooks/usePopoverState";
import type { Task, TaskStatus, TaskPriority } from "@/types/task";
import type { Column } from "./TableHeader";

interface TaskTableRowProps {
  task: Task;
  columns: Column[];
  isSelected: boolean;
  isEditing?: boolean;
  controlColumnsWidth: number;
  selectedTaskIds?: Set<string>;
  onRowClick?: () => void;
  onStartEditing?: () => void;
  onSelectChange?: (checked: boolean, shiftKey: boolean) => void;
  onUpdateTask?: (updates: Partial<Task>) => void;
  onBulkUpdate?: (updates: Partial<Task>) => void;
  onBulkAddAssignee?: (assignee: string) => void;
  onBulkRemoveAssignee?: (assignee: string) => void;
  onAddTaskAfter?: () => void;
  onFinishEditing?: () => void;
  onDeleteTask?: () => void;
}

export const TaskTableRow = memo(function TaskTableRow(props: TaskTableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `task-${props.task.id}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <TaskTableRowContent 
        {...props} 
        dragListeners={listeners}
        dragAttributes={attributes}
        isDragging={isDragging}
      />
    </div>
  );
});

interface TaskTableRowContentProps extends TaskTableRowProps {
  dragListeners?: ReturnType<typeof useSortable>['listeners'];
  dragAttributes?: ReturnType<typeof useSortable>['attributes'];
  isDragging?: boolean;
}

const TaskTableRowContent = memo(function TaskTableRowContent({ 
  task, 
  columns,
  isSelected,
  isEditing = false,
  controlColumnsWidth,
  selectedTaskIds,
  onRowClick,
  onStartEditing,
  onSelectChange,
  onUpdateTask,
  onBulkUpdate,
  onBulkAddAssignee,
  onBulkRemoveAssignee,
  onAddTaskAfter,
  onFinishEditing,
  onDeleteTask,
  dragListeners,
  dragAttributes,
  isDragging,
}: TaskTableRowContentProps) {
  const [, navigate] = useLocation();
  const { openPopover, handleOpenChange, closeAll } = usePopoverState();
  const datePopoverRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const [editingTitle, setEditingTitle] = useState(task.title);
  const [bulkDropdownOpen, setBulkDropdownOpen] = useState(false);

  // Check if this task is part of a multi-selection
  const isMultiSelected = isSelected && selectedTaskIds && selectedTaskIds.size > 1;

  // Helper to apply update to single task or all selected tasks
  const applyUpdate = useCallback((updates: Partial<Task>) => {
    if (isMultiSelected && onBulkUpdate) {
      onBulkUpdate(updates);
    } else {
      onUpdateTask?.(updates);
    }
  }, [isMultiSelected, onBulkUpdate, onUpdateTask]);

  // Focus title input when entering edit mode
  useEffect(() => {
    if (isEditing && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditing]);

  // Sync local title with task title when it changes externally
  useEffect(() => {
    setEditingTitle(task.title);
  }, [task.title]);

  const handleTitleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (editingTitle.trim()) {
        onUpdateTask?.({ title: editingTitle.trim() });
      }
      onFinishEditing?.();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setEditingTitle(task.title);
      onFinishEditing?.();
    }
  }, [editingTitle, task.title, onUpdateTask, onFinishEditing]);

  const handleTitleBlur = useCallback(() => {
    if (editingTitle.trim()) {
      onUpdateTask?.({ title: editingTitle.trim() });
    }
    onFinishEditing?.();
  }, [editingTitle, onUpdateTask, onFinishEditing]);

  const handleStatusChange = useCallback((status: TaskStatus) => {
    applyUpdate({ status });
    closeAll();
  }, [applyUpdate, closeAll]);

  const handlePriorityChange = useCallback((priority: TaskPriority | "_none") => {
    applyUpdate({ priority: priority === "_none" ? undefined : priority });
    closeAll();
  }, [applyUpdate, closeAll]);

  const handleDateChange = useCallback((date: Date | undefined) => {
    if (date) {
      applyUpdate({ dueDate: date });
      closeAll();
    }
  }, [applyUpdate, closeAll]);

  const handleClientChange = useCallback((clientId: string, clientName: string) => {
    if (clientId === "_none") {
      applyUpdate({ clientId: undefined, clientName: undefined });
    } else {
      applyUpdate({ clientId, clientName });
    }
    closeAll();
  }, [applyUpdate, closeAll]);

  const handleAssigneeAdd = useCallback((assignee: string) => {
    if (isMultiSelected && onBulkAddAssignee) {
      onBulkAddAssignee(assignee);
    } else {
      const newAssignees = [...task.assignees, assignee];
      onUpdateTask?.({ assignees: newAssignees });
    }
  }, [isMultiSelected, onBulkAddAssignee, onUpdateTask, task.assignees]);

  const handleAssigneeRemove = useCallback((assignee: string) => {
    if (isMultiSelected && onBulkRemoveAssignee) {
      onBulkRemoveAssignee(assignee);
    } else {
      const newAssignees = task.assignees.filter(a => a !== assignee);
      onUpdateTask?.({ assignees: newAssignees });
    }
  }, [isMultiSelected, onBulkRemoveAssignee, onUpdateTask, task.assignees]);

  const renderCell = (columnId: string) => {
    switch (columnId) {
      case "title":
        if (isEditing) {
          return (
            <input
              ref={titleInputRef}
              type="text"
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              onKeyDown={handleTitleKeyDown}
              onBlur={handleTitleBlur}
              onClick={(e) => e.stopPropagation()}
              className="w-full text-sm font-normal text-foreground bg-transparent border-none outline-none focus:ring-1 focus:ring-primary rounded px-1 py-0.5"
              placeholder="Nome da tarefa..."
              data-testid={`input-task-title-${task.id}`}
            />
          );
        }
        return (
          <span 
            className="text-sm font-normal text-foreground hover:text-foreground hover:bg-gray-700/80 px-2 py-0.5 -mx-2 rounded-full cursor-pointer line-clamp-2 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onStartEditing?.();
            }}
            data-testid={`text-task-title-${task.id}`}
          >
            {task.title || <span className="text-muted-foreground italic">Sem título</span>}
          </span>
        );
      
      case "status":
        return (
          <TaskStatusPopover
            id={task.id}
            status={task.status}
            isOpen={openPopover === "status"}
            onOpenChange={handleOpenChange("status")}
            onStatusChange={handleStatusChange}
            onStopPropagation={() => {}}
          />
        );
      
      case "client":
        return (
          <TaskClientPopover
            id={task.id}
            clientId={task.clientId}
            clientName={task.clientName || null}
            isOpen={openPopover === "client"}
            onOpenChange={handleOpenChange("client")}
            onClientChange={handleClientChange}
            onNavigate={(clientId) => navigate(`/clients/${clientId}`)}
            variant="table"
          />
        );
      
      case "dueDate":
        return (
          <Popover open={openPopover === "dueDate"} onOpenChange={handleOpenChange("dueDate")}>
            <PopoverTrigger asChild>
              <div 
                onClick={(e) => e.stopPropagation()} 
                className="flex items-center gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground hover:bg-gray-700/80 px-2 py-0.5 -mx-2 rounded-full transition-colors"
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                <span className="text-sm">
                  {format(task.dueDate, "dd/MM/yyyy", { locale: ptBR })}
                </span>
              </div>
            </PopoverTrigger>
            <PopoverContent 
              ref={datePopoverRef}
              className={cn("w-auto p-0", UI_CLASSES.popover)} 
              side="bottom" 
              align="start"
              onClick={(e) => e.stopPropagation()}
            >
              <DateInput
                value={format(task.dueDate, "yyyy-MM-dd")}
                onChange={handleDateChange}
                className="font-semibold"
                dataTestId={`input-date-${task.id}`}
                hideIcon
                commitOnInput={false}
              />
            </PopoverContent>
          </Popover>
        );
      
      case "priority":
        return (
          <TaskPriorityPopover
            id={task.id}
            priority={task.priority}
            isEditing={true}
            isOpen={openPopover === "priority"}
            onOpenChange={handleOpenChange("priority")}
            onPriorityChange={handlePriorityChange}
            onStopPropagation={() => {}}
          />
        );
      
      case "assignee":
        return (
          <TaskAssigneesPopover
            id={task.id}
            assignees={task.assignees}
            isOpen={openPopover === "assignee"}
            onOpenChange={handleOpenChange("assignee")}
            onAddAssignee={handleAssigneeAdd}
            onRemoveAssignee={handleAssigneeRemove}
            onStopPropagation={() => {}}
            variant="modal"
            maxDisplay={3}
          />
        );
      
      default:
        return null;
    }
  };

  const handleContextStatusChange = useCallback((status: TaskStatus) => {
    applyUpdate({ status });
  }, [applyUpdate]);

  const handleContextPriorityChange = useCallback((priority: TaskPriority) => {
    applyUpdate({ priority });
  }, [applyUpdate]);

  const handleContextDateChange = useCallback((date: Date) => {
    applyUpdate({ dueDate: date });
  }, [applyUpdate]);

  const handleContextClientChange = useCallback((clientId: string, clientName: string) => {
    if (clientId === "_none") {
      applyUpdate({ clientId: undefined, clientName: undefined });
    } else {
      applyUpdate({ clientId, clientName });
    }
  }, [applyUpdate]);

  return (
    <>
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div 
          className={cn(
            "flex group",
            isSelected && "bg-primary/10"
          )}
          data-testid={`row-task-${task.id}`}
        >
          <div 
            className="flex items-center py-1.5"
            style={{ width: `${controlColumnsWidth}px` }}
          >
            <div 
              className="flex items-center justify-center w-8"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={onAddTaskAfter}
                className="w-5 h-5 flex items-center justify-center text-muted-foreground/50 hover:text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                data-testid={`button-add-task-${task.id}`}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div 
              className="flex items-center justify-center w-6 cursor-grab active:cursor-grabbing"
              {...dragListeners}
              {...dragAttributes}
            >
              <GripVertical 
                className="w-4 h-4 text-muted-foreground/30 hover:text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" 
                data-testid={`drag-handle-task-${task.id}`}
              />
            </div>
            <div 
              className="flex items-center justify-center w-8"
              onClick={(e) => e.stopPropagation()}
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) => {
                  const event = window.event as MouseEvent | undefined;
                  onSelectChange?.(!!checked, event?.shiftKey ?? false);
                }}
                className={cn(
                  "transition-opacity",
                  isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}
                data-testid={`checkbox-task-${task.id}`}
              />
            </div>
          </div>
          <div 
            className={cn(
              "flex-1 grid border-b border-border transition-colors duration-200 cursor-pointer",
              !isSelected && "hover:bg-muted/50",
              isDragging && "bg-muted"
            )}
            style={{
              gridTemplateColumns: columns.map(c => c.width).join(" "),
            }}
            onClick={(e) => {
              if (isMultiSelected) {
                e.stopPropagation();
                setBulkDropdownOpen(true);
              } else {
                onRowClick?.();
              }
            }}
          >
            {columns.map((column) => (
              <div 
                key={column.id} 
                className="px-3 py-1.5 flex items-center"
              >
                {renderCell(column.id)}
              </div>
            ))}
          </div>
        </div>
      </ContextMenuTrigger>
      <TaskCardContextMenu
        selectedCount={isSelected && selectedTaskIds ? selectedTaskIds.size : 1}
        currentDate={format(task.dueDate, "yyyy-MM-dd")}
        currentClient={task.clientName || ""}
        currentAssignees={task.assignees || []}
        onShowReplaceTitleDialog={() => {}}
        onShowAppendTitleDialog={() => {}}
        onDateChange={handleContextDateChange}
        onClientChange={handleContextClientChange}
        onPriorityChange={handleContextPriorityChange}
        onStatusChange={handleContextStatusChange}
        onAddAssignee={handleAssigneeAdd}
        onRemoveAssignee={handleAssigneeRemove}
        onSetSingleAssignee={(assignee) => applyUpdate({ assignees: [assignee] })}
        onDelete={() => onDeleteTask?.()}
      />
    </ContextMenu>
    
    {isMultiSelected && bulkDropdownOpen && (
      <BulkEditDropdown
        selectedCount={selectedTaskIds?.size || 0}
        isOpen={bulkDropdownOpen}
        onOpenChange={setBulkDropdownOpen}
        currentDate={format(task.dueDate, "yyyy-MM-dd")}
        currentClient={task.clientName || ""}
        currentAssignees={task.assignees || []}
        onShowReplaceTitleDialog={() => {}}
        onShowAppendTitleDialog={() => {}}
        onDateChange={(date) => { handleContextDateChange(date); setBulkDropdownOpen(false); }}
        onClientChange={(clientId, clientName) => { handleContextClientChange(clientId, clientName); setBulkDropdownOpen(false); }}
        onPriorityChange={(priority) => { handleContextPriorityChange(priority); setBulkDropdownOpen(false); }}
        onStatusChange={(status) => { handleContextStatusChange(status); setBulkDropdownOpen(false); }}
        onAddAssignee={handleAssigneeAdd}
        onRemoveAssignee={handleAssigneeRemove}
        onSetSingleAssignee={(assignee) => { applyUpdate({ assignees: [assignee] }); setBulkDropdownOpen(false); }}
        onDelete={() => { onDeleteTask?.(); setBulkDropdownOpen(false); }}
      />
    )}
    </>
  );
});
