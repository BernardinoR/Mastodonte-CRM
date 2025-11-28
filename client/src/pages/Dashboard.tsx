import { useState, useCallback } from "react";
import { KanbanColumn } from "@/components/KanbanColumn";
import { TaskCard } from "@/components/TaskCard";
import { FilterBar } from "@/components/FilterBar";
import { Button } from "@/components/ui/button";
import { Plus, Circle, CheckCircle2 } from "lucide-react";
import { NewTaskDialog } from "@/components/NewTaskDialog";
import { DndContext, DragEndEvent, DragStartEvent, DragOverEvent, PointerSensor, useSensor, useSensors, DragOverlay } from "@dnd-kit/core";

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

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Ademar plan fin",
      clientName: "Ademar João Gréguer",
      priority: "Normal" as const,
      status: "To Do" as const,
      assignees: ["Rafael Bernardino Silveira"],
      dueDate: new Date('2025-11-19'),
    },
    {
      id: "2",
      title: "Atualizar plano financeiro da Fernanda",
      clientName: "Fernanda Carolina De Faria",
      priority: "Importante" as const,
      status: "To Do" as const,
      assignees: ["Rafael Bernardino Silveira", "Maria Santos"],
      dueDate: new Date('2025-11-15'),
    },
    {
      id: "3",
      title: "Aguardar retorno sobre apresentação do Ariel",
      status: "To Do" as const,
      assignees: ["Rafael Bernardino Silveira"],
      dueDate: new Date('2025-11-16'),
    },
    {
      id: "4",
      title: "Receber documentação da Viva",
      clientName: "Israel Schuster Da Fonseca",
      priority: "Baixa" as const,
      status: "To Do" as const,
      assignees: ["Rafael Bernardino Silveira", "João Silva", "Ana Costa"],
      dueDate: new Date('2025-11-20'),
    },
    {
      id: "5",
      title: "REALOCAR MARCOS",
      clientName: "Marcia Mozzato Ciampi De Andrade",
      priority: "Urgente" as const,
      status: "In Progress" as const,
      assignees: ["Rafael Bernardino Silveira"],
      dueDate: new Date('2025-01-20'),
    },
    {
      id: "6",
      title: "Falar com Marcia",
      clientName: "Marcia Mozzato Ciampi De Andrade",
      priority: "Urgente" as const,
      status: "In Progress" as const,
      assignees: ["Rafael Bernardino Silveira", "Pedro Oliveira"],
      dueDate: new Date('2025-01-20'),
    },
    {
      id: "7",
      title: "Macter",
      clientName: "Marcia Mozzato Ciampi De Andrade",
      priority: "Urgente" as const,
      status: "In Progress" as const,
      assignees: ["Rafael Bernardino Silveira"],
      dueDate: new Date('2025-01-20'),
    },
    {
      id: "8",
      title: "Receber IRPF Fernanda",
      clientName: "Fernanda Garcia Rodrigues de Souza",
      priority: "Urgente" as const,
      status: "In Progress" as const,
      assignees: ["Rafael Bernardino Silveira"],
      dueDate: new Date('2025-01-20'),
    },
    {
      id: "9",
      title: "Ajustar luiza",
      clientName: "Rodrigo Weber Rocha da Silva",
      priority: "Urgente" as const,
      status: "In Progress" as const,
      assignees: ["Rafael Bernardino Silveira", "Carla Mendes"],
      dueDate: new Date('2025-01-21'),
    },
  ]);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (task.clientName && task.clientName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesAssignee = assigneeFilter === "all" || task.assignees.some(a => a.includes(assigneeFilter));
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
    return matchesSearch && matchesAssignee && matchesPriority;
  });

  const todoTasks = filteredTasks.filter(t => t.status === "To Do");
  const inProgressTasks = filteredTasks.filter(t => t.status === "In Progress");
  const doneTasks = filteredTasks.filter(t => t.status === "Done");

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
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    setOverColumnId(over ? (over.id as string) : null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveTaskId(null);
    setOverColumnId(null);
    
    if (!over) return;
    
    const newStatus = over.id as TaskStatus;
    
    // Move all selected tasks to the new column
    setTasks(prevTasks => 
      prevTasks.map(task => 
        selectedTaskIds.has(task.id) 
          ? { ...task, status: newStatus }
          : task
      )
    );
    
    // Clear selection after drag
    handleClearSelection();
  };

  const activeTask = activeTaskId ? tasks.find(t => t.id === activeTaskId) : null;

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? { ...task, ...updates }
          : task
      )
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  };

  // Selection handlers
  const handleSelectTask = useCallback((taskId: string, shiftKey: boolean) => {
    if (shiftKey && lastSelectedId) {
      // Range selection with Shift+click
      const allTaskIds = filteredTasks.map(t => t.id);
      const lastIndex = allTaskIds.indexOf(lastSelectedId);
      const currentIndex = allTaskIds.indexOf(taskId);
      
      if (lastIndex !== -1 && currentIndex !== -1) {
        const start = Math.min(lastIndex, currentIndex);
        const end = Math.max(lastIndex, currentIndex);
        const rangeIds = allTaskIds.slice(start, end + 1);
        
        setSelectedTaskIds(prev => {
          const newSet = new Set(prev);
          rangeIds.forEach(id => newSet.add(id));
          return newSet;
        });
      }
    } else {
      // Toggle single selection
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
  }, [lastSelectedId, filteredTasks]);

  const handleClearSelection = useCallback(() => {
    setSelectedTaskIds(new Set());
    setLastSelectedId(null);
  }, []);

  // Bulk update for selected tasks (used by context menu)
  const handleBulkUpdate = useCallback((updates: Partial<Task>) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        selectedTaskIds.has(task.id)
          ? { ...task, ...updates }
          : task
      )
    );
  }, [selectedTaskIds]);

  // Bulk delete for selected tasks
  const handleBulkDelete = useCallback(() => {
    setTasks(prevTasks => prevTasks.filter(task => !selectedTaskIds.has(task.id)));
    handleClearSelection();
  }, [selectedTaskIds, handleClearSelection]);

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
            showDropPlaceholder={overColumnId === "To Do" && activeTask?.status !== "To Do"}
          >
            {todoTasks.map(task => (
              <TaskCard
                key={task.id}
                {...task}
                isSelected={selectedTaskIds.has(task.id)}
                selectedCount={selectedTaskIds.has(task.id) ? selectedCount : 0}
                onSelect={handleSelectTask}
                onUpdate={handleUpdateTask}
                onDelete={handleDeleteTask}
                onBulkUpdate={handleBulkUpdate}
                onBulkDelete={handleBulkDelete}
              />
            ))}
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
            showDropPlaceholder={overColumnId === "In Progress" && activeTask?.status !== "In Progress"}
          >
            {inProgressTasks.map(task => (
              <TaskCard
                key={task.id}
                {...task}
                isSelected={selectedTaskIds.has(task.id)}
                selectedCount={selectedTaskIds.has(task.id) ? selectedCount : 0}
                onSelect={handleSelectTask}
                onUpdate={handleUpdateTask}
                onDelete={handleDeleteTask}
                onBulkUpdate={handleBulkUpdate}
                onBulkDelete={handleBulkDelete}
              />
            ))}
          </KanbanColumn>

          <KanbanColumn 
            id="Done"
            title="Done" 
            count={doneTasks.length} 
            color="text-green-400"
            borderColor="border-green-700"
            icon={CheckCircle2}
            showDropPlaceholder={overColumnId === "Done" && activeTask?.status !== "Done"}
          >
            {doneTasks.map(task => (
              <TaskCard
                key={task.id}
                {...task}
                isSelected={selectedTaskIds.has(task.id)}
                selectedCount={selectedTaskIds.has(task.id) ? selectedCount : 0}
                onSelect={handleSelectTask}
                onUpdate={handleUpdateTask}
                onDelete={handleDeleteTask}
                onBulkUpdate={handleBulkUpdate}
                onBulkDelete={handleBulkDelete}
              />
            ))}
          </KanbanColumn>
        </div>
        
        <DragOverlay>
          {activeTask && (
            <div className="opacity-90 rotate-2 scale-105 relative">
              {selectedCount > 1 && (
                <div className="absolute -top-2 -right-2 z-10 bg-blue-500 text-white text-xs font-medium px-2 py-0.5 rounded-full shadow-lg">
                  {selectedCount} cards
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
              />
              {selectedCount > 1 && (
                <div className="absolute inset-0 -z-10 transform translate-x-1 translate-y-1">
                  <div className="w-full h-full bg-[#262626] rounded-lg border border-[#303030] opacity-60" />
                </div>
              )}
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
