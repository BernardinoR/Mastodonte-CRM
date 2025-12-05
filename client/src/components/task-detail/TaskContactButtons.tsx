import { Mail, Phone, MessageCircle } from "lucide-react";
import { UI_CLASSES } from "@/lib/statusConfig";

interface TaskContactButtonsProps {
  clientEmail?: string;
  clientPhone?: string;
}

export function TaskContactButtons({ clientEmail, clientPhone }: TaskContactButtonsProps) {
  if (!clientEmail && !clientPhone) return null;

  const buttonClass = `flex items-center gap-2 px-4 py-2 rounded-full text-sm text-gray-400 ${UI_CLASSES.contactBtn} hover:text-white transition-colors`;

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
          <button
            onClick={() => {
              const phone = clientPhone.replace(/\D/g, "");
              window.location.href = `whatsapp://send?phone=${phone}`;
            }}
            className={buttonClass}
            data-testid="button-whatsapp-client"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </button>
        </>
      )}
    </div>
  );
}
