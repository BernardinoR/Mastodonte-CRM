import { useState, useRef, useEffect } from "react";
import { X, Calendar, Plane, Truck, AlertTriangle, Check, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { cn } from "@/shared/lib/utils";
import { getIconComponent, type IconName } from "./IconPicker";

export type TagType = "finance" | "travel" | "vehicle" | "warning";

export interface TagData {
  id: string;
  icon: IconName;
  text: string;
  type: TagType;
}

const TAG_TYPES: { type: TagType; label: string; icon: React.ElementType; iconClass: string }[] = [
  {
    type: "finance",
    label: "Financeiro",
    icon: Calendar,
    iconClass: "bg-[#1e3a2f] text-[#6ecf8e]",
  },
  { type: "travel", label: "Viagem", icon: Plane, iconClass: "bg-[#2d2640] text-[#a78bfa]" },
  { type: "vehicle", label: "Veículo", icon: Truck, iconClass: "bg-[#243041] text-[#6db1d4]" },
  {
    type: "warning",
    label: "Atenção",
    icon: AlertTriangle,
    iconClass: "bg-[#422c24] text-[#f59e0b]",
  },
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
      <DialogContent className="max-w-[400px] border-[#3a3a3a] bg-[#1a1a1a] p-6">
        <VisuallyHidden>
          <DialogTitle>Adicionar Tag</DialogTitle>
          <DialogDescription>Adicione uma tag ao resumo da reunião</DialogDescription>
        </VisuallyHidden>

        <h3 className="mb-4 text-base font-semibold text-[#ededed]">Adicionar Tag</h3>

        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite o texto da tag..."
          className="mb-4 w-full rounded-lg border border-[#3a3a3a] bg-[#2a2a2a] px-4 py-3 text-sm text-[#ededed] outline-none transition-colors focus:border-[#a78bfa]"
          autoFocus
        />

        <div className="mb-5 flex gap-2">
          {TAG_TYPES.map(({ type, label, icon: Icon, iconClass }) => (
            <button
              key={type}
              type="button"
              onClick={() => setSelectedType(type)}
              className={cn(
                "flex-1 cursor-pointer rounded-lg border-2 border-[#3a3a3a] bg-[#2a2a2a] p-3 text-center transition-all hover:border-[#444444]",
                selectedType === type && "border-[#a78bfa] bg-[#2d2640]",
              )}
            >
              <div
                className={cn(
                  "mx-auto mb-2 flex h-6 w-6 items-center justify-center rounded-md",
                  iconClass,
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="text-xs text-[#888888]">{label}</div>
            </button>
          ))}
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer rounded-lg border border-[#3a3a3a] bg-transparent px-4 py-2.5 text-sm text-[#888888] transition-all hover:bg-[#2a2a2a] hover:text-[#ededed]"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!text.trim()}
            className="cursor-pointer rounded-lg border-none bg-[#7c3aed] px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#6d28d9] disabled:cursor-not-allowed disabled:opacity-50"
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
    <span
      className={cn(
        "group inline-flex cursor-default items-center gap-1.5 rounded-md border border-[#3a3a3a] bg-[#252730] px-3 py-1.5 text-xs text-[#ededed] transition-all",
      )}
    >
      <IconComponent
        className={cn("h-3 w-3", tag.type === "warning" ? "text-[#f59e0b]" : "text-[#6ecf8e]")}
      />
      {tag.text}
      {editable && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-1 cursor-pointer opacity-0 transition-opacity group-hover:opacity-100"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}

export { TAG_STYLES, TAG_ICONS };

interface InlineTagEditorProps {
  onAddTag: (tag: TagData) => void;
  onCancel?: () => void;
}

export function InlineTagEditor({ onAddTag, onCancel }: InlineTagEditorProps) {
  const [text, setText] = useState("");
  const [selectedType, setSelectedType] = useState<TagType>("finance");
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (!text.trim()) {
          setIsExpanded(false);
          onCancel?.();
        }
      }
    }

    if (isExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isExpanded, text, onCancel]);

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
    setIsExpanded(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleConfirm();
    } else if (e.key === "Escape") {
      setIsExpanded(false);
      setText("");
      onCancel?.();
    }
  };

  if (!isExpanded) {
    return (
      <button
        type="button"
        onClick={() => setIsExpanded(true)}
        className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-dashed border-[#3a3a3a] bg-transparent px-3.5 py-2 text-[0.8125rem] text-[#555555] transition-all hover:border-[#555555] hover:bg-[#1a1a1a] hover:text-[#888888]"
      >
        <Plus className="h-3 w-3" />
        Adicionar tag
      </button>
    );
  }

  return (
    <div ref={containerRef} className="inline-flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-2 rounded-md border border-[#3a3a3a] bg-[#1a1a1a] px-3 py-2">
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite o texto da tag..."
          className="min-w-[120px] border-none bg-transparent text-[0.8125rem] text-[#ededed] outline-none placeholder:text-[#555555]"
        />
        <div className="flex items-center gap-1">
          {TAG_TYPES.map(({ type, icon: Icon, iconClass }) => (
            <button
              key={type}
              type="button"
              onClick={() => setSelectedType(type)}
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded transition-all",
                iconClass,
                selectedType === type &&
                  "ring-2 ring-[#a78bfa] ring-offset-1 ring-offset-[#1a1a1a]",
              )}
              title={TAG_TYPES.find((t) => t.type === type)?.label}
            >
              <Icon className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!text.trim()}
          className="flex h-6 w-6 items-center justify-center rounded bg-[#7c3aed] text-white transition-all hover:bg-[#6d28d9] disabled:cursor-not-allowed disabled:opacity-50"
          title="Confirmar"
        >
          <Check className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => {
            setIsExpanded(false);
            setText("");
            onCancel?.();
          }}
          className="flex h-6 w-6 items-center justify-center rounded text-[#888888] transition-all hover:bg-[#333333] hover:text-[#ededed]"
          title="Cancelar"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
