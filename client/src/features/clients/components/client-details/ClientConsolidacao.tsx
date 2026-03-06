import { useState, useMemo } from "react";
import { getMockContasByClient } from "../../lib/contaMockData";
import { ContasTable } from "./ContasTable";
import { ContaHistoricoSheet } from "./ContaHistoricoSheet";
import { ContaFormDialog } from "./ContaFormDialog";
import type { ContaFormData } from "./ContaFormDialog";
import type { Conta } from "../../types/conta";

interface ClientConsolidacaoProps {
  clientId: string;
  clientName: string;
}

type StatusFilter = "Ativas" | "Desativadas" | "Todas";

export function ClientConsolidacao({ clientId }: ClientConsolidacaoProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("Ativas");
  const [selectedConta, setSelectedConta] = useState<Conta | null>(null);
  const [editingConta, setEditingConta] = useState<Conta | null>(null);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const contas = useMemo(() => getMockContasByClient(clientId), [clientId]);

  const handleAddConta = () => {
    setEditingConta(null);
    setIsFormDialogOpen(true);
  };

  const handleEditConta = (conta: Conta) => {
    setEditingConta(conta);
    setIsFormDialogOpen(true);
  };

  const handleSaveConta = (data: ContaFormData) => {
    console.log("Save conta:", data);
    setIsFormDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <ContasTable
        contas={contas}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onContaClick={setSelectedConta}
        onAddConta={handleAddConta}
        onEditConta={handleEditConta}
      />
      <ContaHistoricoSheet
        conta={selectedConta}
        open={!!selectedConta}
        onOpenChange={(open) => {
          if (!open) setSelectedConta(null);
        }}
      />
      <ContaFormDialog
        conta={editingConta}
        open={isFormDialogOpen}
        onOpenChange={setIsFormDialogOpen}
        onSave={handleSaveConta}
      />
    </div>
  );
}
