import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, ChevronDown } from "lucide-react";

interface MonthSelectorProps {
  value: Date;
  onChange: (date: Date) => void;
}

export function MonthSelector({ value, onChange }: MonthSelectorProps) {
  const label = format(value, "MMM/yy", { locale: ptBR });
  const capitalizedLabel = label.charAt(0).toUpperCase() + label.slice(1);

  return (
    <button className="inline-flex h-8 items-center gap-2 rounded-lg border border-white/10 bg-zinc-900 pl-3 pr-3 text-sm text-zinc-400 hover:bg-white/10">
      <Calendar className="h-3.5 w-3.5 text-gray-400" />
      {capitalizedLabel}
      <ChevronDown className="h-3 w-3 opacity-50" />
    </button>
  );
}
