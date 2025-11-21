import { KanbanColumn } from '../KanbanColumn';
import { TaskCard } from '../TaskCard';

export default function KanbanColumnExample() {
  const tasks = [
    {
      id: "1",
      title: "Ademar plan fin",
      clientName: "Ademar João Gréguer",
      priority: "Normal" as const,
      status: "To Do" as const,
      assignee: "Rafael Bernardino Silveira",
      dueDate: new Date('2025-11-19'),
    },
    {
      id: "2",
      title: "Atualizar plano financeiro",
      clientName: "Fernanda Carolina De Faria",
      priority: "Normal" as const,
      status: "To Do" as const,
      assignee: "Rafael Bernardino Silveira",
      dueDate: new Date('2025-11-15'),
    },
    {
      id: "3",
      title: "REALOCAR MARCOS",
      clientName: "Marcia Mozzato Ciampi De Andrade",
      priority: "Urgente" as const,
      status: "In Progress" as const,
      assignee: "Rafael Bernardino Silveira",
      dueDate: new Date('2025-01-20'),
    },
  ];

  return (
    <div className="p-6 bg-background">
      <div className="flex gap-6">
        <KanbanColumn title="To Do" count={2} color="text-blue-400">
          <TaskCard {...tasks[0]} />
          <TaskCard {...tasks[1]} />
        </KanbanColumn>
        <KanbanColumn title="In Progress" count={1} color="text-primary">
          <TaskCard {...tasks[2]} />
        </KanbanColumn>
        <KanbanColumn title="Done" count={0} color="text-green-400">
          <div className="text-sm text-muted-foreground text-center py-8">Nenhuma tarefa concluída</div>
        </KanbanColumn>
      </div>
    </div>
  );
}
