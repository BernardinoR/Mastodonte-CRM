import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Phone, Mail, ExternalLink, Edit, Archive, Plus } from "lucide-react";

interface ClientProfileProps {
  name: string;
  cpf?: string;
  email?: string;
  phone?: string;
  status: string;
  folderLink?: string;
  onEdit?: () => void;
  onArchive?: () => void;
  onNewMeeting?: () => void;
  onNewTask?: () => void;
  meetingsContent?: React.ReactNode;
  tasksContent?: React.ReactNode;
}

export function ClientProfile({
  name,
  cpf,
  email,
  phone,
  status,
  folderLink,
  onEdit,
  onArchive,
  onNewMeeting,
  onNewTask,
  meetingsContent,
  tasksContent,
}: ClientProfileProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const statusColors: Record<string, string> = {
    Ativo: "bg-green-500/10 text-green-500 border-green-500/20",
    Inativo: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    Prospect: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="text-lg font-medium">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="text-2xl font-semibold" data-testid="text-clientname">{name}</h1>
                <Badge variant="outline" className={`${statusColors[status] || ""}`}>
                  {status}
                </Badge>
              </div>
              <div className="flex gap-3 flex-wrap">
                <Button variant="default" size="sm" onClick={onEdit} data-testid="button-edit">
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                <Button variant="outline" size="sm" onClick={onArchive} data-testid="button-archive">
                  <Archive className="w-4 h-4 mr-2" />
                  Arquivar
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {cpf && (
              <div>
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground block mb-1">
                  CPF
                </span>
                <span data-testid="text-cpf">{cpf}</span>
              </div>
            )}
            {email && (
              <div>
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground block mb-1">
                  E-mail
                </span>
                <div className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span data-testid="text-email">{email}</span>
                </div>
              </div>
            )}
            {phone && (
              <div>
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground block mb-1">
                  Telefone
                </span>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span data-testid="text-phone">{phone}</span>
                </div>
              </div>
            )}
            {folderLink && (
              <div>
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground block mb-1">
                  Link da Pasta
                </span>
                <a
                  href={folderLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-primary hover:underline"
                  data-testid="link-folder"
                >
                  <ExternalLink className="w-4 h-4" />
                  Abrir Pasta
                </a>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="meetings" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="meetings" data-testid="tab-meetings">Reuniões</TabsTrigger>
            <TabsTrigger value="tasks" data-testid="tab-tasks">Tarefas</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <Button variant="default" size="sm" onClick={onNewMeeting} data-testid="button-newmeeting">
              <Plus className="w-4 h-4 mr-2" />
              Nova Reunião
            </Button>
            <Button variant="outline" size="sm" onClick={onNewTask} data-testid="button-newtask">
              <Plus className="w-4 h-4 mr-2" />
              Nova Tarefa
            </Button>
          </div>
        </div>
        <TabsContent value="meetings" className="space-y-4">
          {meetingsContent}
        </TabsContent>
        <TabsContent value="tasks" className="space-y-4">
          {tasksContent}
        </TabsContent>
      </Tabs>
    </div>
  );
}
