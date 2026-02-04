import { useState, useRef, useEffect } from "react";
import { AlertTriangle, X, CircleAlert } from "lucide-react";

interface ClientPeculiaritiesProps {
  peculiarities: string[];
  monthlyMeetingDisabled: boolean;
  onAddPeculiarity: (text: string) => void;
  onRemovePeculiarity: (index: number) => void;
  onToggleMonthlyMeeting: (disabled: boolean) => void;
}

export function ClientPeculiarities({
  peculiarities,
  monthlyMeetingDisabled,
  onAddPeculiarity,
  onRemovePeculiarity,
  onToggleMonthlyMeeting,
}: ClientPeculiaritiesProps) {
  const [newItem, setNewItem] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  const handleAdd = () => {
    const trimmed = newItem.trim();
    if (!trimmed) return;
    onAddPeculiarity(trimmed);
    setNewItem("");
    setIsAdding(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
    if (e.key === "Escape") {
      setNewItem("");
      setIsAdding(false);
    }
  };

  return (
    <div>
      {/* Header - outside the card */}
      <div className="mb-4 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-orange-500" />
        <h2 className="text-base font-semibold text-foreground">Peculiaridades</h2>
      </div>

      {/* Card */}
      <div className="overflow-hidden rounded-lg border border-[#3a3a3a] bg-[#1a1a1a]">
        {/* Inline add row — top of card */}
        {isAdding && (
          <div className="flex items-center gap-3 border-b border-[#3a3a3a] px-5 py-4">
            <CircleAlert className="h-[18px] w-[18px] shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => {
                if (!newItem.trim()) {
                  setNewItem("");
                  setIsAdding(false);
                }
              }}
              placeholder="Nova peculiaridade..."
              className="flex-1 border-b border-[#2eaadc] bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
        )}

        {/* Peculiarity rows */}
        {peculiarities.map((item, index) => (
          <div
            key={index}
            className="group flex items-center justify-between border-b border-[#3a3a3a] px-5 py-4 transition-colors hover:bg-[#222222]"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <CircleAlert className="h-[18px] w-[18px] shrink-0 text-amber-500" />
              <span className="truncate text-sm font-medium text-gray-300">{item}</span>
            </div>
            <button
              onClick={() => onRemovePeculiarity(index)}
              className="p-1 text-gray-500 opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
            >
              <X className="h-[18px] w-[18px]" />
            </button>
          </div>
        ))}

        {/* Toggle row */}
        <div className="flex items-center justify-between border-b border-[#3a3a3a] px-5 py-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-gray-200">Desligar reunião mensal</span>
            <span className="text-xs text-gray-500">
              Remove alertas de atraso e exclui dos filtros de reunião.
            </span>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={monthlyMeetingDisabled}
              onChange={(e) => onToggleMonthlyMeeting(e.target.checked)}
            />
            <div className="peer h-6 w-11 rounded-full border-gray-600 bg-gray-700 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#2eaadc] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#2eaadc]/30" />
          </label>
        </div>

        {/* Footer — always visible */}
        <div className="bg-[#222222]/50 px-5 py-3">
          <button
            onClick={() => setIsAdding(true)}
            className="text-xs font-medium text-[#2eaadc] transition-colors hover:text-sky-400"
          >
            + Nova peculiaridade
          </button>
        </div>
      </div>
    </div>
  );
}
