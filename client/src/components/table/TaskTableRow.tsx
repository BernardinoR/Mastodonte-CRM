import { memo, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, CalendarIcon, Plus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { UI_CLASSES } from "@/lib/statusConfig";
import { DateInput } from "@/components/ui/date-input";
import { TaskStatusPopover, TaskPriorityPopover, TaskClientPopover, TaskAssigneesPopover } from "@/components/task-popovers";
import { usePopoverState, type PopoverField } from "@/hooks/usePopoverState";
import type { Task, TaskStatus, TaskPriority } from "@/types/task";
import type { Column } from "./TableHeader";

interface TaskTableRowProps {
  task: Task;
  columns: Column[];
  isSelected: boolean;
  controlColumnsWidth: number;
  onTitleClick?: () => void;
  onSelectChange?: (checked: boolean, shiftKey: boolean) => void;
  onUpdateTask?: (updates: Partial<Task>) => void;
  onAddTask?: () => void;
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
  dragListeners?: any;
  dragAttributes?: any;
  isDragging?: boolean;
}

const TaskTableRowContent = memo(function TaskTableRowContent({ 
  task, 
  columns,
  isSelected,
  controlColumnsWidth,
  onTitleClick,
  onSelectChange,
  onUpdateTask,
  onAddTask,
  dragListeners,
  dragAttributes,
  isDragging,
}: TaskTableRowContentProps) {
  const [, navigate] = useLocation();
  const { openPopover, handleOpenChange, closeAll } = usePopoverState();
  const datePopoverRef = useRef<HTMLDivElement>(null);

  const handleStatusChange = useCallback((status: TaskStatus) => {
    onUpdateTask?.({ status });
    closeAll();
  }, [onUpdateTask, closeAll]);

  const handlePriorityChange = useCallback((priority: TaskPriority | "_none") => {
    onUpdateTask?.({ priority: priority === "_none" ? undefined : priority });
    closeAll();
  }, [onUpdateTask, closeAll]);

  const handleDateChange = useCallback((date: Date | undefined) => {
    if (date) {
      onUpdateTask?.({ dueDate: date });
      closeAll();
    }
  }, [onUpdateTask, closeAll]);

  const handleClientChange = useCallback((clientName: string) => {
    onUpdateTask?.({ clientName: clientName === "_none" ? undefined : clientName });
    closeAll();
  }, [onUpdateTask, closeAll]);

  const handleAssigneeAdd = useCallback((assignee: string) => {
    const newAssignees = [...task.assignees, assignee];
    onUpdateTask?.({ assignees: newAssignees });
  }, [onUpdateTask, task.assignees]);

  const handleAssigneeRemove = useCallback((assignee: string) => {
    const newAssignees = task.assignees.filter(a => a !== assignee);
    onUpdateTask?.({ assignees: newAssignees });
  }, [onUpdateTask, task.assignees]);

  const renderCell = (columnId: string) => {
    switch (columnId) {
      case "title":
        return (
          <span 
            className="text-sm font-normal text-foreground hover:text-foreground hover:bg-gray-700/80 px-2 py-0.5 -mx-2 rounded-full cursor-pointer line-clamp-2 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onTitleClick?.();
            }}
            data-testid={`text-task-title-${task.id}`}
          >
            {task.title}
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
            clientName={task.clientName || null}
            isOpen={openPopover === "client"}
            onOpenChange={handleOpenChange("client")}
            onClientChange={handleClientChange}
            onNavigate={(name) => navigate(`/clients/${encodeURIComponent(name)}`)}
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

  return (
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
            onClick={onAddTask}
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
          "flex-1 grid border-b border-border transition-colors duration-200",
          !isSelected && "hover:bg-muted/50",
          isDragging && "bg-muted"
        )}
        style={{
          gridTemplateColumns: columns.map(c => c.width).join(" "),
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
  );
});
