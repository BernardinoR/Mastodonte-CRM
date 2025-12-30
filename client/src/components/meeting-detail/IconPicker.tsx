import { useState, useRef, useEffect } from "react";
import {
  AlertCircle,
  Home,
  Plane,
  CreditCard,
  Building,
  AlertTriangle,
  Truck,
  Briefcase,
  Heart,
  Star,
  Target,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

const AVAILABLE_ICONS = [
  { name: "alert-circle", icon: AlertCircle, label: "Alerta" },
  { name: "home", icon: Home, label: "Casa" },
  { name: "plane", icon: Plane, label: "Viagem" },
  { name: "credit-card", icon: CreditCard, label: "Cartão" },
  { name: "building", icon: Building, label: "Empresa" },
  { name: "alert-triangle", icon: AlertTriangle, label: "Atenção" },
  { name: "truck", icon: Truck, label: "Veículo" },
  { name: "briefcase", icon: Briefcase, label: "Trabalho" },
  { name: "heart", icon: Heart, label: "Saúde" },
  { name: "star", icon: Star, label: "Destaque" },
  { name: "target", icon: Target, label: "Meta" },
] as const;

export type IconName = typeof AVAILABLE_ICONS[number]["name"];

interface IconPickerProps {
  selectedIcon: IconName | null;
  onSelect: (iconName: IconName) => void;
  triggerClassName?: string;
}

export function getIconComponent(iconName: string) {
  const iconConfig = AVAILABLE_ICONS.find((i) => i.name === iconName);
  return iconConfig?.icon || AlertCircle;
}

export function IconPicker({ selectedIcon, onSelect, triggerClassName }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const SelectedIconComponent = selectedIcon ? getIconComponent(selectedIcon) : Plus;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-6 h-6 bg-[#252525] border border-[#333333] rounded-md flex items-center justify-center",
          "text-[#666666] cursor-pointer transition-all hover:bg-[#333333] hover:text-[#888888]",
          selectedIcon && "bg-[#333333] text-[#888888]",
          triggerClassName
        )}
      >
        <SelectedIconComponent className="w-3.5 h-3.5" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-[#1a1a1a] border border-[#333333] rounded-lg p-2 grid grid-cols-4 gap-1 z-50 shadow-lg shadow-black/50">
          {AVAILABLE_ICONS.map(({ name, icon: Icon }) => (
            <button
              key={name}
              type="button"
              onClick={() => {
                onSelect(name);
                setIsOpen(false);
              }}
              className={cn(
                "w-8 h-8 flex items-center justify-center rounded-md text-[#888888] cursor-pointer transition-all",
                "hover:bg-[#333333] hover:text-[#ededed]",
                selectedIcon === name && "bg-[#333333] text-[#ededed]"
              )}
              title={name}
            >
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export { AVAILABLE_ICONS };

