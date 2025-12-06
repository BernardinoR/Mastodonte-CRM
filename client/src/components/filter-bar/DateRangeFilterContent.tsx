import { memo, useState, useCallback, useMemo, useEffect, useRef } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { UI_CLASSES } from "@/lib/statusConfig";
import { 
  startOfDay, 
  endOfDay,
  format,
  isValid,
  addWeeks,
  addMonths,
  subWeeks,
  subMonths,
  isBefore,
  isSameDay,
  parse
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

function getPresetDateRange(preset: string): { from: Date; to: Date } | undefined {
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

function getRelativeDateRange(direction: "past" | "future", amount: number, unit: "weeks" | "months"): { from: Date; to: Date } {
  const today = startOfDay(new Date());
  
  if (direction === "past") {
    const startDate = unit === "weeks" ? subWeeks(today, amount) : subMonths(today, amount);
    return { from: startDate, to: endOfDay(new Date()) };
  } else {
    const endDate = unit === "weeks" ? addWeeks(today, amount) : addMonths(today, amount);
    return { from: today, to: endOfDay(endDate) };
  }
}

export const DateRangeFilterContent = memo(function DateRangeFilterContent({
  value,
  onChange,
}: DateRangeFilterContentProps) {
  const [relativeDirection, setRelativeDirection] = useState<"past" | "future">(
    value.relativeDirection || "past"
  );
  const [relativeAmount, setRelativeAmount] = useState<number>(
    value.relativeAmount || 4
  );
  const [relativeUnit, setRelativeUnit] = useState<"weeks" | "months">(
    value.relativeUnit || "weeks"
  );

  // Custom range selection state
  const [selectionPhase, setSelectionPhase] = useState<"start" | "end">("start");
  const [pendingStartDate, setPendingStartDate] = useState<Date | null>(null);

  // Drag-to-adjust state
  const [draggingHandle, setDraggingHandle] = useState<"none" | "start" | "end">("none");
  const [dragPreviewRange, setDragPreviewRange] = useState<DateRange | undefined>(undefined);
  const dragAnchorDateRef = useRef<Date | null>(null);
  const calendarContainerRef = useRef<HTMLDivElement>(null);
  const ignoreNextClickRef = useRef(false);

  // Helper to extract date from a calendar day button element
  const getDateFromDayElement = useCallback((element: HTMLElement): Date | null => {
    // Find the closest button element that might be a day button
    const button = element.closest("button") as HTMLButtonElement | null;
    if (!button) return null;
    
    // react-day-picker sets aria-label with the full date in Portuguese locale
    // Format: "sexta-feira, 6 de dezembro de 2024"
    const ariaLabel = button.getAttribute("aria-label");
    if (!ariaLabel) return null;
    
    // Use date-fns parse with Portuguese locale for proper accent handling
    try {
      const parsedDate = parse(ariaLabel, "EEEE, d 'de' MMMM 'de' yyyy", new Date(), { locale: ptBR });
      if (isValid(parsedDate)) {
        return parsedDate;
      }
    } catch {
      // Fall through to return null
    }
    
    return null;
  }, []);

  // Reset selection phase when value changes externally (preset, relative, etc.)
  useEffect(() => {
    if (value.type !== "range" || (value.type === "range" && value.endDate)) {
      setSelectionPhase("start");
      setPendingStartDate(null);
    }
  }, [value.type, value.endDate]);

  useEffect(() => {
    if (value.type === "relative") {
      if (value.relativeDirection) setRelativeDirection(value.relativeDirection);
      if (value.relativeAmount) setRelativeAmount(value.relativeAmount);
      if (value.relativeUnit) setRelativeUnit(value.relativeUnit);
    }
  }, [value.type, value.relativeDirection, value.relativeAmount, value.relativeUnit]);

  const dateRange = useMemo<DateRange | undefined>(() => {
    // Use drag preview range during drag operation
    if (draggingHandle !== "none" && dragPreviewRange) {
      return dragPreviewRange;
    }
    if (value.type === "range" && value.startDate) {
      return { from: value.startDate, to: value.endDate };
    }
    if (value.type === "preset" && value.preset) {
      return getPresetDateRange(value.preset);
    }
    if (value.type === "relative" && value.startDate && value.endDate) {
      return { from: value.startDate, to: value.endDate };
    }
    return undefined;
  }, [value, draggingHandle, dragPreviewRange]);

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

  const applyRelativeFilter = useCallback(() => {
    const range = getRelativeDateRange(relativeDirection, relativeAmount, relativeUnit);
    onChange({
      type: "relative",
      relativeDirection,
      relativeAmount,
      relativeUnit,
      startDate: range.from,
      endDate: range.to,
    });
  }, [onChange, relativeDirection, relativeAmount, relativeUnit]);

  const handleDirectionChange = useCallback((dir: string) => {
    const newDir = dir as "past" | "future";
    setRelativeDirection(newDir);
    const range = getRelativeDateRange(newDir, relativeAmount, relativeUnit);
    onChange({
      type: "relative",
      relativeDirection: newDir,
      relativeAmount,
      relativeUnit,
      startDate: range.from,
      endDate: range.to,
    });
  }, [onChange, relativeAmount, relativeUnit]);

  const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(1, Math.min(52, parseInt(e.target.value) || 1));
    setRelativeAmount(val);
  }, []);

  const handleUnitChange = useCallback((unit: string) => {
    const newUnit = unit as "weeks" | "months";
    setRelativeUnit(newUnit);
    const range = getRelativeDateRange(relativeDirection, relativeAmount, newUnit);
    onChange({
      type: "relative",
      relativeDirection,
      relativeAmount,
      relativeUnit: newUnit,
      startDate: range.from,
      endDate: range.to,
    });
  }, [onChange, relativeDirection, relativeAmount]);

  // Drag-to-adjust: handle mousedown on calendar container
  const handleCalendarMouseDown = useCallback((e: React.MouseEvent) => {
    // Only allow drag when we have a complete range
    if (value.type !== "range" || !value.startDate || !value.endDate) return;
    
    const target = e.target as HTMLElement;
    const dayDate = getDateFromDayElement(target);
    if (!dayDate) return;

    // Check if clicking on start or end handle
    if (isSameDay(dayDate, value.startDate)) {
      e.preventDefault();
      setDraggingHandle("start");
      dragAnchorDateRef.current = value.endDate;
      setDragPreviewRange({ from: value.startDate, to: value.endDate });
    } else if (isSameDay(dayDate, value.endDate)) {
      e.preventDefault();
      setDraggingHandle("end");
      dragAnchorDateRef.current = value.startDate;
      setDragPreviewRange({ from: value.startDate, to: value.endDate });
    }
  }, [value, getDateFromDayElement]);

  // Drag-to-adjust: handle mousemove on calendar container
  const handleCalendarMouseMove = useCallback((e: React.MouseEvent) => {
    if (draggingHandle === "none" || !dragAnchorDateRef.current) return;

    const target = e.target as HTMLElement;
    const dayDate = getDateFromDayElement(target);
    if (!dayDate) return;

    const anchorDate = dragAnchorDateRef.current;
    let newFrom: Date;
    let newTo: Date;

    // Normalize so from <= to
    if (isBefore(dayDate, anchorDate)) {
      newFrom = dayDate;
      newTo = anchorDate;
    } else if (isSameDay(dayDate, anchorDate)) {
      newFrom = dayDate;
      newTo = dayDate;
    } else {
      newFrom = anchorDate;
      newTo = dayDate;
    }

    setDragPreviewRange({ from: newFrom, to: newTo });
  }, [draggingHandle, getDateFromDayElement]);

  // Drag-to-adjust: handle mouseup to confirm selection
  const handleCalendarMouseUp = useCallback(() => {
    if (draggingHandle === "none" || !dragPreviewRange?.from) return;

    // Apply the dragged range
    onChange({
      type: "range",
      startDate: startOfDay(dragPreviewRange.from),
      endDate: dragPreviewRange.to ? endOfDay(dragPreviewRange.to) : endOfDay(dragPreviewRange.from),
    });

    // Reset drag state
    setDraggingHandle("none");
    setDragPreviewRange(undefined);
    dragAnchorDateRef.current = null;
    ignoreNextClickRef.current = true;
  }, [draggingHandle, dragPreviewRange, onChange]);

  // Drag-to-adjust: handle mouse leave to cancel drag
  const handleCalendarMouseLeave = useCallback(() => {
    if (draggingHandle !== "none") {
      // Cancel drag, revert to original range
      setDraggingHandle("none");
      setDragPreviewRange(undefined);
      dragAnchorDateRef.current = null;
    }
  }, [draggingHandle]);

  // Custom day click handler for two-click selection
  const handleDayClick = useCallback((day: Date) => {
    // Ignore clicks that are part of a drag operation
    if (ignoreNextClickRef.current) {
      ignoreNextClickRef.current = false;
      return;
    }

    if (selectionPhase === "start") {
      // First click: set start date locally and in value, clear end date
      const newStartDate = startOfDay(day);
      setPendingStartDate(newStartDate);
      onChange({
        type: "range",
        startDate: newStartDate,
        endDate: undefined,
      });
      setSelectionPhase("end");
    } else {
      // Second click: use local pendingStartDate to avoid stale props issue
      const startDate = pendingStartDate || value.startDate || day;
      let newStart = startDate;
      let newEnd = day;
      
      // Ensure start is before end
      if (isBefore(day, startDate)) {
        newStart = day;
        newEnd = startDate;
      }
      
      onChange({
        type: "range",
        startDate: startOfDay(newStart),
        endDate: endOfDay(newEnd),
      });
      setSelectionPhase("start");
      setPendingStartDate(null);
    }
  }, [selectionPhase, pendingStartDate, value.startDate, onChange]);

  const getDisplayText = () => {
    if (value.type === "range" && value.startDate) {
      const start = format(value.startDate, "dd MMM yyyy", { locale: ptBR });
      if (value.endDate) {
        return `${start} - ${format(value.endDate, "dd MMM yyyy", { locale: ptBR })}`;
      }
      return start;
    }
    if (value.type === "relative" && value.startDate && value.endDate) {
      const start = format(value.startDate, "dd MMM yyyy", { locale: ptBR });
      const end = format(value.endDate, "dd MMM yyyy", { locale: ptBR });
      return `${start} - ${end}`;
    }
    return null;
  };

  const displayText = getDisplayText();
  const isRelativeActive = value.type === "relative";

  return (
    <div className="w-[300px] max-w-[calc(100vw-32px)]">
      <ScrollArea className="max-h-[calc(100vh-120px)]">
        <div className={cn("px-3 py-3 border-b", UI_CLASSES.border)}>
          <div className="text-xs text-gray-500 mb-2">Filtro rápido</div>
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

        <div className={cn("px-3 py-3 border-b", UI_CLASSES.border)}>
          <div className="text-xs text-gray-500 mb-2">Intervalo relativo</div>
          <div className="flex items-center gap-2">
            <Select 
              value={relativeDirection} 
              onValueChange={handleDirectionChange}
            >
              <SelectTrigger 
                className="h-8 w-[100px] bg-[#1a1a1a] border-[#333] text-gray-200 text-sm"
                data-testid="select-relative-direction"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className={UI_CLASSES.popover}>
                <SelectItem value="past" className="text-gray-200">Últimas</SelectItem>
                <SelectItem value="future" className="text-gray-200">Próximas</SelectItem>
              </SelectContent>
            </Select>
            
            <Input
              type="number"
              min={1}
              max={52}
              value={relativeAmount}
              onChange={handleAmountChange}
              onBlur={applyRelativeFilter}
              onKeyDown={(e) => e.key === "Enter" && applyRelativeFilter()}
              className="h-8 w-[50px] bg-[#1a1a1a] border-[#333] text-gray-200 text-sm text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              data-testid="input-relative-amount"
            />
            
            <Select 
              value={relativeUnit} 
              onValueChange={handleUnitChange}
            >
              <SelectTrigger 
                className="h-8 flex-1 bg-[#1a1a1a] border-[#333] text-gray-200 text-sm"
                data-testid="select-relative-unit"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className={UI_CLASSES.popover}>
                <SelectItem value="weeks" className="text-gray-200">semanas</SelectItem>
                <SelectItem value="months" className="text-gray-200">meses</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button
            onClick={applyRelativeFilter}
            variant={isRelativeActive ? "default" : "secondary"}
            size="sm"
            className="w-full mt-2"
            data-testid="button-apply-relative"
          >
            {isRelativeActive ? "Selecionado" : "Aplicar"}
          </Button>
        </div>

        <div className="pt-1">
          <div className="px-3 py-1.5 text-xs text-gray-500">
            {draggingHandle !== "none" 
              ? "Arraste para ajustar o intervalo"
              : selectionPhase === "start" 
                ? "Clique para selecionar a data inicial" 
                : "Clique para selecionar a data final"}
          </div>
          <div 
            ref={calendarContainerRef}
            className={cn("flex justify-center", draggingHandle !== "none" && "select-none")}
            onMouseDown={handleCalendarMouseDown}
            onMouseMove={handleCalendarMouseMove}
            onMouseUp={handleCalendarMouseUp}
            onMouseLeave={handleCalendarMouseLeave}
          >
            <Calendar
              mode="range"
              selected={dateRange}
              onDayClick={handleDayClick}
              locale={ptBR}
              className="p-2"
              classNames={{
                day_range_start: "bg-blue-500 text-white rounded-l-full rounded-r-none cursor-ew-resize",
                day_range_end: "bg-blue-500 text-white rounded-r-full rounded-l-none cursor-ew-resize",
                day_range_middle: "bg-blue-500/30 text-white rounded-none",
              }}
            />
          </div>
        </div>
        
        {displayText && (
          <div className="px-3 py-2 text-sm text-gray-300 border-t border-[#333] text-center">
            {displayText}
          </div>
        )}
        
        <div className="px-3 py-2 text-[10px] text-gray-500 border-t border-[#333]">
          Clique fora para confirmar
        </div>
      </ScrollArea>
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
      const direction = value.relativeDirection === "past" ? "Últimas" : "Próximas";
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
