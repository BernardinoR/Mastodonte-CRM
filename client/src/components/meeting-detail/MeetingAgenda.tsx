import { useState } from "react";
import { ClipboardList, ChevronRight, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { MeetingAgendaItem } from "@/types/meeting";

interface MeetingAgendaProps {
  agenda: MeetingAgendaItem[];
}

export function MeetingAgenda({ agenda }: MeetingAgendaProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(
    new Set(agenda.length > 0 ? [agenda[0].id] : [])
  );

  const toggleItem = (id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <ClipboardList className="w-[18px] h-[18px] text-[#8c8c8c]" />
          <h2 className="text-sm font-semibold text-[#ededed]">Pauta da Reunião</h2>
        </div>
        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-transparent border border-dashed border-[#333333] rounded-md text-[#2eaadc] text-[0.8125rem] font-medium hover:bg-[#1c3847] hover:border-[#2eaadc] transition-all">
          <Plus className="w-3.5 h-3.5" />
          Adicionar
        </button>
      </div>

      <div className="flex flex-col gap-1">
        {agenda.map((item) => {
          const isExpanded = expandedItems.has(item.id);
          return (
            <div 
              key={item.id}
              className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg overflow-hidden"
            >
              <div 
                className="flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-[#202020] transition-colors"
                onClick={() => toggleItem(item.id)}
              >
                <div className="w-6 h-6 bg-[#252730] border border-[#363842] rounded-md flex items-center justify-center text-xs font-semibold text-[#8c8c8c] flex-shrink-0">
                  {item.number}
                </div>
                <span className="flex-1 text-sm font-medium text-[#ededed]">
                  {item.title}
                </span>
                <Badge 
                  className={cn(
                    "text-[0.6875rem]",
                    item.status === "discussed" 
                      ? "bg-[#203828] text-[#6ecf8e]" 
                      : "bg-[#243041] text-[#6db1d4]"
                  )}
                >
                  {item.status === "discussed" ? "Discutido" : "Ação Pendente"}
                </Badge>
                <ChevronRight 
                  className={cn(
                    "w-4 h-4 text-[#8c8c8c] transition-transform",
                    isExpanded && "rotate-90"
                  )} 
                />
              </div>

              {isExpanded && item.subitems.length > 0 && (
                <div className="px-4 pb-4 pl-[52px]">
                  {item.subitems.map((subitem, index) => (
                    <div 
                      key={subitem.id}
                      className={cn(
                        "flex items-start gap-2.5 py-2.5",
                        index !== item.subitems.length - 1 && "border-b border-[#2a2a2a]"
                      )}
                    >
                      <div className="w-1.5 h-1.5 bg-[#4281dc] rounded-full mt-[7px] flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-[0.8125rem] text-[#ededed] mb-1">
                          {subitem.title}
                        </div>
                        <div className="text-xs text-[#8c8c8c] leading-[1.5]">
                          {subitem.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

