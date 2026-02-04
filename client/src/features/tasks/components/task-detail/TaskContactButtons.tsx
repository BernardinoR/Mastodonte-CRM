import { useState } from "react";
import { Mail, Phone, MessageCircle, Calendar } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { UI_CLASSES } from "../../lib/statusConfig";
import type { WhatsAppGroup } from "@features/clients";
import { useCurrentUser } from "@features/users";
import {
  buildSchedulingMessage,
  buildWhatsAppSchedulingUrl,
} from "@features/clients/lib/schedulingMessage";
import { supabase } from "@/shared/lib/supabase";

interface TaskContactButtonsProps {
  clientEmail?: string;
  clientPhone?: string;
  clientName?: string;
  clientId?: string;
  whatsappGroups?: WhatsAppGroup[];
}

export function TaskContactButtons({
  clientEmail,
  clientPhone,
  clientName,
  clientId,
  whatsappGroups = [],
}: TaskContactButtonsProps) {
  const [whatsappPopoverOpen, setWhatsappPopoverOpen] = useState(false);
  const { data: currentUserData } = useCurrentUser();
  const calendarLink = currentUserData?.user?.calendarLink;

  if (!clientEmail && !clientPhone) return null;

  const buttonClass = `flex items-center gap-2 px-4 py-2 rounded-full text-sm text-gray-400 ${UI_CLASSES.contactBtn} hover:text-white transition-colors`;

  const activeWhatsAppGroups = whatsappGroups.filter((g) => g.status === "Ativo" && g.link);
  const hasWhatsAppGroups = activeWhatsAppGroups.length > 0;

  const handleWhatsApp = (link?: string, isGroup?: boolean) => {
    if (isGroup && link) {
      const groupCode = link.replace(/^https?:\/\/chat\.whatsapp\.com\//, "");
      window.location.href = `whatsapp://chat/?code=${groupCode}`;
    } else if (clientPhone) {
      const phone = clientPhone.replace(/\D/g, "");
      window.location.href = `whatsapp://send?phone=${phone}`;
    }
  };

  const handleSchedulingWhatsApp = async () => {
    if (!calendarLink || !clientPhone || !clientName) return;

    // Record scheduling message sent
    if (clientId) {
      try {
        await supabase
          .from("clients")
          .update({ scheduling_message_sent_at: new Date().toISOString() })
          .eq("id", clientId);
      } catch (err) {
        console.error("Error recording scheduling sent:", err);
      }
    }

    const message = buildSchedulingMessage(clientName, calendarLink);
    const url = buildWhatsAppSchedulingUrl(clientPhone, message);
    window.open(url, "_blank");
  };

  return (
    <div className="mb-6 flex gap-3">
      {clientEmail && (
        <a
          href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(clientEmail)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClass}
          data-testid="button-email-client"
        >
          <Mail className="h-4 w-4" />
          Enviar Email
        </a>
      )}
      {clientPhone && (
        <>
          <a href={`tel:${clientPhone}`} className={buttonClass} data-testid="button-call-client">
            <Phone className="h-4 w-4" />
            Ligar
          </a>
          {hasWhatsAppGroups ? (
            <Popover open={whatsappPopoverOpen} onOpenChange={setWhatsappPopoverOpen}>
              <PopoverTrigger asChild>
                <button className={buttonClass} data-testid="button-whatsapp-client">
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-64 border-[#333333] bg-[#202020] p-2" align="start">
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => {
                      handleWhatsApp();
                      setWhatsappPopoverOpen(false);
                    }}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-[#2c2c2c]"
                    data-testid="button-whatsapp-direct"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Chat direto
                  </button>
                  {calendarLink && clientName && (
                    <button
                      onClick={() => {
                        handleSchedulingWhatsApp();
                        setWhatsappPopoverOpen(false);
                      }}
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-[#2c2c2c]"
                      data-testid="button-whatsapp-scheduling"
                    >
                      <Calendar className="h-4 w-4 text-emerald-500" />
                      Enviar link de agendamento
                    </button>
                  )}
                  <div className="my-1 border-t border-[#333333]" />
                  <div className="px-3 py-1 text-xs uppercase text-muted-foreground">Grupos</div>
                  {activeWhatsAppGroups.map((group) => (
                    <button
                      key={group.id}
                      onClick={() => {
                        handleWhatsApp(group.link || undefined, true);
                        setWhatsappPopoverOpen(false);
                      }}
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-[#2c2c2c]"
                      data-testid={`button-whatsapp-group-${group.id}`}
                    >
                      <MessageCircle className="h-4 w-4 text-emerald-500" />
                      {group.name}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          ) : calendarLink && clientName ? (
            <Popover open={whatsappPopoverOpen} onOpenChange={setWhatsappPopoverOpen}>
              <PopoverTrigger asChild>
                <button className={buttonClass} data-testid="button-whatsapp-client">
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-64 border-[#333333] bg-[#202020] p-2" align="start">
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => {
                      handleWhatsApp();
                      setWhatsappPopoverOpen(false);
                    }}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-[#2c2c2c]"
                    data-testid="button-whatsapp-direct"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Chat direto
                  </button>
                  <button
                    onClick={() => {
                      handleSchedulingWhatsApp();
                      setWhatsappPopoverOpen(false);
                    }}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-[#2c2c2c]"
                    data-testid="button-whatsapp-scheduling"
                  >
                    <Calendar className="h-4 w-4 text-emerald-500" />
                    Enviar link de agendamento
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          ) : (
            <button
              onClick={() => handleWhatsApp()}
              className={buttonClass}
              data-testid="button-whatsapp-client"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </button>
          )}
        </>
      )}
    </div>
  );
}
