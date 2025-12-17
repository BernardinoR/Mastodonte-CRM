import { useState } from "react";
import { useParams, Link } from "wouter";
import { 
  Phone, 
  Mail, 
  Calendar, 
  Plus, 
  MessageSquare, 
  Edit, 
  IdCard, 
  User, 
  DollarSign, 
  BarChart3, 
  Clock, 
  ArrowLeft,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  Users,
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
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ClientData {
  id: string;
  name: string;
  initials: string;
  cpf: string;
  phone: string;
  email: string;
  advisor: string;
  lastMeeting: Date;
  aum: string;
  riskProfile: string;
  clientSince: string;
  status: "Ativo" | "Inativo";
}

interface StatCard {
  value: string;
  label: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
}

interface Meeting {
  id: string;
  date: Date;
  type: string;
  notes: string;
}

interface Task {
  id: string;
  title: string;
  status: "To Do" | "In Progress" | "Done";
  priority: "Urgente" | "Alta" | "Normal" | "Baixa";
  dueDate: Date;
  assignees: string[];
}

const MOCK_CLIENT: ClientData = {
  id: "1",
  name: "Ademar João Grieger",
  initials: "AG",
  cpf: "***.456.789-**",
  phone: "+55 (47) 99123-4567",
  email: "ademar.grieger@email.com",
  advisor: "Rafael Bernardino Silveira",
  lastMeeting: new Date('2025-11-22'),
  aum: "R$ 12.450.000,00",
  riskProfile: "Moderado / Agressivo",
  clientSince: "Dezembro de 2022",
  status: "Ativo",
};

const MOCK_STATS: StatCard[] = [
  { value: "R$ 12,4M", label: "AUM Total", change: "↑ +5.2% este mês", changeType: "positive" },
  { value: "8", label: "Reuniões em 2025", change: "↑ +2 vs 2024", changeType: "positive" },
  { value: "15", label: "Tasks Concluídas", change: "100% no prazo", changeType: "positive" },
  { value: "3", label: "Indicações", change: "1 convertida", changeType: "neutral" },
];

const MOCK_MEETINGS: Meeting[] = [
  { id: "1", date: new Date('2025-11-22'), type: "Reunião Mensal", notes: "Política de investimento" },
  { id: "2", date: new Date('2025-10-15'), type: "Follow-up", notes: "Acompanhamento carteira" },
  { id: "3", date: new Date('2025-09-10'), type: "Reunião Mensal", notes: "Revisão de metas" },
];

const MOCK_TASKS: Task[] = [
  { id: "1", title: "Revisar carteira de ações", status: "To Do", priority: "Normal", dueDate: new Date('2025-01-25'), assignees: ["Rafael Bernardino Silveira"] },
  { id: "2", title: "Enviar relatório mensal", status: "In Progress", priority: "Urgente", dueDate: new Date('2025-01-22'), assignees: ["Rafael Bernardino Silveira", "Maria Santos"] },
  { id: "3", title: "Atualizar perfil de risco", status: "To Do", priority: "Alta", dueDate: new Date('2025-01-30'), assignees: ["Rafael Bernardino Silveira"] },
];

const DISABLED_SECTIONS = [
  { id: "farol", title: "Farol", icon: AlertCircle, description: "Indicador de acompanhamento do cliente" },
  { id: "guidance", title: "Guidance", icon: Lightbulb, description: "Orientações para próxima reunião" },
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

function DisabledSection({ section }: { section: typeof DISABLED_SECTIONS[0] }) {
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

function MeetingRow({ meeting }: { meeting: Meeting }) {
  return (
    <div className="flex items-center gap-4 p-3 hover:bg-[#2c2c2c] rounded-lg transition-colors cursor-pointer">
      <div className="w-10 h-10 rounded-lg bg-[#1c3847] flex items-center justify-center">
        <Calendar className="w-5 h-5 text-[#6db1d4]" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-foreground">{meeting.type}</div>
        <div className="text-xs text-muted-foreground truncate">{meeting.notes}</div>
      </div>
      <div className="text-xs text-muted-foreground">
        {format(meeting.date, "dd/MM/yyyy", { locale: ptBR })}
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground" />
    </div>
  );
}

function TaskRow({ task }: { task: Task }) {
  const statusColors = {
    "To Do": "bg-[#1c3847] text-[#6db1d4]",
    "In Progress": "bg-[#4a4528] text-[#e6d96e]",
    "Done": "bg-[#203828] text-[#6ecf8e]",
  };
  
  const priorityColors = {
    "Urgente": "bg-[#3d2626] text-[#e07a7a]",
    "Alta": "bg-[#4d331f] text-[#e6b07a]",
    "Normal": "bg-[#333333] text-[#a0a0a0]",
    "Baixa": "bg-[#1c3847] text-[#6db1d4]",
  };

  return (
    <div className="flex items-center gap-4 p-3 hover:bg-[#2c2c2c] rounded-lg transition-colors cursor-pointer">
      <div className="w-10 h-10 rounded-lg bg-[#38273f] flex items-center justify-center">
        <CheckCircle2 className="w-5 h-5 text-[#d09cdb]" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-foreground">{task.title}</div>
        <div className="flex items-center gap-2 mt-1">
          <Badge className={`${statusColors[task.status]} text-xs px-2 py-0`}>
            {task.status}
          </Badge>
          <Badge className={`${priorityColors[task.priority]} text-xs px-2 py-0`}>
            {task.priority}
          </Badge>
        </div>
      </div>
      <div className="text-xs text-muted-foreground">
        {format(task.dueDate, "dd/MM/yyyy", { locale: ptBR })}
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground" />
    </div>
  );
}

export default function ClientDetails() {
  const params = useParams();
  const [newMeetingOpen, setNewMeetingOpen] = useState(false);
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  
  const client = MOCK_CLIENT;

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
              <h1 className="text-3xl font-bold text-foreground" data-testid="text-client-name">
                {client.name}
              </h1>
              <Badge className="bg-[#203828] text-[#6ecf8e] text-sm font-normal">
                {client.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <MetaItem icon={IdCard} label="CPF" value={client.cpf} />
              <MetaItem icon={Phone} label="Telefone" value={client.phone} />
              <MetaItem icon={Mail} label="Email" value={client.email} />
              <MetaItem icon={User} label="Advisor" value={client.advisor} />
              <MetaItem icon={Calendar} label="Última Reunião" value={format(client.lastMeeting, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })} />
              <MetaItem icon={DollarSign} label="AUM" value={client.aum} highlight />
              <MetaItem icon={BarChart3} label="Perfil de Risco" value={client.riskProfile} />
              <MetaItem icon={Clock} label="Cliente Desde" value={client.clientSince} />
            </div>

            <div className="flex gap-3 mt-6 flex-wrap">
              <Button 
                onClick={() => setNewMeetingOpen(true)}
                className="bg-[#2eaadc] hover:bg-[#259bc5] text-white"
                data-testid="button-new-meeting"
              >
                <Calendar className="w-4 h-4 mr-2" />
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
        {MOCK_STATS.map((stat, index) => (
          <StatCardComponent key={index} stat={stat} />
        ))}
      </div>

      <div className="space-y-4 mb-8">
        {DISABLED_SECTIONS.map((section) => (
          <DisabledSection key={section.id} section={section} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#202020] border-[#333333]">
          <div className="flex items-center justify-between p-4 border-b border-[#333333]">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-base font-semibold text-foreground">Reuniões Recentes</h2>
            </div>
            <Link href="/meetings" className="text-xs text-[#2eaadc] hover:underline flex items-center gap-1">
              Ver todas
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="p-2">
            {MOCK_MEETINGS.map((meeting) => (
              <MeetingRow key={meeting.id} meeting={meeting} />
            ))}
          </div>
        </Card>

        <Card className="bg-[#202020] border-[#333333]">
          <div className="flex items-center justify-between p-4 border-b border-[#333333]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-base font-semibold text-foreground">Tarefas Pendentes</h2>
            </div>
            <Link href="/tasks" className="text-xs text-[#2eaadc] hover:underline flex items-center gap-1">
              Ver todas
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="p-2">
            {MOCK_TASKS.map((task) => (
              <TaskRow key={task.id} task={task} />
            ))}
          </div>
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
