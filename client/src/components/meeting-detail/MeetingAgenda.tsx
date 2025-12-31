import { useState, useEffect, useCallback, useRef } from "react";
import { ClipboardList, ChevronRight, Plus, Trash2, GripVertical, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { EditableSectionTitle } from "./EditableSectionTitle";
import type { MeetingAgendaItem, MeetingAgendaSubitem } from "@/types/meeting";

interface MeetingAgendaProps {
  agenda: MeetingAgendaItem[];
  onUpdate?: (agenda: MeetingAgendaItem[]) => void;
}

export function MeetingAgenda({ agenda, onUpdate }: MeetingAgendaProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(
    new Set(agenda.length > 0 ? [agenda[0].id] : [])
  );
  const [editableAgenda, setEditableAgenda] = useState<MeetingAgendaItem[]>(agenda);

  // Reset editable agenda when prop changes
  useEffect(() => {
    if (!isEditing) {
      setEditableAgenda(agenda);
    }
  }, [agenda, isEditing]);

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

  const handleStartEditing = () => {
    setEditableAgenda(agenda);
    setIsEditing(true);
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
    setExpandedItems(prev => new Set(Array.from(prev).concat(newItem.id)));
  };

  // Update agenda item
  const updateAgendaItem = (id: string, updates: Partial<MeetingAgendaItem>) => {
    setEditableAgenda(prev =>
      prev.map(item => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  // Remove agenda item
  const removeAgendaItem = (id: string) => {
    setEditableAgenda(prev => {
      const filtered = prev.filter(item => item.id !== id);
      // Renumber items
      return filtered.map((item, index) => ({
        ...item,
        number: index + 1,
      }));
    });
  };

  // Add subitem
  const addSubitem = (agendaId: string) => {
    setEditableAgenda(prev =>
      prev.map(item => {
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
      })
    );
  };

  // Update subitem
  const updateSubitem = (
    agendaId: string,
    subitemId: string,
    updates: Partial<MeetingAgendaSubitem>
  ) => {
    setEditableAgenda(prev =>
      prev.map(item => {
        if (item.id === agendaId) {
          return {
            ...item,
            subitems: item.subitems.map(sub =>
              sub.id === subitemId ? { ...sub, ...updates } : sub
            ),
          };
        }
        return item;
      })
    );
  };

  // Remove subitem
  const removeSubitem = (agendaId: string, subitemId: string) => {
    setEditableAgenda(prev =>
      prev.map(item => {
        if (item.id === agendaId) {
          return {
            ...item,
            subitems: item.subitems.filter(sub => sub.id !== subitemId),
          };
        }
        return item;
      })
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
    <div ref={sectionRef} className="space-y-4">
      <div className="flex items-center justify-between">
        <EditableSectionTitle
          icon={<ClipboardList className="w-[18px] h-[18px]" />}
          title="Pauta da Reunião"
          isEditing={isEditing}
          onEditClick={handleStartEditing}
        />
        {isEditing && (
          <div className="flex items-center gap-3">
            {/* Botão Check para salvar */}
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center justify-center w-8 h-8 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500/50 transition-all duration-200 group/check"
              title="Salvar alterações"
            >
              <Check className="w-4 h-4 text-emerald-500 group-hover/check:scale-110 transition-transform" />
            </button>
            
            {/* Botão Adicionar */}
            <button
              onClick={addAgendaItem}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1c3847] border border-[#2eaadc] rounded-md text-[#2eaadc] text-[0.8125rem] font-medium hover:bg-[#234a5c] transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Adicionar Item
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1">
        {displayAgenda.map((item) => {
          const isExpanded = expandedItems.has(item.id);
          return (
            <div 
              key={item.id}
              className={cn(
                "bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg overflow-hidden",
                isEditing && "border-[#333333]"
              )}
            >
              <div 
                className={cn(
                  "flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-[#202020] transition-colors",
                  isEditing && "cursor-default"
                )}
                onClick={() => !isEditing && toggleItem(item.id)}
              >
                {isEditing && (
                  <GripVertical className="w-4 h-4 text-[#555] cursor-grab" />
                )}
                <div className="w-6 h-6 bg-[#252730] border border-[#363842] rounded-md flex items-center justify-center text-xs font-semibold text-[#8c8c8c] flex-shrink-0">
                  {item.number}
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => updateAgendaItem(item.id, { title: e.target.value })}
                    placeholder="Título do item da pauta..."
                    className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-[#ededed] placeholder:text-[#555]"
                  />
                ) : (
                  <span className="flex-1 text-sm font-medium text-[#ededed]">
                    {item.title}
                  </span>
                )}
                {isEditing ? (
                  <select
                    value={item.status}
                    onChange={(e) =>
                      updateAgendaItem(item.id, {
                        status: e.target.value as "discussed" | "action_pending",
                      })
                    }
                    className="bg-[#252730] border border-[#363842] rounded-md px-2 py-1 text-xs text-[#8c8c8c] outline-none"
                  >
                    <option value="discussed">Discutido</option>
                    <option value="action_pending">Ação Pendente</option>
                  </select>
                ) : (
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
                )}
                {isEditing ? (
                  <button
                    onClick={() => removeAgendaItem(item.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-md text-[#666] hover:text-red-500 hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                ) : (
                  <ChevronRight 
                    className={cn(
                      "w-4 h-4 text-[#8c8c8c] transition-transform",
                      isExpanded && "rotate-90"
                    )} 
                  />
                )}
                {isEditing && (
                  <button
                    onClick={() => toggleItem(item.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-md text-[#666] hover:text-white hover:bg-white/10 transition-all"
                  >
                    <ChevronRight 
                      className={cn(
                        "w-4 h-4 transition-transform",
                        isExpanded && "rotate-90"
                      )} 
                    />
                  </button>
                )}
              </div>

              {isExpanded && (
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
                      {isEditing ? (
                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            value={subitem.title}
                            onChange={(e) =>
                              updateSubitem(item.id, subitem.id, { title: e.target.value })
                            }
                            placeholder="Título do sub-item..."
                            className="w-full bg-transparent border-none outline-none text-[0.8125rem] text-[#ededed] placeholder:text-[#555]"
                          />
                          <textarea
                            value={subitem.description}
                            onChange={(e) =>
                              updateSubitem(item.id, subitem.id, {
                                description: e.target.value,
                              })
                            }
                            placeholder="Descrição..."
                            rows={2}
                            className="w-full bg-[#1f1f1f] border border-[#2a2a2a] rounded-md px-3 py-2 text-xs text-[#8c8c8c] placeholder:text-[#555] outline-none resize-none"
                          />
                        </div>
                      ) : (
                        <div className="flex-1">
                          <div className="text-[0.8125rem] text-[#ededed] mb-1">
                            {subitem.title}
                          </div>
                          <div className="text-xs text-[#8c8c8c] leading-[1.5]">
                            {subitem.description}
                          </div>
                        </div>
                      )}
                      {isEditing && (
                        <button
                          onClick={() => removeSubitem(item.id, subitem.id)}
                          className="w-6 h-6 flex items-center justify-center rounded-md text-[#666] hover:text-red-500 hover:bg-red-500/10 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                  {isEditing && (
                    <button
                      onClick={() => addSubitem(item.id)}
                      className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-transparent border border-dashed border-[#333333] rounded-md text-[#555555] text-xs hover:bg-[#1a1a1a] hover:border-[#555555] hover:text-[#888888] transition-all"
                    >
                      <Plus className="w-3 h-3" />
                      Adicionar sub-item
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
