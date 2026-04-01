import { useMemo, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getVisibleContaTypes } from "../utils/contaVisibility";
import { Calendar, Check, ChevronDown } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/shared/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/shared/components/ui/command";
import { cn } from "@/shared/lib/utils";

interface MonthSelectorProps {
  value: Date;
  onChange: (date: Date) => void;
}

const MONTH_NAMES_PT: Record<number, string> = {
  0: "janeiro",
  1: "fevereiro",
  2: "março",
  3: "abril",
  4: "maio",
  5: "junho",
  6: "julho",
  7: "agosto",
  8: "setembro",
  9: "outubro",
  10: "novembro",
  11: "dezembro",
};

function generateMonthOptions() {
  const options: { value: Date; label: string; searchLabel: string }[] = [];
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // Check if the latest closed month should be visible (3rd business day = earliest threshold)
  let latestEndMonth = currentMonth - 1;
  let latestEndYear = currentYear;
  if (latestEndMonth < 0) {
    latestEndMonth = 11;
    latestEndYear--;
  }
  const lastClosedStr = `${String(latestEndMonth + 1).padStart(2, "0")}/${latestEndYear}`;
  const hideLatestMonth = getVisibleContaTypes(lastClosedStr).size === 0;

  for (let year = 2024; year <= currentYear; year++) {
    let endMonth = year === currentYear ? currentMonth - 1 : 11;
    if (hideLatestMonth && year === latestEndYear && endMonth === latestEndMonth) {
      endMonth--;
    }
    for (let month = 0; month <= endMonth; month++) {
      const date = new Date(year, month, 1);
      const label = format(date, "MMM/yy", { locale: ptBR });
      const capitalizedLabel = label.charAt(0).toUpperCase() + label.slice(1);
      const fullName = MONTH_NAMES_PT[month];
      const paddedMonth = String(month + 1).padStart(2, "0");
      const searchLabel = `${fullName} ${year} ${paddedMonth}/${year} ${capitalizedLabel}`;

      options.push({ value: date, label: capitalizedLabel, searchLabel });
    }
  }

  return options.reverse();
}

export function MonthSelector({ value, onChange }: MonthSelectorProps) {
  const [open, setOpen] = useState(false);
  const options = useMemo(() => generateMonthOptions(), []);

  const selectedLabel = useMemo(() => {
    const label = format(value, "MMM/yy", { locale: ptBR });
    return label.charAt(0).toUpperCase() + label.slice(1);
  }, [value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="inline-flex h-8 items-center gap-2 rounded-lg border border-white/10 bg-zinc-900 pl-3 pr-3 text-sm text-zinc-400 hover:bg-white/10">
          <Calendar className="h-3.5 w-3.5 text-gray-400" />
          {selectedLabel}
          <ChevronDown className="h-3 w-3 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-52 p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar mês..." />
          <CommandList>
            <CommandEmpty>Nenhum mês encontrado.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected =
                  value.getFullYear() === option.value.getFullYear() &&
                  value.getMonth() === option.value.getMonth();

                return (
                  <CommandItem
                    key={option.label}
                    value={option.searchLabel}
                    onSelect={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                  >
                    <Check className={cn("h-4 w-4", isSelected ? "opacity-100" : "opacity-0")} />
                    {option.label}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
