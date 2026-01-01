import { useState } from "react";
import { useParams, Link } from "wouter";
import { ArrowLeft, Lock, MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WhatsAppGroupsTable } from "@/components/WhatsAppGroupsTable";
import { ClientHeader, ClientMeetings, ClientTasks } from "@/components/client-details";
import { TasksCompletedCard } from "@/components/client-details/TasksCompletedCard";
import { useClientHeaderEditing } from "@/hooks/useClientHeaderEditing";
import { useTasks } from "@/contexts/TasksContext";
import { useClients } from "@/contexts/ClientsContext";
import { useInlineClientTasks } from "@/hooks/useInlineClientTasks";
import { useInlineClientMeetings } from "@/hooks/useInlineClientMeetings";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { DISABLED_SECTIONS_TOP, DISABLED_SECTIONS_BOTTOM, type DisabledSectionConfig } from "@/lib/clientSections";

function DisabledSection({ section }: { section: DisabledSectionConfig }) {
  const Icon = section.icon;
  return (
    <Card className="p-6 bg-[#202020] border-[#333333] opacity-60">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-[#2c2c2c] flex items-center justify-center">
          <Icon className="w-6 h-6 text-muted-foreground" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-semibold text-foreground">{section.title}</h3>
            <Badge variant="secondary" className="bg-[#333333] text-muted-foreground text-xs">
              <Lock className="w-3 h-3 mr-1" />
              Desabilitado
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{section.description}</p>
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
    dataVersion 
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
    onUpdateName: updateClientName,
    onUpdateCpf: updateClientCpf,
    onUpdatePhone: updateClientPhone,
  });
  
  if (!clientData) {
    return (
      <div className="p-6">
        <Link href="/clients" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Voltar para Clientes
        </Link>
        <div className="text-center text-muted-foreground">Cliente não encontrado</div>
      </div>
    );
  }
  
  const { client, stats, meetings, whatsappGroups } = clientData;

  return (
    <div className="p-6 max-w-6xl mx-auto" data-testid="page-client-details">
      <Link href="/clients" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Voltar para Clientes
      </Link>

      <ClientHeader
        client={client}
        whatsappGroups={whatsappGroups}
        editingState={editingState}
        onNewMeeting={inlineMeetingProps.handleStartAddMeeting}
        onNewTask={inlineTaskProps.handleStartAddTask}
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats
            .filter(s => s.label.toLowerCase() !== "tasks concluídas")
            .map((stat, index) => (
              <Card 
                key={`${stat.label}-${index}`} 
                className="p-4 bg-[#202020] border-[#333333]"
                data-testid={`card-stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div 
                  className="text-2xl font-bold text-foreground" 
                  data-testid={`text-stat-value-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {stat.value}
                </div>
                <div 
                  className="text-xs text-muted-foreground mt-1" 
                  data-testid={`text-stat-label-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {stat.label}
                </div>
                {stat.change && (
                  <div 
                    className={`text-xs mt-2 ${
                      stat.changeType === "positive" ? "text-emerald-400" : "text-red-400"
                    }`}
                    data-testid={`text-stat-change-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {stat.change}
                  </div>
                )}
              </Card>
            ))}
          <TasksCompletedCard tasks={clientTasks} />
        </div>
      </div>

      <div className="space-y-4 mb-8">
        {DISABLED_SECTIONS_TOP.map((section) => (
          <DisabledSection key={section.id} section={section} />
        ))}
      </div>

      <div className="space-y-8 mb-8">
        <ClientMeetings
          meetings={meetings}
          onNewMeeting={inlineMeetingProps.handleStartAddMeeting}
          inlineProps={inlineMeetingProps}
          clientId={clientId}
        />

        <ClientTasks 
          tasks={clientTasks} 
          inlineProps={inlineTaskProps} 
        />
      </div>

      <div className="space-y-4 mb-8">
        {DISABLED_SECTIONS_BOTTOM.map((section) => (
          <DisabledSection key={section.id} section={section} />
        ))}
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-base font-semibold text-foreground">Grupos de WhatsApp</h2>
          </div>
          <span 
            className="text-sm text-[#2eaadc] hover:underline cursor-pointer"
            onClick={() => setIsAddingWhatsAppGroup(true)}
            data-testid="button-new-whatsapp-group"
          >
            + Novo grupo
          </span>
        </div>
        <Card className="bg-[#202020] border-[#333333] overflow-hidden">
          <WhatsAppGroupsTable 
            groups={whatsappGroups}
            clientId={client.id}
            clientName={client.name}
            isAddingExternal={isAddingWhatsAppGroup}
            onCancelAddExternal={() => setIsAddingWhatsAppGroup(false)}
            onAddGroup={(group) => {
              addWhatsAppGroup(client.id, group);
              setIsAddingWhatsAppGroup(false);
            }}
            onUpdateGroup={(groupId, updates) => {
              updateWhatsAppGroup(client.id, groupId, updates);
            }}
            onDeleteGroup={(groupId) => {
              deleteWhatsAppGroup(client.id, groupId);
            }}
          />
        </Card>
      </div>
    </div>
  );
}
