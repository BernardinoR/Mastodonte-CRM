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
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Car,
  Shield,
  PiggyBank,
  BarChart,
  User,
  Users,
  Info,
  CheckCircle,
  Clock,
  Timer,
  Lock,
  Settings,
  FileText,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";

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
  { name: "dollar-sign", icon: DollarSign, label: "Dinheiro" },
  { name: "trending-up", icon: TrendingUp, label: "Crescimento" },
  { name: "trending-down", icon: TrendingDown, label: "Queda" },
  { name: "calendar", icon: Calendar, label: "Calendário" },
  { name: "car", icon: Car, label: "Carro" },
  { name: "shield", icon: Shield, label: "Seguro" },
  { name: "piggy-bank", icon: PiggyBank, label: "Poupança" },
  { name: "bar-chart", icon: BarChart, label: "Gráfico" },
  { name: "user", icon: User, label: "Pessoa" },
  { name: "users", icon: Users, label: "Pessoas" },
  { name: "info", icon: Info, label: "Informação" },
  { name: "check-circle", icon: CheckCircle, label: "Confirmado" },
  { name: "clock", icon: Clock, label: "Relógio" },
  { name: "timer", icon: Timer, label: "Timer" },
  { name: "lock", icon: Lock, label: "Bloqueado" },
  { name: "settings", icon: Settings, label: "Configurações" },
  { name: "file-text", icon: FileText, label: "Documento" },
] as const;

export type IconName = (typeof AVAILABLE_ICONS)[number]["name"];

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
          "flex h-6 w-6 items-center justify-center rounded-md border border-[#333333] bg-[#252525]",
          "cursor-pointer text-[#666666] transition-all hover:bg-[#333333] hover:text-[#888888]",
          selectedIcon && "bg-[#333333] text-[#888888]",
          triggerClassName,
        )}
      >
        <SelectedIconComponent className="h-3.5 w-3.5" />
      </button>

      {isOpen && (
        <div className="absolute left-1/2 top-full z-50 mt-2 grid max-h-[300px] -translate-x-1/2 grid-cols-5 gap-1 overflow-y-auto rounded-lg border border-[#333333] bg-[#1a1a1a] p-2 shadow-lg shadow-black/50">
          {AVAILABLE_ICONS.map(({ name, icon: Icon }) => (
            <button
              key={name}
              type="button"
              onClick={() => {
                onSelect(name);
                setIsOpen(false);
              }}
              className={cn(
                "flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-[#888888] transition-all",
                "hover:bg-[#333333] hover:text-[#ededed]",
                selectedIcon === name && "bg-[#333333] text-[#ededed]",
              )}
              title={name}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export { AVAILABLE_ICONS };
