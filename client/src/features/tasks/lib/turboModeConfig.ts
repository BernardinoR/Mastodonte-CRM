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

// --- Turbo suspend/resume persistence ---

export const TURBO_SUSPENDED_KEY = "turbo-suspended-state";
export const TURBO_SUSPEND_TTL_MS = 5 * 60 * 1000; // 5 minutes

export interface TurboSuspendedNavigation {
  sessionTaskIds: string[];
  currentIndex: number;
  taskStatuses: Record<string, TaskTurboStatus>;
  actionPerformed: boolean;
}

export interface TurboSuspendedState {
  navigation: TurboSuspendedNavigation;
  timerRemainingSeconds: number;
  timerWasRunning: boolean;
  sessionStartTime: number;
  completedInSession: number;
  tasksMovedToDone: number;
  suspendedAt: number;
}

export function saveTurboSuspendedState(state: TurboSuspendedState): void {
  try {
    sessionStorage.setItem(TURBO_SUSPENDED_KEY, JSON.stringify(state));
  } catch {
    // sessionStorage full or unavailable — silently ignore
  }
}

export function loadTurboSuspendedState(): TurboSuspendedState | null {
  try {
    const raw = sessionStorage.getItem(TURBO_SUSPENDED_KEY);
    if (!raw) return null;
    const state: TurboSuspendedState = JSON.parse(raw);
    if (Date.now() - state.suspendedAt > TURBO_SUSPEND_TTL_MS) {
      sessionStorage.removeItem(TURBO_SUSPENDED_KEY);
      return null;
    }
    return state;
  } catch {
    return null;
  }
}

export function clearTurboSuspendedState(): void {
  try {
    sessionStorage.removeItem(TURBO_SUSPENDED_KEY);
  } catch {
    // silently ignore
  }
}
