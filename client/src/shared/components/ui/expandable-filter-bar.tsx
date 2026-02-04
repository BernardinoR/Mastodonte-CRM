/**
 * Componente genérico para barra de filtros expansível
 * Encapsula o botão Plus → X e o container animado com efeito staggered
 */
import { Plus } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export interface ExpandableFilterBarProps {
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  toggleButtonTestId?: string;
}

export function ExpandableFilterBar({
  isExpanded,
  onToggle,
  children,
  toggleButtonTestId = "button-toggle-filters",
}: ExpandableFilterBarProps) {
  return (
    <>
      {/* Botão Toggle Expansor (Plus → X) */}
      <button
        onClick={onToggle}
        className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-[#1a1a1a] hover:text-gray-300 focus:outline-none"
        aria-label="Mostrar/ocultar filtros"
        data-testid={toggleButtonTestId}
      >
        <Plus
          className={cn("h-4 w-4 transition-transform duration-300", isExpanded && "rotate-45")}
        />
      </button>

      {/* Container animado - Filtros */}
      <div
        className={cn(
          "flex items-center gap-1 overflow-hidden transition-all duration-300 ease-out",
          isExpanded ? "opacity-100" : "w-0 opacity-0",
        )}
      >
        {children}
      </div>
    </>
  );
}
