import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { KanbanColumn } from "@/components/KanbanColumn";
import { TaskCard } from "@/components/TaskCard";
import { FilterBar } from "@/components/FilterBar";
import { Button } from "@/components/ui/button";
import { Plus, Circle, CheckCircle2 } from "lucide-react";
import { NewTaskDialog } from "@/components/NewTaskDialog";
import { 
  DndContext, 
  DragEndEvent, 
  DragStartEvent, 
  DragOverEvent, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  DragOverlay,
  closestCenter,
} from "@dnd-kit/core";
import { 
  SortableContext, 
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task, TaskStatus, TaskPriority } from "@/types/task";
import { INITIAL_TASKS, createNewTask } from "@/lib/mock-data";
import { useTaskHistory } from "@/hooks/useTaskHistory";
import { useTaskFilters } from "@/hooks/useTaskFilters";
import { useTaskSelection } from "@/hooks/useTaskSelection";

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
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [overColumnId, setOverColumnId] = useState<string | null>(null);
  
  // Cross-column drop placeholder state
  const [crossColumnPlaceholder, setCrossColumnPlaceholder] = useState<{
    targetStatus: TaskStatus;
    insertIndex: number;
    count: number;
  } | null>(null);
  
  // Projection ref for drag - stores the final calculated position
  const projectionRef = useRef<{
    movingIds: string[];
    targetStatus: TaskStatus;
    insertIndex: number;
  } | null>(null);
  
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
  
  // Task IDs for SortableContext - inject placeholder during cross-column drag
  const todoTaskIds = useMemo(() => {
    const baseIds = todoTasks.map(t => t.id);
    if (!crossColumnPlaceholder || crossColumnPlaceholder.targetStatus !== "To Do") {
      return baseIds;
    }
    const placeholderId = "__placeholder__To Do";
    const result = [...baseIds];
    result.splice(crossColumnPlaceholder.insertIndex, 0, placeholderId);
    return result;
  }, [todoTasks, crossColumnPlaceholder]);
  
  const inProgressTaskIds = useMemo(() => {
    const baseIds = inProgressTasks.map(t => t.id);
    if (!crossColumnPlaceholder || crossColumnPlaceholder.targetStatus !== "In Progress") {
      return baseIds;
    }
    const placeholderId = "__placeholder__In Progress";
    const result = [...baseIds];
    result.splice(crossColumnPlaceholder.insertIndex, 0, placeholderId);
    return result;
  }, [inProgressTasks, crossColumnPlaceholder]);
  
  const doneTaskIds = useMemo(() => {
    const baseIds = doneTasks.map(t => t.id);
    if (!crossColumnPlaceholder || crossColumnPlaceholder.targetStatus !== "Done") {
      return baseIds;
    }
    const placeholderId = "__placeholder__Done";
    const result = [...baseIds];
    result.splice(crossColumnPlaceholder.insertIndex, 0, placeholderId);
    return result;
  }, [doneTasks, crossColumnPlaceholder]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const draggedId = event.active.id as string;
    setActiveTaskId(draggedId);
    
    // If dragging a non-selected card, clear selection and select only this card
    if (!selectedTaskIds.has(draggedId)) {
      clearSelection();
      handleSelectTask(draggedId, false);
    }
    
    // Initialize projection ref
    const activeTask = tasks.find(t => t.id === draggedId);
    if (activeTask) {
      projectionRef.current = {
        movingIds: [draggedId],
        targetStatus: activeTask.status,
        insertIndex: activeTask.order,
      };
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) {
      setOverColumnId(null);
      setCrossColumnPlaceholder(null);
      projectionRef.current = null;
      return;
    }
    
    const overId = over.id as string;
    const activeId = active.id as string;
    
    // Check if hovering over a placeholder - extract column from placeholder ID
    const isOverPlaceholder = overId.startsWith("__placeholder__");
    const placeholderColumn = isOverPlaceholder 
      ? overId.replace("__placeholder__", "") as TaskStatus 
      : null;
    
    // Determine if over is a column or a task
    const isOverColumn = ["To Do", "In Progress", "Done"].includes(overId);
    const overTask = !isOverColumn && !isOverPlaceholder ? tasks.find(t => t.id === overId) : null;
    
    // Get target column for visual feedback
    const activeTask = tasks.find(t => t.id === activeId);
    
    // Priority: placeholder column > column ID > over task's column > active task's column
    let targetStatus: TaskStatus;
    if (placeholderColumn) {
      targetStatus = placeholderColumn;
    } else if (isOverColumn) {
      targetStatus = overId as TaskStatus;
    } else if (overTask) {
      targetStatus = overTask.status;
    } else {
      targetStatus = activeTask?.status || "To Do";
    }
    
    setOverColumnId(targetStatus);
    
    // Calculate projection for final position
    if (!activeTask) return;
    
    // Get moving IDs sorted by order
    const movingIds = selectedTaskIds.has(activeId)
      ? Array.from(selectedTaskIds)
          .map(id => tasks.find(t => t.id === id))
          .filter(Boolean)
          .sort((a, b) => (a as Task).order - (b as Task).order)
          .map(t => (t as Task).id)
      : [activeId];
    
    // Use DnD Kit's sortable indices directly - these match the visual gap
    const activeSortableIndex = active.data?.current?.sortable?.index;
    const overSortableIndex = over.data?.current?.sortable?.index;
    
    // For same column moves, use the sortable index directly
    // For cross-column moves, calculate based on target column
    const isSameColumn = activeTask.status === targetStatus;
    
    let insertIndex: number;
    
    if (isSameColumn) {
      // Same column: use the over sortable index directly
      // DnD Kit's SortableContext already shows the gap at this position
      if (typeof activeSortableIndex === 'number' && typeof overSortableIndex === 'number') {
        insertIndex = overSortableIndex;
      } else if (overTask) {
        let targetColumnTasks: Task[];
        if (targetStatus === "To Do") {
          targetColumnTasks = todoTasks;
        } else if (targetStatus === "In Progress") {
          targetColumnTasks = inProgressTasks;
        } else {
          targetColumnTasks = doneTasks;
        }
        insertIndex = targetColumnTasks.findIndex(t => t.id === overTask.id);
        if (insertIndex === -1) insertIndex = targetColumnTasks.length;
      } else {
        // Dropping on column container in same column
        let targetColumnTasks: Task[];
        if (targetStatus === "To Do") {
          targetColumnTasks = todoTasks;
        } else if (targetStatus === "In Progress") {
          targetColumnTasks = inProgressTasks;
        } else {
          targetColumnTasks = doneTasks;
        }
        insertIndex = targetColumnTasks.length;
      }
      // Clear cross-column placeholder for same column drags
      setCrossColumnPlaceholder(null);
    } else {
      // Cross-column move: calculate insert position
      let targetColumnTasks: Task[];
      if (targetStatus === "To Do") {
        targetColumnTasks = todoTasks;
      } else if (targetStatus === "In Progress") {
        targetColumnTasks = inProgressTasks;
      } else {
        targetColumnTasks = doneTasks;
      }
      
      if (isOverPlaceholder) {
        // Hovering over the placeholder itself - maintain current position
        if (crossColumnPlaceholder?.targetStatus === targetStatus) {
          insertIndex = crossColumnPlaceholder.insertIndex;
        } else {
          // Shouldn't happen, but fallback to end
          insertIndex = targetColumnTasks.length;
        }
      } else if (overTask) {
        // Hovering over a task - calculate position based on cursor relative to task
        const overIndexInColumn = targetColumnTasks.findIndex(t => t.id === overTask.id);
        if (overIndexInColumn !== -1) {
          const baseIndex = typeof overSortableIndex === 'number' ? overSortableIndex : overIndexInColumn;
          
          // Check if cursor is in the bottom half of the over task
          const overRect = over.rect;
          const cursorY = event.activatorEvent instanceof MouseEvent 
            ? (event.activatorEvent as MouseEvent).clientY + (event.delta?.y || 0)
            : null;
          
          if (overRect && cursorY !== null) {
            const midpoint = overRect.top + overRect.height / 2;
            insertIndex = cursorY > midpoint ? baseIndex + 1 : baseIndex;
          } else {
            insertIndex = baseIndex;
          }
        } else {
          insertIndex = targetColumnTasks.length;
        }
      } else {
        // Hovering over column container (empty space or empty column)
        // Use the previous placeholder position if it exists and matches this column
        // Otherwise default to end of list
        if (crossColumnPlaceholder?.targetStatus === targetStatus) {
          // Keep the previous insert index - provides stability
          insertIndex = crossColumnPlaceholder.insertIndex;
        } else {
          // New column - insert at end
          insertIndex = targetColumnTasks.filter(t => !movingIds.includes(t.id)).length;
        }
      }
      
      // Clamp insertIndex to valid range
      const maxIndex = targetColumnTasks.filter(t => !movingIds.includes(t.id)).length;
      insertIndex = Math.min(insertIndex, maxIndex);
      
      // Set cross-column placeholder for visual feedback
      setCrossColumnPlaceholder({
        targetStatus,
        insertIndex,
        count: movingIds.length,
      });
    }
    
    // Store projection in ref (no re-render)
    projectionRef.current = { movingIds, targetStatus, insertIndex };
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    // Clear drag states
    setActiveTaskId(null);
    setOverColumnId(null);
    setCrossColumnPlaceholder(null);
    const projection = projectionRef.current;
    projectionRef.current = null;
    
    if (!over || !projection) {
      clearSelection();
      return;
    }
    
    const activeId = active.id as string;
    const overId = over.id as string;
    
    // Skip if dropped on itself with no movement
    if (activeId === overId && !projection) {
      clearSelection();
      return;
    }
    
    const activeTask = tasks.find(t => t.id === activeId);
    if (!activeTask) return;
    
    const { targetStatus } = projection;
    
    // CRITICAL: Ensure movingIds includes ALL selected cards
    // projection.movingIds may only have the active card if handleDragOver didn't fire
    let movingIds = projection.movingIds;
    const currentSelection = selectedTaskIds;
    
    // If there are more selected cards than in movingIds, use the full selection
    if (currentSelection.size > movingIds.length && currentSelection.has(activeId)) {
      // Get all selected task IDs, sorted by their current order
      const selectedTasks = tasks
        .filter(t => currentSelection.has(t.id))
        .sort((a, b) => a.order - b.order);
      movingIds = selectedTasks.map(t => t.id);
    }
    
    // Get sortable indices from DnD Kit
    const overSortableIndex = over.data?.current?.sortable?.index;
    
    // Use setTasksWithHistory to save state before modification
    setTasksWithHistory(prevTasks => {
      let newTasks = [...prevTasks];
      const sourceStatus = activeTask.status;
      const isSameColumn = sourceStatus === targetStatus;
      
      if (isSameColumn) {
        // SAME COLUMN: Use sortable index for insertion point, move all selected together
        
        // Short-circuit: if dropped on itself or another selected card, no reordering needed
        if (movingIds.includes(overId)) {
          return newTasks; // No change
        }
        
        // Get all tasks in this column sorted by current order
        const columnTasks = newTasks
          .filter(t => t.status === sourceStatus)
          .sort((a, b) => a.order - b.order);
        
        // Get tasks not being moved (stationary)
        const stationaryTasks = columnTasks.filter(t => !movingIds.includes(t.id));
        
        // Get tasks being moved (maintain their relative order)
        const movingTasks = columnTasks.filter(t => movingIds.includes(t.id));
        
        // Check if dropped on column container (not a task)
        const isDroppedOnColumn = ["To Do", "In Progress", "Done"].includes(overId);
        
        let insertIndex: number;
        
        if (isDroppedOnColumn) {
          // Dropped on column container - use projection's insertIndex (usually end of list)
          insertIndex = Math.min(projection.insertIndex, stationaryTasks.length);
        } else {
          // Dropped on a stationary task - calculate based on direction
          
          // Find the first moving task's original index (the "block start")
          const firstMovingIndex = columnTasks.findIndex(t => movingIds.includes(t.id));
          
          // Find the over task in the original column order
          const overTaskOriginalIndex = columnTasks.findIndex(t => t.id === overId);
          
          // Determine if we're moving down or up
          const movingDown = firstMovingIndex < overTaskOriginalIndex;
          
          // Find over task's position in stationary array
          const overIndexInStationary = stationaryTasks.findIndex(t => t.id === overId);
          
          if (overIndexInStationary !== -1) {
            if (movingDown) {
              // Moving down: insert AFTER the over item
              insertIndex = overIndexInStationary + 1;
            } else {
              // Moving up: insert BEFORE the over item
              insertIndex = overIndexInStationary;
            }
          } else {
            // Over task not found in stationary - shouldn't happen, keep original
            return newTasks;
          }
        }
        
        // Clamp to valid range
        insertIndex = Math.min(Math.max(0, insertIndex), stationaryTasks.length);
        
        // Build new order: insert moving tasks at the specified position
        const newOrder = [
          ...stationaryTasks.slice(0, insertIndex),
          ...movingTasks,
          ...stationaryTasks.slice(insertIndex),
        ];
        
        // Apply new orders to tasks
        newOrder.forEach((t, idx) => {
          const taskIndex = newTasks.findIndex(nt => nt.id === t.id);
          if (taskIndex !== -1) {
            newTasks[taskIndex] = { ...newTasks[taskIndex], order: idx };
          }
        });
      } else {
        // DIFFERENT COLUMNS: Move between columns
        // Use sortable index if available for target position
        let insertIndex = projection.insertIndex;
        if (typeof overSortableIndex === 'number') {
          insertIndex = overSortableIndex;
        }
        
        // Renumber source column (excluding moving tasks)
        const sourceColumnTasks = newTasks
          .filter(t => t.status === sourceStatus && !movingIds.includes(t.id))
          .sort((a, b) => a.order - b.order);
        
        sourceColumnTasks.forEach((t, idx) => {
          const taskIndex = newTasks.findIndex(nt => nt.id === t.id);
          if (taskIndex !== -1) {
            newTasks[taskIndex] = { ...newTasks[taskIndex], order: idx };
          }
        });
        
        // Get target column tasks (excluding moving tasks)
        const targetColumnTasks = newTasks
          .filter(t => t.status === targetStatus && !movingIds.includes(t.id))
          .sort((a, b) => a.order - b.order);
        
        const finalInsertIndex = Math.min(insertIndex, targetColumnTasks.length);
        
        // Build new order for target column
        const beforeInsert = targetColumnTasks.slice(0, finalInsertIndex);
        const afterInsert = targetColumnTasks.slice(finalInsertIndex);
        
        // Update orders for tasks before insertion point
        beforeInsert.forEach((t, idx) => {
          const taskIndex = newTasks.findIndex(nt => nt.id === t.id);
          if (taskIndex !== -1) {
            newTasks[taskIndex] = { ...newTasks[taskIndex], order: idx };
          }
        });
        
        // Update moving tasks with new status and orders
        movingIds.forEach((id, idx) => {
          const taskIndex = newTasks.findIndex(t => t.id === id);
          if (taskIndex !== -1) {
            newTasks[taskIndex] = {
              ...newTasks[taskIndex],
              status: targetStatus,
              order: finalInsertIndex + idx,
            };
          }
        });
        
        // Update orders for tasks after insertion point
        afterInsert.forEach((t, idx) => {
          const taskIndex = newTasks.findIndex(nt => nt.id === t.id);
          if (taskIndex !== -1) {
            newTasks[taskIndex] = { ...newTasks[taskIndex], order: finalInsertIndex + movingIds.length + idx };
          }
        });
      }
      
      return newTasks;
    });
    
    // Clear selection after drag
    clearSelection();
  };

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
          onSelect={handleSelectTask}
          onUpdate={handleUpdateTask}
          onDelete={handleDeleteTask}
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
          onSelect={handleSelectTask}
          onUpdate={handleUpdateTask}
          onDelete={handleDeleteTask}
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
        <div className="flex gap-6 overflow-x-auto pb-4">
          <KanbanColumn 
            id="To Do"
            title="" 
            count={todoTasks.length} 
            color="text-blue-400"
            borderColor="border-[#303030]"
            backgroundColor="bg-[#202020]"
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
            title="Done" 
            count={doneTasks.length} 
            color="text-green-400"
            borderColor="border-green-700"
            icon={CheckCircle2}
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
