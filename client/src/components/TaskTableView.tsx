import { useState, useMemo, memo, useCallback } from "react";
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
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { Task, TaskStatus, TaskPriority } from "@/types/task";
import { TableHeader, type Column } from "@/components/table/TableHeader";
import { TableBulkActions } from "@/components/table/TableBulkActions";
import { TaskTableRow } from "@/components/table/TaskTableRow";
import { useColumnResize } from "@/hooks/useColumnResize";

interface TaskTableViewProps {
  tasks: Task[];
  selectedTaskIds: Set<string>;
  onTaskClick?: (task: Task) => void;
  onUpdateTask?: (taskId: string, updates: Partial<Task>) => void;
  onBulkUpdate?: (updates: Partial<Task>) => void;
  onSelectionChange?: (taskIds: Set<string>, lastId?: string) => void;
  onAddTask?: () => void;
  onReorderTasks?: (tasks: Task[]) => void;
  availableAssignees?: string[];
  availableClients?: string[];
}

const DEFAULT_COLUMNS: Column[] = [
  { id: "title", label: "Tarefa", width: "minmax(75px, 1fr)" },
  { id: "status", label: "Status", width: "120px" },
  { id: "client", label: "Cliente", width: "minmax(75px, 1fr)" },
  { id: "dueDate", label: "Data", width: "110px" },
  { id: "priority", label: "Prioridade", width: "120px" },
  { id: "assignee", label: "Responsável", width: "minmax(100px, 1fr)" },
];

const CONTROL_COLUMNS_WIDTH = 88; // 32px + 24px + 32px
const HEADER_CONTROL_WIDTH = "88px";

export const TaskTableView = memo(function TaskTableView({ 
  tasks,
  selectedTaskIds,
  onTaskClick,
  onUpdateTask,
  onBulkUpdate,
  onSelectionChange,
  onAddTask,
  onReorderTasks,
}: TaskTableViewProps) {
  const { 
    columns, 
    setColumns, 
    handleResizeStart, 
    handleResizeMove, 
    handleResizeEnd 
  } = useColumnResize(DEFAULT_COLUMNS);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  // Selection handlers
  const handleSelectTask = useCallback((taskId: string, checked: boolean, shiftKey: boolean = false) => {
    if (shiftKey && lastSelectedId) {
      const lastIndex = tasks.findIndex(t => t.id === lastSelectedId);
      const currentIndex = tasks.findIndex(t => t.id === taskId);
      
      if (lastIndex !== -1 && currentIndex !== -1) {
        const start = Math.min(lastIndex, currentIndex);
        const end = Math.max(lastIndex, currentIndex);
        const rangeIds = tasks.slice(start, end + 1).map(t => t.id);
        
        const newSelection = new Set(selectedTaskIds);
        rangeIds.forEach(id => newSelection.add(id));
        onSelectionChange?.(newSelection, taskId);
        setLastSelectedId(taskId);
        return;
      }
    }
    
    const newSelection = new Set(selectedTaskIds);
    if (checked) {
      newSelection.add(taskId);
    } else {
      newSelection.delete(taskId);
    }
    onSelectionChange?.(newSelection, taskId);
    setLastSelectedId(taskId);
  }, [selectedTaskIds, onSelectionChange, lastSelectedId, tasks]);

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      onSelectionChange?.(new Set(tasks.map(t => t.id)));
    } else {
      onSelectionChange?.(new Set());
    }
    setLastSelectedId(null);
  }, [tasks, onSelectionChange]);

  const handleClearSelection = useCallback(() => {
    onSelectionChange?.(new Set());
    setLastSelectedId(null);
  }, [onSelectionChange]);

  // Bulk action handlers
  const handleBulkStatusChange = useCallback((status: TaskStatus) => {
    if (selectedTaskIds.size > 0 && onBulkUpdate) {
      onBulkUpdate({ status });
    }
  }, [selectedTaskIds, onBulkUpdate]);

  const handleBulkPriorityChange = useCallback((priority: TaskPriority | "_none") => {
    if (selectedTaskIds.size > 0 && onBulkUpdate) {
      onBulkUpdate({ priority: priority === "_none" ? undefined : priority });
    }
  }, [selectedTaskIds, onBulkUpdate]);

  const handleBulkDateChange = useCallback((date: Date | undefined) => {
    if (selectedTaskIds.size > 0 && onBulkUpdate && date) {
      onBulkUpdate({ dueDate: date });
    }
  }, [selectedTaskIds, onBulkUpdate]);

  const handleBulkClientChange = useCallback((clientName: string | undefined) => {
    if (selectedTaskIds.size > 0 && onBulkUpdate) {
      onBulkUpdate({ clientName });
    }
  }, [selectedTaskIds, onBulkUpdate]);

  const handleBulkAssigneesChange = useCallback((assignees: string[]) => {
    if (selectedTaskIds.size > 0 && onBulkUpdate) {
      onBulkUpdate({ assignees });
    }
  }, [selectedTaskIds, onBulkUpdate]);

  // Computed values
  const allSelected = tasks.length > 0 && tasks.every(t => selectedTaskIds.has(t.id));
  const someSelected = tasks.some(t => selectedTaskIds.has(t.id)) && !allSelected;
  const hasSelection = selectedTaskIds.size > 0;

  return (
    <div className="flex-1 overflow-auto" data-testid="table-view-container">
      {hasSelection && (
        <TableBulkActions
          selectedCount={selectedTaskIds.size}
          onStatusChange={handleBulkStatusChange}
          onPriorityChange={handleBulkPriorityChange}
          onDateChange={handleBulkDateChange}
          onClientChange={handleBulkClientChange}
          onAssigneesChange={handleBulkAssigneesChange}
          onClearSelection={handleClearSelection}
        />
      )}
      <div className="min-w-max">
        <DndContext 
          sensors={sensors} 
          collisionDetection={closestCenter} 
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <TableHeader
            columns={columns}
            controlWidth={HEADER_CONTROL_WIDTH}
            allSelected={allSelected}
            someSelected={someSelected}
            onSelectAll={handleSelectAll}
            stickyOffset="0"
            onResizeStart={handleResizeStart}
            onResizeMove={handleResizeMove}
            onResizeEnd={handleResizeEnd}
          />
          
          {tasks.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground" data-testid="text-empty-table">
              Nenhuma tarefa encontrada
            </div>
          ) : (
            <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
              {tasks.map((task) => (
                <TaskTableRow 
                  key={task.id} 
                  task={task} 
                  columns={columns}
                  controlColumnsWidth={CONTROL_COLUMNS_WIDTH}
                  isSelected={selectedTaskIds.has(task.id)}
                  onTitleClick={() => onTaskClick?.(task)}
                  onSelectChange={(checked, shiftKey) => handleSelectTask(task.id, checked, shiftKey)}
                  onUpdateTask={(updates) => onUpdateTask?.(task.id, updates)}
                  onAddTask={onAddTask}
                />
              ))}
            </SortableContext>
          )}
        </DndContext>
      </div>
    </div>
  );
});
