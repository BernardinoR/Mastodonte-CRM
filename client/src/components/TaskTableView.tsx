import { useState, useMemo, memo, useCallback, useRef } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, CalendarIcon, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { Task, TaskStatus, TaskPriority } from "@/types/task";
import { STATUS_CONFIG, PRIORITY_CONFIG, UI_CLASSES } from "@/lib/statusConfig";
import { PriorityBadge as PriorityBadgeShared, StatusBadge as StatusBadgeShared, PRIORITY_OPTIONS, STATUS_OPTIONS } from "@/components/ui/task-badges";
import { DateInput } from "@/components/ui/date-input";
import { ClientSelector, AssigneeSelector } from "@/components/task-editors";
import { parseLocalDate } from "@/lib/date-utils";

interface TaskTableViewProps {
  tasks: Task[];
  selectedTaskIds: Set<string>;
  onTaskClick?: (task: Task) => void;
  onUpdateTask?: (taskId: string, updates: Partial<Task>) => void;
  onSelectionChange?: (taskIds: Set<string>, lastId?: string) => void;
  availableAssignees?: string[];
  availableClients?: string[];
}

interface Column {
  id: string;
  label: string;
  width: string;
}

const DEFAULT_COLUMNS: Column[] = [
  { id: "title", label: "Tarefa", width: "minmax(250px, 2fr)" },
  { id: "status", label: "Status", width: "120px" },
  { id: "client", label: "Cliente", width: "minmax(180px, 1fr)" },
  { id: "dueDate", label: "Data", width: "110px" },
  { id: "priority", label: "Prioridade", width: "120px" },
  { id: "assignee", label: "Pessoa", width: "minmax(160px, 1fr)" },
];

const SortableHeader = memo(function SortableHeader({ 
  column 
}: { 
  column: Column;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-1.5 px-4 py-3 text-xs font-semibold uppercase tracking-wide select-none cursor-grab active:cursor-grabbing",
        "text-[#a8a8b3]",
        isDragging && "opacity-50 bg-[#29292e] rounded"
      )}
      data-testid={`header-column-${column.id}`}
      {...attributes}
      {...listeners}
    >
      <GripVertical 
        className="w-3 h-3 text-[#a8a8b3]/50 hover:text-[#a8a8b3]" 
        data-testid={`drag-handle-${column.id}`}
      />
      <span>{column.label}</span>
    </div>
  );
});

const StatusBadgeTable = memo(function StatusBadgeTable({ status }: { status: TaskStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge 
      variant="secondary" 
      className={cn(
        "text-xs px-2.5 py-0.5 rounded-xl font-semibold border cursor-pointer",
        config?.bgColor, 
        config?.borderColor,
        config?.textColor
      )}
    >
      {status}
    </Badge>
  );
});

const PriorityBadgeTable = memo(function PriorityBadgeTable({ priority }: { priority?: TaskPriority }) {
  if (!priority) return <span className="text-[#a8a8b3] text-sm cursor-pointer hover:text-[#e1e1e6]">Definir</span>;
  const config = PRIORITY_CONFIG[priority];
  return (
    <Badge 
      variant="secondary" 
      className={cn(
        "text-xs px-2.5 py-0.5 rounded-xl font-semibold border cursor-pointer",
        config?.bgColor, 
        config?.borderColor,
        config?.textColor
      )}
    >
      {priority}
    </Badge>
  );
});

const AssigneeDisplay = memo(function AssigneeDisplay({ assignees }: { assignees: string[] }) {
  if (assignees.length === 0) return <span className="text-[#a8a8b3] text-sm cursor-pointer hover:text-[#e1e1e6]">Atribuir</span>;
  
  const firstAssignee = assignees[0];
  const initials = firstAssignee.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const shortName = firstAssignee.split(" ").length > 1 
    ? `${firstAssignee.split(" ")[0]} ${firstAssignee.split(" ")[1]?.[0] || ""}.`
    : firstAssignee;
  const remaining = assignees.length - 1;
  
  return (
    <div className="flex items-center gap-2 cursor-pointer">
      <div className="w-6 h-6 rounded-full bg-[#64635E] flex items-center justify-center text-[10px] font-bold text-white shrink-0">
        {initials}
      </div>
      <span className="text-sm text-[#a8a8b3] truncate">{shortName}</span>
      {remaining > 0 && (
        <span className="text-xs text-[#a8a8b3]">+{remaining}</span>
      )}
    </div>
  );
});

interface TaskRowProps {
  task: Task;
  columns: Column[];
  isSelected: boolean;
  onTitleClick?: () => void;
  onSelectChange?: (checked: boolean) => void;
  onUpdateTask?: (updates: Partial<Task>) => void;
  availableAssignees?: string[];
  availableClients?: string[];
}

const TaskRow = memo(function TaskRow({ 
  task, 
  columns,
  isSelected,
  onTitleClick,
  onSelectChange,
  onUpdateTask,
  availableAssignees = [],
  availableClients = [],
}: TaskRowProps) {
  const [openPopover, setOpenPopover] = useState<string | null>(null);
  const datePopoverRef = useRef<HTMLDivElement>(null);

  const handleStatusChange = useCallback((status: TaskStatus) => {
    onUpdateTask?.({ status });
    setOpenPopover(null);
  }, [onUpdateTask]);

  const handlePriorityChange = useCallback((priority: TaskPriority | "_none") => {
    onUpdateTask?.({ priority: priority === "_none" ? undefined : priority });
    setOpenPopover(null);
  }, [onUpdateTask]);

  const handleDateChange = useCallback((date: Date | undefined) => {
    if (date) {
      onUpdateTask?.({ dueDate: date });
      setOpenPopover(null);
    }
  }, [onUpdateTask]);

  const handleClientChange = useCallback((clientName: string) => {
    onUpdateTask?.({ clientName });
    setOpenPopover(null);
  }, [onUpdateTask]);

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
            className="text-sm font-medium text-[#e1e1e6] truncate hover:text-primary hover:underline cursor-pointer"
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
          <Popover open={openPopover === "status"} onOpenChange={(open) => setOpenPopover(open ? "status" : null)}>
            <PopoverTrigger asChild>
              <div onClick={(e) => e.stopPropagation()}>
                <StatusBadgeTable status={task.status} />
              </div>
            </PopoverTrigger>
            <PopoverContent 
              className={cn("w-48 p-1", UI_CLASSES.popover)} 
              side="bottom" 
              align="start"
              onClick={(e) => e.stopPropagation()}
            >
              {STATUS_OPTIONS.map((s) => (
                <div
                  key={s}
                  className={cn(
                    "px-2 py-1.5 cursor-pointer rounded-md",
                    task.status === s ? UI_CLASSES.selectedItem : UI_CLASSES.dropdownItem
                  )}
                  onClick={() => handleStatusChange(s)}
                >
                  <StatusBadgeShared status={s} />
                </div>
              ))}
            </PopoverContent>
          </Popover>
        );
      
      case "client":
        return (
          <Popover open={openPopover === "client"} onOpenChange={(open) => setOpenPopover(open ? "client" : null)}>
            <PopoverTrigger asChild>
              <div onClick={(e) => e.stopPropagation()} className="cursor-pointer">
                {task.clientName ? (
                  <span className="text-sm text-[#a8a8b3] truncate hover:text-[#e1e1e6]">{task.clientName}</span>
                ) : (
                  <span className="text-[#a8a8b3] text-sm hover:text-[#e1e1e6]">Selecionar</span>
                )}
              </div>
            </PopoverTrigger>
            <PopoverContent 
              className={cn("w-64 p-0", UI_CLASSES.popover)} 
              side="bottom" 
              align="start"
              onClick={(e) => e.stopPropagation()}
            >
              <ClientSelector
                selectedClient={task.clientName || null}
                onSelect={handleClientChange}
              />
            </PopoverContent>
          </Popover>
        );
      
      case "dueDate":
        return (
          <Popover open={openPopover === "dueDate"} onOpenChange={(open) => setOpenPopover(open ? "dueDate" : null)}>
            <PopoverTrigger asChild>
              <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-1.5 cursor-pointer hover:text-[#e1e1e6]">
                <CalendarIcon className="w-3.5 h-3.5 text-[#a8a8b3]" />
                <span className="text-sm text-[#a8a8b3]">
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
          <Popover open={openPopover === "priority"} onOpenChange={(open) => setOpenPopover(open ? "priority" : null)}>
            <PopoverTrigger asChild>
              <div onClick={(e) => e.stopPropagation()}>
                <PriorityBadgeTable priority={task.priority} />
              </div>
            </PopoverTrigger>
            <PopoverContent 
              className={cn("w-48 p-1", UI_CLASSES.popover)} 
              side="bottom" 
              align="start"
              onClick={(e) => e.stopPropagation()}
            >
              {task.priority && (
                <div
                  className={cn("px-2 py-1.5 cursor-pointer rounded-md mb-1", UI_CLASSES.dropdownItem)}
                  onClick={() => handlePriorityChange("_none")}
                >
                  <span className="text-xs text-[#a8a8b3]">Remover prioridade</span>
                </div>
              )}
              {PRIORITY_OPTIONS.map((p) => (
                <div
                  key={p}
                  className={cn(
                    "px-2 py-1.5 cursor-pointer rounded-md",
                    task.priority === p ? UI_CLASSES.selectedItem : UI_CLASSES.dropdownItem
                  )}
                  onClick={() => handlePriorityChange(p)}
                >
                  <PriorityBadgeShared priority={p} />
                </div>
              ))}
            </PopoverContent>
          </Popover>
        );
      
      case "assignee":
        return (
          <Popover open={openPopover === "assignee"} onOpenChange={(open) => setOpenPopover(open ? "assignee" : null)}>
            <PopoverTrigger asChild>
              <div onClick={(e) => e.stopPropagation()}>
                <AssigneeDisplay assignees={task.assignees} />
              </div>
            </PopoverTrigger>
            <PopoverContent 
              className={cn("w-64 p-0", UI_CLASSES.popover)} 
              side="bottom" 
              align="start"
              onClick={(e) => e.stopPropagation()}
            >
              <AssigneeSelector
                selectedAssignees={task.assignees}
                onSelect={handleAssigneeAdd}
                onRemove={handleAssigneeRemove}
              />
            </PopoverContent>
          </Popover>
        );
      
      default:
        return null;
    }
  };

  return (
    <div 
      className={cn(
        "grid border-b border-[#323238] group transition-colors duration-200",
        "hover:bg-[#29292e]"
      )}
      style={{
        gridTemplateColumns: `40px ${columns.map(c => c.width).join(" ")}`,
      }}
      data-testid={`row-task-${task.id}`}
    >
      <div 
        className="px-3 py-4 flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <Checkbox
          checked={isSelected}
          onCheckedChange={onSelectChange}
          className={cn(
            "transition-opacity",
            isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}
          data-testid={`checkbox-task-${task.id}`}
        />
      </div>
      {columns.map((column) => (
        <div 
          key={column.id} 
          className="px-4 py-4 flex items-center"
        >
          {renderCell(column.id)}
        </div>
      ))}
    </div>
  );
});

export const TaskTableView = memo(function TaskTableView({ 
  tasks,
  selectedTaskIds,
  onTaskClick,
  onUpdateTask,
  onSelectionChange,
  availableAssignees = [],
  availableClients = [],
}: TaskTableViewProps) {
  const [columns, setColumns] = useState<Column[]>(DEFAULT_COLUMNS);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const columnIds = useMemo(() => columns.map(c => c.id), [columns]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setColumns((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSelectTask = useCallback((taskId: string, checked: boolean) => {
    const newSelection = new Set(selectedTaskIds);
    if (checked) {
      newSelection.add(taskId);
    } else {
      newSelection.delete(taskId);
    }
    onSelectionChange?.(newSelection, taskId);
  }, [selectedTaskIds, onSelectionChange]);

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      const allIds = new Set(tasks.map(t => t.id));
      onSelectionChange?.(allIds);
    } else {
      onSelectionChange?.(new Set());
    }
  }, [tasks, onSelectionChange]);

  const allSelected = tasks.length > 0 && tasks.every(t => selectedTaskIds.has(t.id));
  const someSelected = tasks.some(t => selectedTaskIds.has(t.id)) && !allSelected;

  return (
    <div className="flex-1 overflow-auto bg-[#121214]" data-testid="table-view-container">
      <div className="min-w-max">
        <DndContext 
          sensors={sensors} 
          collisionDetection={closestCenter} 
          onDragEnd={handleDragEnd}
        >
          <div 
            className="grid border-b border-[#323238] bg-[#121214] sticky top-0 z-10 group"
            style={{
              gridTemplateColumns: `40px ${columns.map(c => c.width).join(" ")}`,
            }}
          >
            <div className="px-3 py-3 flex items-center justify-center">
              <Checkbox
                checked={allSelected}
                onCheckedChange={handleSelectAll}
                className={cn(
                  "transition-opacity",
                  allSelected || someSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}
                data-testid="checkbox-select-all"
              />
            </div>
            <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
              {columns.map((column) => (
                <SortableHeader key={column.id} column={column} />
              ))}
            </SortableContext>
          </div>
        </DndContext>
        
        {tasks.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-[#a8a8b3]" data-testid="text-empty-table">
            Nenhuma tarefa encontrada
          </div>
        ) : (
          tasks.map((task) => (
            <TaskRow 
              key={task.id} 
              task={task} 
              columns={columns}
              isSelected={selectedTaskIds.has(task.id)}
              onTitleClick={() => onTaskClick?.(task)}
              onSelectChange={(checked) => handleSelectTask(task.id, checked as boolean)}
              onUpdateTask={(updates) => onUpdateTask?.(task.id, updates)}
              availableAssignees={availableAssignees}
              availableClients={availableClients}
            />
          ))
        )}
      </div>
    </div>
  );
});
