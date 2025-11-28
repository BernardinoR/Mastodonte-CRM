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
    
    // Get the base column tasks (without the moving cards)
    let baseColumnTasks: Task[];
    if (targetStatus === "To Do") {
      baseColumnTasks = todoTasks.filter(t => !movingIds.includes(t.id));
    } else if (targetStatus === "In Progress") {
      baseColumnTasks = inProgressTasks.filter(t => !movingIds.includes(t.id));
    } else {
      baseColumnTasks = doneTasks.filter(t => !movingIds.includes(t.id));
    }
    
    // Calculate insert index
    let insertIndex = baseColumnTasks.length; // Default: end of list
    
    if (overTask && !movingIds.includes(overTask.id)) {
      const overIndex = baseColumnTasks.findIndex(t => t.id === overTask.id);
      if (overIndex !== -1) {
        // Use pointer position to determine if we're in the top or bottom half of the target card
        const overRect = over.rect;
        const overMidpoint = overRect.top + overRect.height / 2;
        
        // Get pointer Y position using activatorEvent (initial) + delta.y (movement)
        const activatorEvent = event.activatorEvent as PointerEvent | MouseEvent | TouchEvent;
        let pointerY: number;
        
        if ('clientY' in activatorEvent) {
          pointerY = activatorEvent.clientY + event.delta.y;
        } else if ('touches' in activatorEvent && activatorEvent.touches.length > 0) {
          pointerY = activatorEvent.touches[0].clientY + event.delta.y;
        } else {
          // Fallback: insert before
          insertIndex = overIndex;
          projectionRef.current = { movingIds, targetStatus, insertIndex };
          return;
        }
        
        // If pointer is below target card midpoint, insert after; otherwise insert before
        if (pointerY > overMidpoint) {
          insertIndex = overIndex + 1;
        } else {
          insertIndex = overIndex;
        }
      }
    }
    
    // Store projection in ref (no re-render)
    projectionRef.current = { movingIds, targetStatus, insertIndex };
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    // Clear drag states
    setActiveTaskId(null);
    setOverColumnId(null);
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
    
    const { movingIds, targetStatus, insertIndex } = projection;
    
    // Use setTasksWithHistory to save state before modification
    setTasksWithHistory(prevTasks => {
      let newTasks = [...prevTasks];
      const sourceStatus = activeTask.status;
      const isSameColumn = sourceStatus === targetStatus;
      
      if (isSameColumn) {
        // SAME COLUMN: Simple reordering
        // Get all tasks in this column sorted by current order
        const columnTasks = newTasks
          .filter(t => t.status === sourceStatus)
          .sort((a, b) => a.order - b.order);
        
        // Get tasks not being moved
        const stationaryTasks = columnTasks.filter(t => !movingIds.includes(t.id));
        
        // Get tasks being moved (maintain their relative order)
        const movingTasks = columnTasks.filter(t => movingIds.includes(t.id));
        
        // Calculate insert index (clamped to valid range)
        const finalInsertIndex = Math.min(Math.max(0, insertIndex), stationaryTasks.length);
        
        // Build new order: insert moving tasks at the specified position
        const newOrder = [
          ...stationaryTasks.slice(0, finalInsertIndex),
          ...movingTasks,
          ...stationaryTasks.slice(finalInsertIndex),
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
  const handleSelectTask = useCallback((taskId: string, shiftKey: boolean) => {
    const clickedTask = tasks.find(t => t.id === taskId);
    const lastTask = lastSelectedId ? tasks.find(t => t.id === lastSelectedId) : null;
    
    if (shiftKey && lastTask && clickedTask) {
      // Check if same column
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
        // Different column: toggle individual selection (add/remove clicked task)
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
    } else {
      // Toggle single selection (first click or no shift)
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
  const handleBulkAppendTitle = useCallback((suffix: string) => {
    setTasksWithHistory(prevTasks =>
      prevTasks.map(task =>
        selectedTaskIds.has(task.id)
          ? { ...task, title: task.title + suffix }
          : task
      )
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

  // Get count of selected tasks for DragOverlay
  const selectedCount = selectedTaskIds.size;
  const selectedTasks = tasks.filter(t => selectedTaskIds.has(t.id));

  return (
    <div className="p-6" onClick={(e) => {
      // Clear selection when clicking on empty area
      if ((e.target as HTMLElement).closest('[data-task-card]') === null) {
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
              {todoTasks.map(task => (
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
                />
              ))}
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
              {inProgressTasks.map(task => (
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
                />
              ))}
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
              {doneTasks.map(task => (
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
                />
              ))}
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
