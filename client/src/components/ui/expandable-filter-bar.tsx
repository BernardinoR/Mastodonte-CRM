/**
 * Componente genérico para barra de filtros expansível
 * Encapsula o botão Plus → X e o container animado com efeito staggered
 */
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

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
        className="w-8 h-8 rounded-full text-gray-500 hover:text-gray-300 hover:bg-[#1a1a1a] flex items-center justify-center transition-colors focus:outline-none"
        aria-label="Mostrar/ocultar filtros"
        data-testid={toggleButtonTestId}
      >
        <Plus className={cn(
          "w-4 h-4 transition-transform duration-300",
          isExpanded && "rotate-45"
        )} />
      </button>
      
      {/* Container animado - Filtros */}
      <div className={cn(
        "flex items-center gap-1 overflow-hidden transition-all duration-300 ease-out",
        isExpanded ? "opacity-100" : "w-0 opacity-0"
      )}>
        {children}
      </div>
    </>
  );
}

