import { useState, useMemo, memo } from "react";
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
import { GripVertical, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { Task, TaskStatus, TaskPriority } from "@/types/task";
import { STATUS_CONFIG, PRIORITY_CONFIG } from "@/lib/statusConfig";

interface TaskTableViewProps {
  tasks: Task[];
  selectedTaskIds: Set<string>;
  onTaskClick?: (task: Task) => void;
  onTaskFieldClick?: (task: Task, field: string) => void;
  onSelectionChange?: (taskIds: Set<string>, lastId?: string) => void;
}

interface Column {
  id: string;
  label: string;
  width: string;
}

const DEFAULT_COLUMNS: Column[] = [
  { id: "title", label: "Tarefa", width: "minmax(200px, 2fr)" },
  { id: "status", label: "Status", width: "100px" },
  { id: "client", label: "Cliente", width: "minmax(150px, 1fr)" },
  { id: "dueDate", label: "Data", width: "110px" },
  { id: "priority", label: "Prioridade", width: "120px" },
  { id: "assignee", label: "Pessoa", width: "minmax(150px, 1fr)" },
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
        "flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider select-none",
        isDragging && "opacity-50 bg-accent/20 rounded"
      )}
      data-testid={`header-column-${column.id}`}
      {...attributes}
    >
      <GripVertical 
        className="w-3 h-3 cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-muted-foreground" 
        {...listeners}
        data-testid={`drag-handle-${column.id}`}
      />
      <span>{column.label}</span>
    </div>
  );
});

const StatusBadge = memo(function StatusBadge({ status }: { status: TaskStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge 
      variant="secondary" 
      className={cn("text-[10px] px-2 py-0.5", config?.bgColor, config?.textColor)}
    >
      {status === "To Do" ? "To Do" : status === "In Progress" ? "In Progress" : "Done"}
    </Badge>
  );
});

const PriorityBadge = memo(function PriorityBadge({ priority }: { priority?: TaskPriority }) {
  if (!priority) return <span className="text-muted-foreground text-xs">-</span>;
  const config = PRIORITY_CONFIG[priority];
  return (
    <Badge 
      variant="secondary" 
      className={cn("text-[10px] px-2 py-0.5", config?.bgColor, config?.textColor)}
    >
      {priority}
    </Badge>
  );
});

const AssigneeDisplay = memo(function AssigneeDisplay({ assignees }: { assignees: string[] }) {
  if (assignees.length === 0) return <span className="text-muted-foreground text-xs">-</span>;
  
  const firstAssignee = assignees[0];
  const initials = firstAssignee.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const remaining = assignees.length - 1;
  
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[9px] font-medium text-white shrink-0">
        {initials}
      </div>
      <span className="text-xs text-foreground truncate max-w-[100px]">{firstAssignee}</span>
      {remaining > 0 && (
        <span className="text-[10px] text-muted-foreground">+{remaining}</span>
      )}
    </div>
  );
});

const TaskRow = memo(function TaskRow({ 
  task, 
  columns,
  isSelected,
  onTitleClick,
  onFieldClick,
  onSelectChange,
}: { 
  task: Task; 
  columns: Column[];
  isSelected: boolean;
  onTitleClick?: () => void;
  onFieldClick?: (field: string) => void;
  onSelectChange?: (checked: boolean) => void;
}) {
  const renderCell = (columnId: string) => {
    switch (columnId) {
      case "title":
        return (
          <span 
            className="text-sm text-foreground truncate hover:text-primary hover:underline cursor-pointer"
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
        return <StatusBadge status={task.status} />;
      case "client":
        return task.clientName ? (
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="text-xs text-foreground truncate">{task.clientName}</span>
          </div>
        ) : (
          <span className="text-muted-foreground text-xs">-</span>
        );
      case "dueDate":
        return (
          <span className="text-xs text-foreground">
            {format(task.dueDate, "dd/MM/yyyy", { locale: ptBR })}
          </span>
        );
      case "priority":
        return <PriorityBadge priority={task.priority} />;
      case "assignee":
        return <AssigneeDisplay assignees={task.assignees} />;
      default:
        return null;
    }
  };

  return (
    <div 
      className="grid border-b border-border/50 hover-elevate group"
      style={{
        gridTemplateColumns: `36px ${columns.map(c => c.width).join(" ")}`,
      }}
      data-testid={`row-task-${task.id}`}
    >
      <div className="px-2 py-2.5 flex items-center justify-center">
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
          className={cn(
            "px-3 py-2.5 flex items-center",
            column.id !== "title" && "cursor-pointer hover:bg-accent/30"
          )}
          onClick={column.id !== "title" ? (e) => {
            e.stopPropagation();
            onFieldClick?.(column.id);
          } : undefined}
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
  onTaskFieldClick,
  onSelectionChange,
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

  const allSelected = tasks.length > 0 && tasks.every(t => selectedTaskIds.has(t.id));
  const someSelected = tasks.some(t => selectedTaskIds.has(t.id)) && !allSelected;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const newSelection = new Set(tasks.map(t => t.id));
      const lastId = tasks.length > 0 ? tasks[tasks.length - 1].id : undefined;
      onSelectionChange?.(newSelection, lastId);
    } else {
      onSelectionChange?.(new Set(), undefined);
    }
  };

  const handleSelectTask = (taskId: string, checked: boolean) => {
    const newSelection = new Set(selectedTaskIds);
    if (checked) {
      newSelection.add(taskId);
    } else {
      newSelection.delete(taskId);
    }
    onSelectionChange?.(newSelection, taskId);
  };

  return (
    <div className="w-full bg-card border border-border rounded-lg overflow-hidden" data-testid="table-tasks">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div 
          className="grid bg-muted/30 border-b border-border group"
          style={{
            gridTemplateColumns: `36px ${columns.map(c => c.width).join(" ")}`,
          }}
          data-testid="table-header"
        >
          <div className="px-2 py-2 flex items-center justify-center">
            <Checkbox
              checked={allSelected ? true : someSelected ? "indeterminate" : false}
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

      <div className="max-h-[calc(100vh-280px)] overflow-y-auto" data-testid="table-body">
        {tasks.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground" data-testid="text-empty-table">
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
              onFieldClick={(field) => onTaskFieldClick?.(task, field)}
              onSelectChange={(checked) => handleSelectTask(task.id, checked as boolean)}
            />
          ))
        )}
      </div>
    </div>
  );
});
