import { useState } from "react";
import { X, Calendar, Plane, Truck, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { cn } from "@/lib/utils";
import { getIconComponent, type IconName } from "./IconPicker";

export type TagType = "finance" | "travel" | "vehicle" | "warning";

export interface TagData {
  id: string;
  icon: IconName;
  text: string;
  type: TagType;
}

const TAG_TYPES: { type: TagType; label: string; icon: React.ElementType; iconClass: string }[] = [
  { type: "finance", label: "Financeiro", icon: Calendar, iconClass: "bg-[#1e3a2f] text-[#6ecf8e]" },
  { type: "travel", label: "Viagem", icon: Plane, iconClass: "bg-[#2d2640] text-[#a78bfa]" },
  { type: "vehicle", label: "Veículo", icon: Truck, iconClass: "bg-[#243041] text-[#6db1d4]" },
  { type: "warning", label: "Atenção", icon: AlertTriangle, iconClass: "bg-[#422c24] text-[#f59e0b]" },
];

const TAG_ICONS: Record<TagType, IconName> = {
  finance: "building",
  travel: "plane",
  vehicle: "truck",
  warning: "alert-triangle",
};

const TAG_STYLES: Record<TagType, string> = {
  finance: "bg-[#1e3a2f] text-[#6ecf8e]",
  travel: "bg-[#2d2640] text-[#a78bfa]",
  vehicle: "bg-[#243041] text-[#6db1d4]",
  warning: "bg-[#422c24] text-[#f59e0b]",
};

interface TagEditorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddTag: (tag: TagData) => void;
}

export function TagEditorModal({ open, onOpenChange, onAddTag }: TagEditorModalProps) {
  const [text, setText] = useState("");
  const [selectedType, setSelectedType] = useState<TagType>("finance");

  const handleConfirm = () => {
    if (!text.trim()) return;

    const newTag: TagData = {
      id: crypto.randomUUID(),
      icon: TAG_ICONS[selectedType],
      text: text.trim(),
      type: selectedType,
    };

    onAddTag(newTag);
    setText("");
    setSelectedType("finance");
    onOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleConfirm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[400px] bg-[#1a1a1a] border-[#333333] p-6">
        <VisuallyHidden>
          <DialogTitle>Adicionar Tag</DialogTitle>
          <DialogDescription>Adicione uma tag ao resumo da reunião</DialogDescription>
        </VisuallyHidden>

        <h3 className="text-base font-semibold text-[#ededed] mb-4">Adicionar Tag</h3>

        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite o texto da tag..."
          className="w-full px-4 py-3 bg-[#252525] border border-[#333333] rounded-lg text-[#ededed] text-sm outline-none focus:border-[#a78bfa] transition-colors mb-4"
          autoFocus
        />

        <div className="flex gap-2 mb-5">
          {TAG_TYPES.map(({ type, label, icon: Icon, iconClass }) => (
            <button
              key={type}
              type="button"
              onClick={() => setSelectedType(type)}
              className={cn(
                "flex-1 p-3 bg-[#252525] border-2 border-[#333333] rounded-lg cursor-pointer text-center transition-all hover:border-[#444444]",
                selectedType === type && "border-[#a78bfa] bg-[#2d2640]"
              )}
            >
              <div className={cn("w-6 h-6 mx-auto mb-2 rounded-md flex items-center justify-center", iconClass)}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="text-xs text-[#888888]">{label}</div>
            </button>
          ))}
        </div>

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="px-4 py-2.5 bg-transparent border border-[#333333] rounded-lg text-[#888888] text-sm cursor-pointer transition-all hover:bg-[#252525] hover:text-[#ededed]"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!text.trim()}
            className="px-5 py-2.5 bg-[#7c3aed] border-none rounded-lg text-white text-sm font-medium cursor-pointer transition-all hover:bg-[#6d28d9] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Adicionar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface TagDisplayProps {
  tag: TagData;
  onRemove: () => void;
  editable?: boolean;
}

export function TagDisplay({ tag, onRemove, editable = true }: TagDisplayProps) {
  const IconComponent = getIconComponent(tag.icon);

  return (
    <div
      className={cn(
        "group inline-flex items-center gap-2 px-3.5 py-2 rounded-md text-[0.8125rem] font-medium cursor-default transition-all",
        TAG_STYLES[tag.type]
      )}
    >
      <IconComponent className="w-3.5 h-3.5" />
      {tag.text}
      {editable && (
        <button
          type="button"
          onClick={onRemove}
          className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer ml-1"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

export { TAG_STYLES, TAG_ICONS };

