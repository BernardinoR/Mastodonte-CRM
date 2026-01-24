import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Calendar, User } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MeetingCardProps {
  id: string;
  date: Date;
  type: string;
  notes: string;
  clientName?: string;
  onClick?: () => void;
}

export function MeetingCard({ id, date, type, notes, clientName, onClick }: MeetingCardProps) {
  const typeColors: Record<string, string> = {
    "Reunião Mensal": "bg-primary/10 text-primary border-primary/20",
    "Política de Investimento": "bg-purple-500/10 text-purple-400 border-purple-500/20",
    "Patrimônio Previdencial": "bg-blue-500/10 text-blue-400 border-blue-500/20",
    "Reunião Anual": "bg-green-500/10 text-green-400 border-green-500/20",
  };

  return (
    <Card 
      className="hover-elevate active-elevate-2 cursor-pointer" 
      onClick={onClick}
      data-testid={`card-meeting-${id}`}
    >
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="flex flex-col items-center justify-start pt-1 min-w-[60px]">
            <span className="text-2xl font-semibold">{format(date, "dd", { locale: ptBR })}</span>
            <span className="text-xs text-muted-foreground uppercase">{format(date, "MMM", { locale: ptBR })}</span>
            <span className="text-xs text-muted-foreground">{format(date, "yyyy", { locale: ptBR })}</span>
          </div>
          <div className="flex-1 min-w-0 border-l-2 border-border pl-4">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge variant="outline" className={`text-xs ${typeColors[type] || ""}`}>
                {type}
              </Badge>
              {clientName && (
                <span className="text-xs text-muted-foreground">{clientName}</span>
              )}
            </div>
            <p className="text-sm leading-relaxed line-clamp-3" data-testid={`text-meetingnotes-${id}`}>{notes}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
