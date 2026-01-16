import { useState } from "react";
import { ClientCard } from "@/components/ClientCard";
import { NewClientInlineCard } from "@/components/NewClientInlineCard";
import { useClientsPage } from "@/hooks/useClientsPage";
import { useClients } from "@/contexts/ClientsContext";
import { useToast } from "@/hooks/use-toast";
import { 
  ClientsToolbar, 
  ClientsStatsGrid, 
  ClientsListView,
  ClientsFiltersRow
} from "@/components/clients-page";

export default function Clients() {
  const [isCreatingClient, setIsCreatingClient] = useState(false);
  const { addClient } = useClients();
  const { toast } = useToast();
  
  const {
    viewMode,
    setViewMode,
    filterMode,
    setFilterMode,
    isCompact,
    setIsCompact,
    searchQuery,
    setSearchQuery,
    filteredClients,
    stats,
    handleStatsClick,
    totalClients,
    noMeetingCount,
  } = useClientsPage();

  return (
    <div className="p-6">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Clientes</h1>
      </header>

      {/* Toolbar */}
      <ClientsToolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        filterMode={filterMode}
        onFilterModeChange={setFilterMode}
        isCompact={isCompact}
        onCompactChange={setIsCompact}
        totalClients={totalClients}
        noMeetingCount={noMeetingCount}
      />

      {/* Filters Row */}
      <ClientsFiltersRow
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNewClient={() => setIsCreatingClient(true)}
      />

      {/* Stats Grid */}
      <ClientsStatsGrid
        stats={stats}
        activeFilter={filterMode}
        onFilterClick={handleStatsClick}
      />

      {/* Content */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4">
          {isCreatingClient && (
            <NewClientInlineCard
              onSave={async (data) => {
                const result = await addClient(data);
                if (result.success) {
                  setIsCreatingClient(false);
                } else {
                  toast({
                    title: "Erro ao criar cliente",
                    description: result.error,
                    variant: "destructive",
                  });
                }
              }}
              onCancel={() => setIsCreatingClient(false)}
            />
          )}
          {filteredClients.map(client => (
            <ClientCard 
              key={client.id} 
              client={client} 
              isCompact={isCompact}
            />
          ))}
          {filteredClients.length === 0 && !isCreatingClient && (
            <div className="col-span-full text-center py-12 text-[#8c8c8c]">
              Nenhum cliente encontrado
            </div>
          )}
        </div>
      ) : (
        <ClientsListView clients={filteredClients} />
      )}
    </div>
  );
}
