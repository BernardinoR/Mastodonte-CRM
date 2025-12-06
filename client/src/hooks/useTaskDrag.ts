import { useState, useRef, useMemo, useCallback } from 'react';
import { DragStartEvent, DragOverEvent, DragEndEvent } from '@dnd-kit/core';
import { Task, TaskStatus, TaskHistoryEvent } from '@/types/task';

interface CrossColumnPlaceholder {
  targetStatus: TaskStatus;
  insertIndex: number;
  count: number;
}

interface DragProjection {
  movingIds: string[];
  targetStatus: TaskStatus;
  insertIndex: number;
}

interface UseTaskDragProps {
  tasks: Task[];
  todoTasks: Task[];
  inProgressTasks: Task[];
  doneTasks: Task[];
  selectedTaskIds: Set<string>;
  setTasksWithHistory: (updater: (prev: Task[]) => Task[]) => void;
  clearSelection: () => void;
}

interface UseTaskDragReturn {
  activeTaskId: string | null;
  overColumnId: string | null;
  crossColumnPlaceholder: CrossColumnPlaceholder | null;
  todoTaskIds: string[];
  inProgressTaskIds: string[];
  doneTaskIds: string[];
  handleDragStart: (event: DragStartEvent) => void;
  handleDragOver: (event: DragOverEvent) => void;
  handleDragEnd: (event: DragEndEvent) => void;
}

export function useTaskDrag({
  tasks,
  todoTasks,
  inProgressTasks,
  doneTasks,
  selectedTaskIds,
  setTasksWithHistory,
  clearSelection,
}: UseTaskDragProps): UseTaskDragReturn {
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [overColumnId, setOverColumnId] = useState<string | null>(null);
  const [crossColumnPlaceholder, setCrossColumnPlaceholder] = useState<CrossColumnPlaceholder | null>(null);
  const projectionRef = useRef<DragProjection | null>(null);
  
  // Refs to track previous values and avoid unnecessary re-renders
  const prevOverColumnIdRef = useRef<string | null>(null);
  const prevPlaceholderRef = useRef<CrossColumnPlaceholder | null>(null);

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

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const draggedId = event.active.id as string;
    setActiveTaskId(draggedId);
    
    const activeTask = tasks.find(t => t.id === draggedId);
    if (activeTask) {
      projectionRef.current = {
        movingIds: selectedTaskIds.has(draggedId) 
          ? Array.from(selectedTaskIds) 
          : [draggedId],
        targetStatus: activeTask.status,
        insertIndex: activeTask.order,
      };
    }
  }, [selectedTaskIds, tasks]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) {
      // Only update if values actually changed
      if (prevOverColumnIdRef.current !== null) {
        setOverColumnId(null);
        prevOverColumnIdRef.current = null;
      }
      if (prevPlaceholderRef.current !== null) {
        setCrossColumnPlaceholder(null);
        prevPlaceholderRef.current = null;
      }
      projectionRef.current = null;
      return;
    }
    
    const overId = over.id as string;
    const activeId = active.id as string;
    
    const isOverPlaceholder = overId.startsWith("__placeholder__");
    const placeholderColumn = isOverPlaceholder 
      ? overId.replace("__placeholder__", "") as TaskStatus 
      : null;
    
    const isOverColumn = ["To Do", "In Progress", "Done"].includes(overId);
    const overTask = !isOverColumn && !isOverPlaceholder ? tasks.find(t => t.id === overId) : null;
    
    const activeTask = tasks.find(t => t.id === activeId);
    
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
    
    // Only update overColumnId if it changed
    if (prevOverColumnIdRef.current !== targetStatus) {
      setOverColumnId(targetStatus);
      prevOverColumnIdRef.current = targetStatus;
    }
    
    if (!activeTask) return;
    
    // Reuse movingIds from dragStart instead of recalculating on every mouse move
    const movingIds = projectionRef.current?.movingIds || [activeId];
    
    const activeSortableIndex = active.data?.current?.sortable?.index;
    const overSortableIndex = over.data?.current?.sortable?.index;
    
    const isSameColumn = activeTask.status === targetStatus;
    
    let insertIndex: number;
    
    if (isSameColumn) {
      if (overTask) {
        let targetColumnTasks: Task[];
        if (targetStatus === "To Do") {
          targetColumnTasks = todoTasks;
        } else if (targetStatus === "In Progress") {
          targetColumnTasks = inProgressTasks;
        } else {
          targetColumnTasks = doneTasks;
        }
        
        const baseIndex = typeof overSortableIndex === 'number' 
          ? overSortableIndex 
          : targetColumnTasks.findIndex(t => t.id === overTask.id);
        
        if (baseIndex !== -1) {
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
      // Only update if placeholder was previously set
      if (prevPlaceholderRef.current !== null) {
        setCrossColumnPlaceholder(null);
        prevPlaceholderRef.current = null;
      }
    } else {
      let targetColumnTasks: Task[];
      if (targetStatus === "To Do") {
        targetColumnTasks = todoTasks;
      } else if (targetStatus === "In Progress") {
        targetColumnTasks = inProgressTasks;
      } else {
        targetColumnTasks = doneTasks;
      }
      
      if (isOverPlaceholder) {
        // Read from ref to avoid stale closure
        const currentPlaceholder = prevPlaceholderRef.current;
        if (currentPlaceholder?.targetStatus === targetStatus) {
          insertIndex = currentPlaceholder.insertIndex;
        } else {
          insertIndex = targetColumnTasks.length;
        }
      } else if (overTask) {
        const overIndexInColumn = targetColumnTasks.findIndex(t => t.id === overTask.id);
        if (overIndexInColumn !== -1) {
          const baseIndex = typeof overSortableIndex === 'number' ? overSortableIndex : overIndexInColumn;
          
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
        // Read from ref to avoid stale closure
        const currentPlaceholder = prevPlaceholderRef.current;
        if (currentPlaceholder?.targetStatus === targetStatus) {
          insertIndex = currentPlaceholder.insertIndex;
        } else {
          insertIndex = targetColumnTasks.filter(t => !movingIds.includes(t.id)).length;
        }
      }
      
      const maxIndex = targetColumnTasks.filter(t => !movingIds.includes(t.id)).length;
      insertIndex = Math.min(insertIndex, maxIndex);
      
      // Only update if placeholder values actually changed
      const prev = prevPlaceholderRef.current;
      const newCount = movingIds.length;
      if (
        !prev ||
        prev.targetStatus !== targetStatus ||
        prev.insertIndex !== insertIndex ||
        prev.count !== newCount
      ) {
        const newPlaceholder = { targetStatus, insertIndex, count: newCount };
        setCrossColumnPlaceholder(newPlaceholder);
        prevPlaceholderRef.current = newPlaceholder;
      }
    }
    
    projectionRef.current = { movingIds, targetStatus, insertIndex };
  }, [tasks, todoTasks, inProgressTasks, doneTasks]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveTaskId(null);
    setOverColumnId(null);
    setCrossColumnPlaceholder(null);
    
    // Reset refs
    prevOverColumnIdRef.current = null;
    prevPlaceholderRef.current = null;
    
    const projection = projectionRef.current;
    projectionRef.current = null;
    
    if (!over || !projection) {
      return;
    }
    
    const activeId = active.id as string;
    const overId = over.id as string;
    
    const activeTask = tasks.find(t => t.id === activeId);
    if (!activeTask) return;
    
    const { targetStatus } = projection;
    
    let movingIds = projection.movingIds;
    
    if (selectedTaskIds.size > movingIds.length && selectedTaskIds.has(activeId)) {
      const selectedTasks = tasks
        .filter(t => selectedTaskIds.has(t.id))
        .sort((a, b) => a.order - b.order);
      movingIds = selectedTasks.map(t => t.id);
    }
    
    // Check for no-op drops (dropping on self or within selection group)
    const isSameColumn = activeTask.status === targetStatus;
    if (isSameColumn && movingIds.includes(overId)) {
      return;
    }
    
    const overSortableIndex = over.data?.current?.sortable?.index;
    
    setTasksWithHistory(prevTasks => {
      let newTasks = [...prevTasks];
      const sourceStatus = activeTask.status;
      
      if (isSameColumn) {
        
        const columnTasks = newTasks
          .filter(t => t.status === sourceStatus)
          .sort((a, b) => a.order - b.order);
        
        const stationaryTasks = columnTasks.filter(t => !movingIds.includes(t.id));
        const movingTasks = columnTasks.filter(t => movingIds.includes(t.id));
        
        const isDroppedOnColumn = ["To Do", "In Progress", "Done"].includes(overId);
        
        let insertIndex: number;
        
        if (isDroppedOnColumn) {
          insertIndex = Math.min(projection.insertIndex, stationaryTasks.length);
        } else {
          const firstMovingIndex = columnTasks.findIndex(t => movingIds.includes(t.id));
          const overTaskOriginalIndex = columnTasks.findIndex(t => t.id === overId);
          const movingDown = firstMovingIndex < overTaskOriginalIndex;
          const overIndexInStationary = stationaryTasks.findIndex(t => t.id === overId);
          
          if (overIndexInStationary !== -1) {
            if (movingDown) {
              insertIndex = overIndexInStationary + 1;
            } else {
              insertIndex = overIndexInStationary;
            }
          } else {
            return newTasks;
          }
        }
        
        insertIndex = Math.min(Math.max(0, insertIndex), stationaryTasks.length);
        
        const newOrder = [
          ...stationaryTasks.slice(0, insertIndex),
          ...movingTasks,
          ...stationaryTasks.slice(insertIndex),
        ];
        
        newOrder.forEach((t, idx) => {
          const taskIndex = newTasks.findIndex(nt => nt.id === t.id);
          if (taskIndex !== -1) {
            newTasks[taskIndex] = { ...newTasks[taskIndex], order: idx };
          }
        });
      } else {
        let insertIndex = projection.insertIndex;
        if (typeof overSortableIndex === 'number') {
          insertIndex = overSortableIndex;
        }
        
        const sourceColumnTasks = newTasks
          .filter(t => t.status === sourceStatus && !movingIds.includes(t.id))
          .sort((a, b) => a.order - b.order);
        
        sourceColumnTasks.forEach((t, idx) => {
          const taskIndex = newTasks.findIndex(nt => nt.id === t.id);
          if (taskIndex !== -1) {
            newTasks[taskIndex] = { ...newTasks[taskIndex], order: idx };
          }
        });
        
        const targetColumnTasks = newTasks
          .filter(t => t.status === targetStatus && !movingIds.includes(t.id))
          .sort((a, b) => a.order - b.order);
        
        const finalInsertIndex = Math.min(insertIndex, targetColumnTasks.length);
        
        const beforeInsert = targetColumnTasks.slice(0, finalInsertIndex);
        const afterInsert = targetColumnTasks.slice(finalInsertIndex);
        
        beforeInsert.forEach((t, idx) => {
          const taskIndex = newTasks.findIndex(nt => nt.id === t.id);
          if (taskIndex !== -1) {
            newTasks[taskIndex] = { ...newTasks[taskIndex], order: idx };
          }
        });
        
        movingIds.forEach((id, idx) => {
          const taskIndex = newTasks.findIndex(t => t.id === id);
          if (taskIndex !== -1) {
            const task = newTasks[taskIndex];
            
            const statusChangeEvent: TaskHistoryEvent = {
              id: `h-${task.id}-status-${Date.now()}`,
              type: "status_change",
              content: `Status alterado de '${sourceStatus}' para '${targetStatus}'`,
              author: task.assignees[0] || "Sistema",
              timestamp: new Date(),
            };
            
            newTasks[taskIndex] = {
              ...task,
              status: targetStatus,
              order: finalInsertIndex + idx,
              history: [...(task.history || []), statusChangeEvent],
            };
          }
        });
        
        afterInsert.forEach((t, idx) => {
          const taskIndex = newTasks.findIndex(nt => nt.id === t.id);
          if (taskIndex !== -1) {
            newTasks[taskIndex] = { ...newTasks[taskIndex], order: finalInsertIndex + movingIds.length + idx };
          }
        });
      }
      
      return newTasks;
    });
    
    clearSelection();
  }, [tasks, selectedTaskIds, setTasksWithHistory, clearSelection]);

  return {
    activeTaskId,
    overColumnId,
    crossColumnPlaceholder,
    todoTaskIds,
    inProgressTaskIds,
    doneTaskIds,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  };
}
