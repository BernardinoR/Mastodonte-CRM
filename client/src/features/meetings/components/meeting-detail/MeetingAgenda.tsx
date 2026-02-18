import { useState, useEffect, useCallback, useRef } from "react";
import { ClipboardList, ChevronRight, Plus, Trash2, GripVertical, Check, MessageSquare, ListChecks, FileText } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { EditableSectionTitle } from "./EditableSectionTitle";
import type { MeetingAgendaItem, MeetingAgendaSubitem } from "@features/meetings/types/meeting";

interface MeetingAgendaProps {
  agenda: MeetingAgendaItem[];
  onUpdate?: (agenda: MeetingAgendaItem[]) => void;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  discussed: {
    label: "Discutido",
    className: "bg-[#064e3b]/30 text-emerald-400",
  },
  action_pending: {
    label: "Acao Pendente",
    className: "bg-[#1e293b] text-blue-300",
  },
};

// Icons for agenda items based on index
const agendaIcons = [MessageSquare, ListChecks, FileText, ClipboardList];

export function MeetingAgenda({ agenda, onUpdate }: MeetingAgendaProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [editableAgenda, setEditableAgenda] = useState<MeetingAgendaItem[]>(agenda);

  // Reset editable agenda when prop changes
  useEffect(() => {
    if (!isEditing) {
      setEditableAgenda(agenda);
    }
  }, [agenda, isEditing]);

  const toggleItem = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleStartEditing = () => {
    setEditableAgenda(agenda);
    setIsEditing(true);
    // Expand all items in edit mode
    setExpandedItems(new Set(agenda.map((item) => item.id)));
  };

  const handleSave = useCallback(() => {
    if (onUpdate) {
      onUpdate(editableAgenda);
    }
    setIsEditing(false);
  }, [editableAgenda, onUpdate]);

  // Add new agenda item
  const addAgendaItem = () => {
    const newItem: MeetingAgendaItem = {
      id: crypto.randomUUID(),
      number: editableAgenda.length + 1,
      title: "",
      status: "discussed",
      subitems: [],
    };
    setEditableAgenda([...editableAgenda, newItem]);
    setExpandedItems((prev) => new Set(Array.from(prev).concat(newItem.id)));
  };

  // Update agenda item
  const updateAgendaItem = (id: string, updates: Partial<MeetingAgendaItem>) => {
    setEditableAgenda((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    );
  };

  // Remove agenda item
  const removeAgendaItem = (id: string) => {
    setEditableAgenda((prev) => {
      const filtered = prev.filter((item) => item.id !== id);
      return filtered.map((item, index) => ({
        ...item,
        number: index + 1,
      }));
    });
  };

  // Add subitem
  const addSubitem = (agendaId: string) => {
    setEditableAgenda((prev) =>
      prev.map((item) => {
        if (item.id === agendaId) {
          return {
            ...item,
            subitems: [
              ...item.subitems,
              {
                id: crypto.randomUUID(),
                title: "",
                description: "",
              },
            ],
          };
        }
        return item;
      }),
    );
  };

  // Update subitem
  const updateSubitem = (
    agendaId: string,
    subitemId: string,
    updates: Partial<MeetingAgendaSubitem>,
  ) => {
    setEditableAgenda((prev) =>
      prev.map((item) => {
        if (item.id === agendaId) {
          return {
            ...item,
            subitems: item.subitems.map((sub) =>
              sub.id === subitemId ? { ...sub, ...updates } : sub,
            ),
          };
        }
        return item;
      }),
    );
  };

  // Remove subitem
  const removeSubitem = (agendaId: string, subitemId: string) => {
    setEditableAgenda((prev) =>
      prev.map((item) => {
        if (item.id === agendaId) {
          return {
            ...item,
            subitems: item.subitems.filter((sub) => sub.id !== subitemId),
          };
        }
        return item;
      }),
    );
  };

  // Apply AI-generated data
  const applyAIData = (data: MeetingAgendaItem[]) => {
    setEditableAgenda(data);
    setIsEditing(true);
  };

  // Expose applyAIData method
  useEffect(() => {
    (window as any).__applyAgendaAIData = applyAIData;
    return () => {
      delete (window as any).__applyAgendaAIData;
    };
  }, []);

  const displayAgenda = isEditing ? editableAgenda : agenda;

  // Ref for click outside detection
  const sectionRef = useRef<HTMLDivElement>(null);

  // Auto-save when clicking outside
  useEffect(() => {
    if (!isEditing) return;

    const handleClickOutside = (e: MouseEvent) => {
      const modal = document.querySelector('[role="dialog"]');
      if (
        sectionRef.current &&
        !sectionRef.current.contains(e.target as Node) &&
        modal?.contains(e.target as Node)
      ) {
        handleSave();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isEditing, handleSave]);

  return (
    <div ref={sectionRef} className="space-y-3">
      <div className="flex items-center justify-between">
        {isEditing ? (
          <EditableSectionTitle
            icon={<ClipboardList className="h-[18px] w-[18px]" />}
            title="Pauta da Reuniao"
            isEditing={isEditing}
            onEditClick={handleStartEditing}
          />
        ) : (
          <h3
            className="flex cursor-pointer items-center gap-2 text-sm font-bold text-white"
            onClick={handleStartEditing}
          >
            <ClipboardList className="h-[18px] w-[18px] text-gray-400" />
            Pauta da Reuniao
          </h3>
        )}
        {isEditing && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSave}
              className="group/check flex h-8 w-8 items-center justify-center rounded-md border border-emerald-500/30 bg-emerald-500/10 transition-all duration-200 hover:border-emerald-500/50 hover:bg-emerald-500/20"
              title="Salvar alteracoes"
            >
              <Check className="h-4 w-4 text-emerald-500 transition-transform group-hover/check:scale-110" />
            </button>

            <button
              onClick={addAgendaItem}
              className="inline-flex items-center gap-1.5 rounded-md border border-[#2eaadc] bg-[#1c3847] px-3 py-1.5 text-[0.8125rem] font-medium text-[#2eaadc] transition-all hover:bg-[#234a5c]"
            >
              <Plus className="h-3.5 w-3.5" />
              Adicionar Item
            </button>
          </div>
        )}
      </div>

      {/* Timeline layout */}
      <div className="relative pl-2">
        {/* Vertical line */}
        {!isEditing && displayAgenda.length > 1 && (
          <div className="absolute left-[15px] top-4 bottom-4 w-px bg-[#333]" />
        )}

        <div className="flex flex-col gap-2">
          {displayAgenda.map((item, index) => {
            const isExpanded = expandedItems.has(item.id);
            const IconForItem = agendaIcons[index % agendaIcons.length];
            const status = statusConfig[item.status] || statusConfig.discussed;

            if (isEditing) {
              // Edit mode - keep similar to before but with new colors
              return (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-md border border-[#262626] bg-[#161616]"
                >
                  <div className="flex items-center gap-3 px-4 py-3">
                    <GripVertical className="h-4 w-4 cursor-grab text-[#555]" />
                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-[#333] bg-[#1c1c1c] text-xs font-semibold text-gray-500">
                      {item.number}
                    </div>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => updateAgendaItem(item.id, { title: e.target.value })}
                      placeholder="Titulo do item da pauta..."
                      className="flex-1 border-none bg-transparent text-xs font-semibold text-gray-200 outline-none placeholder:text-[#555]"
                    />
                    <select
                      value={item.status}
                      onChange={(e) =>
                        updateAgendaItem(item.id, {
                          status: e.target.value as "discussed" | "action_pending",
                        })
                      }
                      className="rounded-md border border-[#262626] bg-[#1c1c1c] px-2 py-1 text-[9px] font-medium text-gray-400 outline-none"
                    >
                      <option value="discussed">Discutido</option>
                      <option value="action_pending">Acao Pendente</option>
                    </select>
                    <button
                      onClick={() => removeAgendaItem(item.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-[#666] transition-all hover:bg-red-500/10 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => toggleItem(item.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-[#666] transition-all hover:bg-white/10 hover:text-white"
                    >
                      <ChevronRight
                        className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-90")}
                      />
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 pl-[52px]">
                      {item.subitems.map((subitem, subIndex) => (
                        <div
                          key={subitem.id}
                          className={cn(
                            "flex items-start gap-2.5 py-2.5",
                            subIndex !== item.subitems.length - 1 && "border-b border-[#262626]",
                          )}
                        >
                          <div className="mt-[7px] h-1 w-1 flex-shrink-0 rounded-full bg-[#2eaadc]" />
                          <div className="flex-1 space-y-2">
                            <input
                              type="text"
                              value={subitem.title}
                              onChange={(e) =>
                                updateSubitem(item.id, subitem.id, { title: e.target.value })
                              }
                              placeholder="Titulo do sub-item..."
                              className="w-full border-none bg-transparent text-xs text-gray-200 outline-none placeholder:text-[#555]"
                            />
                            <textarea
                              value={subitem.description}
                              onChange={(e) =>
                                updateSubitem(item.id, subitem.id, {
                                  description: e.target.value,
                                })
                              }
                              placeholder="Descricao..."
                              rows={2}
                              className="w-full resize-none rounded-md border border-[#262626] bg-[#1c1c1c] px-3 py-2 text-xs text-gray-500 outline-none placeholder:text-[#555]"
                            />
                          </div>
                          <button
                            onClick={() => removeSubitem(item.id, subitem.id)}
                            className="flex h-6 w-6 items-center justify-center rounded-md text-[#666] transition-all hover:bg-red-500/10 hover:text-red-500"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => addSubitem(item.id)}
                        className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-dashed border-[#262626] bg-transparent px-3 py-1.5 text-xs text-[#555555] transition-all hover:border-[#555555] hover:bg-[#1c1c1c] hover:text-gray-400"
                      >
                        <Plus className="h-3 w-3" />
                        Adicionar sub-item
                      </button>
                    </div>
                  )}
                </div>
              );
            }

            // View mode - timeline layout
            return (
              <div key={item.id} className="relative flex gap-3">
                {/* Timeline icon */}
                <div className="relative z-10 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-[#333] bg-[#1c1c1c]">
                  <IconForItem className="h-3.5 w-3.5 text-gray-500" />
                </div>

                {/* Card */}
                <div
                  className="flex-1 cursor-pointer rounded-md border border-[#262626] bg-[#161616] p-3 transition-colors hover:bg-[#1a1a1a]"
                  onClick={() => toggleItem(item.id)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-gray-200">
                      {item.number}. {item.title}
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex rounded px-2 py-0.5 text-[9px] font-medium",
                          status.className,
                        )}
                      >
                        {status.label}
                      </span>
                      <ChevronRight
                        className={cn(
                          "h-3.5 w-3.5 text-gray-500 transition-transform",
                          isExpanded && "rotate-90",
                        )}
                      />
                    </div>
                  </div>

                  {isExpanded && item.subitems.length > 0 && (
                    <div className="mt-3 space-y-2 border-t border-[#262626] pt-3">
                      {item.subitems.map((subitem) => (
                        <div key={subitem.id} className="flex items-start gap-2">
                          <div className="mt-[6px] h-1 w-1 flex-shrink-0 rounded-full bg-[#2eaadc]" />
                          <span className="text-xs text-gray-500">{subitem.title}{subitem.description ? ` - ${subitem.description}` : ""}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
