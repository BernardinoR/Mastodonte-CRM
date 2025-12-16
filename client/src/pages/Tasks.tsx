import { useState, useCallback, useMemo, useRef } from "react";
import { KanbanColumn } from "@/components/KanbanColumn";
import { SortableTaskCard } from "@/components/SortableTaskCard";
import { DragPreview } from "@/components/DragPreview";
import { FilterBar } from "@/components/FilterBar";
import { TurboModeOverlay } from "@/components/TurboModeOverlay";
import { TurboSummaryModal } from "@/components/TurboSummaryModal";
import { TaskTableView } from "@/components/TaskTableView";
import { Button } from "@/components/ui/button";
import { Plus, Circle, CheckCircle2, ChevronDown } from "lucide-react";
import { NewTaskDialog } from "@/components/NewTaskDialog";
import { TaskDetailModal } from "@/components/TaskDetailModal";
import { 
  DndContext, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  DragOverlay,
  pointerWithin,
  closestCenter,
  CollisionDetection,
} from "@dnd-kit/core";
import { 
  SortableContext, 
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { Task, TaskStatus, TaskPriority } from "@/types/task";
import { INITIAL_TASKS, createNewTask } from "@/lib/mock-data";
import { useTaskHistory } from "@/hooks/useTaskHistory";
import { useTaskFilters } from "@/hooks/useTaskFilters";
import { useTaskSelection } from "@/hooks/useTaskSelection";
import { useTaskDrag } from "@/hooks/useTaskDrag";
import { useQuickAddTask } from "@/hooks/useQuickAddTask";
import { useTurboMode } from "@/hooks/useTurboMode";

const COLUMN_IDS = ["To Do", "In Progress", "Done"] as const;
const TASKS_PER_PAGE = 25;

export default function Tasks() {
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [isCompact, setIsCompact] = useState(false);
  
  // Pagination state per column - tracks how many tasks are visible
  const [visibleCounts, setVisibleCounts] = useState<Record<TaskStatus, number>>({
    "To Do": TASKS_PER_PAGE,
    "In Progress": TASKS_PER_PAGE,
    "Done": TASKS_PER_PAGE,
  });
  
  // Use the task history hook for undo functionality (Ctrl+Z)
  const { tasks, setTasks, setTasksWithHistory } = useTaskHistory(INITIAL_TASKS);
  
  // Use the task filters hook for search, assignee, and priority filtering
  const {
    viewMode,
    setViewMode,
    sorts,
    setSorts,
    activeFilters,
    addFilter,
    updateFilter,
    removeFilter,
    availableAssignees,
    availableClients,
    resetFilters,
    filteredTasks,
    todoTasks,
    inProgressTasks,
    doneTasks,
  } = useTaskFilters(tasks);
  
  // Helper function for selection hook
  const getTasksByStatus = useCallback((status: TaskStatus): Task[] => {
    if (status === "To Do") return todoTasks;
    if (status === "In Progress") return inProgressTasks;
    return doneTasks;
  }, [todoTasks, inProgressTasks, doneTasks]);
  
  // Use the task selection hook for multi-select with Shift+click
  const {
    selectedTaskIds,
    applySelection,
    clearSelection,
    handleSelectTask,
  } = useTaskSelection({ tasks, getTasksByStatus });
  
  // Use the task drag hook for drag-and-drop functionality
  const {
    activeTaskId,
    dropIndicator,
    todoTaskIds,
    inProgressTaskIds,
    doneTaskIds,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  } = useTaskDrag({
    tasks,
    todoTasks,
    inProgressTasks,
    doneTasks,
    selectedTaskIds,
    setTasksWithHistory,
    clearSelection,
  });

  // Use the turbo mode hook for focused task processing
  const turboMode = useTurboMode(tasks);

  // Visible task IDs for SortableContext (limited by pagination)
  const visibleTodoTaskIds = useMemo(() => 
    todoTaskIds.slice(0, visibleCounts["To Do"]), 
    [todoTaskIds, visibleCounts]
  );
  const visibleInProgressTaskIds = useMemo(() => 
    inProgressTaskIds.slice(0, visibleCounts["In Progress"]), 
    [inProgressTaskIds, visibleCounts]
  );
  const visibleDoneTaskIds = useMemo(() => 
    doneTaskIds.slice(0, visibleCounts["Done"]), 
    [doneTaskIds, visibleCounts]
  );

  // Task column map ref - only updates when actual tasks change (not placeholders)
  const taskColumnMapRef = useRef<Map<string, string>>(new Map());
  useMemo(() => {
    const newMap = new Map<string, string>();
    todoTasks.forEach(t => newMap.set(t.id, "To Do"));
    inProgressTasks.forEach(t => newMap.set(t.id, "In Progress"));
    doneTasks.forEach(t => newMap.set(t.id, "Done"));
    taskColumnMapRef.current = newMap;
  }, [todoTasks, inProgressTasks, doneTasks]);
  
  // Custom collision detection: returns card if cursor is in same column, returns column otherwise
  const customCollisionDetection: CollisionDetection = useMemo(() => {
    return (args) => {
      // Read from ref for O(1) lookup without rebuilding
      const taskColumnMap = taskColumnMapRef.current;
      // Step 1: Detect which column the pointer is currently within
      const pointerCollisions = pointerWithin(args);
      const columnCollision = pointerCollisions.find(
        c => COLUMN_IDS.includes(c.id as typeof COLUMN_IDS[number])
      );
      const pointerColumn = columnCollision?.id as string | undefined;
      
      // Step 2: Find the closest card using closestCenter
      const centerCollisions = closestCenter(args);
      const cardCollision = centerCollisions.find(
        c => !COLUMN_IDS.includes(c.id as typeof COLUMN_IDS[number])
      );
      
      if (cardCollision) {
        // Get which column this card belongs to
        const cardColumn = taskColumnMap.get(cardCollision.id as string);
        
        // If pointer is in the same column as the card, return the card (for sorting animation)
        if (pointerColumn && cardColumn === pointerColumn) {
          return [cardCollision];
        }
        
        // Pointer is in a different column - return the column for cross-column drop
        if (pointerColumn) {
          return [{ id: pointerColumn, data: columnCollision?.data }];
        }
      }
      
      // No card found but pointer is in a column - return column (for empty column drops)
      if (columnCollision) {
        return [columnCollision];
      }
      
      // Final fallback
      return centerCollisions;
    };
  }, []); // No deps needed - reads from ref which is always current

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const activeTask = activeTaskId ? tasks.find(t => t.id === activeTaskId) : null;

  const handleUpdateTask = useCallback((taskId: string, updates: Partial<Task>) => {
    setTasksWithHistory(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? { ...task, ...updates }
          : task
      )
    );
  }, [setTasksWithHistory]);

  const handleDeleteTask = useCallback((taskId: string) => {
    setTasksWithHistory(prevTasks => prevTasks.filter(task => task.id !== taskId));
  }, [setTasksWithHistory]);


  // Bulk update for selected tasks (used by context menu)
  const handleBulkUpdate = useCallback((updates: Partial<Task>) => {
    setTasksWithHistory(prevTasks =>
      prevTasks.map(task =>
        selectedTaskIds.has(task.id)
          ? { ...task, ...updates }
          : task
      )
    );
  }, [selectedTaskIds, setTasksWithHistory]);

  // Bulk delete for selected tasks
  const handleBulkDelete = useCallback(() => {
    setTasksWithHistory(prevTasks => prevTasks.filter(task => !selectedTaskIds.has(task.id)));
    clearSelection();
  }, [selectedTaskIds, clearSelection, setTasksWithHistory]);

  // Bulk append title for selected tasks
  const handleBulkAppendTitle = useCallback((textToAppend: string) => {
    // Add space only if suffix starts with alphanumeric character
    const startsWithAlphanumeric = /^[a-zA-Z0-9\u00C0-\u024F]/.test(textToAppend);
    setTasksWithHistory(prevTasks =>
      prevTasks.map(task => {
        if (!selectedTaskIds.has(task.id)) return task;
        // Add space before suffix if title doesn't end with whitespace and suffix starts with alphanumeric
        const needsSpace = task.title.length > 0 && !/\s$/.test(task.title) && startsWithAlphanumeric;
        const suffix = needsSpace ? " " + textToAppend : textToAppend;
        return { ...task, title: task.title + suffix };
      })
    );
  }, [selectedTaskIds, setTasksWithHistory]);

  // Bulk replace title for selected tasks
  const handleBulkReplaceTitle = useCallback((newTitle: string) => {
    setTasksWithHistory(prevTasks =>
      prevTasks.map(task =>
        selectedTaskIds.has(task.id)
          ? { ...task, title: newTitle }
          : task
      )
    );
  }, [selectedTaskIds, setTasksWithHistory]);

  // Bulk add assignee to selected tasks
  const handleBulkAddAssignee = useCallback((assignee: string) => {
    setTasksWithHistory(prevTasks =>
      prevTasks.map(task =>
        selectedTaskIds.has(task.id)
          ? { 
              ...task, 
              assignees: task.assignees.includes(assignee) 
                ? task.assignees 
                : [...task.assignees, assignee] 
            }
          : task
      )
    );
  }, [selectedTaskIds, setTasksWithHistory]);

  // Bulk set assignees (replace all assignees with new ones)
  const handleBulkSetAssignees = useCallback((assignees: string[]) => {
    setTasksWithHistory(prevTasks =>
      prevTasks.map(task =>
        selectedTaskIds.has(task.id)
          ? { ...task, assignees }
          : task
      )
    );
  }, [selectedTaskIds, setTasksWithHistory]);

  // Bulk remove assignee from selected tasks
  const handleBulkRemoveAssignee = useCallback((assignee: string) => {
    setTasksWithHistory(prevTasks =>
      prevTasks.map(task =>
        selectedTaskIds.has(task.id)
          ? { 
              ...task, 
              assignees: task.assignees.filter(a => a !== assignee)
            }
          : task
      )
    );
  }, [selectedTaskIds, setTasksWithHistory]);

  // Open task detail modal
  const handleOpenDetail = useCallback((taskId: string) => {
    setDetailTaskId(taskId);
  }, []);

  // Get the task being viewed in detail
  const detailTask = detailTaskId ? tasks.find(t => t.id === detailTaskId) : null;

  // Quick add task callback
  const handleAddNewTask = useCallback((task: Task) => {
    setTasksWithHistory(prevTasks => [...prevTasks, task]);
  }, [setTasksWithHistory]);

  // Use the quick add task hook
  const { handleQuickAdd, handleQuickAddTop } = useQuickAddTask({
    tasks,
    onAddTask: handleAddNewTask,
    onSetEditingTaskId: setEditingTaskId,
  });

  // Handle new task from FilterBar - creates inline task at top of To Do column
  const handleNewTaskFromFilterBar = useCallback(() => {
    handleQuickAddTop("To Do");
  }, [handleQuickAddTop]);

  // Update task without clearing edit mode - edit mode is controlled by explicit finish action
  const handleUpdateTaskWithClearEdit = useCallback((taskId: string, updates: Partial<Task>) => {
    handleUpdateTask(taskId, updates);
  }, [handleUpdateTask]);

  // Explicit action to finish editing a new task
  const handleFinishEditing = useCallback((taskId: string) => {
    if (editingTaskId === taskId) {
      setEditingTaskId(null);
    }
  }, [editingTaskId]);

  // Load more tasks for a column
  const handleLoadMore = useCallback((status: TaskStatus) => {
    setVisibleCounts(prev => ({
      ...prev,
      [status]: prev[status] + TASKS_PER_PAGE,
    }));
  }, []);

  // Get count of selected tasks for DragOverlay
  const selectedCount = selectedTaskIds.size;
  const selectedTasks = tasks.filter(t => selectedTaskIds.has(t.id));

  // Custom spring-like drop animation for smooth card landing
  const customDropAnimation = useMemo(() => ({
    sideEffects: ({ active, dragOverlay }: { active: { node: HTMLElement }; dragOverlay: { node: HTMLElement } }) => {
      active.node.style.opacity = '0';
      dragOverlay.node.animate(
        [
          { transform: dragOverlay.node.style.transform, opacity: 1 },
          { transform: 'translate3d(0, 0, 0) scale(1)', opacity: 1 },
        ],
        {
          duration: 250,
          easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)', // Spring-like easing
        }
      );
      return () => {
        active.node.style.opacity = '';
      };
    },
    duration: 250,
    easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
  }), []);

  // CSS-based drop indicator line component with smooth animation
  const DropIndicatorLine = () => (
    <div 
      className="bg-blue-500 rounded-full my-1 shadow-[0_0_8px_rgba(59,130,246,0.5)] animate-in fade-in slide-in-from-top-1 duration-150"
      style={{
        height: '4px',
        animation: 'dropIndicatorExpand 150ms ease-out forwards',
      }}
    />
  );

  // Helper to render tasks with CSS drop indicator for cross-column drag
  const renderTasksWithPlaceholder = (
    columnTasks: Task[],
    columnStatus: TaskStatus
  ) => {
    // Use state-based indicator - only updates when position actually changes
    const showIndicator = dropIndicator?.targetStatus === columnStatus;
    const visibleCount = visibleCounts[columnStatus];
    const visibleTasks = columnTasks.slice(0, visibleCount);
    const hiddenCount = columnTasks.length - visibleTasks.length;
    const hasMore = hiddenCount > 0;
    
    const renderTaskCard = (task: Task) => (
      <SortableTaskCard
        key={task.id}
        {...task}
        isSelected={selectedTaskIds.has(task.id)}
        selectedCount={selectedTaskIds.has(task.id) ? selectedCount : 0}
        isDragActive={activeTaskId !== null}
        initialEditMode={editingTaskId === task.id}
        isCompact={isCompact}
        onSelect={handleSelectTask}
        onUpdate={handleUpdateTaskWithClearEdit}
        onDelete={handleDeleteTask}
        onFinishEditing={handleFinishEditing}
        onOpenDetail={handleOpenDetail}
        onBulkUpdate={handleBulkUpdate}
        onBulkDelete={handleBulkDelete}
        onBulkAppendTitle={handleBulkAppendTitle}
        onBulkReplaceTitle={handleBulkReplaceTitle}
        onBulkAddAssignee={handleBulkAddAssignee}
        onBulkSetAssignees={handleBulkSetAssignees}
        onBulkRemoveAssignee={handleBulkRemoveAssignee}
      />
    );
    
    const loadMoreButton = hasMore ? (
      <button
        key="load-more"
        onClick={() => handleLoadMore(columnStatus)}
        className="flex items-center justify-center gap-2 w-full py-2.5 mt-2 rounded-lg border border-dashed border-[#404040] text-gray-400 text-sm hover:border-[#505050] hover:text-gray-300 hover:bg-[#1a1a1a] transition-colors"
        data-testid={`button-load-more-${columnStatus.toLowerCase().replace(' ', '-')}`}
      >
        <ChevronDown className="w-4 h-4" />
        <span>Carregar mais ({hiddenCount})</span>
      </button>
    ) : null;
    
    if (!showIndicator || !dropIndicator) {
      return (
        <>
          {visibleTasks.map(renderTaskCard)}
          {loadMoreButton}
        </>
      );
    }

    const { insertIndex } = dropIndicator;
    const elements: JSX.Element[] = [];
    
    visibleTasks.forEach((task, index) => {
      // Insert indicator line before this task if at the right index
      if (index === insertIndex) {
        elements.push(<DropIndicatorLine key="drop-indicator" />);
      }
      elements.push(renderTaskCard(task));
    });
    
    // Insert at end if insertIndex is at or beyond the visible tasks
    if (insertIndex >= visibleTasks.length) {
      elements.push(<DropIndicatorLine key="drop-indicator" />);
    }
    
    // Add load more button at the end
    if (loadMoreButton) {
      elements.push(loadMoreButton);
    }
    
    return elements;
  };

  return (
    <div className="p-6" onClick={(e) => {
      // Clear selection when clicking on empty area
      const target = e.target as HTMLElement;
      // Don't clear selection if clicking inside a task card, context menu, dialog, or any Radix UI component
      const isInsideTaskCard = target.closest('[data-task-card]') !== null;
      const isInsideContextMenu = target.closest('[data-radix-menu-content]') !== null;
      const isInsideContextMenuContent = target.closest('[data-radix-context-menu-content]') !== null;
      const isInsideRadixPortal = target.closest('[data-radix-popper-content-wrapper]') !== null;
      const isInsideCalendar = target.closest('[data-calendar-container]') !== null;
      const isInsideDialog = target.closest('[role="dialog"]') !== null;
      const isInsideDialogOverlay = target.closest('[data-radix-dialog-overlay]') !== null;
      const isInsideAlertDialog = target.closest('[role="alertdialog"]') !== null;
      
      if (!isInsideTaskCard && !isInsideContextMenu && !isInsideContextMenuContent && !isInsideRadixPortal && !isInsideCalendar && !isInsideDialog && !isInsideDialogOverlay && !isInsideAlertDialog) {
        clearSelection();
      }
    }}>
      <FilterBar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        sorts={sorts}
        onSortsChange={setSorts}
        activeFilters={activeFilters}
        onAddFilter={addFilter}
        onUpdateFilter={updateFilter}
        onRemoveFilter={removeFilter}
        availableAssignees={availableAssignees}
        availableClients={availableClients}
        onReset={resetFilters}
        onNewTask={handleNewTaskFromFilterBar}
        onTurboMode={turboMode.startTurboMode}
        turboModeTaskCount={turboMode.totalTasks}
        tasks={tasks}
        activePresetId={activePresetId}
        onActivePresetChange={setActivePresetId}
        isCompact={isCompact}
        onCompactModeChange={setIsCompact}
      />

      {viewMode === "table" ? (
        <TaskTableView 
          tasks={filteredTasks}
          selectedTaskIds={selectedTaskIds}
          onTaskClick={(task: Task) => setDetailTaskId(task.id)}
          onUpdateTask={handleUpdateTask}
          onBulkUpdate={handleBulkUpdate}
          onBulkAddAssignee={handleBulkAddAssignee}
          onSelectionChange={applySelection}
          onAddTask={() => setNewTaskOpen(true)}
          onReorderTasks={(reorderedTasks) => setTasks(reorderedTasks)}
          availableAssignees={availableAssignees}
          availableClients={availableClients}
        />
      ) : (
      <DndContext 
        sensors={sensors} 
        collisionDetection={customCollisionDetection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex items-stretch gap-4 pb-4">
          <KanbanColumn 
            id="To Do"
            title="" 
            count={todoTasks.length} 
            color="text-blue-400"
            borderColor="border-[#303030]"
            backgroundColor="bg-[#202020]"
            onAddTask={handleQuickAdd}
            onAddTaskTop={handleQuickAddTop}
            addButtonTextColor="#8E8B86"
            addButtonHoverBgColor="#262626"
            isCompact={isCompact}
            customIcon={
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#64635E]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#8E8B86]" />
                <span className="text-xs text-white">To Do</span>
              </div>
            }
          >
            <SortableContext items={visibleTodoTaskIds} strategy={verticalListSortingStrategy}>
              {renderTasksWithPlaceholder(todoTasks, "To Do")}
            </SortableContext>
          </KanbanColumn>

          <KanbanColumn 
            id="In Progress"
            title="" 
            count={inProgressTasks.length} 
            color="text-blue-400"
            borderColor="border-[#1C2027]"
            backgroundColor="bg-[#1C2027]"
            onAddTask={handleQuickAdd}
            onAddTaskTop={handleQuickAddTop}
            addButtonTextColor="rgb(66,129,220)"
            addButtonHoverBgColor="#243041"
            isCompact={isCompact}
            customIcon={
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[rgb(64,97,145)]">
                <div className="w-1.5 h-1.5 rounded-full bg-[rgb(66,129,220)]" />
                <span className="text-xs text-white">In Progress</span>
              </div>
            }
          >
            <SortableContext items={visibleInProgressTaskIds} strategy={verticalListSortingStrategy}>
              {renderTasksWithPlaceholder(inProgressTasks, "In Progress")}
            </SortableContext>
          </KanbanColumn>

          <KanbanColumn 
            id="Done"
            title="" 
            count={doneTasks.length} 
            color="text-green-400"
            borderColor="border-[rgb(27,33,29)]"
            backgroundColor="bg-[rgb(27,33,29)]"
            onAddTask={handleQuickAdd}
            onAddTaskTop={handleQuickAddTop}
            addButtonTextColor="rgb(70,161,113)"
            addButtonHoverBgColor="rgb(35,43,38)"
            isCompact={isCompact}
            customIcon={
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[rgb(56,108,78)]">
                <div className="w-1.5 h-1.5 rounded-full bg-[rgb(70,161,113)]" />
                <span className="text-xs text-white">Done</span>
              </div>
            }
          >
            <SortableContext items={visibleDoneTaskIds} strategy={verticalListSortingStrategy}>
              {renderTasksWithPlaceholder(doneTasks, "Done")}
            </SortableContext>
          </KanbanColumn>
        </div>
        
        <DragOverlay dropAnimation={customDropAnimation}>
          {activeTask && (
            <DragPreview
              {...activeTask}
              selectedCount={selectedCount}
            />
          )}
        </DragOverlay>
      </DndContext>
      )}

      <NewTaskDialog
        open={newTaskOpen}
        onOpenChange={setNewTaskOpen}
        onSubmit={(data) => console.log('New task:', data)}
      />

      {detailTaskId !== null && detailTask && (
        <TaskDetailModal
          task={detailTask}
          open={true}
          onOpenChange={(open) => !open && setDetailTaskId(null)}
          onUpdateTask={handleUpdateTask}
        />
      )}

      <TurboModeOverlay
        turboMode={turboMode}
        onUpdateTask={handleUpdateTask}
      />

      <TurboSummaryModal
        open={turboMode.state.showSummary}
        onClose={turboMode.closeSummary}
        stats={turboMode.state.sessionStats}
        formatTime={turboMode.formatTime}
      />
    </div>
  );
}
