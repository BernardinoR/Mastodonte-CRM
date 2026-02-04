/**
 * Componente genérico para filtros de badge (Status, Prioridade, Tipo, etc.)
 * Reutilizável para qualquer filtro que use badges com cores
 */
import { memo, useMemo } from "react";
import { X } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { UI_CLASSES } from "@features/tasks/lib/statusConfig";
import { Badge } from "@/shared/components/ui/badge";

export interface BadgeFilterContentProps<T extends string> {
  options: readonly T[];
  selectedValues: T[];
  onToggle: (value: T) => void;
  colorMap: Record<T, string>;
  label?: string;
  renderBadge?: (value: T, isSelected: boolean) => React.ReactNode;
}

export function BadgeFilterContent<T extends string>({
  options,
  selectedValues,
  onToggle,
  colorMap,
  label,
  renderBadge,
}: BadgeFilterContentProps<T>) {
  const selected = useMemo(
    () => options.filter((opt) => selectedValues.includes(opt)),
    [options, selectedValues],
  );

  const unselected = useMemo(
    () => options.filter((opt) => !selectedValues.includes(opt)),
    [options, selectedValues],
  );

  const defaultRenderBadge = (value: T, isSelected: boolean) => (
    <Badge className={cn(colorMap[value] || "bg-[#333333] text-[#a0a0a0]", "text-xs")}>
      {value}
    </Badge>
  );

  return (
    <div className="w-full">
      {selected.length > 0 && (
        <>
          <div className={cn("border-b", UI_CLASSES.border)}>
            <div className="px-3 py-1.5 text-xs text-gray-500">{label || "Selecionado"}</div>
            <div className="space-y-1 px-2 pb-2">
              {selected.map((value) => (
                <div
                  key={value}
                  onClick={() => onToggle(value)}
                  className={cn(
                    "group flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5",
                    UI_CLASSES.selectedItem,
                  )}
                  data-testid={`option-filter-${value.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {renderBadge ? renderBadge(value, true) : defaultRenderBadge(value, true)}
                  <X className="ml-auto h-3 w-3 text-gray-500 opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {unselected.length > 0 && (
        <>
          <div className="px-3 py-1.5 text-xs text-gray-500">
            {selected.length > 0 ? "Selecione mais" : label || "Selecionar"}
          </div>
          <div className="px-1 pb-1">
            {unselected.map((value) => (
              <div
                key={value}
                onClick={() => onToggle(value)}
                className={UI_CLASSES.dropdownItem}
                data-testid={`option-filter-${value.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {renderBadge ? renderBadge(value, false) : defaultRenderBadge(value, false)}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
