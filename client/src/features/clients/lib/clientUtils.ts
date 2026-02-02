/**
 * Funções utilitárias para clientes
 * Extrai e calcula dados dos mocks existentes
 */

/**
 * Extrai valor numérico do AUM (ex: "R$ 2,8M" -> 2800000)
 */
export function parseAUM(aumString: string): number {
  if (!aumString) return 0;
  
  // Remove "R$ " e espaços
  const cleaned = aumString.replace(/R\$\s*/i, '').trim();
  
  // Extrai número e sufixo (M, K, etc)
  const match = cleaned.match(/^([\d,.]+)\s*(M|K|B)?$/i);
  if (!match) return 0;
  
  // Converte vírgula para ponto e parseia
  const value = parseFloat(match[1].replace(',', '.'));
  const suffix = (match[2] || '').toUpperCase();
  
  // Multiplica pelo fator do sufixo
  switch (suffix) {
    case 'B':
      return value * 1_000_000_000;
    case 'M':
      return value * 1_000_000;
    case 'K':
      return value * 1_000;
    default:
      return value;
  }
}

/**
 * Calcula dias desde a última reunião
 */
export function daysSinceLastMeeting(lastMeeting: Date | null | undefined): number {
  if (!lastMeeting) return -1;
  
  const now = new Date();
  const meetingDate = new Date(lastMeeting);
  const diffTime = now.getTime() - meetingDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
}

/**
 * Determina status de atraso: ok (<30d), warning (30-60d), critical (>60d)
 * Se mensagem de agendamento foi enviada nas últimas 24h, retorna 'ok' (grace period)
 */
export function getMeetingDelayStatus(
  days: number,
  schedulingMessageSentAt?: Date | null
): 'ok' | 'warning' | 'critical' {
  // Grace period: se mensagem de agendamento foi enviada nas últimas 24h
  if (schedulingMessageSentAt) {
    const hoursSinceSent = (Date.now() - new Date(schedulingMessageSentAt).getTime()) / (1000 * 60 * 60);
    if (hoursSinceSent < 24) return 'ok';
  }

  if (days < 0) return 'critical'; // Sem reunião registrada
  if (days < 30) return 'ok';
  if (days < 60) return 'warning';
  return 'critical';
}

/**
 * Formata AUM para exibição (ex: 2800000 -> "R$ 2,8M")
 */
export function formatAUM(value: number): string {
  if (value >= 1_000_000_000) {
    return `R$ ${(value / 1_000_000_000).toFixed(1).replace('.', ',')}B`;
  }
  if (value >= 1_000_000) {
    return `R$ ${(value / 1_000_000).toFixed(1).replace('.', ',')}M`;
  }
  if (value >= 1_000) {
    return `R$ ${(value / 1_000).toFixed(0)}K`;
  }
  return `R$ ${value.toFixed(0)}`;
}

/**
 * Formata data relativa (ex: "há 5 dias", "há 2 meses")
 */
export function formatDaysAgo(days: number): string {
  if (days < 0) return 'Sem registro';
  if (days === 0) return 'Hoje';
  if (days === 1) return 'Ontem';
  if (days < 7) return `há ${days} dias`;
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return weeks === 1 ? 'há 1 semana' : `há ${weeks} semanas`;
  }
  if (days < 365) {
    const months = Math.floor(days / 30);
    return months === 1 ? 'há 1 mês' : `há ${months} meses`;
  }
  const years = Math.floor(days / 365);
  return years === 1 ? 'há 1 ano' : `há ${years} anos`;
}
