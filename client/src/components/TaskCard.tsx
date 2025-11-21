import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, User } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TaskCardProps {
  id: string;
  title: string;
  clientName: string;
  priority: "Urgente" | "Normal";
  status: "To Do" | "In Progress" | "Done";
  assignee?: string;
  dueDate?: Date;
  onClick?: () => void;
}

export function TaskCard({
  id,
  title,
  clientName,
  priority,
  status,
  assignee,
  dueDate,
  onClick,
}: TaskCardProps) {
  const priorityColors = {
    Urgente: "bg-destructive/10 text-destructive border-destructive/20",
    Normal: "bg-muted text-muted-foreground border-muted-foreground/20",
  };

  const statusColors = {
    "To Do": "bg-blue-500/10 text-blue-400 border-blue-500/20",
    "In Progress": "bg-primary/10 text-primary border-primary/20",
    Done: "bg-green-500/10 text-green-400 border-green-500/20",
  };

  return (
    <Card 
      className="hover-elevate active-elevate-2 cursor-pointer" 
      onClick={onClick}
      data-testid={`card-task-${id}`}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-medium text-base mb-2" data-testid={`text-tasktitle-${id}`}>{title}</h3>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className={`text-xs ${priorityColors[priority]}`}>
                {priority}
              </Badge>
              <Badge variant="outline" className={`text-xs ${statusColors[status]}`}>
                {status}
              </Badge>
              <span className="text-xs text-muted-foreground">{clientName}</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
            {assignee && (
              <div className="flex items-center gap-1.5">
                <Avatar className="w-5 h-5">
                  <AvatarFallback className="text-[10px]">
                    {assignee.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span>{assignee}</span>
              </div>
            )}
            {dueDate && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{format(dueDate, "dd/MM/yyyy", { locale: ptBR })}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
