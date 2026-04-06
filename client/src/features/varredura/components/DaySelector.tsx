import { useState, useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays, ChevronDown } from "lucide-react";
import { isBusinessDay, getBrazilianHolidays } from "@/shared/lib/business-days";
import { Popover, PopoverTrigger, PopoverContent } from "@/shared/components/ui/popover";
import { Calendar } from "@/shared/components/ui/calendar";

export function DaySelector({ value, onChange }: { value: Date; onChange: (d: Date) => void }) {
  const [open, setOpen] = useState(false);

  const holidays = useMemo(() => {
    const year = value.getFullYear();
    const set = getBrazilianHolidays(year);
    for (const h of getBrazilianHolidays(year - 1)) set.add(h);
    for (const h of getBrazilianHolidays(year + 1)) set.add(h);
    return set;
  }, [value]);

  const label = useMemo(() => {
    const today = new Date();
    const isToday = value.toDateString() === today.toDateString();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = value.toDateString() === yesterday.toDateString();

    if (isToday) return "Hoje";
    if (isYesterday) return "Ontem";
    return format(value, "dd MMM yyyy", { locale: ptBR });
  }, [value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="inline-flex h-8 items-center gap-2 rounded-lg border border-[rgba(237,237,237,0.1)] bg-[#1a1a1a] px-3 text-sm text-[#8c8c8c] transition-colors hover:border-[rgba(237,237,237,0.2)] hover:text-[#ededed]"
          data-testid="button-day-selector"
        >
          <CalendarDays className="h-3.5 w-3.5" />
          {label}
          <ChevronDown className="h-3 w-3 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(d) => {
            if (d) {
              onChange(d);
              setOpen(false);
            }
          }}
          disabled={(d) => d > new Date() || !isBusinessDay(d, holidays)}
          locale={ptBR}
        />
      </PopoverContent>
    </Popover>
  );
}
