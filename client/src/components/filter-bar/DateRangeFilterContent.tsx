import { memo, useCallback, useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { UI_CLASSES } from "@/lib/statusConfig";
import { 
  startOfDay, 
  endOfDay,
  format,
  isValid,
  isBefore
} from "date-fns";
import { ptBR } from "date-fns/locale";
import type { DateRange } from "react-day-picker";

export interface DateFilterValue {
  type: "all" | "preset" | "range";
  preset?: string;
  startDate?: Date;
  endDate?: Date;
}

interface DateRangeFilterContentProps {
  value: DateFilterValue;
  onChange: (value: DateFilterValue) => void;
}

const PRESET_OPTIONS = [
  { value: "all", label: "Todas as datas" },
  { value: "today", label: "Hoje" },
  { value: "overdue", label: "Atrasadas" },
  { value: "no-date", label: "Sem data" },
] as const;

function getPresetDateRange(preset: string): { from?: Date; to?: Date } | undefined {
  const today = startOfDay(new Date());
  
  switch (preset) {
    case "today":
      return { from: today, to: endOfDay(new Date()) };
    case "overdue":
      return { from: new Date(2020, 0, 1), to: startOfDay(new Date(Date.now() - 86400000)) };
    case "no-date":
    case "all":
    default:
      return undefined;
  }
}

export const DateRangeFilterContent = memo(function DateRangeFilterContent({
  value,
  onChange,
}: DateRangeFilterContentProps) {
  const dateRange = useMemo<DateRange | undefined>(() => {
    if (value.type === "range" && value.startDate) {
      return {
        from: value.startDate,
        to: value.endDate,
      };
    }
    if (value.type === "preset" && value.preset) {
      return getPresetDateRange(value.preset);
    }
    return undefined;
  }, [value]);

  const currentPresetValue = useMemo(() => {
    if (value.type === "all") return "all";
    if (value.type === "preset" && value.preset) return value.preset;
    return undefined;
  }, [value]);

  const handlePresetChange = useCallback((preset: string) => {
    if (preset === "all") {
      onChange({ type: "all" });
    } else {
      const range = getPresetDateRange(preset);
      onChange({ 
        type: "preset", 
        preset,
        startDate: range?.from,
        endDate: range?.to,
      });
    }
  }, [onChange]);

  const handleCalendarSelect = useCallback((range: DateRange | undefined) => {
    if (!range || !range.from) {
      return;
    }

    onChange({
      type: "range",
      startDate: range.from,
      endDate: range.to,
    });
  }, [onChange]);

  const getDisplayText = () => {
    if (value.type === "range" && value.startDate) {
      const start = format(value.startDate, "dd MMM yyyy", { locale: ptBR });
      if (value.endDate) {
        return `${start} - ${format(value.endDate, "dd MMM yyyy", { locale: ptBR })}`;
      }
      return start;
    }
    return null;
  };

  const displayText = getDisplayText();

  return (
    <div className="w-[280px]">
      <div className={cn("px-3 py-3 border-b", UI_CLASSES.border)}>
        <div className="text-xs text-gray-500 mb-2">Filtrar por data</div>
        <Select 
          value={currentPresetValue} 
          onValueChange={handlePresetChange}
        >
          <SelectTrigger 
            className="w-full bg-[#1a1a1a] border-[#333] text-gray-200"
            data-testid="select-date-preset"
          >
            <SelectValue placeholder="Selecione..." />
          </SelectTrigger>
          <SelectContent className={UI_CLASSES.popover}>
            {PRESET_OPTIONS.map((option) => (
              <SelectItem 
                key={option.value} 
                value={option.value} 
                className="text-gray-200"
                data-testid={`option-filter-date-${option.value}`}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="pt-1">
        <div className="px-3 py-1.5 text-xs text-gray-500">Ou selecione um intervalo</div>
        <Calendar
          mode="range"
          selected={dateRange}
          onSelect={handleCalendarSelect}
          locale={ptBR}
          className="p-2"
          classNames={{
            day_range_start: "bg-blue-500 text-white rounded-l-full rounded-r-none",
            day_range_end: "bg-blue-500 text-white rounded-r-full rounded-l-none",
            day_range_middle: "bg-blue-500/30 text-white rounded-none",
          }}
        />
        
        {displayText && (
          <div className="px-3 pb-2 text-xs text-gray-400">
            {displayText}
          </div>
        )}
      </div>
      
      <div className="px-3 py-2 text-[10px] text-gray-500 border-t border-[#333]">
        Clique fora para confirmar
      </div>
    </div>
  );
});

export function formatDateFilterLabel(value: DateFilterValue | undefined | null): string {
  if (!value || value.type === "all") return "Data";
  
  if (value.type === "preset") {
    const preset = PRESET_OPTIONS.find(p => p.value === value.preset);
    return preset?.label || "Data";
  }
  
  if (value.type === "range" && value.startDate && isValid(value.startDate)) {
    const start = format(value.startDate, "dd/MM", { locale: ptBR });
    if (value.endDate && isValid(value.endDate)) {
      const end = format(value.endDate, "dd/MM", { locale: ptBR });
      return `${start} - ${end}`;
    }
    return start;
  }
  
  return "Data";
}
