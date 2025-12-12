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
  DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, CalendarIcon, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { Task, TaskStatus, TaskPriority } from "@/types/task";
import { STATUS_CONFIG, PRIORITY_CONFIG, UI_CLASSES } from "@/lib/statusConfig";
import { PriorityBadge as PriorityBadgeShared, StatusBadge as StatusBadgeShared, PRIORITY_OPTIONS, STATUS_OPTIONS } from "@/components/ui/task-badges";
import { DateInput } from "@/components/ui/date-input";
import { ClientSelector, AssigneeSelector } from "@/components/task-editors";

interface TaskTableViewProps {
  tasks: Task[];
  selectedTaskIds: Set<string>;
  onTaskClick?: (task: Task) => void;
  onUpdateTask?: (taskId: string, updates: Partial<Task>) => void;
  onBulkUpdate?: (taskIds: string[], updates: Partial<Task>) => void;
  onSelectionChange?: (taskIds: Set<string>, lastId?: string) => void;
  onAddTask?: () => void;
  onReorderTasks?: (tasks: Task[]) => void;
  availableAssignees?: string[];
  availableClients?: string[];
}

interface Column {
  id: string;
  label: string;
  width: string;
}

const DEFAULT_COLUMNS: Column[] = [
  { id: "title", label: "Tarefa", width: "minmax(200px, 1.5fr)" },
  { id: "status", label: "Status", width: "120px" },
  { id: "client", label: "Cliente", width: "minmax(180px, 1fr)" },
  { id: "dueDate", label: "Data", width: "110px" },
  { id: "priority", label: "Prioridade", width: "120px" },
  { id: "assignee", label: "Responsável", width: "minmax(200px, 1.5fr)" },
];

const CONTROL_COLUMNS_WIDTH = "32px 24px 32px";
const HEADER_CONTROL_WIDTH = "88px";

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
  } = useSortable({ id: `col-${column.id}` });

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
        "text-muted-foreground",
        isDragging && "opacity-50 bg-muted rounded"
      )}
      data-testid={`header-column-${column.id}`}
      {...attributes}
      {...listeners}
    >
      <GripVertical 
        className="w-3 h-3 text-muted-foreground/50 hover:text-muted-foreground" 
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
  if (!priority) return <span className="text-muted-foreground text-sm cursor-pointer hover:text-foreground">Definir</span>;
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
  if (assignees.length === 0) return <span className="text-muted-foreground text-sm cursor-pointer hover:text-foreground">Atribuir</span>;
  
  const firstAssignee = assignees[0];
  const initials = firstAssignee.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const shortName = firstAssignee.split(" ").length > 1 
    ? `${firstAssignee.split(" ")[0]} ${firstAssignee.split(" ")[1]?.[0] || ""}.`
    : firstAssignee;
  const remaining = assignees.length - 1;
  
  return (
    <div className="flex items-center gap-2 cursor-pointer">
      <div className="w-6 h-6 rounded-full bg-slate-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
        {initials}
      </div>
      <span className="text-sm text-muted-foreground truncate">{shortName}</span>
      {remaining > 0 && (
        <span className="text-xs text-muted-foreground">+{remaining}</span>
      )}
    </div>
  );
});

interface SortableTaskRowProps {
  task: Task;
  columns: Column[];
  isSelected: boolean;
  onTitleClick?: () => void;
  onSelectChange?: (checked: boolean) => void;
  onUpdateTask?: (updates: Partial<Task>) => void;
  onAddTask?: () => void;
  availableAssignees?: string[];
  availableClients?: string[];
  isDragging?: boolean;
}

const SortableTaskRow = memo(function SortableTaskRow(props: SortableTaskRowProps) {
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
      <TaskRowContent 
        {...props} 
        dragListeners={listeners}
        dragAttributes={attributes}
        isDragging={isDragging}
      />
    </div>
  );
});

interface TaskRowContentProps extends SortableTaskRowProps {
  dragListeners?: any;
  dragAttributes?: any;
}

const TaskRowContent = memo(function TaskRowContent({ 
  task, 
  columns,
  isSelected,
  onTitleClick,
  onSelectChange,
  onUpdateTask,
  onAddTask,
  availableAssignees = [],
  availableClients = [],
  dragListeners,
  dragAttributes,
  isDragging,
}: TaskRowContentProps) {
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
            className="text-sm font-medium text-foreground truncate hover:text-primary hover:underline cursor-pointer"
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
                  <span className="text-sm text-muted-foreground truncate hover:text-foreground">{task.clientName}</span>
                ) : (
                  <span className="text-muted-foreground text-sm hover:text-foreground">Selecionar</span>
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
              <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground">
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
                  <span className="text-xs text-muted-foreground">Remover prioridade</span>
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
        "flex group",
        isSelected && "bg-primary/10"
      )}
      data-testid={`row-task-${task.id}`}
    >
      <div 
        className="flex items-center py-3"
        style={{ width: CONTROL_COLUMNS_WIDTH.split(" ").reduce((acc, w) => acc + parseInt(w), 0) + "px" }}
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
            onCheckedChange={onSelectChange}
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
            className="px-4 py-3 flex items-center"
          >
            {renderCell(column.id)}
          </div>
        ))}
      </div>
    </div>
  );
});

export const TaskTableView = memo(function TaskTableView({ 
  tasks,
  selectedTaskIds,
  onTaskClick,
  onUpdateTask,
  onBulkUpdate,
  onSelectionChange,
  onAddTask,
  onReorderTasks,
  availableAssignees = [],
  availableClients = [],
}: TaskTableViewProps) {
  const [columns, setColumns] = useState<Column[]>(DEFAULT_COLUMNS);
  const [activeId, setActiveId] = useState<string | null>(null);

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

  const columnIds = useMemo(() => columns.map(c => `col-${c.id}`), [columns]);
  const taskIds = useMemo(() => tasks.map(t => `task-${t.id}`), [tasks]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    
    if (!over || active.id === over.id) return;

    const activeIdStr = active.id as string;
    const overIdStr = over.id as string;

    if (activeIdStr.startsWith("col-") && overIdStr.startsWith("col-")) {
      const activeColId = activeIdStr.replace("col-", "");
      const overColId = overIdStr.replace("col-", "");
      
      setColumns((items) => {
        const oldIndex = items.findIndex((i) => i.id === activeColId);
        const newIndex = items.findIndex((i) => i.id === overColId);
        return arrayMove(items, oldIndex, newIndex);
      });
    } else if (activeIdStr.startsWith("task-") && overIdStr.startsWith("task-")) {
      const activeTaskId = activeIdStr.replace("task-", "");
      const overTaskId = overIdStr.replace("task-", "");
      
      const oldIndex = tasks.findIndex((t) => t.id === activeTaskId);
      const newIndex = tasks.findIndex((t) => t.id === overTaskId);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedTasks = arrayMove([...tasks], oldIndex, newIndex);
        onReorderTasks?.(reorderedTasks);
      }
    }
  }, [tasks, onReorderTasks]);

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
  const hasSelection = selectedTaskIds.size > 0;

  const handleClearSelection = useCallback(() => {
    onSelectionChange?.(new Set());
  }, [onSelectionChange]);

  const handleBulkStatusChange = useCallback((status: TaskStatus) => {
    if (hasSelection && onBulkUpdate) {
      onBulkUpdate(Array.from(selectedTaskIds), { status });
    }
  }, [hasSelection, selectedTaskIds, onBulkUpdate]);

  const handleBulkPriorityChange = useCallback((priority: TaskPriority | "_none") => {
    if (hasSelection && onBulkUpdate) {
      onBulkUpdate(Array.from(selectedTaskIds), { priority: priority === "_none" ? undefined : priority });
    }
  }, [hasSelection, selectedTaskIds, onBulkUpdate]);

  const handleBulkDateChange = useCallback((date: Date | undefined) => {
    if (hasSelection && onBulkUpdate && date) {
      onBulkUpdate(Array.from(selectedTaskIds), { dueDate: date });
    }
  }, [hasSelection, selectedTaskIds, onBulkUpdate]);

  const [bulkStatusOpen, setBulkStatusOpen] = useState(false);
  const [bulkPriorityOpen, setBulkPriorityOpen] = useState(false);
  const [bulkDateOpen, setBulkDateOpen] = useState(false);

  return (
    <div className="flex-1 overflow-auto" data-testid="table-view-container">
      {hasSelection && (
        <div className="flex items-center gap-2 px-4 h-10 bg-primary/10 border-b border-border sticky top-0 z-20" data-testid="bulk-actions-bar">
          <span className="text-sm font-medium text-primary" data-testid="text-selected-count">
            {selectedTaskIds.size} selecionado{selectedTaskIds.size > 1 ? "s" : ""}
          </span>
          <div className="flex items-center gap-1 ml-2">
            <Popover open={bulkStatusOpen} onOpenChange={setBulkStatusOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" data-testid="button-bulk-status">
                  Status
                </Button>
              </PopoverTrigger>
              <PopoverContent className={cn("w-48 p-1", UI_CLASSES.popover)} side="bottom" align="start">
                {STATUS_OPTIONS.map((s) => (
                  <div
                    key={s}
                    className={cn("px-2 py-1.5 cursor-pointer rounded-md", UI_CLASSES.dropdownItem)}
                    onClick={() => { handleBulkStatusChange(s); setBulkStatusOpen(false); }}
                  >
                    <StatusBadgeShared status={s} />
                  </div>
                ))}
              </PopoverContent>
            </Popover>
            <Popover open={bulkPriorityOpen} onOpenChange={setBulkPriorityOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" data-testid="button-bulk-priority">
                  Prioridade
                </Button>
              </PopoverTrigger>
              <PopoverContent className={cn("w-48 p-1", UI_CLASSES.popover)} side="bottom" align="start">
                {PRIORITY_OPTIONS.map((p) => (
                  <div
                    key={p}
                    className={cn("px-2 py-1.5 cursor-pointer rounded-md", UI_CLASSES.dropdownItem)}
                    onClick={() => { handleBulkPriorityChange(p); setBulkPriorityOpen(false); }}
                  >
                    <PriorityBadgeShared priority={p} />
                  </div>
                ))}
              </PopoverContent>
            </Popover>
            <Popover open={bulkDateOpen} onOpenChange={setBulkDateOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" data-testid="button-bulk-date">
                  <CalendarIcon className="w-3 h-3 mr-1" />
                  Data e Hora
                </Button>
              </PopoverTrigger>
              <PopoverContent className={cn("w-auto p-0", UI_CLASSES.popover)} side="bottom" align="start">
                <DateInput
                  value=""
                  onChange={(date) => { handleBulkDateChange(date); setBulkDateOpen(false); }}
                />
              </PopoverContent>
            </Popover>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 ml-auto" 
            onClick={handleClearSelection}
            data-testid="button-clear-selection"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
      <div className="min-w-max">
        <DndContext 
          sensors={sensors} 
          collisionDetection={closestCenter} 
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className={cn("flex sticky z-10 group bg-background", hasSelection ? "top-10" : "top-0")}>
            <div 
              className="flex items-center justify-end pr-2 py-3"
              style={{ width: HEADER_CONTROL_WIDTH }}
            >
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
            <div 
              className="flex-1 grid border-b border-border bg-background"
              style={{
                gridTemplateColumns: columns.map(c => c.width).join(" "),
              }}
            >
              <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
                {columns.map((column) => (
                  <SortableHeader key={column.id} column={column} />
                ))}
              </SortableContext>
            </div>
          </div>
          
          {tasks.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground" data-testid="text-empty-table">
              Nenhuma tarefa encontrada
            </div>
          ) : (
            <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
              {tasks.map((task) => (
                <SortableTaskRow 
                  key={task.id} 
                  task={task} 
                  columns={columns}
                  isSelected={selectedTaskIds.has(task.id)}
                  onTitleClick={() => onTaskClick?.(task)}
                  onSelectChange={(checked) => handleSelectTask(task.id, checked as boolean)}
                  onUpdateTask={(updates) => onUpdateTask?.(task.id, updates)}
                  onAddTask={onAddTask}
                  availableAssignees={availableAssignees}
                  availableClients={availableClients}
                />
              ))}
            </SortableContext>
          )}

        </DndContext>
      </div>
    </div>
  );
});
