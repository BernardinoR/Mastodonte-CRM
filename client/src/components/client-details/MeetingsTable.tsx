/**
 * Componente de tabela de reuniões extraído para melhor organização e reutilização
 */
import { Calendar as CalendarIcon, FileText, Trash2 } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/shared/components/ui/alert-dialog";
import { DateInput } from "@/shared/components/ui/date-input";
import { AssigneeSelector } from "@/components/task-editors";
import { abbreviateName } from "@/shared/components/ui/task-assignees";
import { EditableCell } from "@/shared/components/ui/editable-cell";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MEETING_STATUS_BADGE_COLORS, UI_CLASSES } from "@/lib/statusConfig";
import type { useInlineClientMeetings } from "@/hooks/useInlineClientMeetings";
import { useInlineMeetingEdit } from "@/hooks/useInlineMeetingEdit";
import { useInlineEdit } from "@/shared/hooks/useInlineEdit";
import { usePaginatedList } from "@/shared/hooks/usePaginatedList";
import { useClients } from "@/contexts/ClientsContext";
import { 
  MEETING_TYPE_COLORS, 
  MEETING_TYPE_OPTIONS, 
  MEETING_STATUS_OPTIONS,
  type MeetingStatus 
} from "@shared/config/meetingConfig";

export interface Meeting {
  id: string;
  name: string;
  date: Date;
  type: string;
  status: string;
  assignees: string[];
}

export interface MeetingsTableProps {
  meetings: Meeting[];
  inlineProps: ReturnType<typeof useInlineClientMeetings>;
  clientId: string;
  onMeetingClick: (meeting: Meeting) => void;
}

// Usar constantes centralizadas
const typeColors = MEETING_TYPE_COLORS;
const statusColors = MEETING_STATUS_BADGE_COLORS;
const typeOptions = [...MEETING_TYPE_OPTIONS];
const statusOptions: MeetingStatus[] = [...MEETING_STATUS_OPTIONS];

export function MeetingsTable({ 
  meetings, 
  inlineProps,
  clientId,
  onMeetingClick,
}: MeetingsTableProps) {
  // Hook de paginação genérico
  const { visibleItems: visibleMeetings, hasMore, remainingCount, loadMore } = usePaginatedList(meetings, 5);

  // Hook de edição inline genérico para o nome
  const { updateClientMeeting } = useClients();
  const nameEdit = useInlineEdit<Meeting>({
    onSave: (id, name) => updateClientMeeting(clientId, id, { name }),
    getId: (meeting) => meeting.id,
    getValue: (meeting) => meeting.name,
  });

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

  const handleRowClick = (e: React.MouseEvent, meeting: Meeting) => {
    // Don't open modal if clicking on a popover trigger or interactive element
    const target = e.target as HTMLElement;
    const isPopoverTrigger = target.closest('[data-popover-trigger]');
    const isButton = target.closest('button');
    const isPopoverContent = target.closest('[data-radix-popper-content-wrapper]');
    const isInput = target.closest('input');
    
    if (isPopoverTrigger || isButton || isPopoverContent || isInput || nameEdit.editingId) {
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
                <EditableCell
                  value={meeting.name}
                  isEditing={nameEdit.isEditing(meeting.id)}
                  editValue={nameEdit.editingValue}
                  onEditValueChange={nameEdit.setEditingValue}
                  onStartEdit={(e) => nameEdit.startEdit(meeting, e)}
                  onSave={nameEdit.save}
                  onKeyDown={nameEdit.handleKeyDown}
                  icon={<FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                  inputTestId={`input-meeting-name-${meeting.id}`}
                  buttonTestId={`button-edit-meeting-name-${meeting.id}`}
                />
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
            onClick={loadMore}
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

