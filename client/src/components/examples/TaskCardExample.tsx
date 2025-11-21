import { TaskCard } from '../TaskCard';

export default function TaskCardExample() {
  return (
    <div className="p-6 space-y-4 bg-background max-w-md">
      <TaskCard
        id="1"
        title="REALOCAR MARCOS"
        clientName="Marcia Mozzato Ciampi De Andrade"
        priority="Urgente"
        status="In Progress"
        assignee="Rafael Bernardino Silveira"
        dueDate={new Date('2025-01-20')}
        onClick={() => console.log('Task clicked')}
      />
      <TaskCard
        id="2"
        title="Atualizar plano financeiro da Fernanda"
        clientName="Fernanda Carolina De Faria"
        priority="Normal"
        status="To Do"
        assignee="Rafael Bernardino Silveira"
        dueDate={new Date('2025-11-15')}
        onClick={() => console.log('Task clicked')}
      />
      <TaskCard
        id="3"
        title="Receber IRPF Fernanda"
        clientName="Fernanda Garcia Rodrigues de Souza"
        priority="Urgente"
        status="Done"
        assignee="Rafael Bernardino Silveira"
        dueDate={new Date('2025-01-20')}
        onClick={() => console.log('Task clicked')}
      />
    </div>
  );
}
