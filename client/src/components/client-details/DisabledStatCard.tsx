import { Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DisabledStatCardProps {
  title: string;
}

export function DisabledStatCard({ title }: DisabledStatCardProps) {
  return (
    <Card 
      className="p-4 bg-[#202020] border-[#333333] opacity-60"
      data-testid={`card-stat-${title.toLowerCase().replace(/\s+/g, '-')}-disabled`}
    >
      <div 
        className="text-2xl font-bold text-muted-foreground" 
        data-testid={`text-stat-value-${title.toLowerCase().replace(/\s+/g, '-')}`}
      >
        —
      </div>
      <div 
        className="text-xs text-muted-foreground mt-1" 
        data-testid={`text-stat-label-${title.toLowerCase().replace(/\s+/g, '-')}`}
      >
        {title}
      </div>
      <div className="mt-2">
        <Badge 
          variant="secondary" 
          className="bg-[#333333] text-muted-foreground text-[10px] px-1.5 py-0.5"
        >
          <Lock className="w-2.5 h-2.5 mr-1" />
          Indisponível
        </Badge>
      </div>
    </Card>
  );
}
