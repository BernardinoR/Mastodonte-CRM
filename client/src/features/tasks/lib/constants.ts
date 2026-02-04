/**
 * Constantes centralizadas para o módulo de tasks
 * Fonte única de verdade para ordenação de prioridades e configurações
 */

import type { TaskPriority } from "../types/task";

/**
 * Ordem de prioridades para sorting
 * Valores menores = maior prioridade
 */
export const PRIORITY_ORDER: Record<TaskPriority, number> = {
  Urgente: 0,
  Importante: 1,
  Normal: 2,
  Baixa: 3,
};

/**
 * Duração do pomodoro em segundos (25 minutos)
 */
export const POMODORO_DURATION = 25 * 60;
