/**
 * Utilitários para ordenação de tasks
 */

import { PRIORITY_ORDER } from "./constants";
import type { TaskPriority } from "../types/task";

/**
 * Ordena tasks por data (mais recente primeiro) e depois por prioridade (Urgente primeiro)
 */
export function sortTasksByDateAndPriority<T extends { dueDate: Date | string; priority?: string }>(
  tasks: T[]
): T[] {
  return [...tasks].sort((a, b) => {
    // Data mais recente primeiro
    const dateA = new Date(a.dueDate).getTime();
    const dateB = new Date(b.dueDate).getTime();
    if (dateB !== dateA) return dateB - dateA;

    // Urgente primeiro
    const priorityA = PRIORITY_ORDER[(a.priority || "Normal") as TaskPriority] || 3;
    const priorityB = PRIORITY_ORDER[(b.priority || "Normal") as TaskPriority] || 3;
    return priorityA - priorityB;
  });
}

