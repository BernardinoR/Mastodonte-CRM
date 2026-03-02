import { format, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, ChevronDown } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface MonthSelectorProps {
  value: Date;
  onChange: (date: Date) => void;
}

export function MonthSelector({ value, onChange }: MonthSelectorProps) {
  const label = format(value, "MMM/yy", { locale: ptBR });
  const capitalizedLabel = label.charAt(0).toUpperCase() + label.slice(1);

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-gray-400 hover:text-white"
        onClick={() => onChange(subMonths(value, 1))}
      >
        <ChevronDown className="h-4 w-4 rotate-90" />
      </Button>
      <Button
        variant="outline"
        className="h-8 gap-2 border-gray-600 px-3 text-sm hover:bg-white/10"
      >
        <Calendar className="h-4 w-4" />
        {capitalizedLabel}
        <ChevronDown className="h-3 w-3 opacity-50" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-gray-400 hover:text-white"
        onClick={() => onChange(addMonths(value, 1))}
      >
        <ChevronDown className="h-4 w-4 -rotate-90" />
      </Button>
    </div>
  );
}
