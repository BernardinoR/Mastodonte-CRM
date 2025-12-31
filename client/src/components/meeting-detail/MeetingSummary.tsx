import { useState, useRef, useCallback, useEffect } from "react";
import { 
  FileText, 
  User, 
  Users,
  AlertCircle, 
  Home, 
  Plane, 
  CreditCard, 
  Building, 
  AlertTriangle, 
  Truck, 
  Briefcase, 
  Heart, 
  Star, 
  Target, 
  Check, 
  Plus, 
  X,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Car,
  Shield,
  PiggyBank,
  BarChart,
  Info,
  CheckCircle,
  Clock,
  Timer,
  Lock,
  Settings
} from "lucide-react";
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

// Icon map with both kebab-case and PascalCase support
const iconMap: Record<string, React.ElementType> = {
  // Kebab-case (internal format)
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
  "dollar-sign": DollarSign,
  "trending-up": TrendingUp,
  "trending-down": TrendingDown,
  "calendar": Calendar,
  "car": Car,
  "shield": Shield,
  "piggy-bank": PiggyBank,
  "bar-chart": BarChart,
  "user": User,
  "users": Users,
  "info": Info,
  "check-circle": CheckCircle,
  "clock": Clock,
  "timer": Timer,
  "lock": Lock,
  "settings": Settings,
  "file-text": FileText,
  // PascalCase (AI format)
  "AlertCircle": AlertCircle,
  "Home": Home,
  "Plane": Plane,
  "CreditCard": CreditCard,
  "Building": Building,
  "AlertTriangle": AlertTriangle,
  "Truck": Truck,
  "Briefcase": Briefcase,
  "Heart": Heart,
  "Star": Star,
  "Target": Target,
  "DollarSign": DollarSign,
  "TrendingUp": TrendingUp,
  "TrendingDown": TrendingDown,
  "Calendar": Calendar,
  "Car": Car,
  "Shield": Shield,
  "PiggyBank": PiggyBank,
  "BarChart": BarChart,
  "User": User,
  "Users": Users,
  "Info": Info,
  "CheckCircle": CheckCircle,
  "Clock": Clock,
  "Timer": Timer,
  "Lock": Lock,
  "Settings": Settings,
  "FileText": FileText,
};

// Helper function to convert PascalCase to kebab-case
function pascalToKebab(str: string): string {
  return str
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase();
}

// Get icon component from name (supports both PascalCase and kebab-case)
function getIconFromName(iconName: string): React.ElementType {
  // Try direct lookup first
  if (iconMap[iconName]) {
    return iconMap[iconName];
  }
  
  // Try converting PascalCase to kebab-case
  const kebabCase = pascalToKebab(iconName);
  if (iconMap[kebabCase]) {
    return iconMap[kebabCase];
  }
  
  // Fallback to AlertCircle
  return AlertCircle;
}

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
  const handleSave = useCallback(() => {
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
  }, [contextCards, tags, summaryHtml, onUpdate]);

  // Apply AI-generated data
  const applyAIData = (data: {
    summary?: string;
    clientContext?: { points: { icon: string; text: string }[] };
    highlights?: { icon: string; text: string; type: string }[];
  }) => {
    if (data.summary) {
      setSummaryHtml(data.summary);
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

    // Activate edit mode to show the updated data
    setIsEditing(true);
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

  // Render view mode
  if (!isEditing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <EditableSectionTitle
            icon={<FileText className="w-[18px] h-[18px]" />}
            title="Resumo da Reunião"
            isEditing={false}
            onEditClick={handleStartEditing}
          />
        </div>

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
                  const IconComponent = getIconFromName(point.icon);
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
                const IconComponent = getIconFromName(highlight.icon);
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
    <div ref={sectionRef} className="space-y-4">
      <div className="flex items-center justify-between">
        <EditableSectionTitle
          icon={<FileText className="w-[18px] h-[18px]" />}
          title="Resumo da Reunião"
          isEditing={true}
          onSave={handleSave}
        />
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
