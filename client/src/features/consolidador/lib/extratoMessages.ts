import { buildWhatsAppSchedulingUrl } from "@features/clients/lib/schedulingMessage";

interface ExtratoMessageParams {
  contactName?: string;
  clientName: string;
  institution: string;
  referenceMonth: string;
  referenceMonths?: string[];
  collectionMethod: string;
}

const INSTITUTION_PREPOSITION: Record<string, string> = {
  Itaú: "no Itaú",
  BB: "no BB",
  Bradesco: "no Bradesco",
  BTG: "no BTG",
  C6: "no C6",
  Santander: "no Santander",
  Sicoob: "no Sicoob",
  Safra: "no Safra",
  "Mercado Bitcoin": "no Mercado Bitcoin",
  Avenue: "na Avenue",
  XP: "na XP",
  Fidelity: "na Fidelity",
  IB: "na IB",
  Smart: "na Smart",
  Toro: "na Toro",
  Warren: "na Warren",
  Singulare: "na Singulare",
  Revolut: "na Revolut",
};

function getInstitutionPreposition(name: string): string {
  return INSTITUTION_PREPOSITION[name] ?? `na ${name}`;
}

function formatMonthList(months: string[]): string {
  if (months.length === 1) return months[0];
  if (months.length === 2) return `${months[0]} e ${months[1]}`;
  return months.slice(0, -1).join(", ") + " e " + months[months.length - 1];
}

export function buildExtratoRequestMessage(params: ExtratoMessageParams): string {
  const {
    contactName,
    clientName,
    institution,
    referenceMonth,
    referenceMonths,
    collectionMethod,
  } = params;
  const instPrep = getInstitutionPreposition(institution);
  const greeting = contactName ? `Olá, ${contactName}` : "Olá";
  const months = referenceMonths?.length ? referenceMonths : [referenceMonth];
  const monthsStr = formatMonthList(months);
  const label = months.length > 1 ? "competências" : "competência";
  if (collectionMethod === "Manual") {
    const clientFirst = clientName.split(" ")[0];
    return `${greeting}, gostaria de solicitar o extrato de ${clientFirst} ${instPrep}, ${label} ${monthsStr}.`;
  } else {
    return `${greeting}, gostaria de solicitar o extrato ${instPrep}, ${label} ${monthsStr}.`;
  }
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
  const {
    to,
    cc,
    contactName,
    institution,
    referenceMonth,
    referenceMonths,
    collectionMethod,
    clientName,
  } = params;
  const instPrep = getInstitutionPreposition(institution);
  const greeting = contactName ? `Prezado(a) ${contactName}` : "Prezado(a)";
  const clientSuffix = collectionMethod === "Manual" ? ` de ${clientName.split(" ")[0]}` : "";
  const months = referenceMonths?.length ? referenceMonths : [referenceMonth];
  const monthsStr = formatMonthList(months);
  const label = months.length > 1 ? "competências" : "competência";
  const subject = `Solicitação de Extrato - ${institution} - ${monthsStr}`;
  const ccNote =
    collectionMethod === "Manual"
      ? `\n\nDeixo o cliente ${clientName} em cópia para aprovar a solicitação.`
      : "";
  const body = `${greeting},\n\nGostaria de solicitar o extrato${clientSuffix} ${instPrep}, ${label} ${monthsStr}.${ccNote}\n\nAtenciosamente.`;
  const ccParam = cc ? `&cc=${encodeURIComponent(cc)}` : "";
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}${ccParam}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
