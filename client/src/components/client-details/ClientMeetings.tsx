import { useState } from "react";
import { Link } from "wouter";
import { Calendar as CalendarIcon, FileText, Trash2, Pencil } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DateInput } from "@/components/ui/date-input";
import { AssigneeSelector } from "@/components/task-editors";
import { abbreviateName } from "@/components/ui/task-assignees";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MEETING_STATUS_BADGE_COLORS, UI_CLASSES } from "@/lib/statusConfig";
import type { useInlineClientMeetings } from "@/hooks/useInlineClientMeetings";
import { useInlineMeetingEdit } from "@/hooks/useInlineMeetingEdit";
import { MeetingDetailModal } from "@/components/meeting-detail";
import { useClients } from "@/contexts/ClientsContext";
import type { MeetingDetail } from "@/types/meeting";

interface Meeting {
  id: string;
  name: string;
  date: Date;
  type: string;
  status: string;
  assignees: string[];
}

interface ClientMeetingsProps {
  meetings: Meeting[];
  onNewMeeting: () => void;
  inlineProps: ReturnType<typeof useInlineClientMeetings>;
  clientId: string;
}

const typeColors: Record<string, string> = {
  "Mensal": "bg-[#203828] text-[#6ecf8e]",
  "Esporádica": "bg-[#422c24] text-[#dcb092]",
};

const statusColors = MEETING_STATUS_BADGE_COLORS;

const typeOptions = ["Mensal", "Esporádica"];
const statusOptions: ("Agendada" | "Realizada" | "Cancelada")[] = ["Agendada", "Realizada", "Cancelada"];

function MeetingsTable({ 
  meetings, 
  inlineProps,
  clientId,
  onMeetingClick,
}: { 
  meetings: Meeting[]; 
  inlineProps: ReturnType<typeof useInlineClientMeetings>;
  clientId: string;
  onMeetingClick: (meeting: Meeting) => void;
}) {
  const [visibleCount, setVisibleCount] = useState(5);
  
  // Estados para edição inline do nome
  const [editingMeetingId, setEditingMeetingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const visibleMeetings = meetings.slice(0, visibleCount);
  const hasMore = meetings.length > visibleCount;
  const remainingCount = meetings.length - visibleCount;

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 5);
  };

  const {
    isAddingMeeting,
    newMeetingName,
    setNewMeetingName,
    newMeetingType,
    newMeetingDate,
    newMeetingStatus,
    newMeetingAssignees,
    newTypePopoverOpen,
    setNewTypePopoverOpen,
    newStatusPopoverOpen,
    setNewStatusPopoverOpen,
    newDatePopoverOpen,
    setNewDatePopoverOpen,
    newAssigneePopoverOpen,
    setNewAssigneePopoverOpen,
    setNewMeetingRowRef,
    handleStartAddMeeting,
    handleKeyDown,
    handleCancelAddMeeting,
    handleSaveMeeting,
    handleNewTypeChange,
    handleNewStatusChange,
    handleNewDateChange,
    handleNewAddAssignee,
    handleNewRemoveAssignee,
    newDatePopoverRef,
    handleNewDatePopoverInteractOutside,
    handleNewMeetingRowBlur,
  } = inlineProps;

  const {
    typePopoverOpen,
    setTypePopoverOpen,
    statusPopoverOpen,
    setStatusPopoverOpen,
    datePopoverOpen,
    setDatePopoverOpen,
    assigneePopoverOpen,
    setAssigneePopoverOpen,
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    datePopoverRef,
    handleTypeChange,
    handleStatusChange,
    handleDateChange,
    handleAddAssignee,
    handleRemoveAssignee,
    handleDeleteClick,
    handleConfirmDelete,
    handleInteractOutside,
  } = useInlineMeetingEdit(clientId);

  const { updateClientMeeting } = useClients();

  // Handlers para edição inline do nome
  const handleStartEditName = (meeting: Meeting, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingMeetingId(meeting.id);
    setEditingName(meeting.name);
  };

  const handleSaveName = (meetingId: string) => {
    if (editingName.trim() && editingName !== meetings.find(m => m.id === meetingId)?.name) {
      updateClientMeeting(clientId, meetingId, { name: editingName.trim() });
    }
    setEditingMeetingId(null);
    setEditingName("");
  };

  const handleCancelEditName = () => {
    setEditingMeetingId(null);
    setEditingName("");
  };

  const handleNameKeyDown = (e: React.KeyboardEvent, meetingId: string) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSaveName(meetingId);
    } else if (e.key === "Escape") {
      handleCancelEditName();
    }
  };

  const handleRowClick = (e: React.MouseEvent, meeting: Meeting) => {
    // Don't open modal if clicking on a popover trigger or interactive element
    const target = e.target as HTMLElement;
    const isPopoverTrigger = target.closest('[data-popover-trigger]');
    const isButton = target.closest('button');
    const isPopoverContent = target.closest('[data-radix-popper-content-wrapper]');
    const isInput = target.closest('input');
    
    if (isPopoverTrigger || isButton || isPopoverContent || isInput || editingMeetingId) {
      return;
    }
    
    onMeetingClick(meeting);
  };

  const renderInlineAddRow = () => (
    <tr
      ref={setNewMeetingRowRef}
      tabIndex={-1}
      className="border-b border-[#333333] group/row"
      onKeyDown={handleKeyDown}
      onBlur={handleNewMeetingRowBlur}
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
            <div
              className="inline-flex items-center gap-1.5 cursor-pointer rounded px-1 -mx-1 py-0.5 hover:bg-[#2c2c2c] transition-colors text-foreground"
              data-testid="select-new-meeting-date"
            >
              <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground" />
              {format(newMeetingDate, "dd/MM/yyyy", { locale: ptBR })}
            </div>
          </PopoverTrigger>
          <PopoverContent
            ref={newDatePopoverRef}
            className={`w-auto p-0 ${UI_CLASSES.popover}`}
            side="bottom"
            align="start"
            sideOffset={6}
            onInteractOutside={handleNewDatePopoverInteractOutside}
            onPointerDownOutside={handleNewDatePopoverInteractOutside}
            onFocusOutside={handleNewDatePopoverInteractOutside}
          >
            <DateInput
              value={format(newMeetingDate, "yyyy-MM-dd")}
              onChange={(date) => {
                if (date) handleNewDateChange(date);
              }}
              className="font-semibold"
              dataTestId="input-date-new-meeting"
              hideIcon
              commitOnInput={false}
            />
          </PopoverContent>
        </Popover>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <Popover open={newAssigneePopoverOpen} onOpenChange={setNewAssigneePopoverOpen}>
            <PopoverTrigger asChild>
              <div
                className="inline-flex items-center gap-2 rounded-md cursor-pointer transition-colors hover:bg-[#2c2c2c] px-1 py-0.5"
                data-testid="select-new-meeting-assignees"
              >
                {newMeetingAssignees.length === 0 ? (
                  <span className="text-muted-foreground text-sm">+ Responsável</span>
                ) : (
                  <span className="text-foreground text-sm">
                    {newMeetingAssignees.map(a => abbreviateName(a)).join(", ")}
                  </span>
                )}
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0" side="bottom" align="start" sideOffset={6}>
              <AssigneeSelector
                selectedAssignees={newMeetingAssignees}
                onSelect={(assignee) => handleNewAddAssignee(assignee)}
                onRemove={(assignee) => handleNewRemoveAssignee(assignee)}
              />
            </PopoverContent>
          </Popover>
          <button
            onClick={handleCancelAddMeeting}
            className="p-1 rounded hover:bg-[#3a2020] transition-all opacity-0 group-hover/row:opacity-100"
            data-testid="button-cancel-new-meeting"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
          </button>
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
      <table className="w-full text-sm table-fixed">
        <thead>
          <tr className="border-b border-[#333333]">
            <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide w-[280px]">Nome da Reunião</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide w-[100px]">Tipo</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide w-[100px]">Status</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide w-[110px]">Data</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide w-[180px]">Responsáveis</th>
          </tr>
        </thead>
        <tbody>
          {visibleMeetings.map((meeting) => (
            <tr 
              key={meeting.id} 
              className="border-b border-[#333333] hover:bg-[#2c2c2c] transition-colors group/row cursor-pointer"
              onClick={(e) => handleRowClick(e, meeting)}
            >
              <td className="py-3 px-4">
                <div className="flex items-center gap-2 group/name">
                  <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  {editingMeetingId === meeting.id ? (
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onBlur={() => handleSaveName(meeting.id)}
                      onKeyDown={(e) => handleNameKeyDown(e, meeting.id)}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                      className="bg-transparent border-b border-[#2eaadc] text-sm text-foreground font-medium placeholder:text-muted-foreground focus:outline-none w-full"
                      data-testid={`input-meeting-name-${meeting.id}`}
                    />
                  ) : (
                    <>
                      <span className="text-foreground font-medium">{meeting.name}</span>
                      <button
                        onClick={(e) => handleStartEditName(meeting, e)}
                        className="p-1 rounded hover:bg-[#3a3a3a] transition-all opacity-0 group-hover/name:opacity-100"
                        data-testid={`button-edit-meeting-name-${meeting.id}`}
                      >
                        <Pencil className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                      </button>
                    </>
                  )}
                </div>
              </td>
              <td className="py-3 px-4">
                <Popover open={typePopoverOpen === meeting.id} onOpenChange={(open) => setTypePopoverOpen(open ? meeting.id : null)}>
                  <PopoverTrigger asChild data-popover-trigger>
                    <div className="inline-block cursor-pointer" data-testid={`cell-meeting-type-${meeting.id}`}>
                      <Badge className={`${typeColors[meeting.type] || "bg-[#333333] text-[#a0a0a0]"} text-xs cursor-pointer hover:opacity-80 transition-opacity`}>
                        {meeting.type}
                      </Badge>
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className={`w-56 p-0 ${UI_CLASSES.popover}`} side="bottom" align="start" sideOffset={6}>
                    <div className="w-full">
                      <div className={`border-b ${UI_CLASSES.border}`}>
                        <div className="px-3 py-1.5 text-xs text-gray-500">Selecionado</div>
                        <div className="px-3 py-1">
                          <div className={`flex items-center gap-2 px-2 py-1.5 rounded-md ${UI_CLASSES.selectedItem}`}>
                            <Badge className={`${typeColors[meeting.type] || "bg-[#333333] text-[#a0a0a0]"} text-xs`}>
                              {meeting.type}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="px-3 py-1.5 text-xs text-gray-500">Outras opções</div>
                      <div className="pb-1">
                        {typeOptions.filter(t => t !== meeting.type).map(t => (
                          <div
                            key={t}
                            className={UI_CLASSES.dropdownItem}
                            onClick={() => handleTypeChange(clientId, meeting.id, t)}
                            data-testid={`option-meeting-type-${meeting.id}-${t}`}
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
                <Popover open={statusPopoverOpen === meeting.id} onOpenChange={(open) => setStatusPopoverOpen(open ? meeting.id : null)}>
                  <PopoverTrigger asChild data-popover-trigger>
                    <div className="inline-block cursor-pointer" data-testid={`cell-meeting-status-${meeting.id}`}>
                      <Badge className={`${statusColors[meeting.status]} text-xs cursor-pointer hover:opacity-80 transition-opacity`}>
                        {meeting.status}
                      </Badge>
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className={`w-44 p-0 ${UI_CLASSES.popover}`} side="bottom" align="start" sideOffset={6}>
                    <div className="w-full">
                      <div className={`border-b ${UI_CLASSES.border}`}>
                        <div className="px-3 py-1.5 text-xs text-gray-500">Selecionado</div>
                        <div className="px-3 py-1">
                          <div className={`flex items-center gap-2 px-2 py-1.5 rounded-md ${UI_CLASSES.selectedItem}`}>
                            <Badge className={`${statusColors[meeting.status]} text-xs`}>
                              {meeting.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="px-3 py-1.5 text-xs text-gray-500">Outras opções</div>
                      <div className="pb-1">
                        {statusOptions.filter(s => s !== meeting.status).map(s => (
                          <div
                            key={s}
                            className={UI_CLASSES.dropdownItem}
                            onClick={() => handleStatusChange(clientId, meeting.id, s)}
                            data-testid={`option-meeting-status-${meeting.id}-${s}`}
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
                <Popover open={datePopoverOpen === meeting.id} onOpenChange={(open) => setDatePopoverOpen(open ? meeting.id : null)}>
                  <PopoverTrigger asChild data-popover-trigger>
                    <div
                      className="inline-flex items-center gap-1.5 cursor-pointer rounded px-1 -mx-1 py-0.5 hover:bg-[#2c2c2c] transition-colors text-foreground"
                      data-testid={`cell-meeting-date-${meeting.id}`}
                    >
                      <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground" />
                      {format(meeting.date, "dd/MM/yyyy", { locale: ptBR })}
                    </div>
                  </PopoverTrigger>
                  <PopoverContent
                    ref={datePopoverRef}
                    className={`w-auto p-0 ${UI_CLASSES.popover}`}
                    side="bottom"
                    align="start"
                    sideOffset={6}
                    onInteractOutside={handleInteractOutside}
                    onPointerDownOutside={handleInteractOutside}
                    onFocusOutside={handleInteractOutside}
                  >
                    <DateInput
                      value={format(meeting.date, "yyyy-MM-dd")}
                      onChange={(date) => handleDateChange(clientId, meeting.id, date)}
                      className="font-semibold"
                      dataTestId={`input-date-meeting-${meeting.id}`}
                      hideIcon
                      commitOnInput={false}
                    />
                  </PopoverContent>
                </Popover>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <Popover open={assigneePopoverOpen === meeting.id} onOpenChange={(open) => setAssigneePopoverOpen(open ? meeting.id : null)}>
                    <PopoverTrigger asChild data-popover-trigger>
                      <div
                        className="inline-flex items-center gap-2 rounded-md cursor-pointer transition-colors hover:bg-[#2c2c2c] px-1 py-0.5"
                        data-testid={`cell-meeting-assignees-${meeting.id}`}
                      >
                        {(meeting.assignees?.length || 0) === 0 ? (
                          <span className="text-muted-foreground text-sm">+ Responsável</span>
                        ) : (
                          <span className="text-foreground text-sm">
                            {meeting.assignees.map(a => abbreviateName(a)).join(", ")}
                          </span>
                        )}
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-0" side="bottom" align="start" sideOffset={6}>
                      <AssigneeSelector
                        selectedAssignees={meeting.assignees || []}
                        onSelect={(assignee) => handleAddAssignee(clientId, meeting.id, meeting.assignees || [], assignee)}
                        onRemove={(assignee) => handleRemoveAssignee(clientId, meeting.id, meeting.assignees || [], assignee)}
                      />
                    </PopoverContent>
                  </Popover>
                  <button
                    onClick={() => handleDeleteClick(meeting.id, meeting.name)}
                    className="p-1 rounded hover:bg-[#3a2020] transition-all opacity-0 group-hover/row:opacity-100"
                    data-testid={`button-delete-meeting-${meeting.id}`}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {isAddingMeeting && renderInlineAddRow()}
        </tbody>
      </table>
      <div className="flex items-center justify-between">
        {!isAddingMeeting && (
          <div 
            className="py-3 px-4 text-sm text-[#2eaadc] hover:bg-[#2c2c2c] cursor-pointer transition-colors"
            onClick={handleStartAddMeeting}
            data-testid="button-add-meeting-table"
          >
            + Agendar nova reunião
          </div>
        )}
        {isAddingMeeting && <div />}
        {hasMore && (
          <div
            className="py-3 px-4 text-sm text-muted-foreground hover:text-foreground hover:bg-[#2c2c2c] cursor-pointer transition-colors"
            onClick={handleLoadMore}
            data-testid="button-load-more-meetings"
          >
            Carregar mais +{Math.min(5, remainingCount)}
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteConfirmOpen} onOpenChange={(open) => !open && setDeleteConfirmOpen(null)}>
        <AlertDialogContent className="bg-[#252525] border-[#333333]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Excluir reunião?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Tem certeza que deseja excluir a reunião "{deleteConfirmOpen?.meetingName}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-[#333333] border-[#444444] text-foreground hover:bg-[#3a3a3a]">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 text-white hover:bg-red-700"
              data-testid="button-confirm-delete-meeting"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
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
          { id: "1", icon: "alert-circle", text: "Acompanhamento regular de investimentos e planejamento financeiro." },
          { id: "2", icon: "plane", text: "Cliente valoriza flexibilidade e praticidade nas transações." },
        ],
      },
      highlights: [
        { id: "1", icon: "building", text: "Revisão de carteira", type: "normal" },
        { id: "2", icon: "plane", text: "Planejamento", type: "normal" },
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
