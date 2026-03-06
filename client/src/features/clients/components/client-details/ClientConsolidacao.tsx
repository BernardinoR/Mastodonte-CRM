import { useState, useMemo } from "react";
import { getMockContasByClient } from "../../lib/contaMockData";
import { ContasTable } from "./ContasTable";
import { ContaHistoricoSheet } from "./ContaHistoricoSheet";
import type { Conta } from "../../types/conta";

interface ClientConsolidacaoProps {
  clientId: string;
  clientName: string;
}

type StatusFilter = "Ativas" | "Desativadas" | "Todas";

export function ClientConsolidacao({ clientId }: ClientConsolidacaoProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("Ativas");
  const [selectedConta, setSelectedConta] = useState<Conta | null>(null);
  const contas = useMemo(() => getMockContasByClient(clientId), [clientId]);

  return (
    <div className="space-y-6">
      <ContasTable
        contas={contas}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onContaClick={setSelectedConta}
      />
      <ContaHistoricoSheet
        conta={selectedConta}
        open={!!selectedConta}
        onOpenChange={(open) => {
          if (!open) setSelectedConta(null);
        }}
      />
    </div>
  );
}
