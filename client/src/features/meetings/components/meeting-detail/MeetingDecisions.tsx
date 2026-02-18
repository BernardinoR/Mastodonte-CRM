import { useState, useEffect, useCallback, useRef } from "react";
import { Zap, AlertTriangle, Plus, Trash2, Check } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { EditableSectionTitle } from "./EditableSectionTitle";
import type { MeetingDecision } from "@features/meetings/types/meeting";

interface MeetingDecisionsProps {
  decisions: MeetingDecision[];
  onUpdate?: (decisions: MeetingDecision[]) => void;
}

export function MeetingDecisions({ decisions, onUpdate }: MeetingDecisionsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editableDecisions, setEditableDecisions] = useState<MeetingDecision[]>(decisions);

  // Reset editable decisions when prop changes
  useEffect(() => {
    if (!isEditing) {
      setEditableDecisions(decisions);
    }
  }, [decisions, isEditing]);

  const handleStartEditing = () => {
    setEditableDecisions(decisions);
    setIsEditing(true);
  };

  const handleSave = useCallback(() => {
    if (onUpdate) {
      onUpdate(editableDecisions);
    }
    setIsEditing(false);
  }, [editableDecisions, onUpdate]);

  // Add new decision
  const addDecision = () => {
    const newDecision: MeetingDecision = {
      id: crypto.randomUUID(),
      content: "",
      type: "normal",
    };
    setEditableDecisions([...editableDecisions, newDecision]);
  };

  // Update decision
  const updateDecision = (id: string, updates: Partial<MeetingDecision>) => {
    setEditableDecisions((prev) =>
      prev.map((decision) => (decision.id === id ? { ...decision, ...updates } : decision)),
    );
  };

  // Remove decision
  const removeDecision = (id: string) => {
    setEditableDecisions((prev) => prev.filter((decision) => decision.id !== id));
  };

  // Apply AI-generated data
  const applyAIData = (data: MeetingDecision[]) => {
    setEditableDecisions(data);
    setIsEditing(true);
  };

  // Expose applyAIData method
  useEffect(() => {
    (window as any).__applyDecisionsAIData = applyAIData;
    return () => {
      delete (window as any).__applyDecisionsAIData;
    };
  }, []);

  const displayDecisions = isEditing ? editableDecisions : decisions;

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

  if (displayDecisions.length === 0 && !isEditing) return null;

  // Helper to extract title and description from content
  const extractTitleDesc = (decision: MeetingDecision) => {
    if (decision.title) {
      return { title: decision.title, description: decision.content };
    }
    // Extract first sentence as title
    const content = decision.content.replace(/<[^>]*>/g, ""); // strip HTML
    const match = content.match(/^([^.!?]+[.!?]?)\s*(.*)/s);
    if (match && match[2]) {
      return { title: match[1].trim(), description: match[2].trim() };
    }
    return { title: content, description: "" };
  };

  return (
    <div ref={sectionRef} className="space-y-3">
      <div className="flex items-center justify-between">
        {isEditing ? (
          <EditableSectionTitle
            icon={<Zap className="h-[18px] w-[18px]" />}
            title="Decisoes e Pontos de Atencao"
            isEditing={isEditing}
            onEditClick={handleStartEditing}
            iconClassName="text-primary"
          />
        ) : (
          <h3
            className="flex cursor-pointer items-center gap-2 text-sm font-bold text-white"
            onClick={handleStartEditing}
          >
            <Zap className="h-[18px] w-[18px] text-primary" />
            Decisoes e Pontos de Atencao
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
              onClick={addDecision}
              className="inline-flex items-center gap-1.5 rounded-md border border-purple-500/50 bg-purple-500/10 px-3 py-1.5 text-[0.8125rem] font-medium text-purple-400 transition-all hover:bg-purple-500/20"
            >
              <Plus className="h-3.5 w-3.5" />
              Adicionar
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {displayDecisions.map((decision) => {
          const isWarning = decision.type === "warning";

          if (isEditing) {
            return (
              <div
                key={decision.id}
                className="flex items-stretch overflow-hidden rounded-lg border border-[#262626] bg-[#161616]"
              >
                <div
                  className={cn("w-1 flex-shrink-0", isWarning ? "bg-orange-500" : "bg-purple-500")}
                />
                <div className="flex w-full items-center gap-3 p-3">
                  <button
                    onClick={() =>
                      updateDecision(decision.id, {
                        type: isWarning ? "normal" : "warning",
                      })
                    }
                    className="flex-shrink-0"
                    title={isWarning ? "Mudar para normal" : "Marcar como atencao"}
                  >
                    <div
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-full border",
                        isWarning
                          ? "border-orange-500/50 bg-orange-500/10"
                          : "border-purple-500/50 bg-purple-500/10",
                      )}
                    >
                      {isWarning ? (
                        <AlertTriangle className="h-4 w-4 text-orange-400" />
                      ) : (
                        <Check className="h-3.5 w-3.5 text-purple-400" />
                      )}
                    </div>
                  </button>
                  <textarea
                    value={decision.content}
                    onChange={(e) => updateDecision(decision.id, { content: e.target.value })}
                    placeholder="Descreva a decisao ou ponto de atencao..."
                    rows={2}
                    className="flex-1 resize-none border-none bg-transparent text-sm leading-[1.5] text-white outline-none placeholder:text-[#555]"
                  />
                  <button
                    onClick={() => removeDecision(decision.id)}
                    className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md text-[#666] transition-all hover:bg-red-500/10 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          }

          // View mode
          const { title, description } = extractTitleDesc(decision);

          return (
            <div
              key={decision.id}
              className="flex items-stretch overflow-hidden rounded-lg border border-[#262626] bg-[#161616]"
            >
              <div
                className={cn("w-1 flex-shrink-0", isWarning ? "bg-orange-500" : "bg-purple-500")}
              />
              <div className="flex w-full items-center gap-3 p-3">
                <div
                  className={cn(
                    "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border",
                    isWarning
                      ? "border-orange-500/50 bg-orange-500/10"
                      : "border-purple-500/50 bg-purple-500/10",
                  )}
                >
                  {isWarning ? (
                    <AlertTriangle className="h-4 w-4 text-orange-400" />
                  ) : (
                    <Check className="h-3.5 w-3.5 text-purple-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-white">{title}</div>
                  {description && <div className="mt-0.5 text-xs text-gray-400">{description}</div>}
                </div>
              </div>
            </div>
          );
        })}

        {isEditing && editableDecisions.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-[#262626] bg-[#161616] p-8">
            <Zap className="h-8 w-8 text-[#555]" />
            <p className="text-sm text-[#666]">Nenhuma decisao adicionada</p>
            <button
              onClick={addDecision}
              className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-purple-500/10 px-4 py-2 text-sm font-medium text-purple-400 transition-all hover:bg-purple-500/20"
            >
              <Plus className="h-4 w-4" />
              Adicionar Decisao
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
