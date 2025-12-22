import { useState, useRef, useEffect, type KeyboardEvent, type ChangeEvent } from "react";
import { useParams, Link } from "wouter";
import { 
  Phone, 
  Mail, 
  Calendar as CalendarIcon, 
  Plus, 
  MessageSquare, 
  Edit, 
  IdCard, 
  User, 
  MapPin,
  Clock, 
  ArrowLeft,
  CheckCircle2,
  Lock,
  AlertCircle,
  Lightbulb,
  Target,
  FileText,
  History,
  AlertTriangle,
  GitBranch,
  Check,
  X,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DateInput } from "@/components/ui/date-input";
import { NewMeetingDialog } from "@/components/NewMeetingDialog";
import { WhatsAppGroupsTable } from "@/components/WhatsAppGroupsTable";
import { ClientStatusBadge } from "@/components/ClientStatusBadge";
import { EmailsPopover } from "@/components/EmailsPopover";
import { AdvisorPopover } from "@/components/AdvisorPopover";
import { AddressPopover } from "@/components/AddressPopover";
import { FoundationCodeField } from "@/components/FoundationCodeField";
import { AssigneeSelector } from "@/components/task-editors";
import { useTasks } from "@/contexts/TasksContext";
import { useClients } from "@/contexts/ClientsContext";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { UI_CLASSES } from "@/lib/statusConfig";
import { getAvatarColor, getInitials } from "@/components/ui/task-assignees";
import type { Task as GlobalTask, TaskPriority, TaskStatus } from "@/types/task";
import type { ClientStats, ClientMeeting } from "@/types/client";
import { useInlineClientTasks } from "@/hooks/useInlineClientTasks";
import { useInlineTaskEdit } from "@/hooks/useInlineTaskEdit";

type StatCard = ClientStats;
type Meeting = ClientMeeting;

const DISABLED_SECTIONS_TOP = [
  { id: "farol", title: "Farol", icon: AlertCircle, description: "Indicador de acompanhamento do cliente" },
  { id: "guidance", title: "Guidance", icon: Lightbulb, description: "Orientações para próxima reunião" },
];

const DISABLED_SECTIONS_BOTTOM = [
  { id: "oportunidades", title: "Oportunidades", icon: Target, description: "Oportunidades identificadas" },
  { id: "metodo", title: "Método (Planejamento)", icon: FileText, description: "Planejamento financeiro" },
  { id: "timeline", title: "Linha do Tempo", icon: History, description: "Histórico de interações" },
  { id: "erros", title: "Erros e Ocorrências", icon: AlertTriangle, description: "Registro de erros e ocorrências" },
  { id: "pipeline", title: "Pipeline de Indicações", icon: GitBranch, description: "Gestão de indicações" },
];

function MetaItem({ icon: Icon, label, value, highlight = false }: { icon: any; label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </span>
      <span className={`text-sm font-medium ${highlight ? "text-emerald-400" : "text-foreground"}`}>
        {value}
      </span>
    </div>
  );
}

function StatCardComponent({ stat }: { stat: StatCard }) {
  return (
    <Card className="p-4 bg-[#202020] border-[#333333]">
      <div className="text-2xl font-bold text-foreground">{stat.value}</div>
      <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
      {stat.change && (
        <div className={`text-xs mt-2 ${
          stat.changeType === "positive" ? "text-emerald-400" : 
          stat.changeType === "negative" ? "text-red-400" : 
          "text-muted-foreground"
        }`}>
          {stat.change}
        </div>
      )}
    </Card>
  );
}

function DisabledSection({ section }: { section: typeof DISABLED_SECTIONS_TOP[0] }) {
  const Icon = section.icon;
  return (
    <Card className="p-6 bg-[#202020] border-[#333333] opacity-60">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-[#2c2c2c] flex items-center justify-center">
          <Icon className="w-6 h-6 text-muted-foreground" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-semibold text-foreground">{section.title}</h3>
            <Badge variant="secondary" className="bg-[#333333] text-muted-foreground text-xs">
              <Lock className="w-3 h-3 mr-1" />
              Desabilitado
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{section.description}</p>
        </div>
      </div>
    </Card>
  );
}

function MeetingsTable({ meetings, onNewMeeting }: { meetings: Meeting[]; onNewMeeting: () => void }) {
  const typeColors: Record<string, string> = {
    "Mensal": "bg-[#203828] text-[#6ecf8e]",
    "Follow-up": "bg-[#422c24] text-[#dcb092]",
    "Especial": "bg-[#38273f] text-[#d09cdb]",
  };
  
  const statusColors: Record<string, string> = {
    "Agendada": "bg-[#1c3847] text-[#6db1d4]",
    "Realizada": "bg-[#203828] text-[#6ecf8e]",
    "Cancelada": "bg-[#3d2626] text-[#e07a7a]",
  };

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
  );
}

interface InlineTaskProps {
  isAddingTask: boolean;
  newTaskTitle: string;
  setNewTaskTitle: (value: string) => void;
  newTaskPriority: TaskPriority;
  setNewTaskPriority: (value: TaskPriority) => void;
  newTaskStatus: TaskStatus;
  setNewTaskStatus: (value: TaskStatus) => void;
  setNewTaskRowRef: (element: HTMLTableRowElement | null) => void;
  handleStartAddTask: () => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  handleCancelAddTask: () => void;
  handleSaveTask: () => void;
}

function TasksTable({ 
  tasks, 
  inlineProps 
}: { 
  tasks: GlobalTask[]; 
  inlineProps: InlineTaskProps;
}) {
  const {
    isAddingTask,
    newTaskTitle,
    setNewTaskTitle,
    newTaskPriority,
    setNewTaskPriority,
    newTaskStatus,
    setNewTaskStatus,
    setNewTaskRowRef,
    handleStartAddTask,
    handleKeyDown,
    handleCancelAddTask,
    handleSaveTask,
  } = inlineProps;

  const {
    statusPopoverOpen,
    setStatusPopoverOpen,
    priorityPopoverOpen,
    setPriorityPopoverOpen,
    datePopoverOpen,
    setDatePopoverOpen,
    assigneePopoverOpen,
    setAssigneePopoverOpen,
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    datePopoverRef,
    handleStatusChange,
    handlePriorityChange,
    handleDateChange,
    handleAddAssignee,
    handleRemoveAssignee,
    handleDeleteClick,
    handleConfirmDelete,
    handleInteractOutside,
  } = useInlineTaskEdit();

  const statusColors: Record<string, string> = {
    "To Do": "bg-[#333333] text-[#a0a0a0]",
    "In Progress": "bg-[#4d331f] text-[#e6b07a]",
    "Done": "bg-[#203828] text-[#6ecf8e]",
  };
  
  const priorityColors: Record<string, string> = {
    "Urgente": "bg-[#3d2626] text-[#e07a7a]",
    "Importante": "bg-[#38273f] text-[#d09cdb]",
    "Normal": "bg-[#333333] text-[#a0a0a0]",
    "Baixa": "bg-[#1c3847] text-[#6db1d4]",
  };

  const statusOptions: TaskStatus[] = ["To Do", "In Progress", "Done"];
  const priorityOptions: TaskPriority[] = ["Urgente", "Importante", "Normal", "Baixa"];

  const renderInlineAddRow = () => (
    <tr
      ref={setNewTaskRowRef}
      tabIndex={-1}
      className="border-b border-[#333333] group/row"
      onKeyDown={handleKeyDown}
    >
      <td className="py-3 px-4">
        <input
          type="text"
          placeholder="Nome da tarefa"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          className="bg-transparent border-b border-[#2eaadc] text-sm text-foreground font-medium placeholder:text-muted-foreground focus:outline-none w-full"
          autoFocus
          data-testid="input-new-task-title"
        />
      </td>
      <td className="py-3 px-4">
        <select
          value={newTaskStatus}
          onChange={(e) => setNewTaskStatus(e.target.value as TaskStatus)}
          className={`${statusColors[newTaskStatus]} text-xs px-2 py-1 rounded-md cursor-pointer bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-[#2eaadc]`}
          data-testid="select-new-task-status"
        >
          {statusOptions.map((status) => (
            <option key={status} value={status} className="bg-[#202020]">
              {status}
            </option>
          ))}
        </select>
      </td>
      <td className="py-3 px-4">
        <select
          value={newTaskPriority}
          onChange={(e) => setNewTaskPriority(e.target.value as TaskPriority)}
          className={`${priorityColors[newTaskPriority]} text-xs px-2 py-1 rounded-md cursor-pointer bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-[#2eaadc]`}
          data-testid="select-new-task-priority"
        >
          {priorityOptions.map((priority) => (
            <option key={priority} value={priority} className="bg-[#202020]">
              {priority}
            </option>
          ))}
        </select>
      </td>
      <td className="py-3 px-4 text-muted-foreground text-sm">
        Hoje
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">-</span>
          <div className="flex gap-1">
            <button
              onClick={handleSaveTask}
              className="p-1 hover:bg-[#2c2c2c] rounded text-[#2eaadc]"
              data-testid="button-save-new-task"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={handleCancelAddTask}
              className="p-1 hover:bg-[#2c2c2c] rounded text-muted-foreground"
              data-testid="button-cancel-new-task"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </td>
    </tr>
  );

  if (tasks.length === 0 && !isAddingTask) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground text-sm mb-3">Nenhuma tarefa encontrada para este cliente</p>
        <div 
          className="text-sm text-[#2eaadc] hover:underline cursor-pointer"
          onClick={handleStartAddTask}
          data-testid="button-add-task-empty"
        >
          + Nova tarefa
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#333333]">
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">Tarefa</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">Prioridade</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">Prazo</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">Responsável</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id} className="border-b border-[#333333] hover:bg-[#2c2c2c] transition-colors group/row">
                <td className="py-3 px-4 text-foreground font-medium">{task.title}</td>
                <td className="py-3 px-4">
                  <Popover open={statusPopoverOpen === task.id} onOpenChange={(open) => setStatusPopoverOpen(open ? task.id : null)}>
                    <PopoverTrigger asChild>
                      <div className="inline-block cursor-pointer" data-testid={`cell-task-status-${task.id}`}>
                        <Badge className={`${statusColors[task.status]} text-xs cursor-pointer hover:opacity-80 transition-opacity`}>
                          {task.status}
                        </Badge>
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className={`w-44 p-0 ${UI_CLASSES.popover}`} side="bottom" align="start" sideOffset={6}>
                      <div className="w-full">
                        <div className={`border-b ${UI_CLASSES.border}`}>
                          <div className="px-3 py-1.5 text-xs text-gray-500">Selecionado</div>
                          <div className="px-3 py-1">
                            <div className={`flex items-center gap-2 px-2 py-1.5 rounded-md ${UI_CLASSES.selectedItem}`}>
                              <Badge className={`${statusColors[task.status]} text-xs`}>
                                {task.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="px-3 py-1.5 text-xs text-gray-500">Outras opções</div>
                        <div className="pb-1">
                          {statusOptions.filter(s => s !== task.status).map(s => (
                            <div
                              key={s}
                              className={UI_CLASSES.dropdownItem}
                              onClick={() => handleStatusChange(task.id, s)}
                              data-testid={`option-task-status-${task.id}-${s}`}
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
                  <Popover open={priorityPopoverOpen === task.id} onOpenChange={(open) => setPriorityPopoverOpen(open ? task.id : null)}>
                    <PopoverTrigger asChild>
                      <div className="inline-block cursor-pointer" data-testid={`cell-task-priority-${task.id}`}>
                        <Badge className={`${priorityColors[task.priority || "Normal"]} text-xs cursor-pointer hover:opacity-80 transition-opacity`}>
                          {task.priority || "Normal"}
                        </Badge>
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className={`w-44 p-0 ${UI_CLASSES.popover}`} side="bottom" align="start" sideOffset={6}>
                      <div className="w-full">
                        <div className={`border-b ${UI_CLASSES.border}`}>
                          <div className="px-3 py-1.5 text-xs text-gray-500">Selecionado</div>
                          <div className="px-3 py-1">
                            <div className={`flex items-center gap-2 px-2 py-1.5 rounded-md ${UI_CLASSES.selectedItem}`}>
                              <Badge className={`${priorityColors[task.priority || "Normal"]} text-xs`}>
                                {task.priority || "Normal"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="px-3 py-1.5 text-xs text-gray-500">Outras opções</div>
                        <div className="pb-1">
                          {priorityOptions.filter(p => p !== (task.priority || "Normal")).map(p => (
                            <div
                              key={p}
                              className={UI_CLASSES.dropdownItem}
                              onClick={() => handlePriorityChange(task.id, p)}
                              data-testid={`option-task-priority-${task.id}-${p}`}
                            >
                              <Badge className={`${priorityColors[p]} text-xs`}>
                                {p}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </td>
                <td className="py-3 px-4">
                  <Popover open={datePopoverOpen === task.id} onOpenChange={(open) => setDatePopoverOpen(open ? task.id : null)}>
                    <PopoverTrigger asChild>
                      <div
                        className="inline-flex items-center gap-1.5 cursor-pointer rounded px-1 -mx-1 py-0.5 hover:bg-[#2c2c2c] transition-colors text-foreground"
                        data-testid={`cell-task-date-${task.id}`}
                      >
                        <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground" />
                        {format(task.dueDate, "dd/MM/yyyy", { locale: ptBR })}
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
                        value={format(task.dueDate, "yyyy-MM-dd")}
                        onChange={(date) => handleDateChange(task.id, date)}
                        className="font-semibold"
                        dataTestId={`input-date-task-${task.id}`}
                        hideIcon
                        commitOnInput={false}
                      />
                    </PopoverContent>
                  </Popover>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Popover open={assigneePopoverOpen === task.id} onOpenChange={(open) => setAssigneePopoverOpen(open ? task.id : null)}>
                      <PopoverTrigger asChild>
                        <div
                          className="inline-flex items-center gap-2 rounded-md cursor-pointer transition-colors hover:bg-[#2c2c2c] px-1 py-0.5"
                          data-testid={`cell-task-assignee-${task.id}`}
                        >
                          {(task.assignees?.length || 0) === 0 ? (
                            <span className="text-muted-foreground text-sm">+ Responsável</span>
                          ) : (
                            <>
                              <div className="flex -space-x-2 flex-shrink-0">
                                {task.assignees?.slice(0, 3).map((assignee, idx) => (
                                  <Avatar
                                    key={idx}
                                    className={`w-6 h-6 ${UI_CLASSES.avatarBorder} ${getAvatarColor(idx)}`}
                                  >
                                    <AvatarFallback className="bg-transparent text-white font-medium text-[11px]">
                                      {getInitials(assignee)}
                                    </AvatarFallback>
                                  </Avatar>
                                ))}
                              </div>
                              {(task.assignees?.length || 0) > 3 && (
                                <span className="text-muted-foreground text-xs">+{(task.assignees?.length || 0) - 3}</span>
                              )}
                            </>
                          )}
                        </div>
                      </PopoverTrigger>
                      <PopoverContent className="w-64 p-0" side="bottom" align="start" sideOffset={6}>
                        <AssigneeSelector
                          selectedAssignees={task.assignees || []}
                          onSelect={(assignee) => handleAddAssignee(task.id, task.assignees || [], assignee)}
                          onRemove={(assignee) => handleRemoveAssignee(task.id, task.assignees || [], assignee)}
                        />
                      </PopoverContent>
                    </Popover>
                    <button
                      onClick={() => handleDeleteClick(task.id, task.title)}
                      className="p-1 rounded hover:bg-[#3a2020] transition-all opacity-0 group-hover/row:opacity-100"
                      data-testid={`button-delete-task-${task.id}`}
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {isAddingTask && renderInlineAddRow()}
          </tbody>
        </table>
        {!isAddingTask && (
          <div 
            className="py-3 px-4 text-sm text-[#2eaadc] hover:bg-[#2c2c2c] cursor-pointer transition-colors"
            onClick={handleStartAddTask}
            data-testid="button-add-task-table"
          >
            + Nova tarefa
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteConfirmOpen} onOpenChange={(open) => !open && setDeleteConfirmOpen(null)}>
        <AlertDialogContent className="bg-[#252525] border-[#333333]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Excluir tarefa?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Tem certeza que deseja excluir a tarefa "{deleteConfirmOpen?.taskTitle}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-[#333333] border-[#444444] text-foreground hover:bg-[#3a3a3a]">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 text-white hover:bg-red-700"
              data-testid="button-confirm-delete-task"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default function ClientDetails() {
  const params = useParams<{ id: string }>();
  const [newMeetingOpen, setNewMeetingOpen] = useState(false);
  const [isAddingWhatsAppGroup, setIsAddingWhatsAppGroup] = useState(false);
  const [whatsappPopoverOpen, setWhatsappPopoverOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [isEditingCpf, setIsEditingCpf] = useState(false);
  const [draftCpf, setDraftCpf] = useState("");
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [draftPhone, setDraftPhone] = useState("");
  const [isBulkEditing, setIsBulkEditing] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const cpfInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const blurTimeoutRef = useRef<number | null>(null);
  const cpfBlurTimeoutRef = useRef<number | null>(null);
  const phoneBlurTimeoutRef = useRef<number | null>(null);
  const { getTasksByClient } = useTasks();
  const { getFullClientData, getClientByName, addWhatsAppGroup, updateWhatsAppGroup, deleteWhatsAppGroup, updateClientStatus, updateClientName, updateClientCpf, updateClientPhone, addClientEmail, removeClientEmail, updateClientEmail, setClientPrimaryEmail, updateClientAdvisor, updateClientAddress, updateClientFoundationCode, dataVersion } = useClients();
  
  // dataVersion is used to trigger re-render when client data changes
  void dataVersion;
  
  const clientIdOrName = params.id || "1";
  
  let clientData = getFullClientData(clientIdOrName);
  
  if (!clientData) {
    const decodedName = decodeURIComponent(clientIdOrName);
    const clientByName = getClientByName(decodedName);
    if (clientByName) {
      clientData = getFullClientData(clientByName.id);
    }
  }
  
  // Extract client info before hooks to satisfy React's rules of hooks
  const clientId = clientData?.client.id || "";
  const clientName = clientData?.client.name || "";
  
  const clientTasks = getTasksByClient(clientName);

  const inlineTaskProps = useInlineClientTasks({
    clientId,
    clientName,
  });
  
  if (!clientData) {
    return (
      <div className="p-6">
        <Link href="/clients" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Voltar para Clientes
        </Link>
        <div className="text-center text-muted-foreground">Cliente não encontrado</div>
      </div>
    );
  }
  
  const { client, stats, meetings, whatsappGroups } = clientData;

  const startEditingName = () => {
    setDraftName(client.name);
    setIsEditingName(true);
  };

  const handleEditClient = () => {
    setDraftName(client.name);
    setDraftCpf(client.cpf);
    setDraftPhone(client.phone);
    setIsEditingName(true);
    setIsEditingCpf(true);
    setIsEditingPhone(true);
    setIsBulkEditing(true);
  };

  const commitAllChanges = () => {
    const trimmedName = draftName.trim();
    if (trimmedName && trimmedName !== client.name) {
      updateClientName(client.id, trimmedName);
    }
    
    const trimmedCpf = draftCpf.trim();
    if (trimmedCpf && trimmedCpf !== client.cpf) {
      updateClientCpf(client.id, trimmedCpf);
    }
    
    const trimmedPhone = draftPhone.trim();
    if (trimmedPhone && trimmedPhone !== client.phone) {
      updateClientPhone(client.id, trimmedPhone);
    }
    
    setIsEditingName(false);
    setIsEditingCpf(false);
    setIsEditingPhone(false);
    setIsBulkEditing(false);
  };

  const cancelAllChanges = () => {
    setIsEditingName(false);
    setIsEditingCpf(false);
    setIsEditingPhone(false);
    setIsBulkEditing(false);
    setDraftName("");
    setDraftCpf("");
    setDraftPhone("");
  };

  const commitNameChange = () => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
    
    const trimmed = draftName.trim();
    if (trimmed && trimmed !== client.name) {
      updateClientName(client.id, trimmed);
    }
    setIsEditingName(false);
  };

  const cancelEditingName = () => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
    setIsEditingName(false);
    setDraftName("");
  };

  const handleNameKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (isBulkEditing) {
        commitAllChanges();
      } else {
        commitNameChange();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      if (isBulkEditing) {
        cancelAllChanges();
      } else {
        cancelEditingName();
      }
    }
  };

  const handleNameBlur = () => {
    if (isBulkEditing) return;
    blurTimeoutRef.current = window.setTimeout(() => {
      commitNameChange();
    }, 150);
  };

  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditingName]);

  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
      if (cpfBlurTimeoutRef.current) {
        clearTimeout(cpfBlurTimeoutRef.current);
      }
      if (phoneBlurTimeoutRef.current) {
        clearTimeout(phoneBlurTimeoutRef.current);
      }
    };
  }, []);

  // CPF mask: XXX.XXX.XXX-XX
  const formatCpf = (value: string): string => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  };

  // Phone mask: supports Brazilian (+55) and international formats
  const formatPhone = (value: string): string => {
    const digits = value.replace(/\D/g, "");
    if (digits.length === 0) return "";
    
    // Brazilian format: +55 (XX) XXXXX-XXXX or +55 (XX) XXXX-XXXX
    if (digits.startsWith("55") && digits.length >= 3) {
      const country = "+55";
      const rest = digits.slice(2);
      if (rest.length <= 2) return `${country} (${rest}`;
      const ddd = rest.slice(0, 2);
      const number = rest.slice(2);
      if (number.length <= 4) return `${country} (${ddd}) ${number}`;
      if (number.length <= 8) return `${country} (${ddd}) ${number.slice(0, 4)}-${number.slice(4)}`;
      // 9 digits (cell phone)
      return `${country} (${ddd}) ${number.slice(0, 5)}-${number.slice(5, 9)}`;
    }
    
    // International format: +XX XXXX XXXX...
    if (digits.length <= 2) return `+${digits}`;
    const countryCode = digits.slice(0, 2);
    const number = digits.slice(2);
    if (number.length <= 4) return `+${countryCode} ${number}`;
    if (number.length <= 8) return `+${countryCode} ${number.slice(0, 4)} ${number.slice(4)}`;
    return `+${countryCode} ${number.slice(0, 4)} ${number.slice(4, 8)} ${number.slice(8, 12)}`;
  };

  const startEditingCpf = () => {
    setDraftCpf(client.cpf);
    setIsEditingCpf(true);
  };

  const commitCpfChange = () => {
    if (cpfBlurTimeoutRef.current) {
      clearTimeout(cpfBlurTimeoutRef.current);
      cpfBlurTimeoutRef.current = null;
    }
    
    const formatted = draftCpf.trim();
    if (formatted && formatted !== client.cpf) {
      updateClientCpf(client.id, formatted);
    }
    setIsEditingCpf(false);
  };

  const cancelEditingCpf = () => {
    if (cpfBlurTimeoutRef.current) {
      clearTimeout(cpfBlurTimeoutRef.current);
      cpfBlurTimeoutRef.current = null;
    }
    setIsEditingCpf(false);
    setDraftCpf("");
  };

  const handleCpfChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDraftCpf(formatCpf(e.target.value));
  };

  const handleCpfKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (isBulkEditing) {
        commitAllChanges();
      } else {
        commitCpfChange();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      if (isBulkEditing) {
        cancelAllChanges();
      } else {
        cancelEditingCpf();
      }
    }
  };

  const handleCpfBlur = () => {
    if (isBulkEditing) return;
    cpfBlurTimeoutRef.current = window.setTimeout(() => {
      commitCpfChange();
    }, 150);
  };

  useEffect(() => {
    if (isEditingCpf && cpfInputRef.current && !isBulkEditing) {
      cpfInputRef.current.focus();
      cpfInputRef.current.select();
    }
  }, [isEditingCpf, isBulkEditing]);

  const startEditingPhone = () => {
    setDraftPhone(client.phone);
    setIsEditingPhone(true);
  };

  const commitPhoneChange = () => {
    if (phoneBlurTimeoutRef.current) {
      clearTimeout(phoneBlurTimeoutRef.current);
      phoneBlurTimeoutRef.current = null;
    }
    
    const formatted = draftPhone.trim();
    if (formatted && formatted !== client.phone) {
      updateClientPhone(client.id, formatted);
    }
    setIsEditingPhone(false);
  };

  const cancelEditingPhone = () => {
    if (phoneBlurTimeoutRef.current) {
      clearTimeout(phoneBlurTimeoutRef.current);
      phoneBlurTimeoutRef.current = null;
    }
    setIsEditingPhone(false);
    setDraftPhone("");
  };

  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDraftPhone(formatPhone(e.target.value));
  };

  const handlePhoneKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (isBulkEditing) {
        commitAllChanges();
      } else {
        commitPhoneChange();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      if (isBulkEditing) {
        cancelAllChanges();
      } else {
        cancelEditingPhone();
      }
    }
  };

  const handlePhoneBlur = () => {
    if (isBulkEditing) return;
    phoneBlurTimeoutRef.current = window.setTimeout(() => {
      commitPhoneChange();
    }, 150);
  };

  useEffect(() => {
    if (isEditingPhone && phoneInputRef.current && !isBulkEditing) {
      phoneInputRef.current.focus();
      phoneInputRef.current.select();
    }
  }, [isEditingPhone, isBulkEditing]);

  const handleWhatsApp = (link?: string, isGroup?: boolean) => {
    if (isGroup && link) {
      // Extrai o código do grupo do link (ex: https://chat.whatsapp.com/AbCdEfGhIjKlMnO -> AbCdEfGhIjKlMnO)
      const groupCode = link.replace(/^https?:\/\/chat\.whatsapp\.com\//, "");
      window.location.href = `whatsapp://chat/?code=${groupCode}`;
    } else {
      const clientPhone = client.phone.replace(/\D/g, "");
      window.location.href = `whatsapp://send?phone=${clientPhone}`;
    }
  };

  const activeWhatsAppGroups = whatsappGroups.filter(g => g.status === "Ativo" && g.link);
  const hasWhatsAppGroups = activeWhatsAppGroups.length > 0;

  const handleEmail = () => {
    const primaryEmail = client.emails[client.primaryEmailIndex] || client.emails[0];
    if (primaryEmail) {
      window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(primaryEmail)}`, "_blank");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto" data-testid="page-client-details">
      <Link href="/clients" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Voltar para Clientes
      </Link>

      <header className="mb-6 pb-5 border-b border-[#333333]">
        <div className="flex items-start gap-6 flex-wrap">
          <div className="w-20 h-20 bg-[#2c2c2c] rounded-lg flex items-center justify-center text-2xl font-bold text-muted-foreground flex-shrink-0">
            {client.initials}
          </div>
          
          <div className="flex-1 min-w-[300px]">
            <div className="flex items-center gap-3 flex-wrap mb-2">
              {isEditingName ? (
                <input
                  ref={nameInputRef}
                  type="text"
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  onKeyDown={handleNameKeyDown}
                  onBlur={handleNameBlur}
                  className="text-3xl font-bold text-foreground bg-transparent border-b-2 border-[#2eaadc] outline-none min-w-[200px]"
                  data-testid="input-client-name"
                />
              ) : (
                <h1 
                  className="text-3xl font-bold text-foreground cursor-pointer px-2 py-1 -mx-2 -my-1 rounded-md hover:bg-[#2c2c2c] transition-colors"
                  onClick={startEditingName}
                  data-testid="text-client-name"
                >
                  {client.name}
                </h1>
              )}
              <ClientStatusBadge 
                status={client.status}
                onStatusChange={(newStatus) => updateClientStatus(client.id, newStatus)}
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {/* CPF - Editable */}
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                  <IdCard className="w-3.5 h-3.5" />
                  CPF
                </span>
                {isEditingCpf ? (
                  <input
                    ref={cpfInputRef}
                    type="text"
                    value={draftCpf}
                    onChange={handleCpfChange}
                    onKeyDown={handleCpfKeyDown}
                    onBlur={handleCpfBlur}
                    className="text-sm font-medium text-foreground bg-transparent border-b-2 border-[#2eaadc] outline-none"
                    data-testid="input-client-cpf"
                  />
                ) : (
                  <span 
                    className="text-sm font-medium text-foreground cursor-pointer px-1.5 py-0.5 -mx-1.5 -my-0.5 rounded-md hover:bg-[#2c2c2c] transition-colors"
                    onClick={startEditingCpf}
                    data-testid="text-client-cpf"
                  >
                    {client.cpf}
                  </span>
                )}
              </div>
              {/* Phone - Editable */}
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" />
                  Telefone
                </span>
                {isEditingPhone ? (
                  <input
                    ref={phoneInputRef}
                    type="text"
                    value={draftPhone}
                    onChange={handlePhoneChange}
                    onKeyDown={handlePhoneKeyDown}
                    onBlur={handlePhoneBlur}
                    className="text-sm font-medium text-foreground bg-transparent border-b-2 border-[#2eaadc] outline-none"
                    data-testid="input-client-phone"
                  />
                ) : (
                  <span 
                    className="text-sm font-medium text-foreground cursor-pointer px-1.5 py-0.5 -mx-1.5 -my-0.5 rounded-md hover:bg-[#2c2c2c] transition-colors"
                    onClick={startEditingPhone}
                    data-testid="text-client-phone"
                  >
                    {client.phone}
                  </span>
                )}
              </div>
              <EmailsPopover
                emails={client.emails}
                primaryEmailIndex={client.primaryEmailIndex}
                onAddEmail={(email) => addClientEmail(client.id, email)}
                onRemoveEmail={(index) => removeClientEmail(client.id, index)}
                onUpdateEmail={(index, newEmail) => updateClientEmail(client.id, index, newEmail)}
                onSetPrimaryEmail={(index) => setClientPrimaryEmail(client.id, index)}
              />
              <AdvisorPopover
                currentAdvisor={client.advisor}
                onAdvisorChange={(advisor) => updateClientAdvisor(client.id, advisor)}
              />
              <MetaItem icon={CalendarIcon} label="Última Reunião" value={format(client.lastMeeting, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })} />
              <AddressPopover
                address={client.address}
                onAddressChange={(address) => updateClientAddress(client.id, address)}
              />
              <FoundationCodeField
                code={client.foundationCode}
                onCodeChange={(foundationCode) => updateClientFoundationCode(client.id, foundationCode)}
              />
              <MetaItem icon={Clock} label="Cliente Desde" value={client.clientSince} />
            </div>

            <div className="flex gap-3 mt-6 flex-wrap">
              <Button 
                onClick={() => setNewMeetingOpen(true)}
                className="bg-[#2eaadc] hover:bg-[#259bc5] text-white"
                data-testid="button-new-meeting"
              >
                <CalendarIcon className="w-4 h-4 mr-2" />
                Agendar Reunião
              </Button>
              <Button 
                variant="outline" 
                onClick={inlineTaskProps.handleStartAddTask}
                className="border-[#333333] hover:bg-[#2c2c2c]"
                data-testid="button-new-task"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Task
              </Button>
              {hasWhatsAppGroups ? (
                <Popover open={whatsappPopoverOpen} onOpenChange={setWhatsappPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="border-[#333333] hover:bg-[#2c2c2c]"
                      data-testid="button-whatsapp"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      WhatsApp
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-2 bg-[#202020] border-[#333333]" align="start">
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => {
                          handleWhatsApp();
                          setWhatsappPopoverOpen(false);
                        }}
                        className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[#2c2c2c] transition-colors text-left w-full"
                        data-testid="whatsapp-personal"
                      >
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-foreground">Pessoal</span>
                          <span className="text-xs text-muted-foreground">{client.phone}</span>
                        </div>
                      </button>
                      {activeWhatsAppGroups.length > 0 && (
                        <div className="border-t border-[#333333] my-1" />
                      )}
                      {activeWhatsAppGroups.map((group) => (
                        <button
                          key={group.id}
                          onClick={() => {
                            handleWhatsApp(group.link!, true);
                            setWhatsappPopoverOpen(false);
                          }}
                          className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[#2c2c2c] transition-colors text-left w-full"
                          data-testid={`whatsapp-group-${group.id}`}
                        >
                          <MessageSquare className="w-4 h-4 text-muted-foreground" />
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-foreground">{group.name}</span>
                            <span className="text-xs text-muted-foreground">{group.purpose}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              ) : (
                <Button 
                  variant="outline" 
                  onClick={() => handleWhatsApp()}
                  className="border-[#333333] hover:bg-[#2c2c2c]"
                  data-testid="button-whatsapp"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
              )}
              <Button 
                variant="outline" 
                onClick={handleEmail}
                className="border-[#333333] hover:bg-[#2c2c2c]"
                data-testid="button-email"
              >
                <Mail className="w-4 h-4 mr-2" />
                Enviar Email
              </Button>
              {isBulkEditing ? (
                <>
                  <Button 
                    variant="outline"
                    className="border-[#333333] hover:bg-[#2c2c2c]"
                    onClick={cancelAllChanges}
                    data-testid="button-cancel-edit"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button 
                    className="bg-[#2eaadc] hover:bg-[#259bc5] text-white"
                    onClick={commitAllChanges}
                    data-testid="button-save-edit"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Salvar
                  </Button>
                </>
              ) : (
                <Button 
                  variant="outline"
                  className="border-[#333333] hover:bg-[#2c2c2c]"
                  onClick={handleEditClient}
                  data-testid="button-edit"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar Cliente
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat: StatCard, index: number) => (
          <StatCardComponent key={index} stat={stat} />
        ))}
      </div>

      {/* Farol e Guidance (desabilitados) */}
      <div className="space-y-4 mb-8">
        {DISABLED_SECTIONS_TOP.map((section) => (
          <DisabledSection key={section.id} section={section} />
        ))}
      </div>

      {/* Reuniões e Tasks */}
      <div className="space-y-8 mb-8">
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
            <MeetingsTable meetings={meetings} onNewMeeting={() => setNewMeetingOpen(true)} />
          </Card>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-base font-semibold text-foreground">Tasks</h2>
            </div>
            <Link href="/tasks" className="text-sm text-[#2eaadc] hover:underline flex items-center gap-1">
              Ver todas →
            </Link>
          </div>
          <Card className="bg-[#202020] border-[#333333] overflow-hidden">
            <TasksTable tasks={clientTasks} inlineProps={inlineTaskProps} />
          </Card>
        </div>
      </div>

      {/* Oportunidades, Método, Linha do Tempo, Erros, Pipeline (desabilitados) */}
      <div className="space-y-4 mb-8">
        {DISABLED_SECTIONS_BOTTOM.map((section) => (
          <DisabledSection key={section.id} section={section} />
        ))}
      </div>

      {/* Grupos de WhatsApp */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-base font-semibold text-foreground">Grupos de WhatsApp</h2>
          </div>
          <span 
            className="text-sm text-[#2eaadc] hover:underline cursor-pointer"
            onClick={() => setIsAddingWhatsAppGroup(true)}
            data-testid="button-new-whatsapp-group"
          >
            + Novo grupo
          </span>
        </div>
        <Card className="bg-[#202020] border-[#333333] overflow-hidden">
          <WhatsAppGroupsTable 
            groups={whatsappGroups}
            clientId={client.id}
            clientName={client.name}
            isAddingExternal={isAddingWhatsAppGroup}
            onCancelAddExternal={() => setIsAddingWhatsAppGroup(false)}
            onAddGroup={(group) => {
              addWhatsAppGroup(client.id, group);
              setIsAddingWhatsAppGroup(false);
            }}
            onUpdateGroup={(groupId, updates) => {
              updateWhatsAppGroup(client.id, groupId, updates);
            }}
            onDeleteGroup={(groupId) => {
              deleteWhatsAppGroup(client.id, groupId);
            }}
          />
        </Card>
      </div>

      <NewMeetingDialog
        open={newMeetingOpen}
        onOpenChange={setNewMeetingOpen}
        preSelectedClient={client.id}
        onSubmit={(data) => console.log('New meeting:', data)}
      />

    </div>
  );
}
