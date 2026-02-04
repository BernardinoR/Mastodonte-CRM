import { useState, useMemo, memo, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SmartPointerSensor } from "../lib/dndSensors";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { Task, TaskStatus, TaskPriority } from "../types/task";
import { TableHeader, type Column } from "./table/TableHeader";
import { TableBulkActions } from "./table/TableBulkActions";
import { TaskTableRow } from "./table/TaskTableRow";
import { useColumnResize } from "@/shared/hooks/useColumnResize";

interface TaskTableViewProps {
  tasks: Task[];
  selectedTaskIds: Set<string>;
  editingTaskId?: string | null;
  onTaskClick?: (task: Task) => void;
  onUpdateTask?: (taskId: string, updates: Partial<Task>) => void;
  onBulkUpdate?: (updates: Partial<Task>) => void;
  onBulkAddAssignee?: (assignee: string) => void;
  onBulkRemoveAssignee?: (assignee: string) => void;
  onBulkDelete?: () => void;
  onSelectionChange?: (taskIds: Set<string>, lastId?: string) => void;
  onAddTaskAfter?: (afterTaskId: string) => void;
  onStartEditing?: (taskId: string) => void;
  onFinishEditing?: (taskId: string) => void;
  onReorderTasks?: (tasks: Task[]) => void;
  onDeleteTask?: (taskId: string) => void;
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
  editingTaskId,
  onTaskClick,
  onUpdateTask,
  onBulkUpdate,
  onBulkAddAssignee,
  onBulkRemoveAssignee,
  onBulkDelete,
  onSelectionChange,
  onAddTaskAfter,
  onStartEditing,
  onFinishEditing,
  onReorderTasks,
  onDeleteTask,
}: TaskTableViewProps) {
  const { columns, setColumns, handleResizeStart, handleResizeMove, handleResizeEnd } =
    useColumnResize(DEFAULT_COLUMNS);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(SmartPointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const taskIds = useMemo(() => tasks.map((t) => `task-${t.id}`), [tasks]);

  // Handler para drag de LINHAS (restrito ao eixo vertical)
  const handleRowDragStart = useCallback((event: DragStartEvent) => {
    const activeIdStr = event.active.id as string;
    // Só processa se for uma linha (task-)
    if (activeIdStr.startsWith("task-")) {
      setActiveId(activeIdStr);
    }
  }, []);

  const handleRowDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);

      if (!over || active.id === over.id) return;

      const activeIdStr = active.id as string;
      const overIdStr = over.id as string;

      // Só processa se ambos forem linhas (task-)
      if (activeIdStr.startsWith("task-") && overIdStr.startsWith("task-")) {
        const activeTaskId = activeIdStr.replace("task-", "");
        const overTaskId = overIdStr.replace("task-", "");

        const oldIndex = tasks.findIndex((t) => t.id === activeTaskId);
        const newIndex = tasks.findIndex((t) => t.id === overTaskId);

        if (oldIndex !== -1 && newIndex !== -1) {
          const reorderedTasks = arrayMove([...tasks], oldIndex, newIndex);
          onReorderTasks?.(reorderedTasks);
        }
      }
    },
    [tasks, onReorderTasks],
  );

  // Handler para drag de COLUNAS (será usado no TableHeader)
  const handleColumnDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

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
      }
    },
    [setColumns],
  );

  // Selection handlers
  const handleSelectTask = useCallback(
    (taskId: string, checked: boolean, shiftKey: boolean = false) => {
      if (shiftKey && lastSelectedId) {
        const lastIndex = tasks.findIndex((t) => t.id === lastSelectedId);
        const currentIndex = tasks.findIndex((t) => t.id === taskId);

        if (lastIndex !== -1 && currentIndex !== -1) {
          const start = Math.min(lastIndex, currentIndex);
          const end = Math.max(lastIndex, currentIndex);
          const rangeIds = tasks.slice(start, end + 1).map((t) => t.id);

          const newSelection = new Set(selectedTaskIds);
          rangeIds.forEach((id) => newSelection.add(id));
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
    },
    [selectedTaskIds, onSelectionChange, lastSelectedId, tasks],
  );

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        onSelectionChange?.(new Set(tasks.map((t) => t.id)));
      } else {
        onSelectionChange?.(new Set());
      }
      setLastSelectedId(null);
    },
    [tasks, onSelectionChange],
  );

  const handleClearSelection = useCallback(() => {
    onSelectionChange?.(new Set());
    setLastSelectedId(null);
  }, [onSelectionChange]);

  // Bulk action handlers
  const handleBulkStatusChange = useCallback(
    (status: TaskStatus) => {
      if (selectedTaskIds.size > 0 && onBulkUpdate) {
        onBulkUpdate({ status });
      }
    },
    [selectedTaskIds, onBulkUpdate],
  );

  const handleBulkPriorityChange = useCallback(
    (priority: TaskPriority | "_none") => {
      if (selectedTaskIds.size > 0 && onBulkUpdate) {
        onBulkUpdate({ priority: priority === "_none" ? undefined : priority });
      }
    },
    [selectedTaskIds, onBulkUpdate],
  );

  const handleBulkDateChange = useCallback(
    (date: Date | undefined) => {
      if (selectedTaskIds.size > 0 && onBulkUpdate && date) {
        onBulkUpdate({ dueDate: date });
      }
    },
    [selectedTaskIds, onBulkUpdate],
  );

  const handleBulkClientChange = useCallback(
    (clientName: string | undefined) => {
      if (selectedTaskIds.size > 0 && onBulkUpdate) {
        onBulkUpdate({ clientName });
      }
    },
    [selectedTaskIds, onBulkUpdate],
  );

  // Compute union of all assignees from selected tasks (shows everyone assigned to at least one task)
  const selectedAssignees = useMemo(() => {
    const assigneeSet = new Set<string>();
    tasks.forEach((task) => {
      if (selectedTaskIds.has(task.id) && task.assignees) {
        task.assignees.forEach((a) => assigneeSet.add(a));
      }
    });
    return Array.from(assigneeSet);
  }, [tasks, selectedTaskIds]);

  // Computed values
  const allSelected = tasks.length > 0 && tasks.every((t) => selectedTaskIds.has(t.id));
  const someSelected = tasks.some((t) => selectedTaskIds.has(t.id)) && !allSelected;
  const hasSelection = selectedTaskIds.size > 0;

  return (
    <div className="flex-1 overflow-auto" data-testid="table-view-container">
      {hasSelection && (
        <TableBulkActions
          selectedCount={selectedTaskIds.size}
          selectedAssignees={selectedAssignees}
          onStatusChange={handleBulkStatusChange}
          onPriorityChange={handleBulkPriorityChange}
          onDateChange={handleBulkDateChange}
          onClientChange={handleBulkClientChange}
          onAddAssignee={(assignee) => onBulkAddAssignee?.(assignee)}
          onRemoveAssignee={(assignee) => onBulkRemoveAssignee?.(assignee)}
          onDelete={() => onBulkDelete?.()}
          onClearSelection={handleClearSelection}
        />
      )}
      <div className="min-w-max">
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
          onColumnReorder={handleColumnDragEnd}
        />
        {tasks.length === 0 ? (
          <div
            className="flex items-center justify-center py-16 text-muted-foreground"
            data-testid="text-empty-table"
          >
            Nenhuma tarefa encontrada
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragStart={handleRowDragStart}
            onDragEnd={handleRowDragEnd}
          >
            <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
              {tasks.map((task) => (
                <TaskTableRow
                  key={task.id}
                  task={task}
                  columns={columns}
                  controlColumnsWidth={CONTROL_COLUMNS_WIDTH}
                  isSelected={selectedTaskIds.has(task.id)}
                  isEditing={editingTaskId === task.id}
                  selectedTaskIds={selectedTaskIds}
                  onRowClick={() => onTaskClick?.(task)}
                  onStartEditing={() => onStartEditing?.(task.id)}
                  onSelectChange={(checked, shiftKey) =>
                    handleSelectTask(task.id, checked, shiftKey)
                  }
                  onUpdateTask={(updates) => onUpdateTask?.(task.id, updates)}
                  onBulkUpdate={(updates) => onBulkUpdate?.(updates)}
                  onBulkAddAssignee={(assignee) => onBulkAddAssignee?.(assignee)}
                  onBulkRemoveAssignee={(assignee) => onBulkRemoveAssignee?.(assignee)}
                  onAddTaskAfter={() => onAddTaskAfter?.(task.id)}
                  onFinishEditing={() => onFinishEditing?.(task.id)}
                  onDeleteTask={() => onDeleteTask?.(task.id)}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
});
