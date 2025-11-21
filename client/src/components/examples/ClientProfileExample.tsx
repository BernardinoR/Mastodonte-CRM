import { ClientProfile } from '../ClientProfile';
import { MeetingCard } from '../MeetingCard';
import { TaskCard } from '../TaskCard';

export default function ClientProfileExample() {
  return (
    <div className="p-6 bg-background max-w-5xl">
      <ClientProfile
        name="Alessandro Cuçulin Mazer"
        cpf="XXX.XXX.XXX-XX"
        email="mazer.ale@hotmail.com"
        phone="+55 16 99708-716"
        status="Ativo"
        folderLink="https://vault.repl.ai/file/com.google.drive/id/vicapukanty/dsfr/view?usp=sharing"
        onEdit={() => console.log('Edit clicked')}
        onArchive={() => console.log('Archive clicked')}
        onNewMeeting={() => console.log('New meeting clicked')}
        onNewTask={() => console.log('New task clicked')}
        meetingsContent={
          <>
            <MeetingCard
              id="1"
              date={new Date('2024-08-14')}
              type="Reunião Mensal"
              notes="Política de investimento"
            />
            <MeetingCard
              id="2"
              date={new Date('2024-08-12')}
              type="Política de Investimento"
              notes="Patrimônio Previdencial"
            />
            <MeetingCard
              id="3"
              date={new Date('2024-04-10')}
              type="Reunião Mensal"
              notes="Carteira Ações"
            />
          </>
        }
        tasksContent={
          <>
            <TaskCard
              id="1"
              title="Revisar carteira de ações"
              clientName="Alessandro Cuçulin Mazer"
              priority="Normal"
              status="To Do"
              assignee="Rafael Bernardino Silveira"
              dueDate={new Date('2025-01-25')}
            />
            <TaskCard
              id="2"
              title="Enviar relatório mensal"
              clientName="Alessandro Cuçulin Mazer"
              priority="Urgente"
              status="In Progress"
              assignee="Rafael Bernardino Silveira"
              dueDate={new Date('2025-01-22')}
            />
          </>
        }
      />
    </div>
  );
}
