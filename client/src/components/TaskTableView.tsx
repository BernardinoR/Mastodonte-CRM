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
import { GripVertical, FileText, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Task, TaskStatus, TaskPriority } from "@/types/task";
import { STATUS_CONFIG, PRIORITY_CONFIG } from "@/lib/statusConfig";

interface TaskTableViewProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
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
      {...attributes}
    >
      <GripVertical 
        className="w-3 h-3 cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-muted-foreground" 
        {...listeners}
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

const AssigneeBadge = memo(function AssigneeBadge({ name }: { name: string }) {
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[9px] font-medium text-white">
        {initials}
      </div>
      <span className="text-xs text-foreground truncate max-w-[120px]">{name}</span>
    </div>
  );
});

const TaskRow = memo(function TaskRow({ 
  task, 
  columns,
  onClick 
}: { 
  task: Task; 
  columns: Column[];
  onClick?: () => void;
}) {
  const renderCell = (columnId: string) => {
    switch (columnId) {
      case "title":
        return (
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="text-sm text-foreground truncate">{task.title}</span>
          </div>
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
        return task.assignees.length > 0 ? (
          <AssigneeBadge name={task.assignees[0]} />
        ) : (
          <span className="text-muted-foreground text-xs">-</span>
        );
      default:
        return null;
    }
  };

  return (
    <div 
      className="grid border-b border-border/50 hover-elevate cursor-pointer"
      style={{
        gridTemplateColumns: columns.map(c => c.width).join(" "),
      }}
      onClick={onClick}
      data-testid={`row-task-${task.id}`}
    >
      {columns.map((column) => (
        <div 
          key={column.id} 
          className="px-3 py-2.5 flex items-center"
        >
          {renderCell(column.id)}
        </div>
      ))}
    </div>
  );
});

export const TaskTableView = memo(function TaskTableView({ 
  tasks,
  onTaskClick 
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

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => a.order - b.order);
  }, [tasks]);

  return (
    <div className="w-full bg-card border border-border rounded-lg overflow-hidden">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div 
          className="grid bg-muted/30 border-b border-border"
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
      </DndContext>

      <div className="max-h-[calc(100vh-280px)] overflow-y-auto">
        {sortedTasks.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            Nenhuma tarefa encontrada
          </div>
        ) : (
          sortedTasks.map((task) => (
            <TaskRow 
              key={task.id} 
              task={task} 
              columns={columns}
              onClick={() => onTaskClick?.(task)}
            />
          ))
        )}
      </div>
    </div>
  );
});
