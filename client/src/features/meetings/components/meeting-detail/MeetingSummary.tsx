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
  Settings,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { EditableSectionTitle } from "./EditableSectionTitle";
import { ContextSectionEditor, type ContextCardData } from "./ContextCardEditor";
import {
  TagEditorModal,
  TagDisplay,
  InlineTagEditor,
  type TagData,
  type TagType,
} from "./TagEditorModal";
import type { IconName } from "./IconPicker";
import type { MeetingClientContext, MeetingHighlight } from "@features/meetings/types/meeting";

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
  home: Home,
  plane: Plane,
  "credit-card": CreditCard,
  building: Building,
  "alert-triangle": AlertTriangle,
  truck: Truck,
  briefcase: Briefcase,
  heart: Heart,
  star: Star,
  target: Target,
  "dollar-sign": DollarSign,
  "trending-up": TrendingUp,
  "trending-down": TrendingDown,
  calendar: Calendar,
  car: Car,
  shield: Shield,
  "piggy-bank": PiggyBank,
  "bar-chart": BarChart,
  user: User,
  users: Users,
  info: Info,
  "check-circle": CheckCircle,
  clock: Clock,
  timer: Timer,
  lock: Lock,
  settings: Settings,
  "file-text": FileText,
  // PascalCase (AI format)
  AlertCircle: AlertCircle,
  Home: Home,
  Plane: Plane,
  CreditCard: CreditCard,
  Building: Building,
  AlertTriangle: AlertTriangle,
  Truck: Truck,
  Briefcase: Briefcase,
  Heart: Heart,
  Star: Star,
  Target: Target,
  DollarSign: DollarSign,
  TrendingUp: TrendingUp,
  TrendingDown: TrendingDown,
  Calendar: Calendar,
  Car: Car,
  Shield: Shield,
  PiggyBank: PiggyBank,
  BarChart: BarChart,
  User: User,
  Users: Users,
  Info: Info,
  CheckCircle: CheckCircle,
  Clock: Clock,
  Timer: Timer,
  Lock: Lock,
  Settings: Settings,
  FileText: FileText,
};

// Helper function to convert PascalCase to kebab-case
function pascalToKebab(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

// Get icon component from name (supports both PascalCase and kebab-case)
function getIconFromName(iconName: string): React.ElementType {
  if (iconMap[iconName]) {
    return iconMap[iconName];
  }
  const kebabCase = pascalToKebab(iconName);
  if (iconMap[kebabCase]) {
    return iconMap[kebabCase];
  }
  return AlertCircle;
}

// Color mapping for icon types
const iconColors: Record<string, string> = {
  "dollar-sign": "text-emerald-400",
  "trending-up": "text-emerald-400",
  "trending-down": "text-red-400",
  "alert-triangle": "text-amber-400",
  "alert-circle": "text-amber-400",
  "credit-card": "text-blue-400",
  building: "text-blue-400",
  briefcase: "text-blue-400",
  target: "text-purple-400",
  star: "text-yellow-400",
  heart: "text-pink-400",
  shield: "text-cyan-400",
  home: "text-orange-400",
  car: "text-orange-400",
  plane: "text-sky-400",
  truck: "text-orange-400",
  calendar: "text-blue-400",
  clock: "text-gray-400",
  timer: "text-gray-400",
  user: "text-blue-400",
  users: "text-blue-400",
  info: "text-blue-400",
  "check-circle": "text-emerald-400",
  lock: "text-gray-400",
  settings: "text-gray-400",
  "file-text": "text-gray-400",
  "piggy-bank": "text-emerald-400",
  "bar-chart": "text-purple-400",
  DollarSign: "text-emerald-400",
  TrendingUp: "text-emerald-400",
  TrendingDown: "text-red-400",
  AlertTriangle: "text-amber-400",
  AlertCircle: "text-amber-400",
  CreditCard: "text-blue-400",
  Building: "text-blue-400",
  Briefcase: "text-blue-400",
  Target: "text-purple-400",
  Star: "text-yellow-400",
  Heart: "text-pink-400",
  Shield: "text-cyan-400",
  Home: "text-orange-400",
  Car: "text-orange-400",
  Plane: "text-sky-400",
  Truck: "text-orange-400",
  Calendar: "text-blue-400",
  Clock: "text-gray-400",
  Timer: "text-gray-400",
  User: "text-blue-400",
  Users: "text-blue-400",
  Info: "text-blue-400",
  CheckCircle: "text-emerald-400",
  Lock: "text-gray-400",
  Settings: "text-gray-400",
  FileText: "text-gray-400",
  PiggyBank: "text-emerald-400",
  BarChart: "text-purple-400",
};

function getIconColor(iconName: string): string {
  return iconColors[iconName] || "text-[#2eaadc]";
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
      type: h.type === "warning" ? "warning" : ("finance" as TagType),
    }));
  });

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
    setSummaryHtml(summary);
    setShowContext(clientContext.points.length > 0);
    setContextCards(
      clientContext.points.map((p) => ({
        id: p.id || crypto.randomUUID(),
        icon: p.icon as IconName,
        text: p.text,
      })),
    );
    setTags(
      highlights.map((h) => ({
        id: h.id || crypto.randomUUID(),
        icon: h.icon as IconName,
        text: h.text,
        type: h.type === "warning" ? "warning" : ("finance" as TagType),
      })),
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
        })),
      );
    }

    if (data.highlights?.length) {
      setTags(
        data.highlights.map((h) => ({
          id: crypto.randomUUID(),
          icon: h.icon as IconName,
          text: h.text,
          type: h.type === "warning" ? "warning" : ("finance" as TagType),
        })),
      );
    }

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
    // Merge highlights into context points for "Principais Pontos" display
    const allPoints = [
      ...clientContext.points.map((p) => ({ ...p, source: "context" as const })),
      ...highlights.map((h) => ({
        id: h.id,
        icon: h.icon,
        text: h.text,
        source: "highlight" as const,
        type: h.type,
      })),
    ];

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3
            className="flex cursor-pointer items-center gap-2 text-sm font-bold text-white"
            onClick={handleStartEditing}
          >
            <FileText className="h-[18px] w-[18px] text-gray-400" />
            Resumo da Reuniao
          </h3>
        </div>

        <div className="rounded-lg border border-[#262626] bg-[#161616] p-5">
          <p
            className="text-[13px] leading-relaxed text-gray-400 [&_b]:font-semibold [&_b]:text-white [&_strong]:font-semibold [&_strong]:text-white"
            dangerouslySetInnerHTML={{ __html: summary }}
          />

          {/* Contexto da Cliente */}
          {allPoints.length > 0 && (
            <div className="mt-5 border-t border-[#262626] pt-5">
              <div className="mb-5 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                CONTEXTO DA CLIENTE — {clientName}
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                {allPoints.slice(0, 4).map((point) => {
                  const IconComponent = getIconFromName(point.icon);
                  // Split on colon: before = title, after = description
                  const parts = point.text.split(":");
                  const hasColon = parts.length > 1;
                  const titulo = hasColon ? parts[0].trim() : point.text;
                  const descricao = hasColon ? parts.slice(1).join(":").trim() : "";

                  return (
                    <div key={point.id} className="flex items-start gap-3">
                      <IconComponent className="mt-0.5 h-6 w-6 flex-shrink-0 text-gray-500" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-white">{titulo}</p>
                        {descricao && (
                          <p className="mt-1 text-xs leading-normal text-gray-400">{descricao}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render edit mode
  return (
    <div ref={sectionRef} className="space-y-3">
      <div className="flex items-center justify-between">
        <EditableSectionTitle
          icon={<FileText className="h-[18px] w-[18px]" />}
          title="Resumo da Reuniao"
          isEditing={true}
        />

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
            type="button"
            onClick={toggleContextSection}
            className={cn(
              "inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#262626] bg-[#1c1c1c] px-4 py-2.5 text-[0.8125rem] font-medium text-gray-500 transition-all hover:border-[#333] hover:bg-[#262626] hover:text-white",
              showContext && "border-purple-500/50 bg-purple-500/10 text-purple-400",
            )}
          >
            {showContext ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Contexto Ativado
              </>
            ) : (
              <>
                <User className="h-3.5 w-3.5" />
                Adicionar Contexto do Cliente
              </>
            )}
          </button>
        </div>
      </div>

      {/* Summary Container */}
      <div className="rounded-lg border border-[#262626] bg-[#161616]">
        {/* Main Text Editor */}
        <div className="p-5">
          <div
            ref={editorRef}
            contentEditable
            onInput={handleEditorInput}
            onKeyDown={handleKeyDown}
            data-placeholder="Escreva o resumo da reuniao aqui. Selecione texto e pressione Ctrl+B para negrito..."
            className={cn(
              "min-h-[60px] text-[13px] leading-relaxed text-gray-400 outline-none",
              "[&:empty]:before:text-[#555555] [&:empty]:before:content-[attr(data-placeholder)]",
              "[&_strong]:font-semibold [&_strong]:text-white",
              "[&_b]:font-semibold [&_b]:text-white",
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
        <div className="flex flex-wrap gap-2.5 border-t border-[#262626] px-6 py-4">
          {tags.map((tag) => (
            <TagDisplay key={tag.id} tag={tag} onRemove={() => handleRemoveTag(tag.id)} />
          ))}
          <InlineTagEditor onAddTag={handleAddTag} />
        </div>
      </div>
    </div>
  );
}
