import { useState, useRef, useMemo, useCallback } from 'react';
import { DragStartEvent, DragOverEvent, DragEndEvent } from '@dnd-kit/core';
import { Task, TaskStatus } from '@/types/task';

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
  handleClearSelection: () => void;
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
  handleClearSelection,
}: UseTaskDragProps): UseTaskDragReturn {
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [overColumnId, setOverColumnId] = useState<string | null>(null);
  const [crossColumnPlaceholder, setCrossColumnPlaceholder] = useState<CrossColumnPlaceholder | null>(null);
  const projectionRef = useRef<DragProjection | null>(null);

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
    const { active } = event;
    setActiveTaskId(active.id as string);
    setCrossColumnPlaceholder(null);
    projectionRef.current = null;
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setOverColumnId(null);
      setCrossColumnPlaceholder(null);
      projectionRef.current = null;
      return;
    }
    
    const activeId = active.id as string;
    const overId = over.id as string;
    
    const activeTask = tasks.find(t => t.id === activeId);
    if (!activeTask) return;
    
    const movingIds = selectedTaskIds.has(activeId)
      ? Array.from(selectedTaskIds)
      : [activeId];
    
    const isOverPlaceholder = overId.startsWith('__placeholder__');
    const overTask = !isOverPlaceholder ? tasks.find(t => t.id === overId) : null;
    
    let targetStatus: TaskStatus;
    
    if (isOverPlaceholder) {
      const placeholderColumn = overId.replace('__placeholder__', '') as TaskStatus;
      targetStatus = placeholderColumn;
    } else if (overId === "To Do" || overId === "In Progress" || overId === "Done") {
      targetStatus = overId as TaskStatus;
    } else if (overTask) {
      targetStatus = overTask.status;
    } else {
      targetStatus = activeTask.status;
    }
    
    setOverColumnId(targetStatus);
    
    const activeSortableIndex = active.data?.current?.sortable?.index;
    const overSortableIndex = over.data?.current?.sortable?.index;
    
    const isSameColumn = activeTask.status === targetStatus;
    
    let insertIndex: number;
    
    if (isSameColumn) {
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
      setCrossColumnPlaceholder(null);
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
        if (crossColumnPlaceholder?.targetStatus === targetStatus) {
          insertIndex = crossColumnPlaceholder.insertIndex;
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
        if (crossColumnPlaceholder?.targetStatus === targetStatus) {
          insertIndex = crossColumnPlaceholder.insertIndex;
        } else {
          insertIndex = targetColumnTasks.filter(t => !movingIds.includes(t.id)).length;
        }
      }
      
      const maxIndex = targetColumnTasks.filter(t => !movingIds.includes(t.id)).length;
      insertIndex = Math.min(insertIndex, maxIndex);
      
      setCrossColumnPlaceholder({
        targetStatus,
        insertIndex,
        count: movingIds.length,
      });
    }
    
    projectionRef.current = { movingIds, targetStatus, insertIndex };
  }, [tasks, selectedTaskIds, todoTasks, inProgressTasks, doneTasks, crossColumnPlaceholder]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveTaskId(null);
    setOverColumnId(null);
    setCrossColumnPlaceholder(null);
    const projection = projectionRef.current;
    projectionRef.current = null;
    
    if (!over || !projection) {
      handleClearSelection();
      return;
    }
    
    const activeId = active.id as string;
    const overId = over.id as string;
    
    if (activeId === overId && projection.movingIds.length === 1) {
      handleClearSelection();
      return;
    }
    
    const { movingIds, targetStatus, insertIndex } = projection;
    
    setTasksWithHistory(prevTasks => {
      const movingTasks = prevTasks.filter(t => movingIds.includes(t.id));
      const remainingTasks = prevTasks.filter(t => !movingIds.includes(t.id));
      
      const updatedMovingTasks = movingTasks.map(t => ({
        ...t,
        status: targetStatus,
      }));
      
      const targetColumnTasks = remainingTasks.filter(t => t.status === targetStatus);
      const otherTasks = remainingTasks.filter(t => t.status !== targetStatus);
      
      const newTargetColumn = [
        ...targetColumnTasks.slice(0, insertIndex),
        ...updatedMovingTasks,
        ...targetColumnTasks.slice(insertIndex),
      ];
      
      const reorderedTargetColumn = newTargetColumn.map((task, idx) => ({
        ...task,
        order: idx,
      }));
      
      return [...otherTasks, ...reorderedTargetColumn];
    });
    
    handleClearSelection();
  }, [setTasksWithHistory, handleClearSelection]);

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
