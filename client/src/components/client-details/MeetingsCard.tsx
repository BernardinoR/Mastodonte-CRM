import { useState, useMemo } from "react";
import { subMonths } from "date-fns";
import { Card } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { ClientMeeting } from "@/types/client";

interface MeetingsCardProps {
  meetings: ClientMeeting[];
}

export function MeetingsCard({ meetings }: MeetingsCardProps) {
  const [period, setPeriod] = useState<"year" | "12m">("year");
  
  // Filtrar apenas reuniões realizadas
  const realizedMeetings = useMemo(() => {
    return meetings.filter(m => m.status === "Realizada");
  }, [meetings]);
  
  // Calcular reuniões do período atual e anterior
  const { currentMeetings, previousMeetings, comparisonText, comparisonYear, label } = useMemo(() => {
    const now = new Date();
    
    if (period === "year") {
      // Período atual: ano atual
      const currentYear = now.getFullYear();
      const currentYearStart = new Date(currentYear, 0, 1);
      const currentYearEnd = new Date(currentYear, 11, 31, 23, 59, 59);
      
      // Período anterior: ano anterior completo
      const previousYear = currentYear - 1;
      const previousYearStart = new Date(previousYear, 0, 1);
      const previousYearEnd = new Date(previousYear, 11, 31, 23, 59, 59);
      
      const current = realizedMeetings.filter(m => {
        const meetingDate = new Date(m.date);
        return meetingDate >= currentYearStart && meetingDate <= currentYearEnd;
      });
      
      const previous = realizedMeetings.filter(m => {
        const meetingDate = new Date(m.date);
        return meetingDate >= previousYearStart && meetingDate <= previousYearEnd;
      });
      
      const currentCount = current.length;
      const previousCount = previous.length;
      const diff = currentCount - previousCount;
      
      let text = "";
      if (diff > 0) {
        text = `↑ +${diff} vs ${previousYear}`;
      } else if (diff < 0) {
        text = `↓ ${diff} vs ${previousYear}`;
      } else {
        text = `= vs ${previousYear}`;
      }
      
      return {
        currentMeetings: current,
        previousMeetings: previous,
        comparisonText: text,
        comparisonYear: previousYear,
        label: `Reuniões em ${currentYear}`,
      };
    } else {
      // Período atual: últimos 12 meses
      const current12mStart = subMonths(now, 12);
      const current12mEnd = now;
      
      // Período anterior: 12 meses anteriores aos 12 meses atuais (13-24 meses atrás)
      const previous12mStart = subMonths(now, 24);
      const previous12mEnd = subMonths(now, 12);
      
      const current = realizedMeetings.filter(m => {
        const meetingDate = new Date(m.date);
        return meetingDate >= current12mStart && meetingDate <= current12mEnd;
      });
      
      const previous = realizedMeetings.filter(m => {
        const meetingDate = new Date(m.date);
        return meetingDate >= previous12mStart && meetingDate < previous12mEnd;
      });
      
      const currentCount = current.length;
      const previousCount = previous.length;
      const diff = currentCount - previousCount;
      
      // Para 12M, mostrar o ano do início do período anterior
      const previousStartYear = previous12mStart.getFullYear();
      
      let text = "";
      if (diff > 0) {
        text = `↑ +${diff} vs ${previousStartYear}`;
      } else if (diff < 0) {
        text = `↓ ${diff} vs ${previousStartYear}`;
      } else {
        text = `= vs ${previousStartYear}`;
      }
      
      return {
        currentMeetings: current,
        previousMeetings: previous,
        comparisonText: text,
        comparisonYear: previousStartYear,
        label: "Reuniões",
      };
    }
  }, [realizedMeetings, period]);
  
  const count = currentMeetings.length;
  const previousCount = previousMeetings.length;
  const isPositive = count > previousCount;
  const isEqual = count === previousCount;
  
  return (
    <Card 
      className="p-4 bg-[#202020] border-[#333333] relative"
      data-testid="card-meetings"
    >
      {/* Toggle no canto superior direito */}
      <div className="absolute top-4 right-4">
        <ToggleGroup
          type="single"
          value={period}
          onValueChange={(value) => {
            if (value) setPeriod(value as "year" | "12m");
          }}
          className="h-7 gap-0"
          size="sm"
          variant="outline"
        >
          <ToggleGroupItem
            value="year"
            aria-label="Ano"
            data-testid="button-period-year"
            className="text-[11px] px-2.5 h-7 rounded-l-md rounded-r-none border-r-0"
          >
            Ano
          </ToggleGroupItem>
          <ToggleGroupItem
            value="12m"
            aria-label="12M"
            data-testid="button-period-12m"
            className="text-[11px] px-2.5 h-7 rounded-r-md rounded-l-none"
          >
            12M
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      
      {/* Conteúdo principal */}
      <div 
        className="text-2xl font-bold text-foreground" 
        data-testid="text-meetings-count"
      >
        <span className="text-white">{count}</span>
      </div>
      <div 
        className="text-xs text-muted-foreground mt-1" 
        data-testid="text-meetings-label"
      >
        {label}
      </div>
      
      {/* Mensagem de comparação */}
      {comparisonText && (
        <div 
          className={`text-xs mt-2 ${
            isPositive 
              ? "text-emerald-400" 
              : isEqual 
              ? "text-muted-foreground" 
              : "text-red-400"
          }`}
          data-testid="text-comparison"
        >
          {comparisonText}
        </div>
      )}
    </Card>
  );
}

