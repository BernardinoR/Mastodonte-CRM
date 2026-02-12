import { useState, useRef, useEffect } from "react";
import { Calendar, ChevronRight, FileText, Search, X, Info, Unlink } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { UI_CLASSES } from "../../lib/statusConfig";
import { MEETING_TYPE_COLORS, MEETING_FALLBACK_COLOR } from "@/shared/config/meetingConfig";
import { cn } from "@/shared/lib/utils";

interface TaskMeetingLinkProps {
  meeting?: {
    id: number;
    title: string;
    date: Date;
    type: string;
    clientName?: string;
  };
  clientMeetings: Array<{
    id: string;
    name: string;
    type: string;
    date: Date;
  }>;
  onNavigate?: (meetingId: number) => void;
  onLink: (meetingId: number) => void;
  onUnlink: () => void;
}

export function TaskMeetingLink({
  meeting,
  clientMeetings,
  onNavigate,
  onLink,
  onUnlink,
}: TaskMeetingLinkProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredUnlink, setHoveredUnlink] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSearching && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearching]);

  useEffect(() => {
    if (!isSearching) return;

    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsSearching(false);
        setSearchQuery("");
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsSearching(false);
        setSearchQuery("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isSearching]);

  const filteredMeetings = clientMeetings.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getTypeBadgeClass = (type: string) => MEETING_TYPE_COLORS[type] || MEETING_FALLBACK_COLOR;

  // State 2 — Linked
  if (meeting) {
    return (
      <div>
        <label className={UI_CLASSES.sectionLabel}>Reunião de Origem</label>
        <div className="group/meeting relative">
          <div className={UI_CLASSES.meetingLinkCard} onClick={() => onNavigate?.(meeting.id)}>
            <FileText className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-xs font-medium text-gray-200">
                  {meeting.title}
                </span>
                <div className="h-3.5 w-px bg-[#444444]" />
                <span
                  className={cn(
                    "flex-shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium",
                    getTypeBadgeClass(meeting.type),
                  )}
                >
                  {meeting.type}
                </span>
                <div className="h-3.5 w-px bg-[#444444]" />
                <span className="flex flex-shrink-0 items-center gap-1 text-[11px] text-gray-500">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(meeting.date), "dd/MM/yyyy", {
                    locale: ptBR,
                  })}
                </span>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-600 transition-colors group-hover:text-gray-400" />
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUnlink();
            }}
            onMouseEnter={() => setHoveredUnlink(true)}
            onMouseLeave={() => setHoveredUnlink(false)}
            className="absolute -right-2 -top-2 rounded-full border border-[#333333] bg-[#1a1a1a] p-1 text-gray-500 opacity-0 shadow-md transition-all hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 group-hover/meeting:opacity-100"
            title="Desvincular reunião"
          >
            {hoveredUnlink ? <Unlink className="h-3 w-3" /> : <X className="h-3 w-3" />}
          </button>
        </div>
      </div>
    );
  }

  // State 1 — Not linked
  return (
    <div className="mt-1" ref={containerRef}>
      <label className={UI_CLASSES.sectionLabel}>Reunião de Origem</label>
      {isSearching ? (
        /* Barra de busca — substitui o card, inline no mesmo espaço */
        <div className="relative">
          <div className="flex items-center rounded-lg border border-primary bg-[#1a1a1a]">
            <Search className="ml-3 h-4 w-4 flex-shrink-0 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar reunião..."
              className="w-full bg-transparent px-3 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none"
            />
            <button
              onClick={() => {
                setIsSearching(false);
                setSearchQuery("");
              }}
              className="mr-2 rounded p-1 text-gray-400 transition-colors hover:bg-[#333333] hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {/* Lista de resultados — flutuante abaixo da barra */}
          <div className="absolute left-0 right-0 top-full z-50 mt-1">
            <div className="max-h-48 overflow-y-auto rounded-lg border border-[#333333] bg-[#202020] shadow-lg">
              {filteredMeetings.length === 0 ? (
                <div className="px-4 py-3 text-center text-xs text-gray-500">
                  {clientMeetings.length === 0
                    ? "Nenhuma reunião disponível para este cliente"
                    : "Nenhuma reunião encontrada"}
                </div>
              ) : (
                filteredMeetings.map((m) => (
                  <div
                    key={m.id}
                    className="flex cursor-pointer items-center gap-3 px-3 py-2.5 transition-colors hover:bg-[#333333]"
                    onClick={() => {
                      onLink(parseInt(m.id, 10));
                      setIsSearching(false);
                      setSearchQuery("");
                    }}
                  >
                    <span className="min-w-0 flex-1 truncate text-sm text-gray-200">{m.name}</span>
                    <span
                      className={cn(
                        "flex-shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium",
                        getTypeBadgeClass(m.type),
                      )}
                    >
                      {m.type}
                    </span>
                    <span className="flex flex-shrink-0 items-center gap-1 text-[11px] text-gray-500">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(m.date), "dd/MM/yyyy", { locale: ptBR })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Card "Não vinculado" com uppercase, gap-2.5, tooltip */
        <div className="group flex items-center justify-between rounded-lg border border-[#333333]/30 px-4 py-3 transition-all hover:border-[#333333]/50 hover:bg-white/5">
          <div className="flex items-center gap-2.5">
            <span className="rounded bg-gray-700/50 px-2 py-0.5 text-[11px] font-medium uppercase text-gray-400">
              Não vinculado
            </span>
            <div className="group/info relative">
              <Info className="h-3.5 w-3.5 cursor-help text-gray-600" />
              <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-52 -translate-x-1/2 rounded-lg border border-[#333333] bg-[#202020] px-3.5 py-2.5 text-[11px] text-gray-400 opacity-0 shadow-lg transition-opacity group-hover/info:opacity-100">
                Vincule esta tarefa a uma reunião de origem para rastrear de onde ela surgiu.
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsSearching(true)}
            className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 transition-all duration-200 hover:text-gray-300"
          >
            Buscar
          </button>
        </div>
      )}
    </div>
  );
}
