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
  const filteredStats = stats.filter(stat => 
    stat.label.toLowerCase() !== "tasks concluídas"
  );
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {filteredStats.map((stat, index) => (
        <Card 
          key={`${stat.label}-${index}`} 
          className="p-4 bg-[#202020] border-[#333333]"
          data-testid={`card-stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}
        >
          <div 
            className="text-2xl font-bold text-foreground" 
            data-testid={`text-stat-value-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}
          >
            {stat.value}
          </div>
          <div 
            className="text-xs text-muted-foreground mt-1" 
            data-testid={`text-stat-label-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}
          >
            {stat.label}
          </div>
          {stat.change && (
            <div 
              className={`text-xs mt-2 ${
                stat.positive ? "text-emerald-400" : "text-red-400"
              }`}
              data-testid={`text-stat-change-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {stat.change}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
