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
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-4 h-4 text-orange-500" />
        <h2 className="text-base font-semibold text-foreground">Peculiaridades</h2>
      </div>

      {/* Card */}
      <div className="bg-[#1a1a1a] border border-[#333] rounded-lg overflow-hidden">
        {/* Inline add row — top of card */}
        {isAdding && (
          <div className="flex items-center gap-3 px-5 py-4 border-b border-[#333]">
            <CircleAlert className="w-[18px] h-[18px] text-muted-foreground shrink-0" />
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
              className="flex-1 bg-transparent text-sm text-foreground font-medium placeholder:text-muted-foreground focus:outline-none border-b border-[#2eaadc]"
            />
          </div>
        )}

        {/* Peculiarity rows */}
        {peculiarities.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between px-5 py-4 border-b border-[#333] hover:bg-[#202020] transition-colors group"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <CircleAlert className="w-[18px] h-[18px] text-amber-500 shrink-0" />
              <span className="text-gray-300 text-sm font-medium truncate">
                {item}
              </span>
            </div>
            <button
              onClick={() => onRemovePeculiarity(index)}
              className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
            >
              <X className="w-[18px] h-[18px]" />
            </button>
          </div>
        ))}

        {/* Toggle row */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#333]">
          <div className="flex flex-col gap-0.5">
            <span className="text-gray-200 text-sm font-medium">
              Desligar reunião mensal
            </span>
            <span className="text-gray-500 text-xs">
              Remove alertas de atraso e exclui dos filtros de reunião.
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={monthlyMeetingDisabled}
              onChange={(e) => onToggleMonthlyMeeting(e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#2eaadc]/30 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all border-gray-600 peer-checked:bg-[#2eaadc]" />
          </label>
        </div>

        {/* Footer — always visible */}
        <div className="px-5 py-3 bg-[#202020]/50">
          <button
            onClick={() => setIsAdding(true)}
            className="text-[#2eaadc] text-xs hover:text-sky-400 font-medium transition-colors"
          >
            + Nova peculiaridade
          </button>
        </div>
      </div>
    </div>
  );
}
