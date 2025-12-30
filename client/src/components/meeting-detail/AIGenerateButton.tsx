import { useState } from "react";
import { Sparkles, FileText, ClipboardList, Zap, Loader2, X } from "lucide-react";
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
  shortLabel: string;
  icon: React.ReactNode;
}

const options: OptionChip[] = [
  {
    id: "summary",
    label: "Resumo",
    shortLabel: "Resumo",
    icon: <FileText className="w-3.5 h-3.5" />,
  },
  {
    id: "agenda",
    label: "Pauta",
    shortLabel: "Pauta",
    icon: <ClipboardList className="w-3.5 h-3.5" />,
  },
  {
    id: "decisions",
    label: "Decisões",
    shortLabel: "Decisões",
    icon: <Zap className="w-3.5 h-3.5" />,
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
    new Set(["summary", "agenda", "decisions"])
  );

  const toggleOption = (option: GenerateOption) => {
    setSelectedOptions((prev) => {
      const next = new Set(prev);
      if (next.has(option)) {
        // Don't allow deselecting all
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
          "w-auto min-w-[680px] max-w-[800px] p-0",
          "bg-[#0d0d0d]/98 backdrop-blur-xl",
          "border border-white/10 rounded-xl",
          "shadow-2xl shadow-purple-500/10"
        )}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#7c3aed] to-[#6366f1] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-base font-semibold text-white">Gerar com IA</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-md flex items-center justify-center text-[#666] hover:text-white hover:bg-white/10 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Reorganized layout: chips on left, input and button on right */}
          <div className="flex items-start gap-6">
            {/* Options chips - Left aligned */}
            <div className="flex flex-col gap-3 min-w-[140px]">
              <span className="text-sm font-medium text-[#888] mb-1">O que gerar:</span>
              {options.map((option) => {
                const isSelected = selectedOptions.has(option.id);
                return (
                  <button
                    key={option.id}
                    onClick={() => toggleOption(option.id)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 text-left",
                      isSelected
                        ? "bg-gradient-to-r from-[#7c3aed]/30 to-[#6366f1]/30 border border-purple-500/50 text-purple-300"
                        : "bg-white/5 border border-white/10 text-[#888] hover:border-white/20 hover:text-white"
                    )}
                  >
                    <div className={cn(
                      "transition-colors",
                      isSelected ? "text-purple-400" : "text-[#666]"
                    )}>
                      {option.icon}
                    </div>
                    <span className="flex-1">{option.shortLabel}</span>
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-purple-400" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Input and Generate button - Right side */}
            <div className="flex-1 flex flex-col gap-4">
              {/* Input area */}
              <div className="relative">
                <label className="block text-sm font-medium text-[#888] mb-2">
                  Descreva a reunião para a IA processar:
                </label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ex: Reunião com Márcia sobre situação financeira da empresa, dificuldades de caixa, viagens planejadas para janeiro..."
                  className={cn(
                    "w-full h-[120px] px-4 py-3 rounded-lg resize-none",
                    "bg-[#1a1a1a]/80 border border-white/5",
                    "text-base text-white placeholder:text-[#555]",
                    "focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20",
                    "transition-all duration-200"
                  )}
                />
                <div className="absolute bottom-3 right-3 text-xs text-[#555]">
                  {inputText.length} caracteres
                </div>
              </div>

              {/* Generate button */}
              <div className="flex justify-end">
                <button
                  onClick={handleGenerate}
                  disabled={!canGenerate}
                  className={cn(
                    "px-6 py-3 rounded-lg flex items-center gap-2 transition-all duration-300",
                    "text-base font-semibold",
                    canGenerate
                      ? "bg-gradient-to-br from-[#7c3aed] to-[#6366f1] text-white hover:from-[#6d28d9] hover:to-[#4f46e5] shadow-lg shadow-purple-500/30"
                      : "bg-white/5 text-[#555] cursor-not-allowed"
                  )}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Gerando...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className={cn(
                        "w-5 h-5",
                        canGenerate && "animate-pulse"
                      )} />
                      <span>Gerar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Selected info */}
          <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
            <span className="text-xs text-[#666]">
              {selectedOptions.size === 3
                ? "Gerando tudo"
                : `Gerando: ${Array.from(selectedOptions)
                    .map((o) => options.find((opt) => opt.id === o)?.shortLabel)
                    .join(", ")}`}
            </span>
            <button
              onClick={() => setSelectedOptions(new Set(["summary", "agenda", "decisions"]))}
              className="text-xs text-purple-400 hover:text-purple-300 transition-colors font-medium"
            >
              Selecionar tudo
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

