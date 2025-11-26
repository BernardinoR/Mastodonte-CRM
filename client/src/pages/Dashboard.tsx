import { useState } from "react";
import { KanbanColumn } from "@/components/KanbanColumn";
import { TaskCard } from "@/components/TaskCard";
import { FilterBar } from "@/components/FilterBar";
import { Button } from "@/components/ui/button";
import { Plus, Circle, Loader2, CheckCircle2 } from "lucide-react";
import { NewTaskDialog } from "@/components/NewTaskDialog";
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;
    
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { ...task, status: newStatus }
          : task
      )
    );
  };

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

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
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

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-4">
          <KanbanColumn 
            id="To Do"
            title="To Do" 
            count={todoTasks.length} 
            color="text-blue-400"
            borderColor="border-[#202020]"
            icon={Circle}
          >
            {todoTasks.map(task => (
              <TaskCard
                key={task.id}
                {...task}
                onUpdate={handleUpdateTask}
                onDelete={handleDeleteTask}
              />
            ))}
          </KanbanColumn>

          <KanbanColumn 
            id="In Progress"
            title="In Progress" 
            count={inProgressTasks.length} 
            color="text-primary"
            borderColor="border-blue-700"
            icon={Loader2}
          >
            {inProgressTasks.map(task => (
              <TaskCard
                key={task.id}
                {...task}
                onUpdate={handleUpdateTask}
                onDelete={handleDeleteTask}
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
          >
            {doneTasks.map(task => (
              <TaskCard
                key={task.id}
                {...task}
                onUpdate={handleUpdateTask}
                onDelete={handleDeleteTask}
              />
            ))}
          </KanbanColumn>
        </div>
      </DndContext>

      <NewTaskDialog
        open={newTaskOpen}
        onOpenChange={setNewTaskOpen}
        onSubmit={(data) => console.log('New task:', data)}
      />
    </div>
  );
}
