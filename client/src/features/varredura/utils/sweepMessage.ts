import type { ManagerClient } from "../types/varredura";

export function buildSweepMessage(client: ManagerClient, institutionName: string): string {
  if (client.contactType === "manager") {
    const greeting = client.managerName ? `Olá ${client.managerName.split(" ")[0]}` : "Olá";
    return `${greeting}, tudo bem? Gostaria de verificar se há saldo disponível na conta do cliente ${client.clientName.split(" ")[0]} na ${institutionName} para alocação. Poderia nos informar?`;
  }
  const firstName = client.clientName.split(" ")[0];
  return `Olá ${firstName}, tudo bem? Gostaria de verificar se há saldo disponível na sua conta na ${institutionName} para alocação. Poderia nos informar?`;
}

export function buildSweepWhatsAppUrl(phone: string, message: string): string {
  const cleanPhone = phone.replace(/\D/g, "");
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export function buildSweepMailtoUrl(
  email: string,
  client: ManagerClient,
  institutionName: string,
): string {
  const subject =
    client.contactType === "manager"
      ? `Verificação de saldo — ${client.clientName} — ${institutionName}`
      : `Verificação de saldo — ${institutionName}`;
  const body = buildSweepMessage(client, institutionName);
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
