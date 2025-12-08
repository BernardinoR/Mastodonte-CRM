import type { TaskPriority } from "@/types/task";

export const POMODORO_DURATION = 25 * 60;

export const PRIORITY_ORDER: Record<TaskPriority, number> = {
  "Urgente": 0,
  "Importante": 1,
  "Normal": 2,
  "Baixa": 3,
};

export interface TaskTurboStatus {
  visited: boolean;
  hadAction: boolean;
}

export interface TurboSessionStats {
  tasksWithHistory: number;
  tasksMovedToDone: number;
  totalTasksVisited: number;
  totalTasks: number;
  sessionDurationSeconds: number;
  averageTimePerTask: number;
}
