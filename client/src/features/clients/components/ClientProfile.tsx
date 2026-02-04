import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Phone, Mail, ExternalLink, Edit, Archive, Plus } from "lucide-react";
import { CLIENT_STATUS_OUTLINE_COLORS } from "@features/tasks/lib/statusConfig";

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

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="mb-6 flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg font-medium">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-semibold" data-testid="text-clientname">
                  {name}
                </h1>
                <Badge
                  variant="outline"
                  className={`${CLIENT_STATUS_OUTLINE_COLORS[status] || ""}`}
                >
                  {status}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="default" size="sm" onClick={onEdit} data-testid="button-edit">
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onArchive}
                  data-testid="button-archive"
                >
                  <Archive className="mr-2 h-4 w-4" />
                  Arquivar
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
            {cpf && (
              <div>
                <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  CPF
                </span>
                <span data-testid="text-cpf">{cpf}</span>
              </div>
            )}
            {email && (
              <div>
                <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  E-mail
                </span>
                <div className="flex items-center gap-1.5">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span data-testid="text-email">{email}</span>
                </div>
              </div>
            )}
            {phone && (
              <div>
                <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Telefone
                </span>
                <div className="flex items-center gap-1.5">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span data-testid="text-phone">{phone}</span>
                </div>
              </div>
            )}
            {folderLink && (
              <div>
                <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Link da Pasta
                </span>
                <a
                  href={folderLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-primary hover:underline"
                  data-testid="link-folder"
                >
                  <ExternalLink className="h-4 w-4" />
                  Abrir Pasta
                </a>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="meetings" className="w-full">
        <div className="mb-4 flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="meetings" data-testid="tab-meetings">
              Reuniões
            </TabsTrigger>
            <TabsTrigger value="tasks" data-testid="tab-tasks">
              Tarefas
            </TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={onNewMeeting}
              data-testid="button-newmeeting"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nova Reunião
            </Button>
            <Button variant="outline" size="sm" onClick={onNewTask} data-testid="button-newtask">
              <Plus className="mr-2 h-4 w-4" />
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
