import { memo, useState, useCallback, useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { UI_CLASSES } from "@/lib/statusConfig";
import { 
  addWeeks, 
  addMonths, 
  subWeeks, 
  subMonths, 
  startOfDay, 
  endOfDay,
  format,
  isValid
} from "date-fns";
import { ptBR } from "date-fns/locale";
import type { DateRange } from "react-day-picker";

export interface DateFilterValue {
  type: "all" | "preset" | "relative" | "range";
  preset?: string;
  relativeDirection?: "past" | "future";
  relativeAmount?: number;
  relativeUnit?: "weeks" | "months";
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

export const DateRangeFilterContent = memo(function DateRangeFilterContent({
  value,
  onChange,
}: DateRangeFilterContentProps) {
  const [relativeDirection, setRelativeDirection] = useState<"past" | "future">(
    value.relativeDirection || "past"
  );
  const [relativeAmount, setRelativeAmount] = useState<number>(
    value.relativeAmount || 8
  );
  const [relativeUnit, setRelativeUnit] = useState<"weeks" | "months">(
    value.relativeUnit || "weeks"
  );

  const dateRange = useMemo<DateRange | undefined>(() => {
    if (value.type === "range" && value.startDate) {
      return {
        from: value.startDate,
        to: value.endDate,
      };
    }
    return undefined;
  }, [value]);

  const handlePresetSelect = useCallback((preset: string) => {
    if (preset === "all") {
      onChange({ type: "all" });
    } else {
      onChange({ type: "preset", preset });
    }
  }, [onChange]);

  const handleRelativeChange = useCallback(() => {
    const today = startOfDay(new Date());
    let startDate: Date;
    let endDate: Date;

    if (relativeDirection === "past") {
      endDate = endOfDay(new Date());
      if (relativeUnit === "weeks") {
        startDate = subWeeks(today, relativeAmount);
      } else {
        startDate = subMonths(today, relativeAmount);
      }
    } else {
      startDate = today;
      if (relativeUnit === "weeks") {
        endDate = endOfDay(addWeeks(today, relativeAmount));
      } else {
        endDate = endOfDay(addMonths(today, relativeAmount));
      }
    }

    onChange({
      type: "relative",
      relativeDirection,
      relativeAmount,
      relativeUnit,
      startDate,
      endDate,
    });
  }, [onChange, relativeDirection, relativeAmount, relativeUnit]);

  const handleCalendarSelect = useCallback((range: DateRange | undefined) => {
    if (!range) {
      onChange({ type: "all" });
      return;
    }

    onChange({
      type: "range",
      startDate: range.from,
      endDate: range.to,
    });
  }, [onChange]);

  const isPresetActive = (preset: string) => {
    if (preset === "all" && value.type === "all") return true;
    return value.type === "preset" && value.preset === preset;
  };

  return (
    <div className="w-[280px]">
      <div className={cn("border-b pb-2", UI_CLASSES.border)}>
        <div className="px-3 py-1.5 text-xs text-gray-500">Seletor relativo</div>
        <div className="px-3 flex items-center gap-2">
          <Select 
            value={relativeDirection} 
            onValueChange={(v) => setRelativeDirection(v as "past" | "future")}
          >
            <SelectTrigger className="h-8 w-[100px] bg-[#1a1a1a] border-[#333] text-gray-200 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className={UI_CLASSES.popover}>
              <SelectItem value="past" className="text-gray-200">Últimos(as)</SelectItem>
              <SelectItem value="future" className="text-gray-200">Próximos(as)</SelectItem>
            </SelectContent>
          </Select>
          
          <Input
            type="number"
            min={1}
            max={52}
            value={relativeAmount}
            onChange={(e) => setRelativeAmount(Math.max(1, parseInt(e.target.value) || 1))}
            className="h-8 w-[50px] bg-[#1a1a1a] border-[#333] text-gray-200 text-sm text-center"
            data-testid="input-date-relative-amount"
          />
          
          <Select 
            value={relativeUnit} 
            onValueChange={(v) => setRelativeUnit(v as "weeks" | "months")}
          >
            <SelectTrigger className="h-8 flex-1 bg-[#1a1a1a] border-[#333] text-gray-200 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className={UI_CLASSES.popover}>
              <SelectItem value="weeks" className="text-gray-200">semanas</SelectItem>
              <SelectItem value="months" className="text-gray-200">meses</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="px-3 pt-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleRelativeChange}
            className="w-full h-7 text-xs"
            data-testid="button-apply-relative-date"
          >
            Aplicar
          </Button>
        </div>
      </div>

      <div className={cn("border-b py-1", UI_CLASSES.border)}>
        {PRESET_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => handlePresetSelect(option.value)}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-1.5 text-sm transition-colors cursor-pointer",
              isPresetActive(option.value)
                ? "bg-[#2a2a2a] text-white"
                : "text-gray-300 hover:bg-[#2a2a2a]"
            )}
            data-testid={`option-filter-date-${option.value}`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="pt-1">
        <div className="px-3 py-1.5 text-xs text-gray-500">Selecionar intervalo</div>
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
        
        {value.type === "range" && value.startDate && (
          <div className="px-3 pb-2 text-xs text-gray-400">
            {format(value.startDate, "dd MMM yyyy", { locale: ptBR })}
            {value.endDate && ` - ${format(value.endDate, "dd MMM yyyy", { locale: ptBR })}`}
          </div>
        )}
        
        {value.type === "relative" && value.startDate && value.endDate && (
          <div className="px-3 pb-2 text-xs text-gray-400">
            {format(value.startDate, "dd MMM yyyy", { locale: ptBR })} - {format(value.endDate, "dd MMM yyyy", { locale: ptBR })}
          </div>
        )}
      </div>
      
      <div className="px-3 py-2 text-[10px] text-gray-500 border-t border-[#333]">
        O filtro será atualizado com a data atual
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
  
  if (value.type === "relative") {
    const amount = value.relativeAmount && !isNaN(value.relativeAmount) ? value.relativeAmount : 0;
    if (amount > 0 && value.relativeUnit) {
      const direction = value.relativeDirection === "past" ? "Últimos" : "Próximos";
      const unit = value.relativeUnit === "weeks" ? "sem" : "meses";
      return `${direction} ${amount} ${unit}`;
    }
    return "Data";
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
