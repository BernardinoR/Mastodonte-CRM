import { useState, useRef, useCallback, useEffect } from "react";
import { FileText, User, AlertCircle, Home, Plane, CreditCard, Building, AlertTriangle, Truck, Briefcase, Heart, Star, Target, Check, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { EditableSectionTitle } from "./EditableSectionTitle";
import { ContextSectionEditor, type ContextCardData } from "./ContextCardEditor";
import { TagEditorModal, TagDisplay, type TagData, type TagType } from "./TagEditorModal";
import type { IconName } from "./IconPicker";
import type { MeetingClientContext, MeetingHighlight } from "@/types/meeting";

interface MeetingSummaryProps {
  summary: string;
  clientName: string;
  clientContext: MeetingClientContext;
  highlights: MeetingHighlight[];
  onUpdate?: (data: {
    summary: string;
    clientContext: MeetingClientContext;
    highlights: MeetingHighlight[];
  }) => void;
}

const iconMap: Record<string, React.ElementType> = {
  "alert-circle": AlertCircle,
  "home": Home,
  "plane": Plane,
  "credit-card": CreditCard,
  "building": Building,
  "alert-triangle": AlertTriangle,
  "truck": Truck,
  "briefcase": Briefcase,
  "heart": Heart,
  "star": Star,
  "target": Target,
};

export function MeetingSummary({ 
  summary, 
  clientName, 
  clientContext, 
  highlights,
  onUpdate,
}: MeetingSummaryProps) {
  const [isEditing, setIsEditing] = useState(false);
  
  // Editor state
  const [summaryHtml, setSummaryHtml] = useState(summary);
  const editorRef = useRef<HTMLDivElement>(null);

  // Context section state
  const [showContext, setShowContext] = useState(clientContext.points.length > 0);
  const [contextClientName, setContextClientName] = useState(clientName);
  const [contextCards, setContextCards] = useState<ContextCardData[]>(() => {
    if (clientContext?.points) {
      return clientContext.points.map((p) => ({
        id: p.id || crypto.randomUUID(),
        icon: p.icon as IconName,
        text: p.text,
      }));
    }
    return [];
  });

  // Tags state
  const [tags, setTags] = useState<TagData[]>(() => {
    return highlights.map((h) => ({
      id: h.id || crypto.randomUUID(),
      icon: h.icon as IconName,
      text: h.text,
      type: h.type === "warning" ? "warning" : "finance" as TagType,
    }));
  });
  const [tagModalOpen, setTagModalOpen] = useState(false);

  // Keyboard shortcuts for bold
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === "b") {
      e.preventDefault();
      document.execCommand("bold", false);
    }
  }, []);

  // Update HTML when editor changes
  const handleEditorInput = useCallback(() => {
    if (editorRef.current) {
      setSummaryHtml(editorRef.current.innerHTML);
    }
  }, []);

  // Toggle context section
  const toggleContextSection = () => {
    setShowContext(!showContext);
    if (!showContext && contextCards.length === 0) {
      setContextCards([
        {
          id: crypto.randomUUID(),
          icon: null,
          text: "",
        },
      ]);
    }
  };

  // Tag handlers
  const handleAddTag = (tag: TagData) => {
    setTags([...tags, tag]);
  };

  const handleRemoveTag = (id: string) => {
    setTags(tags.filter((t) => t.id !== id));
  };

  // Start editing
  const handleStartEditing = () => {
    setIsEditing(true);
  };

  // Cancel editing
  const handleCancel = () => {
    // Reset to original values
    setSummaryHtml(summary);
    setShowContext(clientContext.points.length > 0);
    setContextCards(
      clientContext.points.map((p) => ({
        id: p.id || crypto.randomUUID(),
        icon: p.icon as IconName,
        text: p.text,
      }))
    );
    setTags(
      highlights.map((h) => ({
        id: h.id || crypto.randomUUID(),
        icon: h.icon as IconName,
        text: h.text,
        type: h.type === "warning" ? "warning" : "finance" as TagType,
      }))
    );
    setIsEditing(false);
  };

  // Save changes
  const handleSave = () => {
    const newClientContext: MeetingClientContext = {
      points: contextCards
        .filter((c) => c.text.trim())
        .map((c) => ({
          id: c.id,
          icon: c.icon || "alert-circle",
          text: c.text,
        })),
    };

    const newHighlights: MeetingHighlight[] = tags.map((t) => ({
      id: t.id,
      icon: t.icon,
      text: t.text,
      type: t.type === "warning" ? "warning" : "normal",
    }));

    if (onUpdate) {
      onUpdate({
        summary: summaryHtml,
        clientContext: newClientContext,
        highlights: newHighlights,
      });
    }
    setIsEditing(false);
  };

  // Apply AI-generated data
  const applyAIData = (data: {
    summary?: string;
    clientContext?: { points: { icon: string; text: string }[] };
    highlights?: { icon: string; text: string; type: string }[];
  }) => {
    if (data.summary) {
      setSummaryHtml(data.summary);
      if (editorRef.current) {
        editorRef.current.innerHTML = data.summary;
      }
    }

    if (data.clientContext?.points?.length) {
      setShowContext(true);
      setContextCards(
        data.clientContext.points.map((p) => ({
          id: crypto.randomUUID(),
          icon: p.icon as IconName,
          text: p.text,
        }))
      );
    }

    if (data.highlights?.length) {
      setTags(
        data.highlights.map((h) => ({
          id: crypto.randomUUID(),
          icon: h.icon as IconName,
          text: h.text,
          type: h.type === "warning" ? "warning" : "finance" as TagType,
        }))
      );
    }
  };

  // Set initial content when entering edit mode
  useEffect(() => {
    if (isEditing && editorRef.current) {
      editorRef.current.innerHTML = summaryHtml;
    }
  }, [isEditing]);

  // Expose applyAIData method
  useEffect(() => {
    (window as any).__applySummaryAIData = applyAIData;
    return () => {
      delete (window as any).__applySummaryAIData;
    };
  }, []);

  // Render view mode
  if (!isEditing) {
    return (
      <div className="space-y-4">
        <EditableSectionTitle
          icon={<FileText className="w-[18px] h-[18px]" />}
          title="Resumo da Reunião"
          onEditClick={handleStartEditing}
        />

        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-[10px] p-6">
          <p 
            className="text-sm text-[#a0a0a0] leading-[1.7]"
            dangerouslySetInnerHTML={{ __html: summary }}
          />

          {/* Client Context */}
          {clientContext.points.length > 0 && (
            <div className="mt-5 pt-5 border-t border-[#2a2a2a]">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#a78bfa] uppercase tracking-wider mb-3">
                <User className="w-3.5 h-3.5" />
                Contexto da Cliente - {clientName}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {clientContext.points.map((point) => {
                  const IconComponent = iconMap[point.icon] || AlertCircle;
                  return (
                    <div 
                      key={point.id}
                      className="flex items-start gap-2.5 p-3 bg-[#202020] rounded-lg"
                    >
                      <IconComponent className="w-4 h-4 text-[#6db1d4] flex-shrink-0 mt-0.5" />
                      <span className="text-[0.8125rem] text-[#b0b0b0] leading-[1.5]">
                        {point.text}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Highlights */}
          {highlights.length > 0 && (
            <div className="mt-5 pt-5 border-t border-[#2a2a2a] flex flex-wrap gap-2.5">
              {highlights.map((highlight) => {
                const IconComponent = iconMap[highlight.icon] || Building;
                return (
                  <span 
                    key={highlight.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#252730] border border-[#363842] rounded-md text-xs text-[#ededed]"
                  >
                    <IconComponent 
                      className={`w-3 h-3 ${highlight.type === "warning" ? "text-[#f59e0b]" : "text-[#6ecf8e]"}`} 
                    />
                    {highlight.text}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render edit mode
  return (
    <div className="space-y-4">
      <EditableSectionTitle
        icon={<FileText className="w-[18px] h-[18px]" />}
        title="Resumo da Reunião"
        isEditing={true}
      />

      {/* Summary Container */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden">
        {/* Main Text Editor */}
        <div className="p-6">
          <div
            ref={editorRef}
            contentEditable
            onInput={handleEditorInput}
            onKeyDown={handleKeyDown}
            data-placeholder="Escreva o resumo da reunião aqui. Selecione texto e pressione Ctrl+B para negrito..."
            className={cn(
              "min-h-[60px] text-[#c0c0c0] text-[0.9375rem] leading-[1.8] outline-none",
              "[&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-[#555555]",
              "[&_strong]:text-white [&_strong]:font-semibold",
              "[&_b]:text-white [&_b]:font-semibold"
            )}
          />
        </div>

        {/* Context Section */}
        {showContext && (
          <ContextSectionEditor
            clientName={contextClientName}
            onClientNameChange={setContextClientName}
            cards={contextCards}
            onCardsChange={setContextCards}
          />
        )}

        {/* Tags Section */}
        <div className="px-6 py-4 flex flex-wrap gap-2.5 border-t border-[#2a2a2a]">
          {tags.map((tag) => (
            <TagDisplay
              key={tag.id}
              tag={tag}
              onRemove={() => handleRemoveTag(tag.id)}
            />
          ))}
          <button
            type="button"
            onClick={() => setTagModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-transparent border border-dashed border-[#333333] rounded-md text-[#555555] text-[0.8125rem] cursor-pointer transition-all hover:bg-[#1a1a1a] hover:border-[#555555] hover:text-[#888888]"
          >
            <Plus className="w-3 h-3" />
            Adicionar tag
          </button>
        </div>

        {/* Action Button */}
        <div className="px-6 py-4 border-t border-[#2a2a2a] flex gap-3">
          <button
            type="button"
            onClick={toggleContextSection}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2.5 bg-[#252525] border border-[#333333] rounded-lg text-[#888888] text-[0.8125rem] font-medium cursor-pointer transition-all hover:bg-[#333333] hover:text-[#ededed] hover:border-[#444444]",
              showContext && "bg-[#2d2640] border-[#a78bfa] text-[#a78bfa]"
            )}
          >
            {showContext ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Contexto Ativado
              </>
            ) : (
              <>
                <User className="w-3.5 h-3.5" />
                Adicionar Contexto do Cliente
              </>
            )}
          </button>
        </div>
      </div>

      {/* Save/Cancel buttons */}
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
          Salvar Resumo
        </button>
      </div>

      {/* Tag Modal */}
      <TagEditorModal
        open={tagModalOpen}
        onOpenChange={setTagModalOpen}
        onAddTag={handleAddTag}
      />
    </div>
  );
}
