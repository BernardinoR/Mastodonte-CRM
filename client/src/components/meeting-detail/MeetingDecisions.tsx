import { useState, useEffect } from "react";
import { Zap, CheckCircle2, AlertTriangle, Plus, Trash2, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { EditableSectionTitle } from "./EditableSectionTitle";
import type { MeetingDecision } from "@/types/meeting";

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

  const handleCancel = () => {
    setEditableDecisions(decisions);
    setIsEditing(false);
  };

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(editableDecisions);
    }
    setIsEditing(false);
  };

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
    setEditableDecisions(prev =>
      prev.map(decision => (decision.id === id ? { ...decision, ...updates } : decision))
    );
  };

  // Remove decision
  const removeDecision = (id: string) => {
    setEditableDecisions(prev => prev.filter(decision => decision.id !== id));
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

  if (displayDecisions.length === 0 && !isEditing) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <EditableSectionTitle
          icon={<Zap className="w-[18px] h-[18px]" />}
          title="Decisões e Pontos de Atenção"
          isEditing={isEditing}
          onEditClick={handleStartEditing}
          iconClassName="text-[#a78bfa]"
        />
        {isEditing && (
          <button
            onClick={addDecision}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2d2640] border border-[#a78bfa] rounded-md text-[#a78bfa] text-[0.8125rem] font-medium hover:bg-[#3d3650] transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Adicionar
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {displayDecisions.map((decision) => (
          <div 
            key={decision.id}
            className={cn(
              "flex items-start gap-3 p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg",
              decision.type === "warning" 
                ? "border-l-[3px] border-l-[#f59e0b]" 
                : "border-l-[3px] border-l-[#a78bfa]"
            )}
          >
            {isEditing ? (
              <>
                <button
                  onClick={() =>
                    updateDecision(decision.id, {
                      type: decision.type === "warning" ? "normal" : "warning",
                    })
                  }
                  className="flex-shrink-0 mt-0.5"
                  title={decision.type === "warning" ? "Mudar para normal" : "Marcar como atenção"}
                >
                  {decision.type === "warning" ? (
                    <AlertTriangle className="w-[18px] h-[18px] text-[#f59e0b]" />
                  ) : (
                    <CheckCircle2 className="w-[18px] h-[18px] text-[#a78bfa]" />
                  )}
                </button>
                <textarea
                  value={decision.content}
                  onChange={(e) => updateDecision(decision.id, { content: e.target.value })}
                  placeholder="Descreva a decisão ou ponto de atenção..."
                  rows={2}
                  className="flex-1 bg-transparent border-none outline-none text-sm text-[#ededed] placeholder:text-[#555] resize-none leading-[1.5]"
                />
                <button
                  onClick={() => removeDecision(decision.id)}
                  className="w-7 h-7 flex items-center justify-center rounded-md text-[#666] hover:text-red-500 hover:bg-red-500/10 transition-all flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                {decision.type === "warning" ? (
                  <AlertTriangle className="w-[18px] h-[18px] text-[#f59e0b] flex-shrink-0" />
                ) : (
                  <CheckCircle2 className="w-[18px] h-[18px] text-[#a78bfa] flex-shrink-0" />
                )}
                <p 
                  className="text-sm text-[#ededed] leading-[1.5]"
                  dangerouslySetInnerHTML={{ __html: decision.content }}
                />
              </>
            )}
          </div>
        ))}

        {isEditing && editableDecisions.length === 0 && (
          <div className="p-8 bg-[#1a1a1a] border border-dashed border-[#333333] rounded-lg flex flex-col items-center justify-center gap-2">
            <Zap className="w-8 h-8 text-[#555]" />
            <p className="text-sm text-[#666]">Nenhuma decisão adicionada</p>
            <button
              onClick={addDecision}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-[#2d2640] rounded-md text-[#a78bfa] text-sm font-medium hover:bg-[#3d3650] transition-all"
            >
              <Plus className="w-4 h-4" />
              Adicionar Decisão
            </button>
          </div>
        )}
      </div>

      {/* Save/Cancel buttons */}
      {isEditing && (
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#252730] border border-[#363842] rounded-lg text-[#ededed] text-sm font-medium hover:bg-[#2a2d38] hover:border-[#4a4f5c] transition-all"
          >
            <X className="w-4 h-4" />
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#10b981] border-none rounded-lg text-white text-sm font-medium hover:bg-[#059669] transition-all"
          >
            <Check className="w-4 h-4" />
            Salvar Decisões
          </button>
        </div>
      )}
    </div>
  );
}
