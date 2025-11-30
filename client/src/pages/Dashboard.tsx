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
} from "@dnd-kit/sortable";

type TaskStatus = "To Do" | "In Progress" | "Done";
type TaskPriority = "Urgente" | "Importante" | "Normal" | "Baixa";

interface Task {
  id: string;
  title: string;
  clientName?: string;
  priority?: TaskPriority;
  status: TaskStatus;
  assignees: string[];
  dueDate: Date;
  description?: string;
  notes?: string[];
  order: number;
}

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [overColumnId, setOverColumnId] = useState<string | null>(null);
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);
  
  // Cross-column drop placeholder state
  const [crossColumnPlaceholder, setCrossColumnPlaceholder] = useState<{
    targetStatus: TaskStatus;
    insertIndex: number;
    count: number;
  } | null>(null);
  
  // Ref to keep the current selectedTaskIds for use in callbacks
  const selectedTaskIdsRef = useRef<Set<string>>(selectedTaskIds);
  useEffect(() => {
    selectedTaskIdsRef.current = selectedTaskIds;
  }, [selectedTaskIds]);
  
  // Projection ref for drag - stores the final calculated position
  const projectionRef = useRef<{
    movingIds: string[];
    targetStatus: TaskStatus;
    insertIndex: number;
  } | null>(null);
  
  // History stack for undo functionality (Ctrl+Z)
  const historyRef = useRef<Task[][]>([]);
  const MAX_HISTORY = 20;

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Ademar plan fin",
      clientName: "Ademar João Gréguer",
      priority: "Normal" as const,
      status: "To Do" as const,
      assignees: ["Rafael Bernardino Silveira"],
      dueDate: new Date('2025-11-19'),
      order: 0,
    },
    {
      id: "2",
      title: "Atualizar plano financeiro da Fernanda",
      clientName: "Fernanda Carolina De Faria",
      priority: "Importante" as const,
      status: "To Do" as const,
      assignees: ["Rafael Bernardino Silveira", "Maria Santos"],
      dueDate: new Date('2025-11-15'),
      order: 1,
    },
    {
      id: "3",
      title: "Aguardar retorno sobre apresentação do Ariel",
      status: "To Do" as const,
      assignees: ["Rafael Bernardino Silveira"],
      dueDate: new Date('2025-11-16'),
      order: 2,
    },
    {
      id: "4",
      title: "Receber documentação da Viva",
      clientName: "Israel Schuster Da Fonseca",
      priority: "Baixa" as const,
      status: "To Do" as const,
      assignees: ["Rafael Bernardino Silveira", "João Silva", "Ana Costa"],
      dueDate: new Date('2025-11-20'),
      order: 3,
    },
    {
      id: "5",
      title: "REALOCAR MARCOS",
      clientName: "Marcia Mozzato Ciampi De Andrade",
      priority: "Urgente" as const,
      status: "In Progress" as const,
      assignees: ["Rafael Bernardino Silveira"],
      dueDate: new Date('2025-01-20'),
      order: 0,
    },
    {
      id: "6",
      title: "Falar com Marcia",
      clientName: "Marcia Mozzato Ciampi De Andrade",
      priority: "Urgente" as const,
      status: "In Progress" as const,
      assignees: ["Rafael Bernardino Silveira", "Pedro Oliveira"],
      dueDate: new Date('2025-01-20'),
      order: 1,
    },
    {
      id: "7",
      title: "Macter",
      clientName: "Marcia Mozzato Ciampi De Andrade",
      priority: "Urgente" as const,
      status: "In Progress" as const,
      assignees: ["Rafael Bernardino Silveira"],
      dueDate: new Date('2025-01-20'),
      order: 2,
    },
    {
      id: "8",
      title: "Receber IRPF Fernanda",
      clientName: "Fernanda Garcia Rodrigues de Souza",
      priority: "Urgente" as const,
      status: "In Progress" as const,
      assignees: ["Rafael Bernardino Silveira"],
      dueDate: new Date('2025-01-20'),
      order: 3,
    },
    {
      id: "9",
      title: "Ajustar luiza",
      clientName: "Rodrigo Weber Rocha da Silva",
      priority: "Urgente" as const,
      status: "In Progress" as const,
      assignees: ["Rafael Bernardino Silveira", "Carla Mendes"],
      dueDate: new Date('2025-01-21'),
      order: 4,
    },
  ]);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (task.clientName && task.clientName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesAssignee = assigneeFilter === "all" || task.assignees.some(a => a.includes(assigneeFilter));
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
    return matchesSearch && matchesAssignee && matchesPriority;
  });

  // Get base filtered tasks per column
  const todoTasks = useMemo(() => 
    filteredTasks.filter(t => t.status === "To Do").sort((a, b) => a.order - b.order),
    [filteredTasks]
  );
  const inProgressTasks = useMemo(() => 
    filteredTasks.filter(t => t.status === "In Progress").sort((a, b) => a.order - b.order),
    [filteredTasks]
  );
  const doneTasks = useMemo(() => 
    filteredTasks.filter(t => t.status === "Done").sort((a, b) => a.order - b.order),
    [filteredTasks]
  );
  
  // Task IDs for SortableContext (no projection - cards render in their actual positions)
  const todoTaskIds = useMemo(() => todoTasks.map(t => t.id), [todoTasks]);
  const inProgressTaskIds = useMemo(() => inProgressTasks.map(t => t.id), [inProgressTasks]);
  const doneTaskIds = useMemo(() => doneTasks.map(t => t.id), [doneTasks]);

  // Helper to update tasks with history tracking
  const setTasksWithHistory = useCallback((updater: (prevTasks: Task[]) => Task[]) => {
    setTasks(prevTasks => {
      // Push current state to history INSIDE the updater to get the correct state
      const historyCopy = [...historyRef.current];
      historyCopy.push(prevTasks.map(t => ({ ...t })));
      if (historyCopy.length > MAX_HISTORY) {
        historyCopy.shift();
      }
      historyRef.current = historyCopy;
      
      // Return the updated tasks
      return updater(prevTasks);
    });
  }, []);

  // Undo: restore previous state
  const handleUndo = useCallback(() => {
    if (historyRef.current.length === 0) return;
    const previousState = historyRef.current.pop();
    if (previousState) {
      setTasks(previousState);
    }
  }, []);

  // Listen for Ctrl+Z
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo]);

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
      setSelectedTaskIds(new Set([draggedId]));
      setLastSelectedId(draggedId);
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
    
    // Determine if over is a column or a task
    const isOverColumn = ["To Do", "In Progress", "Done"].includes(overId);
    const overTask = !isOverColumn ? tasks.find(t => t.id === overId) : null;
    
    // Get target column for visual feedback
    const activeTask = tasks.find(t => t.id === activeId);
    const targetStatus: TaskStatus = isOverColumn 
      ? overId as TaskStatus 
      : overTask?.status || activeTask?.status || "To Do";
    
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
      
      if (overTask) {
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
      handleClearSelection();
      return;
    }
    
    const activeId = active.id as string;
    const overId = over.id as string;
    
    // Skip if dropped on itself with no movement
    if (activeId === overId && !projection) {
      handleClearSelection();
      return;
    }
    
    const activeTask = tasks.find(t => t.id === activeId);
    if (!activeTask) return;
    
    const { targetStatus } = projection;
    
    // CRITICAL: Ensure movingIds includes ALL selected cards
    // projection.movingIds may only have the active card if handleDragOver didn't fire
    let movingIds = projection.movingIds;
    const currentSelection = selectedTaskIdsRef.current;
    
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
    handleClearSelection();
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

  // Selection handlers
  const handleSelectTask = useCallback((taskId: string, shiftKey: boolean, ctrlKey: boolean) => {
    const clickedTask = tasks.find(t => t.id === taskId);
    const lastTask = lastSelectedId ? tasks.find(t => t.id === lastSelectedId) : null;
    
    if (shiftKey && lastTask && clickedTask) {
      // Shift+click: Range selection within same column, toggle across columns
      const sameColumn = lastTask.status === clickedTask.status;
      
      if (sameColumn) {
        // Range selection within same column
        let columnTasks: Task[];
        if (clickedTask.status === "To Do") {
          columnTasks = todoTasks;
        } else if (clickedTask.status === "In Progress") {
          columnTasks = inProgressTasks;
        } else {
          columnTasks = doneTasks;
        }
        
        const columnTaskIds = columnTasks.map(t => t.id);
        const lastIndex = columnTaskIds.indexOf(lastSelectedId!);
        const currentIndex = columnTaskIds.indexOf(taskId);
        
        if (lastIndex !== -1 && currentIndex !== -1) {
          const start = Math.min(lastIndex, currentIndex);
          const end = Math.max(lastIndex, currentIndex);
          const rangeIds = columnTaskIds.slice(start, end + 1);
          
          setSelectedTaskIds(prev => {
            const newSet = new Set(prev);
            rangeIds.forEach(id => newSet.add(id));
            return newSet;
          });
        }
      } else {
        // Different column with Shift: toggle individual selection
        setSelectedTaskIds(prev => {
          const newSet = new Set(prev);
          if (newSet.has(taskId)) {
            newSet.delete(taskId);
          } else {
            newSet.add(taskId);
          }
          return newSet;
        });
        setLastSelectedId(taskId);
      }
    } else if (ctrlKey) {
      // Ctrl+click: Toggle individual selection (add/remove from current selection)
      setSelectedTaskIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(taskId)) {
          newSet.delete(taskId);
        } else {
          newSet.add(taskId);
        }
        return newSet;
      });
      setLastSelectedId(taskId);
    } else {
      // Regular click: Select only this card (clear others)
      setSelectedTaskIds(new Set([taskId]));
      setLastSelectedId(taskId);
    }
  }, [lastSelectedId, tasks, todoTasks, inProgressTasks, doneTasks]);

  const handleClearSelection = useCallback(() => {
    setSelectedTaskIds(new Set());
    setLastSelectedId(null);
  }, []);

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
    handleClearSelection();
  }, [selectedTaskIds, handleClearSelection, setTasksWithHistory]);

  // Bulk append title for selected tasks
  const handleBulkAppendTitle = useCallback((textToAppend: string) => {
    // Use ref to get the most current selectedTaskIds
    const currentSelectedIds = selectedTaskIdsRef.current;
    // Add space only if suffix starts with alphanumeric character
    const startsWithAlphanumeric = /^[a-zA-Z0-9\u00C0-\u024F]/.test(textToAppend);
    setTasksWithHistory(prevTasks =>
      prevTasks.map(task => {
        if (!currentSelectedIds.has(task.id)) return task;
        // Add space before suffix if title doesn't end with whitespace and suffix starts with alphanumeric
        const needsSpace = task.title.length > 0 && !/\s$/.test(task.title) && startsWithAlphanumeric;
        const suffix = needsSpace ? " " + textToAppend : textToAppend;
        return { ...task, title: task.title + suffix };
      })
    );
  }, [setTasksWithHistory]);

  // Bulk replace title for selected tasks
  const handleBulkReplaceTitle = useCallback((newTitle: string) => {
    // Use ref to get the most current selectedTaskIds
    const currentSelectedIds = selectedTaskIdsRef.current;
    setTasksWithHistory(prevTasks =>
      prevTasks.map(task =>
        currentSelectedIds.has(task.id)
          ? { ...task, title: newTitle }
          : task
      )
    );
  }, [setTasksWithHistory]);

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

  // Placeholder component for cross-column drops
  const DropPlaceholder = ({ count }: { count: number }) => (
    <div 
      className="h-16 rounded-lg border-2 border-dashed border-blue-500/50 bg-blue-500/10 flex items-center justify-center transition-all duration-200"
      style={{ minHeight: count > 1 ? `${count * 4 + 4}rem` : '4rem' }}
    >
      <span className="text-blue-400 text-sm font-medium">
        {count > 1 ? `${count} tarefas` : '1 tarefa'}
      </span>
    </div>
  );

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
    const elements: JSX.Element[] = [];
    
    columnTasks.forEach((task, index) => {
      // Insert placeholder before this task if at the right index
      if (index === insertIndex) {
        elements.push(<DropPlaceholder key="placeholder" count={count} />);
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
      elements.push(<DropPlaceholder key="placeholder" count={count} />);
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
        handleClearSelection();
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
