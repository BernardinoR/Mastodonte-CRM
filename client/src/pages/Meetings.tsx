import { useState } from "react";
import { MeetingCard } from "@/components/MeetingCard";
import { FilterBar } from "@/components/FilterBar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { NewMeetingDialog } from "@/components/NewMeetingDialog";

export default function Meetings() {
  const [searchQuery, setSearchQuery] = useState("");
  const [newMeetingOpen, setNewMeetingOpen] = useState(false);

  const meetings = [
    {
      id: "1",
      date: new Date('2024-08-20'),
      type: "Reunião Mensal",
      clientName: "Alessandro Cuçulin Mazer",
      notes: "Política de investimento e discussão sobre alocação de ativos internacionais.",
    },
    {
      id: "2",
      date: new Date('2024-08-14'),
      type: "Política de Investimento",
      clientName: "Alessandro Cuçulin Mazer",
      notes: "Definição de nova política após revisão do perfil de risco.",
    },
    {
      id: "3",
      date: new Date('2024-08-12'),
      type: "Reunião Mensal",
      clientName: "Fernanda Carolina De Faria",
      notes: "Revisão de carteira e apresentação de novas oportunidades.",
    },
    {
      id: "4",
      date: new Date('2024-08-10'),
      type: "Patrimônio Previdencial",
      clientName: "Gustavo Samconi Soares",
      notes: "Planejamento previdenciário e discussão sobre produtos de longo prazo.",
    },
    {
      id: "5",
      date: new Date('2024-08-05'),
      type: "Reunião Anual",
      clientName: "Marcia Mozzato Ciampi De Andrade",
      notes: "Balanço anual dos investimentos e planejamento estratégico para 2025.",
    },
  ];

  const filteredMeetings = meetings.filter(meeting =>
    meeting.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    meeting.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    meeting.notes.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Reuniões</h1>
        <Button onClick={() => setNewMeetingOpen(true)} data-testid="button-newmeeting">
          <Plus className="w-4 h-4 mr-2" />
          Nova Reunião
        </Button>
      </div>

      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        showAssignee={false}
        showPriority={false}
      />

      <div className="space-y-4">
        {filteredMeetings.map(meeting => (
          <MeetingCard
            key={meeting.id}
            {...meeting}
            onClick={() => console.log('Meeting clicked:', meeting.id)}
          />
        ))}
      </div>

      <NewMeetingDialog
        open={newMeetingOpen}
        onOpenChange={setNewMeetingOpen}
        onSubmit={(data) => console.log('New meeting:', data)}
      />
    </div>
  );
}
