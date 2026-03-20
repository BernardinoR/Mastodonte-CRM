import { buildWhatsAppSchedulingUrl } from "@features/clients/lib/schedulingMessage";

interface ExtratoMessageParams {
  contactName?: string;
  clientName: string;
  institution: string;
  referenceMonth: string;
  collectionMethod: string;
}

export function buildExtratoRequestMessage(params: ExtratoMessageParams): string {
  const { contactName, clientName, institution, referenceMonth, collectionMethod } = params;
  const greeting = contactName ? `Olá, ${contactName}` : "Olá";
  const clientSuffix =
    collectionMethod === "Manual" ? ` do cliente ${clientName.split(" ")[0]}` : "";
  return `${greeting}, gostaria de solicitar o extrato da ${institution} da competência ${referenceMonth}${clientSuffix}.`;
}

export function buildExtratoWhatsAppUrl(phone: string, message: string): string {
  return buildWhatsAppSchedulingUrl(phone, message);
}

export function buildExtratoEmailUrl(
  params: ExtratoMessageParams & {
    to: string;
    cc?: string;
  },
): string {
  const { to, cc, contactName, institution, referenceMonth, collectionMethod, clientName } = params;
  const greeting = contactName ? `Prezado(a) ${contactName}` : "Prezado(a)";
  const clientSuffix =
    collectionMethod === "Manual" ? ` do cliente ${clientName.split(" ")[0]}` : "";
  const subject = `Solicitação de Extrato - ${institution} - ${referenceMonth}`;
  const body = `${greeting},\n\nGostaria de solicitar o extrato da ${institution} da competência ${referenceMonth}${clientSuffix}.\n\nAtenciosamente.`;
  const ccParam = cc ? `&cc=${encodeURIComponent(cc)}` : "";
  return `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}${ccParam}&body=${encodeURIComponent(body)}`;
}
