import { Card } from "@/shared/components/ui/card";

interface ClientMetaStatsProps {
  stats: Array<{
    label: string;
    value: string;
    change: string;
    positive: boolean;
  }>;
}

export function ClientMetaStats({ stats }: ClientMetaStatsProps) {
  // Filtrar o card de "Tasks Concluídas" - agora é um componente separado
  const filteredStats = stats.filter((stat) => stat.label.toLowerCase() !== "tasks concluídas");

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {filteredStats.map((stat, index) => (
        <Card
          key={`${stat.label}-${index}`}
          className="border-[#3a3a3a] bg-[#1a1a1a] p-4"
          data-testid={`card-stat-${stat.label.toLowerCase().replace(/\s+/g, "-")}`}
        >
          <div
            className="text-2xl font-bold text-foreground"
            data-testid={`text-stat-value-${stat.label.toLowerCase().replace(/\s+/g, "-")}`}
          >
            {stat.value}
          </div>
          <div
            className="mt-1 text-xs text-muted-foreground"
            data-testid={`text-stat-label-${stat.label.toLowerCase().replace(/\s+/g, "-")}`}
          >
            {stat.label}
          </div>
          {stat.change && (
            <div
              className={`mt-2 text-xs ${stat.positive ? "text-emerald-400" : "text-red-400"}`}
              data-testid={`text-stat-change-${stat.label.toLowerCase().replace(/\s+/g, "-")}`}
            >
              {stat.change}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
