/**
 * Componente principal de reuniões do cliente
 * Orquestra a tabela de reuniões e o modal de detalhes
 */
import { useState } from "react";
import { Link } from "wouter";
import { Calendar as CalendarIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { useInlineClientMeetings } from "@/hooks/useInlineClientMeetings";
import { useClients } from "@/contexts/ClientsContext";
import type { MeetingDetail } from "@/types/meeting";
import { MeetingDetailModal } from "@/components/meeting-detail";
import { MeetingsTable, type Meeting } from "./MeetingsTable";

interface ClientMeetingsProps {
  meetings: Meeting[];
  onNewMeeting: () => void;
  inlineProps: ReturnType<typeof useInlineClientMeetings>;
  clientId: string;
}

export function ClientMeetings({ meetings, onNewMeeting, inlineProps, clientId }: ClientMeetingsProps) {
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingDetail | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const { getFullClientData, getMeetingDetail } = useClients();
  
  const clientData = getFullClientData(clientId);
  const clientName = clientData?.client.name || "";

  const handleMeetingClick = (meeting: Meeting) => {
    // Try to get stored detailed data first
    const storedDetail = getMeetingDetail(clientId, meeting.id);
    
    if (storedDetail) {
      setSelectedMeeting(storedDetail);
      setDetailModalOpen(true);
      return;
    }
    
    // Fallback: Create MeetingDetail from basic meeting data
    const meetingDetail: MeetingDetail = {
      id: meeting.id,
      name: meeting.name,
      type: meeting.type,
      status: meeting.status as "Agendada" | "Realizada" | "Cancelada",
      date: meeting.date,
      startTime: "10:00",
      endTime: "11:15",
      duration: "1h 15min",
      location: "Google Meet",
      assignees: meeting.assignees,
      responsible: {
        name: meeting.assignees[0] || "Rafael",
        initials: meeting.assignees[0]?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || "RF",
      },
      clientName: clientName,
      summary: `Foi discutida a <strong>situação financeira</strong> e as prioridades do cliente, além de revisar o desempenho das <strong>carteiras de investimento</strong> e as estratégias de realocação.`,
      clientContext: {
        points: [
          { id: "1", icon: "AlertCircle", text: "Acompanhamento regular de investimentos e planejamento financeiro." },
          { id: "2", icon: "Plane", text: "Cliente valoriza flexibilidade e praticidade nas transações." },
        ],
      },
      highlights: [
        { id: "1", icon: "Building", text: "Revisão de carteira", type: "normal" },
        { id: "2", icon: "Plane", text: "Planejamento", type: "normal" },
      ],
      agenda: [
        {
          id: "1",
          number: 1,
          title: "Revisão de Carteira de Investimentos",
          status: "discussed",
          subitems: [
            { id: "1-1", title: "Análise de performance", description: "Revisão do desempenho atual das carteiras e rentabilidade no período." },
            { id: "1-2", title: "Estratégias de realocação", description: "Discussão sobre oportunidades de realocação para melhorar rentabilidade." },
          ],
        },
        {
          id: "2",
          number: 2,
          title: "Planejamento Financeiro",
          status: "discussed",
          subitems: [
            { id: "2-1", title: "Objetivos de curto prazo", description: "Definição de metas para os próximos 6 meses." },
          ],
        },
      ],
      decisions: [
        { id: "1", content: "Revisão mensal de <strong>performance das carteiras</strong> será mantida", type: "normal" },
        { id: "2", content: "Avaliar novas <strong>oportunidades de investimento</strong> no próximo encontro", type: "normal" },
      ],
      linkedTasks: [
        {
          id: "1",
          title: "Preparar relatório mensal de performance",
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          assignee: meeting.assignees[0] || "Rafael",
          priority: "Normal",
          completed: false,
        },
      ],
      participants: [
        { id: "1", name: clientName, role: "Cliente", avatarColor: "#a78bfa", initials: clientName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() },
        { id: "2", name: meeting.assignees[0] || "Rafael", role: "Consultor de Investimentos", avatarColor: "#2563eb", initials: meeting.assignees[0]?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || "RF" },
      ],
      attachments: [
        { id: "1", name: "Relatório_Carteira.pdf", type: "pdf", size: "2.4 MB", addedAt: meeting.date },
      ],
    };
    
    setSelectedMeeting(meetingDetail);
    setDetailModalOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-base font-semibold text-foreground">Reuniões</h2>
        </div>
        <Link href="/meetings" className="text-sm text-[#2eaadc] hover:underline flex items-center gap-1">
          Ver todas →
        </Link>
      </div>
      <Card className="bg-[#202020] border-[#333333] overflow-hidden">
        <MeetingsTable 
          meetings={meetings} 
          inlineProps={inlineProps} 
          clientId={clientId}
          onMeetingClick={handleMeetingClick}
        />
      </Card>

      <MeetingDetailModal
        meeting={selectedMeeting}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
      />
    </div>
  );
}
