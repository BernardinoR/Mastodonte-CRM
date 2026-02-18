import { useState } from "react";
import { Sparkles, FileText, ClipboardList, Zap, Loader2 } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";

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
    icon: <FileText className="h-4 w-4" />,
  },
  {
    id: "agenda",
    label: "Pauta",
    icon: <ClipboardList className="h-4 w-4" />,
  },
  {
    id: "decisions",
    label: "Decisões",
    icon: <Zap className="h-4 w-4" />,
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
    () => new Set<GenerateOption>(["summary", "agenda", "decisions"]),
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
            "flex h-8 items-center gap-2 rounded px-3 py-1.5 text-xs font-medium transition-colors",
            "border border-purple-500/50 bg-transparent",
            "hover:bg-purple-500/10",
            "text-purple-400",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
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
          "bg-[#101010]/98 backdrop-blur-xl",
          "rounded-xl border border-white/10",
          "shadow-2xl shadow-purple-500/10",
        )}
      >
        {/* Horizontal layout with vertical chips */}
        <div className="flex items-stretch gap-3 p-4">
          {/* Option chips - vertical stack */}
          <div className="flex flex-shrink-0 flex-col gap-2">
            {options.map((option) => {
              const isSelected = selectedOptions.has(option.id);
              return (
                <button
                  key={option.id}
                  onClick={() => toggleOption(option.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200",
                    isSelected
                      ? "border border-purple-500/60 bg-gradient-to-r from-[#7c3aed]/40 to-[#6366f1]/40 text-purple-200"
                      : "border border-white/10 bg-white/5 text-[#666] hover:border-white/20 hover:text-white",
                  )}
                >
                  <span
                    className={cn(
                      "transition-colors",
                      isSelected ? "text-purple-400" : "text-[#555]",
                    )}
                  >
                    {option.icon}
                  </span>
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>

          {/* Textarea - fills height of 3 chips */}
          <div className="min-w-0 flex-1">
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
                "h-full min-h-[120px] w-full resize-none rounded-lg px-4 py-3",
                "border border-white/5 bg-[#1a1a1a]",
                "text-sm text-white placeholder:text-[#555]",
                "focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/20",
                "transition-all duration-200",
              )}
            />
          </div>

          {/* Generate button - fills height */}
          <button
            onClick={handleGenerate}
            disabled={!canGenerate}
            className={cn(
              "flex flex-shrink-0 flex-col items-center justify-center gap-2 rounded-lg px-6 transition-all duration-300",
              "text-sm font-semibold",
              canGenerate
                ? "bg-gradient-to-br from-[#7c3aed] to-[#6366f1] text-white shadow-lg shadow-purple-500/25 hover:from-[#6d28d9] hover:to-[#4f46e5]"
                : "cursor-not-allowed bg-white/5 text-[#555]",
            )}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Sparkles className={cn("h-5 w-5", canGenerate && "animate-pulse")} />
            )}
            <span>Gerar</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
