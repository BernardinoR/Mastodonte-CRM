import { 
  TrendingUp, 
  Calculator,
  Users, 
  UserPlus,
  CalendarX, 
  AlertTriangle,
  CalendarCheck,
  ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatAUM } from "@/lib/clientUtils";
import type { ClientsPageStats, ClientsFilterMode } from "@/types/client";

interface ClientsStatsGridProps {
  stats: ClientsPageStats;
  activeFilter: ClientsFilterMode;
  onFilterClick: (filter: ClientsFilterMode) => void;
}

type StatVariant = 'success' | 'info' | 'warning' | 'danger';

interface StatCardProps {
  icon: React.ElementType;
  value: string | number;
  label: string;
  variant: StatVariant;
  isClickable?: boolean;
  isActive?: boolean;
  onClick?: () => void;
}

// Cores do design original
const VARIANT_STYLES: Record<StatVariant, {
  gradient: string;
  border: string;
  borderActive: string;
  text: string;
}> = {
  success: {
    gradient: 'bg-gradient-to-br from-[rgba(110,207,142,0.1)] to-[rgba(110,207,142,0.05)]',
    border: 'border-[rgba(110,207,142,0.2)]',
    borderActive: 'border-[#6ecf8e]',
    text: 'text-[#6ecf8e]',
  },
  info: {
    gradient: 'bg-gradient-to-br from-[rgba(109,177,212,0.1)] to-[rgba(109,177,212,0.05)]',
    border: 'border-[rgba(109,177,212,0.2)]',
    borderActive: 'border-[#6db1d4]',
    text: 'text-[#6db1d4]',
  },
  warning: {
    gradient: 'bg-gradient-to-br from-[rgba(220,176,146,0.1)] to-[rgba(220,176,146,0.05)]',
    border: 'border-[rgba(220,176,146,0.2)]',
    borderActive: 'border-[#dcb092]',
    text: 'text-[#dcb092]',
  },
  danger: {
    gradient: 'bg-gradient-to-br from-[rgba(224,122,122,0.1)] to-[rgba(224,122,122,0.05)]',
    border: 'border-[rgba(224,122,122,0.2)]',
    borderActive: 'border-[#e07a7a]',
    text: 'text-[#e07a7a]',
  },
};

function StatCard({ 
  icon: Icon, 
  value, 
  label, 
  variant,
  isClickable = false,
  isActive = false,
  onClick 
}: StatCardProps) {
  const styles = VARIANT_STYLES[variant];
  
  return (
    <div 
      className={cn(
        "flex flex-col gap-1.5 p-3 px-4 rounded-xl border transition-all relative overflow-hidden flex-1",
        styles.gradient,
        isActive ? styles.borderActive : styles.border,
        isClickable && "cursor-pointer hover:translate-y-[-2px] hover:shadow-lg",
        isActive && "shadow-[0_0_0_2px_currentColor]"
      )}
      style={{ 
        color: isActive ? styles.text.replace('text-[', '').replace(']', '') : undefined 
      }}
      onClick={onClick}
    >
      {/* Top bar indicator */}
      <div 
        className={cn(
          "absolute top-0 left-0 right-0 h-[3px] transition-opacity",
          styles.text.replace('text-', 'bg-'),
          isActive || isClickable ? "opacity-100" : "opacity-0"
        )}
      />
      
      <Icon className={cn("w-4 h-4 opacity-80", styles.text)} />
      <span className={cn("text-lg font-bold", styles.text)}>{value}</span>
      <span className="text-[10px] text-[#8c8c8c] uppercase tracking-wide font-medium">
        {label}
      </span>
    </div>
  );
}

export function ClientsStatsGrid({ stats, activeFilter, onFilterClick }: ClientsStatsGridProps) {
  return (
    <div className="flex gap-3 mb-6">
      {/* Financeiro - Success */}
      <StatCard
        icon={TrendingUp}
        value={formatAUM(stats.totalAUM)}
        label="AUM Total"
        variant="success"
      />
      <StatCard
        icon={Calculator}
        value={formatAUM(stats.averageAUM)}
        label="AUM Médio"
        variant="success"
      />
      
      {/* Clientes - Info */}
      <StatCard
        icon={Users}
        value={stats.activeClients}
        label="Clientes Ativos"
        variant="info"
      />
      <StatCard
        icon={UserPlus}
        value={stats.newClientsMonth}
        label="Novos no Mês"
        variant="info"
      />
      
      {/* Alertas - Clicáveis */}
      <StatCard
        icon={CalendarX}
        value={stats.noMeeting30Days}
        label="Sem Reunião 30+ dias"
        variant="warning"
        isClickable
        isActive={activeFilter === 'noMeeting'}
        onClick={() => onFilterClick(activeFilter === 'noMeeting' ? 'all' : 'noMeeting')}
      />
      <StatCard
        icon={AlertTriangle}
        value={stats.urgentTasksClients}
        label="Com Tasks Urgentes"
        variant="danger"
        isClickable
        isActive={activeFilter === 'urgentTasks'}
        onClick={() => onFilterClick(activeFilter === 'urgentTasks' ? 'all' : 'urgentTasks')}
      />
      
      {/* Agenda - Info */}
      <StatCard
        icon={CalendarCheck}
        value={stats.meetingsThisWeek}
        label="Reuniões Semana"
        variant="info"
      />
      <StatCard
        icon={ShieldCheck}
        value={stats.retentionRate}
        label="Taxa Retenção"
        variant="success"
      />
    </div>
  );
}
