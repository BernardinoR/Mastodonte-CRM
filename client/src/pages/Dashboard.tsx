import { useState, useCallback } from "react";
import { KanbanColumn } from "@/components/KanbanColumn";
import { TaskCard } from "@/components/TaskCard";
import { FilterBar } from "@/components/FilterBar";
import { Button } from "@/components/ui/button";
import { Plus, Circle, CheckCircle2 } from "lucide-react";
import { NewTaskDialog } from "@/components/NewTaskDialog";
import { 
  DndContext, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  DragOverlay,
  closestCenter,
} from "@dnd-kit/core";
import { 
  SortableContext, 
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task, TaskStatus, TaskPriority } from "@/types/task";
import { INITIAL_TASKS, createNewTask } from "@/lib/mock-data";
import { useTaskHistory } from "@/hooks/useTaskHistory";
import { useTaskFilters } from "@/hooks/useTaskFilters";
import { useTaskSelection } from "@/hooks/useTaskSelection";
import { useTaskDrag } from "@/hooks/useTaskDrag";
import { useQuickAddTask } from "@/hooks/useQuickAddTask";

// Sortable placeholder component for cross-column drops
// Defined outside of Dashboard to avoid recreating on every render
function SortablePlaceholder({ id, count }: { id: string; count: number }) {
  const { 
    setNodeRef, 
    transform, 
    transition,
  } = useSortable({ id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    height: count > 1 ? `${count * 5 + 2}rem` : '5rem',
  };
  
  return (
    <div 
      ref={setNodeRef}
      style={style}
      className="rounded-lg border-2 border-dashed border-blue-500/40 bg-blue-500/5 flex items-center justify-center pointer-events-none"
    >
      <span className="text-blue-400/60 text-sm font-medium">
        {count > 1 ? `${count} tarefas` : ''}
      </span>
    </div>
  );
}

export default function Dashboard() {
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  
  // Use the task history hook for undo functionality (Ctrl+Z)
  const { tasks, setTasks, setTasksWithHistory } = useTaskHistory(INITIAL_TASKS);
  
  // Use the task filters hook for search, assignee, and priority filtering
  const {
    searchQuery,
    setSearchQuery,
    assigneeFilter,
    setAssigneeFilter,
    priorityFilter,
    setPriorityFilter,
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
    clearSelection,
    handleSelectTask,
  } = useTaskSelection({ tasks, getTasksByStatus });
  
  // Use the task drag hook for drag-and-drop functionality
  const {
    activeTaskId,
    overColumnId,
    crossColumnPlaceholder,
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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const activeTask = activeTaskId ? tasks.find(t => t.id === activeTaskId) : null;

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    setTasksWithHistory(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? { ...task, ...updates }
          : task
      )
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasksWithHistory(prevTasks => prevTasks.filter(task => task.id !== taskId));
  };


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

  // Quick add task callback
  const handleAddNewTask = useCallback((task: Task) => {
    setTasksWithHistory(prevTasks => [...prevTasks, task]);
  }, [setTasksWithHistory]);

  // Use the quick add task hook
  const { handleQuickAdd } = useQuickAddTask({
    tasks,
    onAddTask: handleAddNewTask,
    onSetEditingTaskId: setEditingTaskId,
  });

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

  // Get count of selected tasks for DragOverlay
  const selectedCount = selectedTaskIds.size;
  const selectedTasks = tasks.filter(t => selectedTaskIds.has(t.id));

  // Helper to render tasks with placeholder at correct position for cross-column drag
  const renderTasksWithPlaceholder = (
    columnTasks: Task[],
    columnStatus: TaskStatus
  ) => {
    const showPlaceholder = crossColumnPlaceholder?.targetStatus === columnStatus;
    
    if (!showPlaceholder) {
      return columnTasks.map(task => (
        <TaskCard
          key={task.id}
          {...task}
          isSelected={selectedTaskIds.has(task.id)}
          selectedCount={selectedTaskIds.has(task.id) ? selectedCount : 0}
          isDragActive={activeTaskId !== null}
          initialEditMode={editingTaskId === task.id}
          onSelect={handleSelectTask}
          onUpdate={handleUpdateTaskWithClearEdit}
          onDelete={handleDeleteTask}
          onFinishEditing={handleFinishEditing}
          onBulkUpdate={handleBulkUpdate}
          onBulkDelete={handleBulkDelete}
          onBulkAppendTitle={handleBulkAppendTitle}
          onBulkReplaceTitle={handleBulkReplaceTitle}
          onBulkAddAssignee={handleBulkAddAssignee}
          onBulkSetAssignees={handleBulkSetAssignees}
          onBulkRemoveAssignee={handleBulkRemoveAssignee}
        />
      ));
    }

    const { insertIndex, count } = crossColumnPlaceholder;
    const placeholderId = `__placeholder__${columnStatus}`;
    const elements: JSX.Element[] = [];
    
    columnTasks.forEach((task, index) => {
      // Insert placeholder before this task if at the right index
      if (index === insertIndex) {
        elements.push(<SortablePlaceholder key={placeholderId} id={placeholderId} count={count} />);
      }
      
      elements.push(
        <TaskCard
          key={task.id}
          {...task}
          isSelected={selectedTaskIds.has(task.id)}
          selectedCount={selectedTaskIds.has(task.id) ? selectedCount : 0}
          isDragActive={activeTaskId !== null}
          initialEditMode={editingTaskId === task.id}
          onSelect={handleSelectTask}
          onUpdate={handleUpdateTaskWithClearEdit}
          onDelete={handleDeleteTask}
          onFinishEditing={handleFinishEditing}
          onBulkUpdate={handleBulkUpdate}
          onBulkDelete={handleBulkDelete}
          onBulkAppendTitle={handleBulkAppendTitle}
          onBulkReplaceTitle={handleBulkReplaceTitle}
          onBulkAddAssignee={handleBulkAddAssignee}
          onBulkSetAssignees={handleBulkSetAssignees}
          onBulkRemoveAssignee={handleBulkRemoveAssignee}
        />
      );
    });
    
    // Insert at end if insertIndex is at or beyond the end
    if (insertIndex >= columnTasks.length) {
      elements.push(<SortablePlaceholder key={placeholderId} id={placeholderId} count={count} />);
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
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">Tarefas</h1>
        <Button onClick={() => setNewTaskOpen(true)} data-testid="button-newtask">
          <Plus className="w-4 h-4 mr-2" />
          Nova Tarefa
        </Button>
      </div>

      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        assigneeFilter={assigneeFilter}
        onAssigneeChange={setAssigneeFilter}
        priorityFilter={priorityFilter}
        onPriorityChange={setPriorityFilter}
      />

      <DndContext 
        sensors={sensors} 
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex items-start gap-6 overflow-x-auto pb-4">
          <KanbanColumn 
            id="To Do"
            title="" 
            count={todoTasks.length} 
            color="text-blue-400"
            borderColor="border-[#303030]"
            backgroundColor="bg-[#202020]"
            onAddTask={handleQuickAdd}
            addButtonTextColor="#8E8B86"
            addButtonHoverBgColor="#262626"
            customIcon={
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#64635E]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#8E8B86]" />
                <span className="text-xs text-white">To Do</span>
              </div>
            }
          >
            <SortableContext items={todoTaskIds} strategy={verticalListSortingStrategy}>
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
            addButtonTextColor="rgb(66,129,220)"
            addButtonHoverBgColor="#243041"
            customIcon={
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[rgb(64,97,145)]">
                <div className="w-1.5 h-1.5 rounded-full bg-[rgb(66,129,220)]" />
                <span className="text-xs text-white">In Progress</span>
              </div>
            }
          >
            <SortableContext items={inProgressTaskIds} strategy={verticalListSortingStrategy}>
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
            addButtonTextColor="rgb(70,161,113)"
            addButtonHoverBgColor="rgb(35,43,38)"
            customIcon={
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[rgb(56,108,78)]">
                <div className="w-1.5 h-1.5 rounded-full bg-[rgb(70,161,113)]" />
                <span className="text-xs text-white">Done</span>
              </div>
            }
          >
            <SortableContext items={doneTaskIds} strategy={verticalListSortingStrategy}>
              {renderTasksWithPlaceholder(doneTasks, "Done")}
            </SortableContext>
          </KanbanColumn>
        </div>
        
        <DragOverlay>
          {activeTask && (
            <div className="opacity-95 rotate-2 scale-105 relative">
              {selectedCount > 1 && (
                <>
                  <div className="absolute inset-0 transform translate-x-3 translate-y-3 rounded-lg bg-[#1a1a1a] border border-[#404040] opacity-40" />
                  <div className="absolute inset-0 transform translate-x-1.5 translate-y-1.5 rounded-lg bg-[#222222] border border-[#383838] opacity-60" />
                </>
              )}
              <div className="relative">
                {selectedCount > 1 && (
                  <div className="absolute -top-3 -right-3 z-20 bg-blue-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg border-2 border-blue-400">
                    {selectedCount}
                  </div>
                )}
                <TaskCard
                  {...activeTask}
                  isSelected={false}
                  selectedCount={0}
                  onSelect={() => {}}
                  onUpdate={() => {}}
                  onDelete={() => {}}
                  onBulkUpdate={() => {}}
                  onBulkDelete={() => {}}
                  onBulkAppendTitle={() => {}}
                  onBulkReplaceTitle={() => {}}
                  onBulkAddAssignee={() => {}}
                  onBulkSetAssignees={() => {}}
                  onBulkRemoveAssignee={() => {}}
                />
              </div>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <NewTaskDialog
        open={newTaskOpen}
        onOpenChange={setNewTaskOpen}
        onSubmit={(data) => console.log('New task:', data)}
      />
    </div>
  );
}
