import { useState } from "react";
import { AlertTriangle, Plus, X, CircleAlert } from "lucide-react";
import { Switch } from "@/shared/components/ui/switch";

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

  const handleAdd = () => {
    const trimmed = newItem.trim();
    if (!trimmed) return;
    onAddPeculiarity(trimmed);
    setNewItem("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="bg-[#1a1a1a] rounded-xl shadow-2xl overflow-hidden border border-[#333333] flex flex-col">
      {/* Header */}
      <div className="px-6 py-5 border-b border-[#333333] flex items-center gap-3 bg-[#1e1e1e]">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-500/10 text-orange-500 shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">Peculiaridades</h2>
      </div>

      {/* Content */}
      <div className="p-8 flex flex-col gap-6">
        {peculiarities.length > 0 && (
          <ul className="flex flex-col gap-3">
            {peculiarities.map((item, index) => (
              <li
                key={index}
                className="group flex items-center justify-between p-4 rounded-lg bg-[#252525] border border-transparent hover:border-[#333333] transition-all duration-200"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <CircleAlert className="w-5 h-5 text-amber-500 shrink-0 fill-amber-500 stroke-[#252525]" />
                  <span className="text-gray-200 text-sm font-medium">{item}</span>
                </div>
                <button
                  onClick={() => onRemovePeculiarity(index)}
                  className="text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-[#333333] flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Input row */}
        <div className="flex items-center gap-3">
          <input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Adicionar nova peculiaridade..."
            className="flex-1 bg-[#252525] text-white placeholder-gray-500 border border-[#404040] rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2eaadc]/50 focus:border-[#2eaadc] transition-all shadow-sm"
          />
          <button
            onClick={handleAdd}
            disabled={!newItem.trim()}
            className="bg-[#2eaadc] hover:bg-sky-500 disabled:opacity-40 disabled:cursor-not-allowed text-[#121617] text-sm font-bold py-3 px-6 rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-[#2eaadc]/20 shrink-0"
          >
            <Plus className="w-[18px] h-[18px]" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px w-full bg-[#333333]" />

      {/* Footer toggle */}
      <div className="px-8 py-6 flex items-center justify-between bg-[#1e1e1e]">
        <div className="flex flex-col gap-1">
          <span className="text-white text-sm font-semibold">Desligar reunião mensal</span>
          <span className="text-gray-400 text-xs">Remove alertas de atraso e exclui dos filtros de reunião.</span>
        </div>
        <Switch
          checked={monthlyMeetingDisabled}
          onCheckedChange={onToggleMonthlyMeeting}
        />
      </div>
    </div>
  );
}
