import { MeetingCard } from '../MeetingCard';

export default function MeetingCardExample() {
  return (
    <div className="p-6 space-y-4 bg-background max-w-3xl">
      <MeetingCard
        id="1"
        date={new Date('2024-08-14')}
        type="Reunião Mensal"
        clientName="Alessandro Cuçulin Mazer"
        notes="Revisão da carteira de investimentos e discussão sobre novas oportunidades no mercado internacional."
        onClick={() => console.log('Meeting clicked')}
      />
      <MeetingCard
        id="2"
        date={new Date('2024-08-12')}
        type="Política de Investimento"
        clientName="Alessandro Cuçulin Mazer"
        notes="Definição da nova política de investimentos considerando o perfil de risco atualizado e objetivos de longo prazo."
        onClick={() => console.log('Meeting clicked')}
      />
      <MeetingCard
        id="3"
        date={new Date('2023-08-30')}
        type="Reunião Anual"
        clientName="Alessandro Cuçulin Mazer"
        notes="Balanço anual dos investimentos, apresentação de resultados e planejamento estratégico para o próximo ano fiscal."
        onClick={() => console.log('Meeting clicked')}
      />
    </div>
  );
}
