import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { DragStartEvent, DragOverEvent, DragEndEvent } from '@dnd-kit/core';
import { Task, TaskStatus, TaskHistoryEvent } from '../types/task';

interface DragProjection {
  movingIds: string[];
  targetStatus: TaskStatus;
  insertIndex: number;
}

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
  const [dropIndicator, setDropIndicator] = useState<DropIndicator | null>(null);
  
  const projectionRef = useRef<DragProjection | null>(null);
  
  const pendingIndicatorRef = useRef<DropIndicator | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const lastCommittedIndicatorRef = useRef<DropIndicator | null>(null);
  const columnChangeDebounceRef = useRef<number | null>(null);
  const lastColumnRef = useRef<TaskStatus | null>(null);
  
  const taskByIdRef = useRef<Map<string, Task>>(new Map());
  const movingIdSetRef = useRef<Set<string>>(new Set());
  
  const columnCacheRef = useRef<{
    todo: Task[];
    inProgress: Task[];
    done: Task[];
    todoFiltered: Task[];
    inProgressFiltered: Task[];
    doneFiltered: Task[];
  } | null>(null);
  
  useMemo(() => {
    const newMap = new Map<string, Task>();
    tasks.forEach(t => newMap.set(t.id, t));
    taskByIdRef.current = newMap;
  }, [tasks]);

  const todoTaskIds = useMemo(() => todoTasks.map(t => t.id), [todoTasks]);
  const inProgressTaskIds = useMemo(() => inProgressTasks.map(t => t.id), [inProgressTasks]);
  const doneTaskIds = useMemo(() => doneTasks.map(t => t.id), [doneTasks]);

  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
      if (columnChangeDebounceRef.current !== null) {
        clearTimeout(columnChangeDebounceRef.current);
      }
    };
  }, []);

  const flushIndicator = useCallback(() => {
    const pending = pendingIndicatorRef.current;
    const last = lastCommittedIndicatorRef.current;
    
    if (pending === null && last === null) {
      rafIdRef.current = null;
      return;
    }
    
    if (pending === null) {
      if (last !== null) {
        setDropIndicator(null);
        lastCommittedIndicatorRef.current = null;
      }
    } else {
      if (
        !last ||
        last.targetStatus !== pending.targetStatus ||
        last.insertIndex !== pending.insertIndex ||
        last.count !== pending.count
      ) {
        setDropIndicator(pending);
        lastCommittedIndicatorRef.current = pending;
      }
    }
    
    rafIdRef.current = null;
  }, []);

  const scheduleIndicatorUpdate = useCallback((indicator: DropIndicator | null, isColumnChange: boolean = false) => {
    // If this is a column change, debounce to avoid rapid updates that hurt FPS
    if (isColumnChange && indicator) {
      // Clear any pending column change debounce
      if (columnChangeDebounceRef.current !== null) {
        clearTimeout(columnChangeDebounceRef.current);
      }
      
      // Debounce column changes by 50ms to smooth out rapid transitions
      columnChangeDebounceRef.current = window.setTimeout(() => {
        pendingIndicatorRef.current = indicator;
        lastColumnRef.current = indicator.targetStatus;
        
        if (rafIdRef.current === null) {
          rafIdRef.current = requestAnimationFrame(flushIndicator);
        }
        columnChangeDebounceRef.current = null;
      }, 50);
      return;
    }
    
    pendingIndicatorRef.current = indicator;
    
    if (rafIdRef.current === null) {
      rafIdRef.current = requestAnimationFrame(flushIndicator);
    }
  }, [flushIndicator]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const draggedId = event.active.id as string;
    setActiveTaskId(draggedId);
    
    const activeTask = taskByIdRef.current.get(draggedId);
    if (activeTask) {
      const movingIds = selectedTaskIds.has(draggedId) 
        ? Array.from(selectedTaskIds) 
        : [draggedId];
      
      movingIdSetRef.current = new Set(movingIds);
      
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
      
      // Initialize lastColumnRef so first cross-column move is debounced
      lastColumnRef.current = activeTask.status;
      
      pendingIndicatorRef.current = null;
      lastCommittedIndicatorRef.current = null;
    }
  }, [selectedTaskIds, todoTasks, inProgressTasks, doneTasks]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) {
      scheduleIndicatorUpdate(null);
      projectionRef.current = null;
      return;
    }
    
    const overId = over.id as string;
    const activeId = active.id as string;
    
    const isOverColumn = ["To Do", "In Progress", "Done"].includes(overId);
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
    
    if (!activeTask) return;
    
    const movingIds = projectionRef.current?.movingIds || [activeId];
    const isSameColumn = activeTask.status === targetStatus;
    
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
      insertIndex = targetColumnFiltered.length;
    }
    
    insertIndex = Math.min(Math.max(0, insertIndex), targetColumnFiltered.length);
    
    projectionRef.current = { movingIds, targetStatus, insertIndex };
    
    if (!isSameColumn) {
      // Check if this is a column change from the last committed column
      const isColumnChange = lastColumnRef.current !== null && lastColumnRef.current !== targetStatus;
      
      scheduleIndicatorUpdate({ 
        targetStatus, 
        insertIndex, 
        count: movingIds.length 
      }, isColumnChange);
      
      // Update last column if not debouncing
      if (!isColumnChange) {
        lastColumnRef.current = targetStatus;
      }
    } else {
      scheduleIndicatorUpdate(null);
      lastColumnRef.current = null;
    }
  }, [todoTasks, inProgressTasks, doneTasks, scheduleIndicatorUpdate]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    
    if (columnChangeDebounceRef.current !== null) {
      clearTimeout(columnChangeDebounceRef.current);
      columnChangeDebounceRef.current = null;
    }
    
    setActiveTaskId(null);
    setDropIndicator(null);
    
    pendingIndicatorRef.current = null;
    lastCommittedIndicatorRef.current = null;
    lastColumnRef.current = null;
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
    dropIndicator,
    todoTaskIds,
    inProgressTaskIds,
    doneTaskIds,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  };
}
