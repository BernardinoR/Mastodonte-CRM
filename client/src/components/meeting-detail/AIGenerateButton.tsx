import { useState } from "react";
import { Sparkles, FileText, ClipboardList, Zap, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export type GenerateOption = "summary" | "agenda" | "decisions";

interface AIGenerateButtonProps {
  onGenerate: (text: string, options: GenerateOption[]) => Promise<void>;
  isLoading?: boolean;
  disabled?: boolean;
}

interface OptionChip {
  id: GenerateOption;
  label: string;
  icon: React.ReactNode;
}

const options: OptionChip[] = [
  {
    id: "summary",
    label: "Resumo",
    icon: <FileText className="w-4 h-4" />,
  },
  {
    id: "agenda",
    label: "Pauta",
    icon: <ClipboardList className="w-4 h-4" />,
  },
  {
    id: "decisions",
    label: "Decisões",
    icon: <Zap className="w-4 h-4" />,
  },
];

export function AIGenerateButton({
  onGenerate,
  isLoading = false,
  disabled = false,
}: AIGenerateButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<Set<GenerateOption>>(
    () => new Set<GenerateOption>(["summary", "agenda", "decisions"])
  );

  const toggleOption = (option: GenerateOption) => {
    setSelectedOptions((prev) => {
      const next = new Set(prev);
      if (next.has(option)) {
        if (next.size > 1) {
          next.delete(option);
        }
      } else {
        next.add(option);
      }
      return next;
    });
  };

  const handleGenerate = async () => {
    if (!inputText.trim() || selectedOptions.size === 0) return;
    await onGenerate(inputText.trim(), Array.from(selectedOptions));
    setIsOpen(false);
    setInputText("");
  };

  const canGenerate = inputText.trim().length > 0 && selectedOptions.size > 0 && !isLoading;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          disabled={disabled || isLoading}
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300",
            "bg-gradient-to-r from-[#7c3aed] to-[#6366f1]",
            "hover:from-[#6d28d9] hover:to-[#4f46e5]",
            "text-white shadow-lg shadow-purple-500/20",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "border border-purple-400/20"
          )}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          <span>Gerar com IA</span>
        </button>
      </PopoverTrigger>

      <PopoverContent
        side="bottom"
        align="end"
        sideOffset={8}
        className={cn(
          "w-auto min-w-[600px] p-0",
          "bg-[#0d0d0d]/98 backdrop-blur-xl",
          "border border-white/10 rounded-xl",
          "shadow-2xl shadow-purple-500/10"
        )}
      >
        {/* Horizontal layout with vertical chips */}
        <div className="flex items-stretch gap-3 p-4">
          {/* Option chips - vertical stack */}
          <div className="flex flex-col gap-2 flex-shrink-0">
            {options.map((option) => {
              const isSelected = selectedOptions.has(option.id);
              return (
                <button
                  key={option.id}
                  onClick={() => toggleOption(option.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    isSelected
                      ? "bg-gradient-to-r from-[#7c3aed]/40 to-[#6366f1]/40 border border-purple-500/60 text-purple-200"
                      : "bg-white/5 border border-white/10 text-[#666] hover:border-white/20 hover:text-white"
                  )}
                >
                  <span className={cn(
                    "transition-colors",
                    isSelected ? "text-purple-400" : "text-[#555]"
                  )}>
                    {option.icon}
                  </span>
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>

          {/* Textarea - fills height of 3 chips */}
          <div className="flex-1 min-w-0">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && canGenerate) {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
              placeholder="Descreva a reunião para a IA processar..."
              className={cn(
                "w-full h-full min-h-[120px] px-4 py-3 rounded-lg resize-none",
                "bg-[#1a1a1a] border border-white/5",
                "text-sm text-white placeholder:text-[#555]",
                "focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20",
                "transition-all duration-200"
              )}
            />
          </div>

          {/* Generate button - fills height */}
          <button
            onClick={handleGenerate}
            disabled={!canGenerate}
            className={cn(
              "flex flex-col items-center justify-center gap-2 px-6 rounded-lg transition-all duration-300 flex-shrink-0",
              "text-sm font-semibold",
              canGenerate
                ? "bg-gradient-to-br from-[#7c3aed] to-[#6366f1] text-white hover:from-[#6d28d9] hover:to-[#4f46e5] shadow-lg shadow-purple-500/25"
                : "bg-white/5 text-[#555] cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Sparkles className={cn("w-5 h-5", canGenerate && "animate-pulse")} />
            )}
            <span>Gerar</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
