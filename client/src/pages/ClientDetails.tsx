import { useState, useRef, useEffect, type KeyboardEvent } from "react";
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
  Hash,
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
  GitBranch
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NewMeetingDialog } from "@/components/NewMeetingDialog";
import { NewTaskDialog } from "@/components/NewTaskDialog";
import { WhatsAppGroupsTable } from "@/components/WhatsAppGroupsTable";
import { ClientStatusBadge } from "@/components/ClientStatusBadge";
import { useTasks } from "@/contexts/TasksContext";
import { useClients } from "@/contexts/ClientsContext";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Task as GlobalTask } from "@/types/task";
import type { ClientStats, ClientMeeting } from "@/types/client";

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

function TasksTable({ tasks, onNewTask }: { tasks: GlobalTask[]; onNewTask: () => void }) {
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

  if (tasks.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground text-sm mb-3">Nenhuma tarefa encontrada para este cliente</p>
        <div 
          className="text-sm text-[#2eaadc] hover:underline cursor-pointer"
          onClick={onNewTask}
          data-testid="button-add-task-empty"
        >
          + Nova tarefa
        </div>
      </div>
    );
  }

  return (
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
            <tr key={task.id} className="border-b border-[#333333] hover:bg-[#2c2c2c] transition-colors cursor-pointer">
              <td className="py-3 px-4 text-foreground font-medium">{task.title}</td>
              <td className="py-3 px-4">
                <Badge className={`${statusColors[task.status]} text-xs`}>
                  {task.status}
                </Badge>
              </td>
              <td className="py-3 px-4">
                <Badge className={`${priorityColors[task.priority || "Normal"]} text-xs`}>
                  {task.priority || "Normal"}
                </Badge>
              </td>
              <td className="py-3 px-4 text-foreground">
                {format(task.dueDate, "dd/MM/yyyy", { locale: ptBR })}
              </td>
              <td className="py-3 px-4 text-foreground">{task.assignees?.join(", ") || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div 
        className="py-3 px-4 text-sm text-[#2eaadc] hover:bg-[#2c2c2c] cursor-pointer transition-colors"
        onClick={onNewTask}
        data-testid="button-add-task-table"
      >
        + Nova tarefa
      </div>
    </div>
  );
}

export default function ClientDetails() {
  const params = useParams<{ id: string }>();
  const [newMeetingOpen, setNewMeetingOpen] = useState(false);
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [isAddingWhatsAppGroup, setIsAddingWhatsAppGroup] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [draftName, setDraftName] = useState("");
  const nameInputRef = useRef<HTMLInputElement>(null);
  const blurTimeoutRef = useRef<number | null>(null);
  const { getTasksByClient } = useTasks();
  const { getFullClientData, getClientByName, addWhatsAppGroup, updateWhatsAppGroup, deleteWhatsAppGroup, updateClientStatus, updateClientName, dataVersion } = useClients();
  
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
  
  const clientTasks = getTasksByClient(client.name);

  const startEditingName = () => {
    setDraftName(client.name);
    setIsEditingName(true);
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
      commitNameChange();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancelEditingName();
    }
  };

  const handleNameBlur = () => {
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
    };
  }, []);

  const handleWhatsApp = () => {
    const phone = client.phone.replace(/\D/g, "");
    window.open(`https://wa.me/${phone}`, "_blank");
  };

  const handleEmail = () => {
    window.open(`mailto:${client.email}`, "_blank");
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
                  className="text-3xl font-bold text-foreground cursor-pointer hover:text-[#2eaadc] transition-colors"
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
              <MetaItem icon={IdCard} label="CPF" value={client.cpf} />
              <MetaItem icon={Phone} label="Telefone" value={client.phone} />
              <MetaItem icon={Mail} label="Email" value={client.email} />
              <MetaItem icon={User} label="Consultor" value={client.advisor} />
              <MetaItem icon={CalendarIcon} label="Última Reunião" value={format(client.lastMeeting, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })} />
              <MetaItem icon={MapPin} label="Endereço" value={client.address} />
              <MetaItem icon={Hash} label="Código Foundation" value={client.foundationCode} />
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
                onClick={() => setNewTaskOpen(true)}
                className="border-[#333333] hover:bg-[#2c2c2c]"
                data-testid="button-new-task"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Task
              </Button>
              <Button 
                variant="outline" 
                onClick={handleWhatsApp}
                className="border-[#333333] hover:bg-[#2c2c2c]"
                data-testid="button-whatsapp"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
              <Button 
                variant="outline" 
                onClick={handleEmail}
                className="border-[#333333] hover:bg-[#2c2c2c]"
                data-testid="button-email"
              >
                <Mail className="w-4 h-4 mr-2" />
                Enviar Email
              </Button>
              <Button 
                variant="outline"
                className="border-[#333333] hover:bg-[#2c2c2c]"
                data-testid="button-edit"
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar Cliente
              </Button>
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
            <TasksTable tasks={clientTasks} onNewTask={() => setNewTaskOpen(true)} />
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

      <NewTaskDialog
        open={newTaskOpen}
        onOpenChange={setNewTaskOpen}
        preSelectedClient={client.id}
        onSubmit={(data) => console.log('New task:', data)}
      />
    </div>
  );
}
