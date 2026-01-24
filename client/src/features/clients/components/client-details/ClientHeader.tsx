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
import type { Address, WhatsAppGroup } from "@features/clients";
import type { ClientStatus } from "@features/tasks/lib/statusConfig";
import type { useClientHeaderEditing } from "@features/clients";

function MetaItem({ 
  icon: Icon, 
  label, 
  value, 
  highlight = false 
}: { 
  icon: React.ComponentType<{ className?: string }>; 
  label: string; 
  value: string; 
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5" />
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
  };
  meetings: ClientMeeting[];
  whatsappGroups: WhatsAppGroup[];
  editingState: ReturnType<typeof useClientHeaderEditing>;
  onNewMeeting: () => void;
  onNewTask: () => void;
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
      .filter(m => m.type === "Mensal" && m.status === "Realizada")
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
      window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(primaryEmail)}`, "_blank");
    }
  };

  const activeWhatsAppGroups = whatsappGroups.filter(g => g.status === "Ativo" && g.link);
  const hasWhatsAppGroups = activeWhatsAppGroups.length > 0;

  return (
    <header className="mb-6 pb-5 border-b border-[#333333]">
      <div className="flex items-start gap-6 flex-wrap">
        <div 
          className="w-20 h-20 bg-[#2c2c2c] rounded-lg flex items-center justify-center text-2xl font-bold text-muted-foreground flex-shrink-0"
          data-testid="avatar-client-initials"
        >
          {client.initials}
        </div>
        
        <div className="flex-1 min-w-[300px]">
          <div className="flex items-center gap-3 flex-wrap mb-2">
            {isEditingName ? (
              <input
                ref={nameInputRef}
                type="text"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                onKeyDown={handleNameKeyDown}
                onBlur={handleNameBlur}
                className="text-3xl font-bold text-foreground bg-transparent border-b-2 border-[#2eaadc] outline-none min-w-[200px]"
                data-testid="input-client-name"
              />
            ) : (
              <h1 
                className="text-3xl font-bold text-foreground cursor-pointer px-2 py-1 -mx-2 -my-1 rounded-md hover:bg-[#2c2c2c] transition-colors"
                onClick={startEditingName}
                data-testid="text-client-name"
              >
                {client.name}
              </h1>
            )}
            <ClientStatusBadge 
              status={client.status}
              onStatusChange={onUpdateStatus}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                <IdCard className="w-3.5 h-3.5" />
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
                  className="text-sm font-medium text-foreground bg-transparent border-b-2 border-[#2eaadc] outline-none"
                  data-testid="input-client-cpf"
                />
              ) : (
                <span 
                  className="text-sm font-medium text-foreground cursor-pointer px-1.5 py-0.5 -mx-1.5 -my-0.5 rounded-md hover:bg-[#2c2c2c] transition-colors"
                  onClick={startEditingCpf}
                  data-testid="text-client-cpf"
                >
                  {client.cpf}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" />
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
                  className="text-sm font-medium text-foreground bg-transparent border-b-2 border-[#2eaadc] outline-none"
                  data-testid="input-client-phone"
                />
              ) : (
                <span 
                  className="text-sm font-medium text-foreground cursor-pointer px-1.5 py-0.5 -mx-1.5 -my-0.5 rounded-md hover:bg-[#2c2c2c] transition-colors"
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
            <AdvisorPopover
              currentAdvisor={client.advisor}
              onAdvisorChange={onUpdateAdvisor}
            />
            <MetaItem 
              icon={CalendarIcon} 
              label="Última Reunião" 
              value={format(lastMonthlyMeetingDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })} 
            />
            <AddressPopover
              address={client.address}
              onAddressChange={onUpdateAddress}
            />
            <FoundationCodeField
              code={client.foundationCode}
              onCodeChange={onUpdateFoundationCode}
            />
            <MetaItem icon={Clock} label="Cliente Desde" value={client.clientSince} />
          </div>

          <div className="flex gap-3 mt-6 flex-wrap">
            <Button 
              onClick={onNewMeeting}
              className="bg-[#2eaadc] hover:bg-[#259bc5] text-white"
              data-testid="button-new-meeting"
            >
              <CalendarIcon className="w-4 h-4 mr-2" />
              Agendar Reunião
            </Button>
            <Button 
              variant="outline" 
              onClick={onNewTask}
              className="border-[#333333] hover:bg-[#2c2c2c]"
              data-testid="button-new-task"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Task
            </Button>
            {hasWhatsAppGroups ? (
              <Popover open={whatsappPopoverOpen} onOpenChange={setWhatsappPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="border-[#333333] hover:bg-[#2c2c2c]"
                    data-testid="button-whatsapp"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    WhatsApp
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2 bg-[#202020] border-[#333333]" align="start">
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => {
                        handleWhatsApp();
                        setWhatsappPopoverOpen(false);
                      }}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-[#2c2c2c] rounded-md transition-colors text-left"
                      data-testid="button-whatsapp-direct"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Chat direto
                    </button>
                    <div className="border-t border-[#333333] my-1" />
                    <div className="px-3 py-1 text-xs text-muted-foreground uppercase">Grupos</div>
                    {activeWhatsAppGroups.map((group) => (
                      <button
                        key={group.id}
                        onClick={() => {
                          handleWhatsApp(group.link || undefined, true);
                          setWhatsappPopoverOpen(false);
                        }}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-[#2c2c2c] rounded-md transition-colors text-left"
                        data-testid={`button-whatsapp-group-${group.id}`}
                      >
                        <MessageSquare className="w-4 h-4 text-emerald-500" />
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
                className="border-[#333333] hover:bg-[#2c2c2c]"
                data-testid="button-whatsapp"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
            )}
            <Button 
              variant="outline"
              onClick={handleEmail}
              className="border-[#333333] hover:bg-[#2c2c2c]"
              data-testid="button-send-email"
            >
              <Mail className="w-4 h-4 mr-2" />
              Enviar Email
            </Button>
            {isBulkEditing ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={cancelAllChanges}
                  className="border-[#333333] hover:bg-[#2c2c2c]"
                  data-testid="button-cancel-edit"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                <Button 
                  onClick={commitAllChanges}
                  className="bg-[#2eaadc] hover:bg-[#259bc5] text-white"
                  data-testid="button-save-edit"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Salvar
                </Button>
              </>
            ) : (
              <Button 
                variant="outline" 
                onClick={handleEditClient}
                className="border-[#333333] hover:bg-[#2c2c2c]"
                data-testid="button-edit-client"
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
