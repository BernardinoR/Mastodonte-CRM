import { useState } from "react";
import { Mail, Phone, MessageCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { UI_CLASSES } from "@/lib/statusConfig";
import type { WhatsAppGroup } from "@/types/client";

interface TaskContactButtonsProps {
  clientEmail?: string;
  clientPhone?: string;
  whatsappGroups?: WhatsAppGroup[];
}

export function TaskContactButtons({ clientEmail, clientPhone, whatsappGroups = [] }: TaskContactButtonsProps) {
  const [whatsappPopoverOpen, setWhatsappPopoverOpen] = useState(false);

  if (!clientEmail && !clientPhone) return null;

  const buttonClass = `flex items-center gap-2 px-4 py-2 rounded-full text-sm text-gray-400 ${UI_CLASSES.contactBtn} hover:text-white transition-colors`;

  const activeWhatsAppGroups = whatsappGroups.filter(g => g.status === "Ativo" && g.link);
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

  return (
    <div className="flex gap-3 mb-6">
      {clientEmail && (
        <a
          href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(clientEmail)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClass}
          data-testid="button-email-client"
        >
          <Mail className="w-4 h-4" />
          Enviar Email
        </a>
      )}
      {clientPhone && (
        <>
          <a
            href={`tel:${clientPhone}`}
            className={buttonClass}
            data-testid="button-call-client"
          >
            <Phone className="w-4 h-4" />
            Ligar
          </a>
          {hasWhatsAppGroups ? (
            <Popover open={whatsappPopoverOpen} onOpenChange={setWhatsappPopoverOpen}>
              <PopoverTrigger asChild>
                <button
                  className={buttonClass}
                  data-testid="button-whatsapp-client"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </button>
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
                    <MessageCircle className="w-4 h-4" />
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
                      <MessageCircle className="w-4 h-4 text-emerald-500" />
                      {group.name}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          ) : (
            <button
              onClick={() => handleWhatsApp()}
              className={buttonClass}
              data-testid="button-whatsapp-client"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </button>
          )}
        </>
      )}
    </div>
  );
}
