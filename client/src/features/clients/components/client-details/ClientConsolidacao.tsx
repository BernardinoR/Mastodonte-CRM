import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/shared/lib/supabase";
import { ContasTable } from "./ContasTable";
import { ContaHistoricoSheet } from "./ContaHistoricoSheet";
import { ContaFormDialog } from "./ContaFormDialog";
import type { ContaFormData } from "./ContaFormDialog";
import type { Conta } from "../../types/conta";
import type { WhatsAppGroup } from "../../types/client";

interface ClientConsolidacaoProps {
  clientId: string;
  clientName: string;
  whatsappGroups?: WhatsAppGroup[];
}

type StatusFilter = "Ativas" | "Desativadas" | "Todas";

function mapDbConta(row: Record<string, unknown>): Conta {
  const inst = row.institutions as Record<string, unknown> | null;
  return {
    id: row.id as string,
    clientId: row.client_id as string,
    institutionId: row.institution_id as number,
    institution: {
      id: inst?.id as number,
      name: inst?.name as string,
      currency: (inst?.currency as "Real" | "Dolar" | "Euro") ?? "Real",
      attachmentCount: (inst?.attachment_count as number) ?? 1,
      referenceFiles: (inst?.reference_files as string[]) ?? [],
    },
    accountName: row.account_name as string,
    numeroConta: row.account_number as string | undefined,
    tipo: row.type as Conta["tipo"],
    competencia: row.start_date as string,
    competenciaDesativacao: row.end_date as string | undefined,
    status: row.status as Conta["status"],
    ativoDesde: row.active_since as string | undefined,
    desativadoDesde: row.deactivated_since as string | undefined,
    gerenteNome: row.manager_name as string | undefined,
    gerenteEmail: row.manager_email as string | undefined,
    gerenteTelefone: row.manager_phone as string | undefined,
    whatsappGroupId: row.whatsapp_group_id as string | undefined,
    whatsappGroupAtivo: row.whatsapp_group_linked as boolean | undefined,
  };
}

function mapContaToDb(clientId: string, data: ContaFormData) {
  return {
    client_id: clientId,
    institution_id: data.institutionId,
    account_name: data.accountName,
    account_number: data.numeroConta || null,
    type: data.tipo,
    start_date: data.competencia || null,
    end_date: data.competenciaDesativacao || null,
    status: data.status,
    manager_name: data.gerenteNome || null,
    manager_email: data.gerenteEmail || null,
    manager_phone: data.gerenteTelefone || null,
    whatsapp_group_id: data.whatsappGroupId || null,
    whatsapp_group_linked: data.whatsappGroupAtivo,
    updated_at: new Date().toISOString(),
  };
}

export function ClientConsolidacao({ clientId, whatsappGroups = [] }: ClientConsolidacaoProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("Ativas");
  const [selectedConta, setSelectedConta] = useState<Conta | null>(null);
  const [editingConta, setEditingConta] = useState<Conta | null>(null);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [contas, setContas] = useState<Conta[]>([]);

  useEffect(() => {
    async function fetchContas() {
      const { data, error } = await supabase
        .from("contas")
        .select("*, institutions(*)")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching contas:", error);
        return;
      }
      setContas((data || []).map(mapDbConta));
    }
    fetchContas();
  }, [clientId]);

  const handleAddConta = () => {
    setEditingConta(null);
    setIsFormDialogOpen(true);
  };

  const handleEditConta = (conta: Conta) => {
    setEditingConta(conta);
    setIsFormDialogOpen(true);
  };

  const handleSaveConta = useCallback(
    async (data: ContaFormData) => {
      const dbData = mapContaToDb(clientId, data);

      if (editingConta) {
        const { data: updated, error } = await supabase
          .from("contas")
          .update(dbData)
          .eq("id", editingConta.id)
          .select("*, institutions(*)")
          .single();

        if (error) {
          console.error("Error updating conta:", error);
          return;
        }
        const mapped = mapDbConta(updated);
        setContas((prev) => prev.map((c) => (c.id === mapped.id ? mapped : c)));
      } else {
        const { data: inserted, error } = await supabase
          .from("contas")
          .insert({ id: crypto.randomUUID(), ...dbData })
          .select("*, institutions(*)")
          .single();

        if (error) {
          console.error("Error inserting conta:", error);
          return;
        }
        setContas((prev) => [mapDbConta(inserted), ...prev]);
      }

      setIsFormDialogOpen(false);
    },
    [clientId, editingConta],
  );

  const handleDeleteConta = useCallback(async (contaId: string) => {
    const { error } = await supabase.from("contas").delete().eq("id", contaId);
    if (error) {
      console.error("Error deleting conta:", error);
      return;
    }
    setContas((prev) => prev.filter((c) => c.id !== contaId));
    setIsFormDialogOpen(false);
  }, []);

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
        onDelete={handleDeleteConta}
        whatsappGroups={whatsappGroups}
      />
    </div>
  );
}
