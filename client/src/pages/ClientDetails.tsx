import { ClientProfile } from "@/components/ClientProfile";
import { MeetingCard } from "@/components/MeetingCard";
import { TaskCard } from "@/components/TaskCard";
import { useState } from "react";
import { NewMeetingDialog } from "@/components/NewMeetingDialog";
import { NewTaskDialog } from "@/components/NewTaskDialog";

export default function ClientDetails() {
  const [newMeetingOpen, setNewMeetingOpen] = useState(false);
  const [newTaskOpen, setNewTaskOpen] = useState(false);

  const meetings = [
    {
      id: "1",
      date: new Date('2024-08-14'),
      type: "Reunião Mensal",
      notes: "Política de investimento",
    },
    {
      id: "2",
      date: new Date('2024-08-12'),
      type: "Política de Investimento",
      notes: "Patrimônio Previdencial",
    },
    {
      id: "3",
      date: new Date('2024-04-10'),
      type: "Reunião Mensal",
      notes: "Carteira Ações",
    },
    {
      id: "4",
      date: new Date('2024-01-15'),
      type: "Informação social",
      notes: "Discussão sobre estratégias de investimento para o próximo trimestre.",
    },
    {
      id: "5",
      date: new Date('2023-08-30'),
      type: "Reunião Anual",
      notes: "Balanço anual e planejamento estratégico",
    },
  ];

  const tasks = [
    {
      id: "1",
      title: "Revisar carteira de ações",
      clientName: "Alessandro Cuçulin Mazer",
      priority: "Normal" as const,
      status: "To Do" as const,
      assignees: ["Rafael Bernardino Silveira"],
      dueDate: new Date('2025-01-25'),
      onUpdate: () => {},
      onDelete: () => {},
    },
    {
      id: "2",
      title: "Enviar relatório mensal",
      clientName: "Alessandro Cuçulin Mazer",
      priority: "Urgente" as const,
      status: "In Progress" as const,
      assignees: ["Rafael Bernardino Silveira", "Maria Santos"],
      dueDate: new Date('2025-01-22'),
      onUpdate: () => {},
      onDelete: () => {},
    },
    {
      id: "3",
      title: "Marcar reunião mensal",
      clientName: "Alessandro Cuçulin Mazer",
      priority: "Normal" as const,
      status: "Done" as const,
      assignees: ["Rafael Bernardino Silveira"],
      dueDate: new Date('2025-01-15'),
      onUpdate: () => {},
      onDelete: () => {},
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <ClientProfile
        name="Alessandro Cuçulin Mazer"
        cpf="XXX.XXX.XXX-XX"
        email="mazer.ale@hotmail.com"
        phone="+55 16 99708-716"
        status="Ativo"
        folderLink="https://vault.repl.ai/file/com.google.drive/id/vicapukanty/dsfr/view?usp=sharing"
        onEdit={() => console.log('Edit client')}
        onArchive={() => console.log('Archive client')}
        onNewMeeting={() => setNewMeetingOpen(true)}
        onNewTask={() => setNewTaskOpen(true)}
        meetingsContent={
          <>
            {meetings.map(meeting => (
              <MeetingCard
                key={meeting.id}
                {...meeting}
                onClick={() => console.log('Meeting clicked:', meeting.id)}
              />
            ))}
          </>
        }
        tasksContent={
          <>
            {tasks.map(task => (
              <TaskCard
                key={task.id}
                {...task}
              />
            ))}
          </>
        }
      />

      <NewMeetingDialog
        open={newMeetingOpen}
        onOpenChange={setNewMeetingOpen}
        preSelectedClient="1"
        onSubmit={(data) => console.log('New meeting:', data)}
      />

      <NewTaskDialog
        open={newTaskOpen}
        onOpenChange={setNewTaskOpen}
        preSelectedClient="1"
        onSubmit={(data) => console.log('New task:', data)}
      />
    </div>
  );
}
