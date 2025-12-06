import { useState, useRef, useMemo, useCallback } from 'react';
import { DragStartEvent, DragOverEvent, DragEndEvent } from '@dnd-kit/core';
import { Task, TaskStatus, TaskHistoryEvent } from '@/types/task';

interface DragProjection {
  movingIds: string[];
  targetStatus: TaskStatus;
  insertIndex: number;
}

// Drop indicator position for cross-column drops
export interface DropIndicator {
  targetStatus: TaskStatus;
  insertIndex: number;
  count: number;
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
  dropIndicator: DropIndicator | null;
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
  // Minimal state for drop indicator - only updates when position actually changes
  const [dropIndicator, setDropIndicator] = useState<DropIndicator | null>(null);
  
  // Projection ref for drag end calculations
  const projectionRef = useRef<DragProjection | null>(null);
  
  // Refs to track previous values and avoid unnecessary state updates
  const prevOverColumnIdRef = useRef<string | null>(null);
  const prevIndicatorRef = useRef<DropIndicator | null>(null);
  
  // Performance optimization: Map for O(1) task lookups instead of O(n) find()
  const taskByIdRef = useRef<Map<string, Task>>(new Map());
  const movingIdSetRef = useRef<Set<string>>(new Set());
  
  // Cache column task arrays at drag start to avoid recalculating during drag
  const columnCacheRef = useRef<{
    todo: Task[];
    inProgress: Task[];
    done: Task[];
    todoFiltered: Task[];
    inProgressFiltered: Task[];
    doneFiltered: Task[];
  } | null>(null);
  
  // Update taskById map when tasks change
  useMemo(() => {
    const newMap = new Map<string, Task>();
    tasks.forEach(t => newMap.set(t.id, t));
    taskByIdRef.current = newMap;
  }, [tasks]);

  // Simple task ID lists - NO placeholder insertion (pure, stable)
  const todoTaskIds = useMemo(() => todoTasks.map(t => t.id), [todoTasks]);
  const inProgressTaskIds = useMemo(() => inProgressTasks.map(t => t.id), [inProgressTasks]);
  const doneTaskIds = useMemo(() => doneTasks.map(t => t.id), [doneTasks]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const draggedId = event.active.id as string;
    setActiveTaskId(draggedId);
    
    // Use O(1) lookup instead of O(n) find
    const activeTask = taskByIdRef.current.get(draggedId);
    if (activeTask) {
      const movingIds = selectedTaskIds.has(draggedId) 
        ? Array.from(selectedTaskIds) 
        : [draggedId];
      
      // Update movingIdSet for O(1) includes checks during drag
      movingIdSetRef.current = new Set(movingIds);
      
      // Cache column arrays at drag start - avoids recalculating during drag
      const movingSet = movingIdSetRef.current;
      columnCacheRef.current = {
        todo: todoTasks,
        inProgress: inProgressTasks,
        done: doneTasks,
        todoFiltered: todoTasks.filter(t => !movingSet.has(t.id)),
        inProgressFiltered: inProgressTasks.filter(t => !movingSet.has(t.id)),
        doneFiltered: doneTasks.filter(t => !movingSet.has(t.id)),
      };
      
      projectionRef.current = {
        movingIds,
        targetStatus: activeTask.status,
        insertIndex: activeTask.order,
      };
      
      // Reset indicator refs
      prevIndicatorRef.current = null;
    }
  }, [selectedTaskIds, todoTasks, inProgressTasks, doneTasks]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) {
      // Only update if values actually changed
      if (prevOverColumnIdRef.current !== null) {
        setOverColumnId(null);
        prevOverColumnIdRef.current = null;
      }
      if (prevIndicatorRef.current !== null) {
        setDropIndicator(null);
        prevIndicatorRef.current = null;
      }
      projectionRef.current = null;
      return;
    }
    
    const overId = over.id as string;
    const activeId = active.id as string;
    
    const isOverColumn = ["To Do", "In Progress", "Done"].includes(overId);
    // Use O(1) Map lookup instead of O(n) find
    const overTask = !isOverColumn ? taskByIdRef.current.get(overId) : undefined;
    
    const activeTask = taskByIdRef.current.get(activeId);
    
    let targetStatus: TaskStatus;
    if (isOverColumn) {
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
    
    const isSameColumn = activeTask.status === targetStatus;
    
    // Use cached filtered arrays instead of filtering on every mouse move
    const cache = columnCacheRef.current;
    let targetColumnFiltered: Task[];
    if (cache) {
      if (targetStatus === "To Do") {
        targetColumnFiltered = cache.todoFiltered;
      } else if (targetStatus === "In Progress") {
        targetColumnFiltered = cache.inProgressFiltered;
      } else {
        targetColumnFiltered = cache.doneFiltered;
      }
    } else {
      // Fallback if cache not available
      const movingSet = movingIdSetRef.current;
      if (targetStatus === "To Do") {
        targetColumnFiltered = todoTasks.filter(t => !movingSet.has(t.id));
      } else if (targetStatus === "In Progress") {
        targetColumnFiltered = inProgressTasks.filter(t => !movingSet.has(t.id));
      } else {
        targetColumnFiltered = doneTasks.filter(t => !movingSet.has(t.id));
      }
    }
    
    let insertIndex: number;
    
    if (overTask) {
      // Find index in filtered array
      const overIndexInFiltered = targetColumnFiltered.findIndex(t => t.id === overTask.id);
      if (overIndexInFiltered !== -1) {
        const overRect = over.rect;
        const cursorY = event.activatorEvent instanceof MouseEvent 
          ? (event.activatorEvent as MouseEvent).clientY + (event.delta?.y || 0)
          : null;
        
        if (overRect && cursorY !== null) {
          const midpoint = overRect.top + overRect.height / 2;
          insertIndex = cursorY > midpoint ? overIndexInFiltered + 1 : overIndexInFiltered;
        } else {
          insertIndex = overIndexInFiltered;
        }
      } else {
        insertIndex = targetColumnFiltered.length;
      }
    } else {
      // Dropping on column itself - insert at end
      insertIndex = targetColumnFiltered.length;
    }
    
    // Clamp to valid range
    insertIndex = Math.min(Math.max(0, insertIndex), targetColumnFiltered.length);
    
    // Update projection ref (no state change!)
    projectionRef.current = { movingIds, targetStatus, insertIndex };
    
    // Update drop indicator state ONLY if position actually changed
    if (!isSameColumn) {
      const prev = prevIndicatorRef.current;
      const newCount = movingIds.length;
      
      // Only update state if values actually changed
      if (
        !prev ||
        prev.targetStatus !== targetStatus ||
        prev.insertIndex !== insertIndex ||
        prev.count !== newCount
      ) {
        const newIndicator = { targetStatus, insertIndex, count: newCount };
        setDropIndicator(newIndicator);
        prevIndicatorRef.current = newIndicator;
      }
    } else {
      // Same column - clear indicator if it was set
      if (prevIndicatorRef.current !== null) {
        setDropIndicator(null);
        prevIndicatorRef.current = null;
      }
    }
  }, [todoTasks, inProgressTasks, doneTasks]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveTaskId(null);
    setOverColumnId(null);
    setDropIndicator(null);
    
    // Reset refs
    prevOverColumnIdRef.current = null;
    prevIndicatorRef.current = null;
    columnCacheRef.current = null;
    
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
    dropIndicator,
    todoTaskIds,
    inProgressTaskIds,
    doneTaskIds,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  };
}
