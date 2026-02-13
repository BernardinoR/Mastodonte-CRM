import { useState } from "react";
import { useParams, Link } from "wouter";
import { ArrowLeft, Lock, MessageSquare } from "lucide-react";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { toast } from "@/shared/hooks/use-toast";
import { supabase } from "@/shared/lib/supabase";
import { WhatsAppGroupsTable } from "@features/clients";
import {
  ClientHeader,
  ClientMeetings,
  ClientTasks,
  ClientPeculiarities,
} from "@features/clients/components/client-details";
import { TasksCompletedCard } from "@features/clients/components/client-details/TasksCompletedCard";
import { MeetingsCard } from "@features/clients/components/client-details/MeetingsCard";
import { DisabledStatCard } from "@features/clients/components/client-details/DisabledStatCard";
import { useClientHeaderEditing } from "@features/clients";
import { useTasks } from "@features/tasks";
import { useClients } from "@features/clients";
import { useInlineClientTasks } from "@features/clients";
import { useInlineClientMeetings } from "@features/clients";
import { useCurrentUser } from "@features/users";
import {
  DISABLED_SECTIONS_TOP,
  DISABLED_SECTIONS_BOTTOM,
  type DisabledSectionConfig,
} from "@features/clients";
import {
  buildSchedulingMessage,
  buildWhatsAppSchedulingUrl,
} from "@features/clients/lib/schedulingMessage";

function DisabledSection({ section }: { section: DisabledSectionConfig }) {
  const Icon = section.icon;
  return (
    <Card className="border-[#3a3a3a] bg-[#1a1a1a] p-6 opacity-60">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#2c2c2c]">
          <Icon className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-semibold text-foreground">{section.title}</h3>
            <Badge variant="secondary" className="bg-[#333333] text-xs text-muted-foreground">
              <Lock className="mr-1 h-3 w-3" />
              Desabilitado
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{section.description}</p>
        </div>
      </div>
    </Card>
  );
}

export default function ClientDetails() {
  const params = useParams<{ id: string }>();
  const [isAddingWhatsAppGroup, setIsAddingWhatsAppGroup] = useState(false);

  const { getTasksByClient } = useTasks();
  const {
    getFullClientData,
    getClientByName,
    addWhatsAppGroup,
    updateWhatsAppGroup,
    deleteWhatsAppGroup,
    updateClientStatus,
    updateClientName,
    updateClientCpf,
    updateClientPhone,
    addClientEmail,
    removeClientEmail,
    updateClientEmail,
    setClientPrimaryEmail,
    updateClientAdvisor,
    updateClientAddress,
    updateClientFoundationCode,
    updateClientPeculiarities,
    updateClientLastMeeting,
    updateClientSince,
    updateClientMonthlyMeetingDisabled,
    dataVersion,
  } = useClients();

  void dataVersion;

  const clientIdOrName = params.id || "1";

  let clientData = getFullClientData(clientIdOrName);

  if (!clientData) {
    const decodedName = decodeURIComponent(clientIdOrName);
    const clientByName = getClientByName(decodedName);
    if (clientByName) {
      clientData = getFullClientData(clientByName.id);
    }
  }

  const clientId = clientData?.client.id || "";
  const clientName = clientData?.client.name || "";

  const clientTasks = getTasksByClient(clientName);

  const { data: currentUserData } = useCurrentUser();
  const currentUserName = currentUserData?.user?.name || currentUserData?.user?.email || "";
  const calendarLink = currentUserData?.user?.calendarLink;

  const handleScheduleWhatsApp = async () => {
    if (!calendarLink) {
      toast({
        title: "Link de agendamento não configurado",
        description: "Configure seu link do Google Calendar no seu perfil",
        variant: "destructive",
      });
      return;
    }

    const clientPhone = clientData?.client.phone;
    if (!clientPhone) {
      toast({
        title: "Telefone não informado",
        description: "O cliente não possui telefone cadastrado",
        variant: "destructive",
      });
      return;
    }

    // Record scheduling message sent
    try {
      await supabase
        .from("clients")
        .update({ scheduling_message_sent_at: new Date().toISOString() })
        .eq("id", clientId);
    } catch (err) {
      console.error("Error recording scheduling sent:", err);
    }

    // Open WhatsApp with pre-formatted message
    const message = buildSchedulingMessage(clientName, calendarLink);
    const url = buildWhatsAppSchedulingUrl(clientPhone, message);
    window.open(url, "_blank");
  };

  const inlineTaskProps = useInlineClientTasks({
    clientId,
    clientName,
    defaultAssignee: currentUserName,
  });

  const inlineMeetingProps = useInlineClientMeetings({
    clientId,
    clientName,
    defaultAssignee: currentUserName,
  });

  const editingState = useClientHeaderEditing({
    clientId,
    clientName: clientData?.client.name || "",
    clientCpf: clientData?.client.cpf || "",
    clientPhone: clientData?.client.phone || "",
    clientLastMeeting: clientData?.client.lastMeeting || new Date(),
    clientSinceDate: clientData?.client.clientSinceDate || new Date(),
    onUpdateName: updateClientName,
    onUpdateCpf: updateClientCpf,
    onUpdatePhone: updateClientPhone,
    onUpdateLastMeeting: updateClientLastMeeting,
    onUpdateClientSince: updateClientSince,
  });

  if (!clientData) {
    return (
      <div className="p-6">
        <Link
          href="/clients"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Clientes
        </Link>
        <div className="text-center text-muted-foreground">Cliente não encontrado</div>
      </div>
    );
  }

  const autoOpenMeetingId = new URLSearchParams(window.location.search).get("meetingId");

  const { client, meetings, whatsappGroups } = clientData;

  const handleAddPeculiarity = (text: string) => {
    updateClientPeculiarities(client.id, [...client.peculiarities, text]);
  };

  const handleRemovePeculiarity = (index: number) => {
    updateClientPeculiarities(
      client.id,
      client.peculiarities.filter((_, i) => i !== index),
    );
  };

  const handleToggleMonthlyMeeting = (disabled: boolean) => {
    updateClientMonthlyMeetingDisabled(client.id, disabled);
  };

  return (
    <div className="mx-auto max-w-6xl p-6" data-testid="page-client-details">
      <Link
        href="/clients"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para Clientes
      </Link>

      <ClientHeader
        client={client}
        meetings={meetings}
        whatsappGroups={whatsappGroups}
        editingState={editingState}
        onNewMeeting={inlineMeetingProps.handleStartAddMeeting}
        onNewTask={inlineTaskProps.handleStartAddTask}
        onScheduleWhatsApp={handleScheduleWhatsApp}
        onAddEmail={(email) => addClientEmail(client.id, email)}
        onRemoveEmail={(index) => removeClientEmail(client.id, index)}
        onUpdateEmail={(index, email) => updateClientEmail(client.id, index, email)}
        onSetPrimaryEmail={(index) => setClientPrimaryEmail(client.id, index)}
        onUpdateAdvisor={(advisor) => updateClientAdvisor(client.id, advisor)}
        onUpdateAddress={(address) => updateClientAddress(client.id, address)}
        onUpdateFoundationCode={(code) => updateClientFoundationCode(client.id, code)}
        onUpdateStatus={(status) => updateClientStatus(client.id, status)}
      />

      <div className="mb-8">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {/* 1. AUM - Indisponível */}
          <DisabledStatCard title="AUM" />

          {/* 2. Reuniões */}
          <MeetingsCard meetings={meetings} />

          {/* 3. Tasks Concluídas */}
          <TasksCompletedCard tasks={clientTasks} />

          {/* 4. Indicações - Indisponível */}
          <DisabledStatCard title="Indicações" />
        </div>
      </div>

      <div className="mb-8 space-y-4">
        {DISABLED_SECTIONS_TOP.map((section) => (
          <DisabledSection key={section.id} section={section} />
        ))}
      </div>

      <div className="mb-8 space-y-8">
        <ClientMeetings
          meetings={meetings}
          onNewMeeting={inlineMeetingProps.handleStartAddMeeting}
          inlineProps={inlineMeetingProps}
          clientId={clientId}
          autoOpenMeetingId={autoOpenMeetingId}
        />

        <ClientTasks tasks={clientTasks} inlineProps={inlineTaskProps} clientName={client.name} />
      </div>

      <div className="mb-8 space-y-4">
        {DISABLED_SECTIONS_BOTTOM.map((section) => (
          <DisabledSection key={section.id} section={section} />
        ))}
      </div>

      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-base font-semibold text-foreground">Grupos de WhatsApp</h2>
          </div>
          <span
            className="cursor-pointer text-sm text-[#2eaadc] hover:underline"
            onClick={() => setIsAddingWhatsAppGroup(true)}
            data-testid="button-new-whatsapp-group"
          >
            + Novo grupo
          </span>
        </div>
        <Card className="overflow-hidden border-[#3a3a3a] bg-[#1a1a1a]">
          <WhatsAppGroupsTable
            groups={whatsappGroups}
            clientId={client.id}
            clientName={client.name}
            isAddingExternal={isAddingWhatsAppGroup}
            onCancelAddExternal={() => setIsAddingWhatsAppGroup(false)}
            onAddGroup={async (group) => {
              await addWhatsAppGroup(client.id, group);
              setIsAddingWhatsAppGroup(false);
            }}
            onUpdateGroup={async (groupId, updates) => {
              await updateWhatsAppGroup(client.id, groupId, updates);
            }}
            onDeleteGroup={async (groupId) => {
              await deleteWhatsAppGroup(client.id, groupId);
            }}
          />
        </Card>
      </div>

      <div className="mb-8">
        <ClientPeculiarities
          peculiarities={client.peculiarities}
          monthlyMeetingDisabled={client.monthlyMeetingDisabled}
          onAddPeculiarity={handleAddPeculiarity}
          onRemovePeculiarity={handleRemovePeculiarity}
          onToggleMonthlyMeeting={handleToggleMonthlyMeeting}
        />
      </div>
    </div>
  );
}
