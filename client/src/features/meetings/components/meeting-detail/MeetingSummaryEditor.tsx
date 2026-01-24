import { useState, useRef, useCallback, useEffect } from "react";
import { FileText, User, Check, Sparkles, Loader2, Plus } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useAISummary, type AIResponse } from "@features/meetings/hooks/useAISummary";
import { ContextSectionEditor, type ContextCardData } from "./ContextCardEditor";
import { TagEditorModal, TagDisplay, InlineTagEditor, type TagData, type TagType } from "./TagEditorModal";
import type { IconName } from "./IconPicker";
import type { MeetingClientContext, MeetingHighlight } from "@features/meetings/types/meeting";

interface MeetingSummaryEditorProps {
  clientName: string;
  meetingDate: Date;
  initialSummary?: string;
  initialClientContext?: MeetingClientContext;
  initialHighlights?: MeetingHighlight[];
  onSave: (data: {
    summary: string;
    clientContext: MeetingClientContext;
    highlights: MeetingHighlight[];
  }) => void;
  onCancel: () => void;
}

export function MeetingSummaryEditor({
  clientName,
  meetingDate,
  initialSummary = "",
  initialClientContext,
  initialHighlights = [],
  onSave,
  onCancel,
}: MeetingSummaryEditorProps) {
  // Text editor state
  const [summaryHtml, setSummaryHtml] = useState(initialSummary);
  const editorRef = useRef<HTMLDivElement>(null);

  // Context section state
  const [showContext, setShowContext] = useState(
    initialClientContext ? initialClientContext.points.length > 0 : false
  );
  const [contextClientName, setContextClientName] = useState(clientName);
  const [contextCards, setContextCards] = useState<ContextCardData[]>(() => {
    if (initialClientContext?.points) {
      return initialClientContext.points.map((p) => ({
        id: crypto.randomUUID(),
        icon: p.icon as IconName,
        text: p.text,
      }));
    }
    return [];
  });

  // Tags state
  const [tags, setTags] = useState<TagData[]>(() => {
    return initialHighlights.map((h) => ({
      id: crypto.randomUUID(),
      icon: h.icon as IconName,
      text: h.text,
      type: h.type === "warning" ? "warning" : "finance" as TagType,
    }));
  });

  // AI integration
  const { isLoading, error, processWithAI, clearError } = useAISummary();

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

  // Process with AI
  const handleProcessWithAI = async () => {
    const textContent = editorRef.current?.textContent || "";
    
    if (!textContent.trim()) {
      return;
    }

    clearError();

    const result = await processWithAI(
      textContent,
      clientName,
      meetingDate.toISOString().split("T")[0],
      ["summary", "agenda", "decisions"]
    );

    if (result) {
      applyAIResponse(result);
    }
  };

  const applyAIResponse = (response: AIResponse) => {
    // Apply summary
    if (response.summary) {
      setSummaryHtml(response.summary);
      if (editorRef.current) {
        editorRef.current.innerHTML = response.summary;
      }
    }

    // Apply context
    if (response.clientContext?.points?.length) {
      setShowContext(true);
      setContextCards(
        response.clientContext.points.map((p) => ({
          id: crypto.randomUUID(),
          icon: p.icon as IconName,
          text: p.text,
        }))
      );
    }

    // Apply highlights/tags
    if (response.highlights?.length) {
      setTags(
        response.highlights.map((h) => ({
          id: crypto.randomUUID(),
          icon: h.icon as IconName,
          text: h.text,
          type: h.type === "warning" ? "warning" : "finance" as TagType,
        }))
      );
    }
  };

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

  // Add tag
  const handleAddTag = (tag: TagData) => {
    setTags([...tags, tag]);
  };

  // Remove tag
  const handleRemoveTag = (id: string) => {
    setTags(tags.filter((t) => t.id !== id));
  };

  // Save
  const handleSave = () => {
    const clientContext: MeetingClientContext = {
      points: contextCards
        .filter((c) => c.text.trim())
        .map((c) => ({
          id: c.id,
          icon: c.icon || "alert-circle",
          text: c.text,
        })),
    };

    const highlights: MeetingHighlight[] = tags.map((t) => ({
      id: t.id,
      icon: t.icon,
      text: t.text,
      type: t.type === "warning" ? "warning" : "normal",
    }));

    onSave({
      summary: summaryHtml,
      clientContext,
      highlights,
    });
  };

  // Set initial content
  useEffect(() => {
    if (editorRef.current && initialSummary) {
      editorRef.current.innerHTML = initialSummary;
    }
  }, []);

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-2.5">
        <FileText className="w-[18px] h-[18px] text-[#8c8c8c]" />
        <h2 className="text-sm font-semibold text-[#ededed]">Resumo da Reunião</h2>
        <span className="text-xs text-[#555555] ml-2">(Modo Edição)</span>
      </div>

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
              "min-h-[60px] text-sm text-[#a0a0a0] leading-[1.7] outline-none",
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
          <InlineTagEditor onAddTag={handleAddTag} />
        </div>

        {/* Action Buttons */}
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

          <button
            type="button"
            onClick={handleProcessWithAI}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#7c3aed] to-[#a78bfa] border-none rounded-lg text-white text-[0.8125rem] font-medium cursor-pointer transition-all hover:from-[#6d28d9] hover:to-[#9061f9] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                Processar com IA
              </>
            )}
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="px-6 py-3 bg-[#3d2424] border-t border-[#5a3030] text-[#ef4444] text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Save/Cancel buttons */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 bg-[#252730] border border-[#363842] rounded-lg text-[#ededed] text-sm font-medium hover:bg-[#2a2d38] hover:border-[#4a4f5c] transition-all"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="px-5 py-2.5 bg-[#10b981] border-none rounded-lg text-white text-sm font-medium hover:bg-[#059669] transition-all"
        >
          Salvar Resumo
        </button>
      </div>
    </div>
  );
}
