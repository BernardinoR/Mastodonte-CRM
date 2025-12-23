import { Link } from "wouter";
import { Calendar as CalendarIcon, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MEETING_STATUS_BADGE_COLORS } from "@/lib/statusConfig";

interface Meeting {
  id: string;
  name: string;
  date: Date;
  type: string;
  status: string;
  consultant: string;
}

interface ClientMeetingsProps {
  meetings: Meeting[];
  onNewMeeting: () => void;
}

const typeColors: Record<string, string> = {
  "Mensal": "bg-[#203828] text-[#6ecf8e]",
  "Follow-up": "bg-[#422c24] text-[#dcb092]",
  "Especial": "bg-[#38273f] text-[#d09cdb]",
};

const statusColors = MEETING_STATUS_BADGE_COLORS;

export function ClientMeetings({ meetings, onNewMeeting }: ClientMeetingsProps) {
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
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#333333]">
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">Nome da Reunião</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">Tipo</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">Data</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">Consultor</th>
              </tr>
            </thead>
            <tbody>
              {meetings.map((meeting) => (
                <tr key={meeting.id} className="border-b border-[#333333] hover:bg-[#2c2c2c] transition-colors cursor-pointer">
                  <td className="py-3 px-4 text-foreground font-medium flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    {meeting.name}
                  </td>
                  <td className="py-3 px-4">
                    <Badge className={`${typeColors[meeting.type] || "bg-[#333333] text-[#a0a0a0]"} text-xs`}>
                      {meeting.type}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Badge className={`${statusColors[meeting.status]} text-xs`}>
                      {meeting.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-foreground">
                    {format(meeting.date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </td>
                  <td className="py-3 px-4 text-foreground">{meeting.consultant}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div 
            className="py-3 px-4 text-sm text-[#2eaadc] hover:bg-[#2c2c2c] cursor-pointer transition-colors"
            onClick={onNewMeeting}
            data-testid="button-add-meeting-table"
          >
            + Agendar nova reunião
          </div>
        </div>
      </Card>
    </div>
  );
}
