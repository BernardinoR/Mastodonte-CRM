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
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { Calendar } from "@/shared/components/ui/calendar";
import { ClientStatusBadge } from "@features/clients";
import { EmailsPopover } from "@features/clients";
import { AdvisorPopover } from "@features/clients";
import { AddressPopover } from "@features/clients";
import { FoundationCodeField } from "@features/clients";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/shared/lib/utils";
import { useCopyToClipboard } from "@/shared/hooks";
import { formatPhone } from "@/shared/lib/formatters";
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

const MONTH_LABELS = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

const MONTH_FULL = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

function MonthYearPicker({
  value,
  onChange,
  label,
}: {
  value: Date;
  onChange: (date: Date) => void;
  label: string;
}) {
  const [viewYear, setViewYear] = useState(value.getFullYear());
  const [monthInput, setMonthInput] = useState("");
  const selectedMonth = value.getMonth();
  const selectedYear = value.getFullYear();

  const displayLabel = `${MONTH_FULL[value.getMonth()]} de ${value.getFullYear()}`;

  const handleMonthInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, "");
    if (raw.length > 6) raw = raw.slice(0, 6);
    if (raw.length > 2) raw = raw.slice(0, 2) + "/" + raw.slice(2);
    setMonthInput(raw);

    const match = raw.match(/^(\d{2})\/(\d{4})$/);
    if (match) {
      const month = parseInt(match[1], 10);
      const year = parseInt(match[2], 10);
      if (month >= 1 && month <= 12 && year >= 1900 && year <= 2100) {
        onChange(new Date(year, month - 1, 1));
        setViewYear(year);
      }
    }
  };

  const handleMonthSelect = (monthIndex: number) => {
    const newDate = new Date(viewYear, monthIndex, 1);
    onChange(newDate);
    setMonthInput(String(monthIndex + 1).padStart(2, "0") + "/" + viewYear);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="flex cursor-pointer flex-col gap-1" data-testid="picker-client-since">
          <span className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            Cliente Desde
          </span>
          <span className="-mx-1 flex items-center rounded-md px-1 text-sm font-medium text-foreground transition-colors hover:bg-[#333333]">
            {displayLabel}
            <ChevronDown className="ml-1 h-3 w-3 text-muted-foreground" />
          </span>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-64 border-[#3a3a3a] bg-[#1a1a1a] p-4" align="start">
        <div className="mb-3 border-b border-[#3a3a3a] pb-3">
          <Input
            type="text"
            placeholder="MM/yyyy"
            value={monthInput}
            onChange={handleMonthInputChange}
            className="h-8 border-[#3a3a3a] bg-[#2a2a2a] text-sm text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setViewYear((y) => y - 1)}
            className="rounded-md p-1 text-gray-400 transition-colors hover:bg-[#2a2a2a] hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-medium text-white">{viewYear}</span>
          <button
            type="button"
            onClick={() => setViewYear((y) => y + 1)}
            className="rounded-md p-1 text-gray-400 transition-colors hover:bg-[#2a2a2a] hover:text-white"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {MONTH_LABELS.map((m, i) => {
            const isSelected = i === selectedMonth && viewYear === selectedYear;
            return (
              <button
                key={m}
                type="button"
                onClick={() => handleMonthSelect(i)}
                className={cn(
                  "rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                  isSelected
                    ? "bg-blue-500 text-white"
                    : "text-gray-300 hover:bg-[#2a2a2a] hover:text-white",
                )}
              >
                {m}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function LastMeetingPicker({ value, onChange }: { value: Date; onChange: (date: Date) => void }) {
  const [dateInput, setDateInput] = useState("");
  const [calendarMonth, setCalendarMonth] = useState<Date>(value);

  const displayValue = format(value, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, "");
    if (raw.length > 8) raw = raw.slice(0, 8);
    if (raw.length > 4) raw = raw.slice(0, 2) + "/" + raw.slice(2, 4) + "/" + raw.slice(4);
    else if (raw.length > 2) raw = raw.slice(0, 2) + "/" + raw.slice(2);
    setDateInput(raw);

    const match = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (match) {
      const day = parseInt(match[1], 10);
      const month = parseInt(match[2], 10);
      const year = parseInt(match[3], 10);
      if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1900 && year <= 2100) {
        const parsed = new Date(year, month - 1, day);
        if (parsed.getDate() === day && parsed.getMonth() === month - 1) {
          onChange(parsed);
          setCalendarMonth(parsed);
        }
      }
    }
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      onChange(date);
      setDateInput(format(date, "dd/MM/yyyy"));
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="flex cursor-pointer flex-col gap-1" data-testid="picker-last-meeting">
          <span className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
            <CalendarIcon className="h-3.5 w-3.5" />
            Última Reunião
          </span>
          <span className="-mx-1 flex items-center rounded-md px-1 text-sm font-medium text-foreground transition-colors hover:bg-[#333333]">
            {displayValue}
            <ChevronDown className="ml-1 h-3 w-3 text-muted-foreground" />
          </span>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto border-[#3a3a3a] bg-[#1a1a1a] p-0" align="start">
        <div className="border-b border-[#3a3a3a] px-4 pb-3 pt-4">
          <Input
            type="text"
            placeholder="dd/MM/yyyy"
            value={dateInput}
            onChange={handleDateInputChange}
            className="h-8 border-[#3a3a3a] bg-[#2a2a2a] text-sm text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <Calendar
          mode="single"
          selected={value}
          onSelect={handleCalendarSelect}
          locale={ptBR}
          month={calendarMonth}
          onMonthChange={setCalendarMonth}
        />
      </PopoverContent>
    </Popover>
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
    clientSinceDate: Date;
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
  const copy = useCopyToClipboard();

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
    draftLastMeeting,
    setDraftLastMeeting,
    draftClientSince,
    setDraftClientSince,
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
                  onClick={() => (client.cpf ? copy(client.cpf, "CPF") : startEditingCpf())}
                  data-testid="text-client-cpf"
                >
                  {client.cpf || "—"}
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
                  onClick={() =>
                    client.phone ? copy(client.phone, "Telefone") : startEditingPhone()
                  }
                  data-testid="text-client-phone"
                >
                  {client.phone ? formatPhone(client.phone) : "—"}
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
            {isBulkEditing ? (
              <LastMeetingPicker
                value={draftLastMeeting ?? lastMonthlyMeetingDate}
                onChange={setDraftLastMeeting}
              />
            ) : (
              <MetaItem
                icon={CalendarIcon}
                label="Última Reunião"
                value={format(lastMonthlyMeetingDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                disabled={client.monthlyMeetingDisabled}
              />
            )}
            <AddressPopover address={client.address} onAddressChange={onUpdateAddress} />
            <FoundationCodeField
              code={client.foundationCode}
              onCodeChange={onUpdateFoundationCode}
            />
            {isBulkEditing ? (
              <MonthYearPicker
                value={draftClientSince ?? client.clientSinceDate}
                onChange={setDraftClientSince}
                label={client.clientSince}
              />
            ) : (
              <MetaItem icon={Clock} label="Cliente Desde" value={client.clientSince} />
            )}
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
