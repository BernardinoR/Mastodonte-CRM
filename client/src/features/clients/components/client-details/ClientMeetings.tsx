/**
 * Componente principal de reuniões do cliente
 * Orquestra a tabela de reuniões e o modal de detalhes
 */
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Calendar as CalendarIcon, Search, X, Calendar, User, Tag } from "lucide-react";
import { Card } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { cn } from "@/shared/lib/utils";
import type { useInlineClientMeetings } from "@features/clients";
import { useClients } from "@features/clients";
import { MeetingDetailModal, type MeetingDetail } from "@features/meetings";
import { MeetingsTable, type Meeting } from "./MeetingsTable";
import { ExpandableFilterBar } from "@/shared/components/ui/expandable-filter-bar";
import {
  MeetingTypeFilterContent,
  MeetingStatusFilterContent,
} from "@shared/components/filter-bar/MeetingFilterContent";
import { DateRangeFilterContent } from "@shared/components/filter-bar/DateRangeFilterContent";
import { SearchableMultiSelect } from "@/shared/components/ui/searchable-multi-select";
import { useSearchFilter } from "@/shared/hooks/useSearchFilter";
import { sortBy, type SortField } from "@features/tasks/lib/sortUtils";
import {
  MEETING_TYPE_OPTIONS,
  MEETING_STATUS_OPTIONS,
  type MeetingType,
  type MeetingStatus,
} from "@shared/config/meetingConfig";
import type { DateFilterValue } from "@features/tasks";
import { startOfDay, isBefore, isAfter, isSameDay, endOfDay } from "date-fns";

interface ClientMeetingsProps {
  meetings: Meeting[];
  onNewMeeting: () => void;
  inlineProps: ReturnType<typeof useInlineClientMeetings>;
  clientId: string;
}

export function ClientMeetings({
  meetings,
  onNewMeeting,
  inlineProps,
  clientId,
}: ClientMeetingsProps) {
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingDetail | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const { getFullClientData, getMeetingDetail, updateClientMeeting } = useClients();

  const clientData = getFullClientData(clientId);
  const clientName = clientData?.client.name || "";

  // Estados dos filtros
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<MeetingType[]>([...MEETING_TYPE_OPTIONS]);
  const [selectedStatuses, setSelectedStatuses] = useState<MeetingStatus[]>([
    ...MEETING_STATUS_OPTIONS,
  ]);
  const [dateFilter, setDateFilter] = useState<DateFilterValue>({ type: "all" });
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);

  // Calcular responsáveis disponíveis das reuniões
  const availableAssignees = useMemo(() => {
    const assignees = new Set<string>();
    meetings.forEach((meeting) => {
      meeting.assignees?.forEach((a) => assignees.add(a));
    });
    return Array.from(assignees).sort();
  }, [meetings]);

  // Aplicar filtros locais antes da busca
  const filteredMeetings = useMemo(() => {
    let result = meetings;

    // Filtro de tipo
    if (selectedTypes.length < MEETING_TYPE_OPTIONS.length) {
      result = result.filter((meeting) => selectedTypes.includes(meeting.type as MeetingType));
    }

    // Filtro de status
    if (selectedStatuses.length < MEETING_STATUS_OPTIONS.length) {
      result = result.filter((meeting) =>
        selectedStatuses.includes(meeting.status as MeetingStatus),
      );
    }

    // Filtro de data
    if (dateFilter.type !== "all") {
      const today = startOfDay(new Date());
      result = result.filter((meeting) => {
        const meetingDate = meeting.date ? startOfDay(new Date(meeting.date)) : null;

        if (dateFilter.type === "preset") {
          switch (dateFilter.preset) {
            case "today":
              return meetingDate && isSameDay(meetingDate, today);
            case "overdue":
              return meetingDate && isBefore(meetingDate, today);
            case "no-date":
              return !meetingDate;
            default:
              return true;
          }
        } else if (dateFilter.type === "range" || dateFilter.type === "relative") {
          if (dateFilter.startDate && dateFilter.endDate) {
            const start = startOfDay(dateFilter.startDate);
            const end = endOfDay(dateFilter.endDate);
            return meetingDate && meetingDate >= start && meetingDate <= end;
          } else if (dateFilter.startDate) {
            const start = startOfDay(dateFilter.startDate);
            return meetingDate && !isBefore(meetingDate, start);
          }
        }

        return true;
      });
    }

    // Filtro de responsável
    if (selectedAssignees.length > 0) {
      result = result.filter(
        (meeting) => meeting.assignees?.some((a) => selectedAssignees.includes(a)) ?? false,
      );
    }

    return result;
  }, [meetings, selectedTypes, selectedStatuses, dateFilter, selectedAssignees]);

  // Hook de busca por nome (aplicado após os filtros)
  const searchFilter = useSearchFilter<Meeting>(filteredMeetings, (meeting, term) =>
    meeting.name.toLowerCase().includes(term),
  );

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focar no input quando a busca abrir
  useEffect(() => {
    if (searchFilter.isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchFilter.isSearchOpen]);

  const handleSearchBlur = () => {
    if (!searchFilter.searchTerm.trim()) {
      searchFilter.closeSearch();
    }
  };

  const handleClearSearch = () => {
    searchFilter.setSearchTerm("");
    searchFilter.closeSearch();
  };

  // Handlers dos filtros
  const handleTypeToggle = useCallback((type: MeetingType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  }, []);

  const handleStatusToggle = useCallback((status: MeetingStatus) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status],
    );
  }, []);

  const handleDateChange = useCallback((value: DateFilterValue) => {
    setDateFilter(value);
  }, []);

  const handleAssigneeChange = useCallback((assignees: string[]) => {
    setSelectedAssignees(assignees);
  }, []);

  // Ordenação padrão: data (mais recente) + "Realizada" no topo
  const sortedAndFilteredMeetings = useMemo(() => {
    const STATUS_ORDER: Record<MeetingStatus, number> = {
      Realizada: 1,
      Agendada: 2,
      Cancelada: 3,
    };

    const sortFields: SortField<Meeting>[] = [
      {
        key: (m) => (m.date ? new Date(m.date).getTime() : 0),
        order: "desc",
        priority: 1,
      },
      {
        key: (m) => STATUS_ORDER[m.status as MeetingStatus] || 999,
        order: "asc",
        priority: 2,
      },
    ];

    return sortBy(searchFilter.filteredItems, ...sortFields);
  }, [searchFilter.filteredItems]);

  const handleMeetingClick = async (meeting: Meeting) => {
    // Try to fetch detailed data from the API
    const detail = await getMeetingDetail(clientId, meeting.id);

    if (detail) {
      setSelectedMeeting(detail);
      setDetailModalOpen(true);
      return;
    }

    // Fallback: Create basic MeetingDetail from meeting data (for meetings without AI summary)
    const getInitials = (name: string): string =>
      name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    const meetingDetail: MeetingDetail = {
      id: meeting.id,
      name: meeting.name,
      type: meeting.type,
      status: meeting.status as "Agendada" | "Realizada" | "Cancelada",
      date: meeting.date,
      startTime: "10:00",
      endTime: "11:00",
      duration: "1h",
      location: "Google Meet",
      assignees: meeting.assignees,
      responsible: {
        name: meeting.assignees[0] || "Consultor",
        initials: getInitials(meeting.assignees[0] || "Consultor"),
      },
      clientName: clientName,
      summary: "",
      clientContext: { points: [] },
      highlights: [],
      agenda: [],
      decisions: [],
      linkedTasks: [],
      participants: [
        {
          id: "1",
          name: clientName,
          role: "Cliente",
          avatarColor: "#a78bfa",
          initials: getInitials(clientName),
        },
        {
          id: "2",
          name: meeting.assignees[0] || "Consultor",
          role: "Consultor de Investimentos",
          avatarColor: "#2563eb",
          initials: getInitials(meeting.assignees[0] || "Consultor"),
        },
      ],
      attachments: [],
    };

    setSelectedMeeting(meetingDetail);
    setDetailModalOpen(true);
  };

  // Handler para atualizar reunião (sincroniza tabela e modal)
  const handleUpdateMeeting = useCallback(
    (meetingId: string, updates: Partial<MeetingDetail>) => {
      // Atualizar no contexto (sincroniza com tabela)
      updateClientMeeting(clientId, meetingId, updates);

      // Atualizar estado local do modal se estiver aberto
      if (selectedMeeting && selectedMeeting.id === meetingId) {
        setSelectedMeeting((prev) => (prev ? { ...prev, ...updates } : null));
      }
    },
    [clientId, updateClientMeeting, selectedMeeting],
  );

  // Sincronizar modal quando a tabela atualiza (quando meetings muda)
  useEffect(() => {
    if (selectedMeeting && detailModalOpen) {
      const updatedMeeting = meetings.find((m) => m.id === selectedMeeting.id);
      if (updatedMeeting) {
        const typeChanged = updatedMeeting.type !== selectedMeeting.type;
        const statusChanged = updatedMeeting.status !== selectedMeeting.status;
        const assigneesChanged =
          JSON.stringify(updatedMeeting.assignees) !== JSON.stringify(selectedMeeting.assignees);

        if (typeChanged || statusChanged || assigneesChanged) {
          setSelectedMeeting((prev) => {
            if (!prev) return null;

            // Atualizar responsible se o primeiro assignee mudou
            const newFirstAssignee = updatedMeeting.assignees?.[0];
            const currentFirstAssignee = prev.assignees?.[0];
            const responsible =
              newFirstAssignee && newFirstAssignee !== currentFirstAssignee
                ? {
                    name: newFirstAssignee,
                    initials: newFirstAssignee
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase(),
                  }
                : prev.responsible;

            return {
              ...prev,
              type: updatedMeeting.type,
              status: updatedMeeting.status as "Agendada" | "Realizada" | "Cancelada",
              assignees: updatedMeeting.assignees,
              responsible,
            };
          });
        }
      }
    }
  }, [meetings, selectedMeeting, detailModalOpen]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-base font-semibold text-foreground">Reuniões</h2>
          </div>

          <ExpandableFilterBar
            isExpanded={isFiltersExpanded}
            onToggle={() => setIsFiltersExpanded(!isFiltersExpanded)}
            toggleButtonTestId="button-toggle-meeting-filters"
          >
            {/* Busca */}
            <div
              className={cn(
                "relative flex h-8 items-center overflow-hidden rounded-full transition-all duration-300 ease-out",
                isFiltersExpanded ? "scale-100 opacity-100" : "scale-0 opacity-0",
                searchFilter.isSearchOpen
                  ? "w-52 border border-[#3a3a3a] bg-[#1a1a1a] px-3"
                  : "w-8",
              )}
              style={{ transitionDelay: isFiltersExpanded ? "0ms" : "0ms" }}
            >
              <button
                onClick={() => !searchFilter.isSearchOpen && searchFilter.openSearch()}
                className={cn(
                  "flex shrink-0 items-center justify-center transition-colors",
                  searchFilter.isSearchOpen
                    ? "h-4 w-4 cursor-default text-gray-500"
                    : "h-8 w-8 rounded-full text-gray-500 hover:bg-[#1a1a1a] hover:text-gray-300",
                )}
                data-testid="button-search-meeting"
              >
                <Search className="h-4 w-4" />
              </button>

              <div
                className={cn(
                  "flex items-center gap-1.5 overflow-hidden transition-all duration-300 ease-out",
                  searchFilter.isSearchOpen ? "ml-1.5 w-full opacity-100" : "w-0 opacity-0",
                )}
              >
                <Input
                  ref={searchInputRef}
                  type="text"
                  value={searchFilter.searchTerm}
                  onChange={(e) => searchFilter.setSearchTerm(e.target.value)}
                  onBlur={handleSearchBlur}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      handleClearSearch();
                    }
                  }}
                  placeholder="Buscar reunião..."
                  className="h-7 flex-1 border-0 bg-transparent p-0 text-sm placeholder:text-gray-500 focus-visible:ring-0"
                  data-testid="input-search-meeting"
                />
                {searchFilter.searchTerm && (
                  <button
                    onClick={handleClearSearch}
                    className="flex h-5 w-5 shrink-0 items-center justify-center text-gray-500 hover:text-gray-300"
                    data-testid="button-clear-search-meeting"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Filtro Tipo */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 w-8 p-0 text-gray-500 transition-all duration-300 hover:text-gray-300 focus-visible:ring-0",
                    isFiltersExpanded ? "scale-100 opacity-100" : "scale-0 opacity-0",
                  )}
                  style={{ transitionDelay: isFiltersExpanded ? "50ms" : "0ms" }}
                  aria-label="Filtrar por tipo"
                  data-testid="button-filter-meeting-type"
                >
                  <Tag className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-0" side="bottom" align="start" sideOffset={6}>
                <MeetingTypeFilterContent
                  selectedValues={selectedTypes}
                  onToggle={handleTypeToggle}
                />
              </PopoverContent>
            </Popover>

            {/* Filtro Status */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 w-8 p-0 text-gray-500 transition-all duration-300 hover:text-gray-300 focus-visible:ring-0",
                    isFiltersExpanded ? "scale-100 opacity-100" : "scale-0 opacity-0",
                  )}
                  style={{ transitionDelay: isFiltersExpanded ? "100ms" : "0ms" }}
                  aria-label="Filtrar por status"
                  data-testid="button-filter-meeting-status"
                >
                  <CalendarIcon className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-0" side="bottom" align="start" sideOffset={6}>
                <MeetingStatusFilterContent
                  selectedValues={selectedStatuses}
                  onToggle={handleStatusToggle}
                />
              </PopoverContent>
            </Popover>

            {/* Filtro Data */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 w-8 p-0 text-gray-500 transition-all duration-300 hover:text-gray-300 focus-visible:ring-0",
                    isFiltersExpanded ? "scale-100 opacity-100" : "scale-0 opacity-0",
                  )}
                  style={{ transitionDelay: isFiltersExpanded ? "150ms" : "0ms" }}
                  aria-label="Filtrar por data"
                  data-testid="button-filter-meeting-date"
                >
                  <Calendar className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" side="bottom" align="start" sideOffset={6}>
                <DateRangeFilterContent value={dateFilter} onChange={handleDateChange} />
              </PopoverContent>
            </Popover>

            {/* Filtro Responsável */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 w-8 p-0 text-gray-500 transition-all duration-300 hover:text-gray-300 focus-visible:ring-0",
                    isFiltersExpanded ? "scale-100 opacity-100" : "scale-0 opacity-0",
                  )}
                  style={{ transitionDelay: isFiltersExpanded ? "200ms" : "0ms" }}
                  aria-label="Filtrar por responsável"
                  data-testid="button-filter-meeting-assignee"
                >
                  <User className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-0" side="bottom" align="start" sideOffset={6}>
                <SearchableMultiSelect
                  items={availableAssignees}
                  selectedItems={selectedAssignees}
                  onSelectionChange={handleAssigneeChange}
                  placeholder="Buscar responsável..."
                  selectedLabel="Responsável selecionado"
                  availableLabel="Selecione mais"
                  emptyMessage="Nenhum responsável encontrado"
                  itemType="user"
                />
              </PopoverContent>
            </Popover>
          </ExpandableFilterBar>
        </div>
      </div>
      <Card className="overflow-hidden border-[#3a3a3a] bg-[#1a1a1a]">
        <MeetingsTable
          meetings={sortedAndFilteredMeetings}
          inlineProps={inlineProps}
          clientId={clientId}
          onMeetingClick={handleMeetingClick}
        />
      </Card>

      <MeetingDetailModal
        meeting={selectedMeeting}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        onUpdateMeeting={handleUpdateMeeting}
      />
    </div>
  );
}
