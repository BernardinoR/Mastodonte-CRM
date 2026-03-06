import { useState, useMemo } from "react";
import { getMockContasByClient } from "../../lib/contaMockData";
import { ContasTable } from "./ContasTable";

interface ClientConsolidacaoProps {
  clientId: string;
  clientName: string;
}

type StatusFilter = "Ativas" | "Desativadas" | "Todas";

export function ClientConsolidacao({ clientId }: ClientConsolidacaoProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("Ativas");
  const contas = useMemo(() => getMockContasByClient(clientId), [clientId]);

  return (
    <div className="space-y-6">
      <ContasTable
        contas={contas}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />
    </div>
  );
}
