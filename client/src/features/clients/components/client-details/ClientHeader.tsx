import { useState, useMemo } from "react";
import {
  Phone,
  Mail,
  Calendar as CalendarIcon,
  Plus,
  MessageSquare,
  Edit,
  IdCard,
  Clock,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { ClientStatusBadge } from "@features/clients";
import { EmailsPopover } from "@features/clients";
import { AdvisorPopover } from "@features/clients";
import { AddressPopover } from "@features/clients";
import { FoundationCodeField } from "@features/clients";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/shared/lib/utils";
import type { Address, WhatsAppGroup } from "@features/clients";
import type { ClientStatus } from "@features/tasks/lib/statusConfig";
import type { useClientHeaderEditing } from "@features/clients";

function MetaItem({
  icon: Icon,
  label,
  value,
  highlight = false,
  disabled = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  highlight?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className={cn("flex flex-col gap-1", disabled && "opacity-40")}>
      <span className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </span>
      <span className={`text-sm font-medium ${highlight ? "text-emerald-400" : "text-foreground"}`}>
        {value}
      </span>
    </div>
  );
}

interface ClientMeeting {
  id: string;
  name: string;
  type: string;
  status: string;
  date: Date;
  assignees: string[];
}

interface ClientHeaderProps {
  client: {
    id: string;
    name: string;
    initials: string;
    cpf: string;
    phone: string;
    emails: string[];
    primaryEmailIndex: number;
    advisor: string;
    lastMeeting: Date;
    address: Address;
    foundationCode: string;
    clientSince: string;
    status: ClientStatus;
    monthlyMeetingDisabled: boolean;
  };
  meetings: ClientMeeting[];
  whatsappGroups: WhatsAppGroup[];
  editingState: ReturnType<typeof useClientHeaderEditing>;
  onNewMeeting: () => void;
  onNewTask: () => void;
  onScheduleWhatsApp: () => void;
  onAddEmail: (email: string) => void;
  onRemoveEmail: (index: number) => void;
  onUpdateEmail: (index: number, email: string) => void;
  onSetPrimaryEmail: (index: number) => void;
  onUpdateAdvisor: (advisor: string) => void;
  onUpdateAddress: (address: Address) => void;
  onUpdateFoundationCode: (code: string) => void;
  onUpdateStatus: (status: ClientStatus) => void;
}

export function ClientHeader({
  client,
  meetings,
  whatsappGroups,
  editingState,
  onNewMeeting,
  onNewTask,
  onScheduleWhatsApp,
  onAddEmail,
  onRemoveEmail,
  onUpdateEmail,
  onSetPrimaryEmail,
  onUpdateAdvisor,
  onUpdateAddress,
  onUpdateFoundationCode,
  onUpdateStatus,
}: ClientHeaderProps) {
  const [whatsappPopoverOpen, setWhatsappPopoverOpen] = useState(false);

  // Calcular última reunião mensal realizada (tipo "Mensal" + status "Realizada")
  const lastMonthlyMeetingDate = useMemo(() => {
    const monthlyMeetings = meetings
      .filter((m) => m.type === "Mensal" && m.status === "Realizada")
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return monthlyMeetings[0]?.date || client.lastMeeting;
  }, [meetings, client.lastMeeting]);

  const {
    isEditingName,
    draftName,
    setDraftName,
    isEditingCpf,
    draftCpf,
    isEditingPhone,
    draftPhone,
    isBulkEditing,
    nameInputRef,
    cpfInputRef,
    phoneInputRef,
    startEditingName,
    handleNameKeyDown,
    handleNameBlur,
    startEditingCpf,
    handleCpfChange,
    handleCpfKeyDown,
    handleCpfBlur,
    startEditingPhone,
    handlePhoneChange,
    handlePhoneKeyDown,
    handlePhoneBlur,
    handleEditClient,
    commitAllChanges,
    cancelAllChanges,
  } = editingState;

  const handleWhatsApp = (link?: string, isGroup?: boolean) => {
    if (isGroup && link) {
      const groupCode = link.replace(/^https?:\/\/chat\.whatsapp\.com\//, "");
      window.location.href = `whatsapp://chat/?code=${groupCode}`;
    } else {
      const clientPhone = client.phone.replace(/\D/g, "");
      window.location.href = `whatsapp://send?phone=${clientPhone}`;
    }
  };

  const handleEmail = () => {
    const primaryEmail = client.emails[client.primaryEmailIndex] || client.emails[0];
    if (primaryEmail) {
      window.open(
        `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(primaryEmail)}`,
        "_blank",
      );
    }
  };

  const activeWhatsAppGroups = whatsappGroups.filter((g) => g.status === "Ativo" && g.link);
  const hasWhatsAppGroups = activeWhatsAppGroups.length > 0;

  return (
    <header className="mb-6 border-b border-[#3a3a3a] pb-5">
      <div className="flex flex-wrap items-start gap-6">
        <div
          className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-lg bg-[#2a2a2a] text-2xl font-bold text-muted-foreground"
          data-testid="avatar-client-initials"
        >
          {client.initials}
        </div>

        <div className="min-w-[300px] flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-3">
            {isEditingName ? (
              <input
                ref={nameInputRef}
                type="text"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                onKeyDown={handleNameKeyDown}
                onBlur={handleNameBlur}
                className="min-w-[200px] border-b-2 border-[#2eaadc] bg-transparent text-3xl font-bold text-foreground outline-none"
                data-testid="input-client-name"
              />
            ) : (
              <h1
                className="-mx-2 -my-1 cursor-pointer rounded-md px-2 py-1 text-3xl font-bold text-foreground transition-colors hover:bg-[#333333]"
                onClick={startEditingName}
                data-testid="text-client-name"
              >
                {client.name}
              </h1>
            )}
            <ClientStatusBadge status={client.status} onStatusChange={onUpdateStatus} />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="flex flex-col gap-1">
              <span className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
                <IdCard className="h-3.5 w-3.5" />
                CPF
              </span>
              {isEditingCpf ? (
                <input
                  ref={cpfInputRef}
                  type="text"
                  value={draftCpf}
                  onChange={handleCpfChange}
                  onKeyDown={handleCpfKeyDown}
                  onBlur={handleCpfBlur}
                  className="border-b-2 border-[#2eaadc] bg-transparent text-sm font-medium text-foreground outline-none"
                  data-testid="input-client-cpf"
                />
              ) : (
                <span
                  className="-mx-1.5 -my-0.5 cursor-pointer rounded-md px-1.5 py-0.5 text-sm font-medium text-foreground transition-colors hover:bg-[#333333]"
                  onClick={startEditingCpf}
                  data-testid="text-client-cpf"
                >
                  {client.cpf}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <span className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
                <Phone className="h-3.5 w-3.5" />
                Telefone
              </span>
              {isEditingPhone ? (
                <input
                  ref={phoneInputRef}
                  type="text"
                  value={draftPhone}
                  onChange={handlePhoneChange}
                  onKeyDown={handlePhoneKeyDown}
                  onBlur={handlePhoneBlur}
                  className="border-b-2 border-[#2eaadc] bg-transparent text-sm font-medium text-foreground outline-none"
                  data-testid="input-client-phone"
                />
              ) : (
                <span
                  className="-mx-1.5 -my-0.5 cursor-pointer rounded-md px-1.5 py-0.5 text-sm font-medium text-foreground transition-colors hover:bg-[#333333]"
                  onClick={startEditingPhone}
                  data-testid="text-client-phone"
                >
                  {client.phone}
                </span>
              )}
            </div>
            <EmailsPopover
              emails={client.emails}
              primaryEmailIndex={client.primaryEmailIndex}
              onAddEmail={onAddEmail}
              onRemoveEmail={onRemoveEmail}
              onUpdateEmail={onUpdateEmail}
              onSetPrimaryEmail={onSetPrimaryEmail}
            />
            <AdvisorPopover currentAdvisor={client.advisor} onAdvisorChange={onUpdateAdvisor} />
            <MetaItem
              icon={CalendarIcon}
              label="Última Reunião"
              value={format(lastMonthlyMeetingDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              disabled={client.monthlyMeetingDisabled}
            />
            <AddressPopover address={client.address} onAddressChange={onUpdateAddress} />
            <FoundationCodeField
              code={client.foundationCode}
              onCodeChange={onUpdateFoundationCode}
            />
            <MetaItem icon={Clock} label="Cliente Desde" value={client.clientSince} />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              onClick={onScheduleWhatsApp}
              className="bg-[#2eaadc] text-white hover:bg-[#259bc5]"
              data-testid="button-new-meeting"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              Agendar Reunião
            </Button>
            <Button
              variant="outline"
              onClick={onNewTask}
              className="border-[#3a3a3a] hover:bg-[#333333]"
              data-testid="button-new-task"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nova Task
            </Button>
            {hasWhatsAppGroups ? (
              <Popover open={whatsappPopoverOpen} onOpenChange={setWhatsappPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-[#3a3a3a] hover:bg-[#333333]"
                    data-testid="button-whatsapp"
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    WhatsApp
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 border-[#3a3a3a] bg-[#2a2a2a] p-2" align="start">
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => {
                        handleWhatsApp();
                        setWhatsappPopoverOpen(false);
                      }}
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-[#333333]"
                      data-testid="button-whatsapp-direct"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Chat direto
                    </button>
                    <div className="my-1 border-t border-[#3a3a3a]" />
                    <div className="px-3 py-1 text-xs uppercase text-muted-foreground">Grupos</div>
                    {activeWhatsAppGroups.map((group) => (
                      <button
                        key={group.id}
                        onClick={() => {
                          handleWhatsApp(group.link || undefined, true);
                          setWhatsappPopoverOpen(false);
                        }}
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-[#333333]"
                        data-testid={`button-whatsapp-group-${group.id}`}
                      >
                        <MessageSquare className="h-4 w-4 text-emerald-500" />
                        {group.name}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            ) : (
              <Button
                variant="outline"
                onClick={() => handleWhatsApp()}
                className="border-[#3a3a3a] hover:bg-[#333333]"
                data-testid="button-whatsapp"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                WhatsApp
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleEmail}
              className="border-[#3a3a3a] hover:bg-[#333333]"
              data-testid="button-send-email"
            >
              <Mail className="mr-2 h-4 w-4" />
              Enviar Email
            </Button>
            {isBulkEditing ? (
              <>
                <Button
                  variant="outline"
                  onClick={cancelAllChanges}
                  className="border-[#3a3a3a] hover:bg-[#333333]"
                  data-testid="button-cancel-edit"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>
                <Button
                  onClick={commitAllChanges}
                  className="bg-[#2eaadc] text-white hover:bg-[#259bc5]"
                  data-testid="button-save-edit"
                >
                  <Check className="mr-2 h-4 w-4" />
                  Salvar
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                onClick={handleEditClient}
                className="border-[#3a3a3a] hover:bg-[#333333]"
                data-testid="button-edit-client"
              >
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
