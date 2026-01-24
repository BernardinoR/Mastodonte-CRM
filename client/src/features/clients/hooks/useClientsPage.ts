import { useState, useMemo, useCallback } from "react";
import { useClients } from "@features/clients";
import { useTasks } from "@/contexts/TasksContext";
import { CLIENT_EXTENDED_DATA } from "@/shared/mocks/clientsMock";
import { 
  parseAUM, 
  daysSinceLastMeeting, 
  getMeetingDelayStatus, 
  formatAUM 
} from "@features/clients";
import type { 
  EnrichedClient, 
  ClientsPageStats, 
  ClientsViewMode, 
  ClientsFilterMode 
} from "@features/clients";

export function useClientsPage() {
  // Estados de UI
  const [viewMode, setViewMode] = useState<ClientsViewMode>('cards');
  const [filterMode, setFilterMode] = useState<ClientsFilterMode>('all');
  const [isCompact, setIsCompact] = useState(true); // Começar compacto por padrão
  const [searchQuery, setSearchQuery] = useState('');

  // Contextos
  const { clients } = useClients();
  const { getTasksByClient } = useTasks();

  // Enriquece clientes com dados calculados
  const enrichedClients = useMemo((): EnrichedClient[] => {
    return clients.map(client => {
      // Busca AUM dos dados estendidos
      const extendedData = CLIENT_EXTENDED_DATA[client.id];
      const aumString = extendedData?.stats?.[0]?.value || 'R$ 0';
      const aum = parseAUM(aumString);
      
      // Calcula dias desde última reunião
      const days = daysSinceLastMeeting(client.lastMeeting);
      const meetingDelayStatus = getMeetingDelayStatus(days);
      
      // Conta tasks urgentes
      const clientTasks = getTasksByClient(client.id);
      const urgentTasksCount = clientTasks.filter(
        task => task.priority === 'Urgente' && task.status !== 'Done'
      ).length;
      
      // Formata cidade/estado
      const cityState = client.address?.city && client.address?.state
        ? `${client.address.city}/${client.address.state}`
        : '';

      return {
        ...client,
        aum,
        aumFormatted: formatAUM(aum),
        daysSinceLastMeeting: days,
        meetingDelayStatus,
        urgentTasksCount,
        cityState,
      };
    });
  }, [clients, getTasksByClient]);

  // Filtra clientes baseado no modo e busca
  const filteredClients = useMemo(() => {
    let filtered = [...enrichedClients];

    // Aplica filtro de modo
    switch (filterMode) {
      case 'noMeeting':
        filtered = filtered.filter(c => c.daysSinceLastMeeting >= 30);
        break;
      case 'urgentTasks':
        filtered = filtered.filter(c => c.urgentTasksCount > 0);
        break;
      case 'byAum':
        // Ordenar por AUM decrescente
        filtered = filtered.sort((a, b) => b.aum - a.aum);
        break;
      // 'all' não precisa de filtro adicional
    }

    // Aplica filtro de busca
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(client =>
        client.name.toLowerCase().includes(query) ||
        client.emails.some(email => email.toLowerCase().includes(query)) ||
        client.phone?.toLowerCase().includes(query) ||
        client.advisor?.toLowerCase().includes(query) ||
        client.cityState?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [enrichedClients, filterMode, searchQuery]);

  // Calcula estatísticas agregadas
  const stats = useMemo((): ClientsPageStats => {
    const activeClients = enrichedClients.filter(c => c.status === 'Ativo').length;
    const totalAUM = enrichedClients.reduce((sum, c) => sum + c.aum, 0);
    const averageAUM = enrichedClients.length > 0 ? totalAUM / enrichedClients.length : 0;
    const noMeeting30Days = enrichedClients.filter(c => c.daysSinceLastMeeting >= 30).length;
    const urgentTasksClients = enrichedClients.filter(c => c.urgentTasksCount > 0).length;

    // Dados mockados para as novas stats
    const newClientsMonth = 3; // Mock
    const meetingsThisWeek = 8; // Mock
    const retentionRate = '98,2%'; // Mock

    return {
      totalAUM,
      averageAUM,
      activeClients,
      noMeeting30Days,
      urgentTasksClients,
      newClientsMonth,
      meetingsThisWeek,
      retentionRate,
    };
  }, [enrichedClients]);

  // Handler para mudança de filtro via clique nos stats
  const handleStatsClick = useCallback((statType: 'noMeeting' | 'urgentTasks') => {
    setFilterMode(prev => prev === statType ? 'all' : statType);
  }, []);

  return {
    // Estados
    viewMode,
    setViewMode,
    filterMode,
    setFilterMode,
    isCompact,
    setIsCompact,
    searchQuery,
    setSearchQuery,
    
    // Dados
    filteredClients,
    enrichedClients,
    stats,
    totalClients: enrichedClients.length,
    noMeetingCount: enrichedClients.filter(c => c.daysSinceLastMeeting >= 30).length,
    
    // Handlers
    handleStatsClick,
  };
}
