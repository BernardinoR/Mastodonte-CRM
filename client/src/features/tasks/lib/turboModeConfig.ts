export { PRIORITY_ORDER, POMODORO_DURATION } from "./constants";

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
