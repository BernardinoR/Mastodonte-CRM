import { useState, useEffect } from "react";
import { ClientCard } from "@features/clients";
import { NewClientInlineCard } from "@features/clients";
import { useClientsPage } from "@features/clients";
import { useClients } from "@features/clients";
import { useToast } from "@/shared/hooks/use-toast";
import {
  ClientsToolbar,
  ClientsStatsGrid,
  ClientsListView,
  ClientsFiltersRow
} from "@features/clients/components/clients-page";
import { useClientImportExport } from "../hooks/useClientImportExport";
import { ImportClientsDialog } from "../components/ImportClientsDialog";

export default function Clients() {
  const [isCreatingClient, setIsCreatingClient] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const { addClient, refetchClients } = useClients();
  const { toast } = useToast();

  // Refetch clientes ao montar a página para garantir dados atualizados
  useEffect(() => {
    refetchClients();
  }, [refetchClients]);

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

  const {
    state: importState,
    validation,
    importResult,
    errorMessage,
    progress,
    handleFileSelected,
    confirmImport,
    exportClients,
    downloadTemplate,
    reset: resetImport,
  } = useClientImportExport();

  const handleImportFile = (file: File) => {
    setShowImportDialog(true);
    handleFileSelected(file);
  };

  const handleExportClients = () => {
    exportClients();
    toast({
      title: "Exportação concluída",
      description: "O arquivo Excel foi baixado com sucesso.",
    });
  };

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
        onImportFile={handleImportFile}
        onExportClients={handleExportClients}
        onDownloadTemplate={downloadTemplate}
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

      {/* Import Dialog */}
      <ImportClientsDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        state={importState}
        validation={validation}
        importResult={importResult}
        errorMessage={errorMessage}
        progress={progress}
        onConfirmImport={confirmImport}
        onReset={resetImport}
      />
    </div>
  );
}
