import { useState } from "react";
import { ClientCard } from "@/components/ClientCard";
import { NewClientDialog } from "@/components/NewClientDialog";
import { useClientsPage } from "@/hooks/useClientsPage";
import { 
  ClientsToolbar, 
  ClientsStatsGrid, 
  ClientsListView,
  ClientsFiltersRow
} from "@/components/clients-page";

export default function Clients() {
  const [newClientOpen, setNewClientOpen] = useState(false);
  
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
        onNewClient={() => setNewClientOpen(true)}
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
          {filteredClients.map(client => (
            <ClientCard 
              key={client.id} 
              client={client} 
              isCompact={isCompact}
            />
          ))}
          {filteredClients.length === 0 && (
            <div className="col-span-full text-center py-12 text-[#8c8c8c]">
              Nenhum cliente encontrado
            </div>
          )}
        </div>
      ) : (
        <ClientsListView clients={filteredClients} />
      )}

      {/* New Client Dialog */}
      <NewClientDialog
        open={newClientOpen}
        onOpenChange={setNewClientOpen}
        onSubmit={(data) => console.log('New client:', data)}
      />
    </div>
  );
}
