import { Link } from "wouter";
import { Calendar as CalendarIcon, FileText, Check, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DateInput } from "@/components/ui/date-input";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MEETING_STATUS_BADGE_COLORS, UI_CLASSES } from "@/lib/statusConfig";
import type { useInlineClientMeetings } from "@/hooks/useInlineClientMeetings";
import { MOCK_RESPONSIBLES } from "@/lib/mock-users";

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
  inlineProps: ReturnType<typeof useInlineClientMeetings>;
}

const typeColors: Record<string, string> = {
  "Reunião Mensal": "bg-[#203828] text-[#6ecf8e]",
  "Reunião Anual": "bg-[#203828] text-[#6ecf8e]",
  "Política de Investimento": "bg-[#422c24] text-[#dcb092]",
  "Patrimônio Previdencial": "bg-[#38273f] text-[#d09cdb]",
  "Mensal": "bg-[#203828] text-[#6ecf8e]",
  "Follow-up": "bg-[#422c24] text-[#dcb092]",
  "Especial": "bg-[#38273f] text-[#d09cdb]",
};

const statusColors = MEETING_STATUS_BADGE_COLORS;

const typeOptions = ["Reunião Mensal", "Reunião Anual", "Política de Investimento", "Patrimônio Previdencial"];
const statusOptions: ("Agendada" | "Realizada" | "Cancelada")[] = ["Agendada", "Realizada", "Cancelada"];

function MeetingsTable({ 
  meetings, 
  inlineProps 
}: { 
  meetings: Meeting[]; 
  inlineProps: ReturnType<typeof useInlineClientMeetings>;
}) {
  const {
    isAddingMeeting,
    newMeetingName,
    setNewMeetingName,
    newMeetingType,
    newMeetingDate,
    newMeetingStatus,
    newMeetingConsultant,
    newTypePopoverOpen,
    setNewTypePopoverOpen,
    newStatusPopoverOpen,
    setNewStatusPopoverOpen,
    newDatePopoverOpen,
    setNewDatePopoverOpen,
    newConsultantPopoverOpen,
    setNewConsultantPopoverOpen,
    setNewMeetingRowRef,
    handleStartAddMeeting,
    handleKeyDown,
    handleCancelAddMeeting,
    handleSaveMeeting,
    handleNewTypeChange,
    handleNewStatusChange,
    handleNewDateChange,
    handleNewConsultantChange,
  } = inlineProps;

  const renderInlineAddRow = () => (
    <tr
      ref={setNewMeetingRowRef}
      tabIndex={-1}
      className="border-b border-[#333333] group/row"
      onKeyDown={handleKeyDown}
    >
      <td className="py-3 px-4">
        <input
          type="text"
          placeholder="Nome da reunião"
          value={newMeetingName}
          onChange={(e) => setNewMeetingName(e.target.value)}
          className="bg-transparent border-b border-[#2eaadc] text-sm text-foreground font-medium placeholder:text-muted-foreground focus:outline-none w-full"
          autoFocus
          data-testid="input-new-meeting-name"
        />
      </td>
      <td className="py-3 px-4">
        <Popover open={newTypePopoverOpen} onOpenChange={setNewTypePopoverOpen}>
          <PopoverTrigger asChild>
            <div className="inline-block cursor-pointer" data-testid="select-new-meeting-type">
              <Badge className={`${typeColors[newMeetingType] || "bg-[#333333] text-[#a0a0a0]"} text-xs cursor-pointer hover:opacity-80 transition-opacity`}>
                {newMeetingType}
              </Badge>
            </div>
          </PopoverTrigger>
          <PopoverContent className={`w-56 p-0 ${UI_CLASSES.popover}`} side="bottom" align="start" sideOffset={6}>
            <div className="w-full">
              <div className={`border-b ${UI_CLASSES.border}`}>
                <div className="px-3 py-1.5 text-xs text-gray-500">Selecionado</div>
                <div className="px-3 py-1">
                  <div className={`flex items-center gap-2 px-2 py-1.5 rounded-md ${UI_CLASSES.selectedItem}`}>
                    <Badge className={`${typeColors[newMeetingType] || "bg-[#333333] text-[#a0a0a0]"} text-xs`}>
                      {newMeetingType}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="px-3 py-1.5 text-xs text-gray-500">Outras opções</div>
              <div className="pb-1">
                {typeOptions.filter(t => t !== newMeetingType).map(t => (
                  <div
                    key={t}
                    className={UI_CLASSES.dropdownItem}
                    onClick={() => handleNewTypeChange(t)}
                    data-testid={`option-new-meeting-type-${t}`}
                  >
                    <Badge className={`${typeColors[t] || "bg-[#333333] text-[#a0a0a0]"} text-xs`}>
                      {t}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </td>
      <td className="py-3 px-4">
        <Popover open={newStatusPopoverOpen} onOpenChange={setNewStatusPopoverOpen}>
          <PopoverTrigger asChild>
            <div className="inline-block cursor-pointer" data-testid="select-new-meeting-status">
              <Badge className={`${statusColors[newMeetingStatus]} text-xs cursor-pointer hover:opacity-80 transition-opacity`}>
                {newMeetingStatus}
              </Badge>
            </div>
          </PopoverTrigger>
          <PopoverContent className={`w-44 p-0 ${UI_CLASSES.popover}`} side="bottom" align="start" sideOffset={6}>
            <div className="w-full">
              <div className={`border-b ${UI_CLASSES.border}`}>
                <div className="px-3 py-1.5 text-xs text-gray-500">Selecionado</div>
                <div className="px-3 py-1">
                  <div className={`flex items-center gap-2 px-2 py-1.5 rounded-md ${UI_CLASSES.selectedItem}`}>
                    <Badge className={`${statusColors[newMeetingStatus]} text-xs`}>
                      {newMeetingStatus}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="px-3 py-1.5 text-xs text-gray-500">Outras opções</div>
              <div className="pb-1">
                {statusOptions.filter(s => s !== newMeetingStatus).map(s => (
                  <div
                    key={s}
                    className={UI_CLASSES.dropdownItem}
                    onClick={() => handleNewStatusChange(s)}
                    data-testid={`option-new-meeting-status-${s}`}
                  >
                    <Badge className={`${statusColors[s]} text-xs`}>
                      {s}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </td>
      <td className="py-3 px-4">
        <Popover open={newDatePopoverOpen} onOpenChange={setNewDatePopoverOpen}>
          <PopoverTrigger asChild>
            <span 
              className="text-foreground text-sm cursor-pointer hover:text-[#2eaadc] transition-colors"
              data-testid="select-new-meeting-date"
            >
              {format(newMeetingDate, "dd/MM/yyyy", { locale: ptBR })}
            </span>
          </PopoverTrigger>
          <PopoverContent className={`w-auto p-3 ${UI_CLASSES.popover}`} side="bottom" align="start" sideOffset={6}>
            <DateInput
              value={newMeetingDate}
              onChange={(date) => {
                if (date) handleNewDateChange(date);
              }}
            />
          </PopoverContent>
        </Popover>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <Popover open={newConsultantPopoverOpen} onOpenChange={setNewConsultantPopoverOpen}>
            <PopoverTrigger asChild>
              <div
                className="inline-flex items-center gap-2 rounded-md cursor-pointer transition-colors hover:bg-[#2c2c2c] px-1 py-0.5"
                data-testid="select-new-meeting-consultant"
              >
                <span className="text-foreground text-sm">
                  {newMeetingConsultant}
                </span>
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0" side="bottom" align="start" sideOffset={6}>
              <div className="max-h-52 overflow-y-auto">
                {MOCK_RESPONSIBLES.map((consultant) => (
                  <div
                    key={consultant.id}
                    className={UI_CLASSES.dropdownItem}
                    onClick={() => handleNewConsultantChange(consultant.name)}
                    data-testid={`option-consultant-${consultant.id}`}
                  >
                    <span className="text-sm text-foreground">{consultant.name}</span>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          <div className="flex gap-1">
            <button
              onClick={handleSaveMeeting}
              className="p-1 hover:bg-[#2c2c2c] rounded text-[#2eaadc]"
              data-testid="button-save-new-meeting"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={handleCancelAddMeeting}
              className="p-1 hover:bg-[#2c2c2c] rounded text-muted-foreground"
              data-testid="button-cancel-new-meeting"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </td>
    </tr>
  );

  if (meetings.length === 0 && !isAddingMeeting) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground text-sm mb-3">Nenhuma reunião encontrada para este cliente</p>
        <div 
          className="text-sm text-[#2eaadc] hover:underline cursor-pointer"
          onClick={handleStartAddMeeting}
          data-testid="button-add-meeting-empty"
        >
          + Agendar nova reunião
        </div>
      </div>
    );
  }

  return (
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
          {isAddingMeeting && renderInlineAddRow()}
        </tbody>
      </table>
      {!isAddingMeeting && (
        <div 
          className="py-3 px-4 text-sm text-[#2eaadc] hover:bg-[#2c2c2c] cursor-pointer transition-colors"
          onClick={handleStartAddMeeting}
          data-testid="button-add-meeting-table"
        >
          + Agendar nova reunião
        </div>
      )}
    </div>
  );
}

export function ClientMeetings({ meetings, onNewMeeting, inlineProps }: ClientMeetingsProps) {
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
        <MeetingsTable meetings={meetings} inlineProps={inlineProps} />
      </Card>
    </div>
  );
}
