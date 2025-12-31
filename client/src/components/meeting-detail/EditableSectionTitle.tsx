import { useState } from "react";
import { Edit2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditableSectionTitleProps {
  icon: React.ReactNode;
  title: string;
  isEditing?: boolean;
  onEditClick?: () => void;
  onSave?: () => void;
  className?: string;
  iconClassName?: string;
}

export function EditableSectionTitle({
  icon,
  title,
  isEditing = false,
  onEditClick,
  onSave,
  className,
  iconClassName,
}: EditableSectionTitleProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={cn(
        "group flex items-center gap-2.5 py-1.5 px-2 -mx-2 rounded-lg cursor-pointer transition-all duration-300",
        isHovered && !isEditing && "bg-[#1f1f23]",
        isEditing && "bg-[#2d2640]/50",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onEditClick}
    >
      <div className={cn("text-[#8c8c8c]", iconClassName)}>
        {icon}
      </div>
      <h2 className="text-sm font-semibold text-[#ededed]">{title}</h2>
      
      {/* Edit indicator that appears on hover */}
      <div
        className={cn(
          "ml-auto flex items-center gap-1.5 transition-all duration-300",
          isHovered && !isEditing
            ? "opacity-100 translate-x-0"
            : "opacity-0 -translate-x-2"
        )}
      >
        <Edit2 className="w-3.5 h-3.5 text-[#a78bfa]" />
        <span className="text-xs text-[#a78bfa] font-medium">Editar</span>
      </div>

      {/* Editing indicator with save button */}
      {isEditing && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSave?.();
          }}
          className="ml-auto flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 transition-all duration-200 group/save"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-[#a78bfa] animate-pulse" />
          <span className="text-xs text-[#a78bfa] font-medium">Editando</span>
          <Check className="w-4 h-4 text-emerald-500 group-hover/save:scale-110 transition-transform" />
        </button>
      )}
    </div>
  );
}

