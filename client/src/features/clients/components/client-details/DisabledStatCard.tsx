import { Lock } from "lucide-react";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";

interface DisabledStatCardProps {
  title: string;
}

export function DisabledStatCard({ title }: DisabledStatCardProps) {
  return (
    <Card
      className="border-[#3a3a3a] bg-[#1a1a1a] p-4 opacity-60"
      data-testid={`card-stat-${title.toLowerCase().replace(/\s+/g, "-")}-disabled`}
    >
      <div
        className="text-2xl font-bold text-muted-foreground"
        data-testid={`text-stat-value-${title.toLowerCase().replace(/\s+/g, "-")}`}
      >
        —
      </div>
      <div
        className="mt-1 text-xs text-muted-foreground"
        data-testid={`text-stat-label-${title.toLowerCase().replace(/\s+/g, "-")}`}
      >
        {title}
      </div>
      <div className="mt-2">
        <Badge
          variant="secondary"
          className="bg-[#333333] px-1.5 py-0.5 text-[10px] text-muted-foreground"
        >
          <Lock className="mr-1 h-2.5 w-2.5" />
          Indisponível
        </Badge>
      </div>
    </Card>
  );
}
