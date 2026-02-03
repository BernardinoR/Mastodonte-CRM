export function buildSchedulingMessage(
  clientName: string,
  calendarLink: string
): string {
  const firstName = clientName.split(' ')[0];
  return `Olá ${firstName}! Gostaria de agendar nossa próxima reunião. Por favor, escolha o melhor horário no link abaixo:\n\n${calendarLink}\n\nAguardo seu retorno!`;
}

export function buildWhatsAppSchedulingUrl(
  phone: string,
  message: string
): string {
  const cleanPhone = phone.replace(/\D/g, '');
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}
