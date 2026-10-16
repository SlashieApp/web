import {
  WORKER_SETUP_SCREENS,
  type WorkerSetupScreenId,
  type WorkerSetupSubStepId,
  workerSetupScreen,
} from '../views'

/** Optional in the API too: setup finishes without them. */
const OPTIONAL_SUB_STEPS = new Set<WorkerSetupSubStepId>([
  'area.travel',
  'verify.portfolio',
])

const ORDER = WORKER_SETUP_SCREENS.map((view) => view.screen)

export const WORKER_SETUP_SCREEN_COUNT = ORDER.length

/** Every required sub-step of the screen is saved. */
export function isScreenDone(
  screen: WorkerSetupScreenId,
  completed: ReadonlySet<string>,
): boolean {
  return workerSetupScreen(screen).subSteps.every(
    (step) => OPTIONAL_SUB_STEPS.has(step) || completed.has(step),
  )
}

/** A returning worker picks up at the first screen not done, in web order. */
export function resumeScreen(
  completed: ReadonlySet<string>,
): WorkerSetupScreenId {
  return ORDER.find((screen) => !isScreenDone(screen, completed)) ?? 'review'
}

/** Open: the current screen, any done screen, or one whose earlier screens are all done. */
export function isScreenUnlocked(
  screen: WorkerSetupScreenId,
  active: WorkerSetupScreenId,
  completed: ReadonlySet<string>,
): boolean {
  if (screen === active || isScreenDone(screen, completed)) return true
  return ORDER.slice(0, ORDER.indexOf(screen)).every((earlier) =>
    isScreenDone(earlier, completed),
  )
}

export function nextScreen(
  screen: WorkerSetupScreenId,
): WorkerSetupScreenId | null {
  return ORDER[ORDER.indexOf(screen) + 1] ?? null
}

export function previousScreen(
  screen: WorkerSetupScreenId,
): WorkerSetupScreenId | null {
  return ORDER[ORDER.indexOf(screen) - 1] ?? null
}

/** 1-based, for "Step 2 of 6". */
export function screenNumber(screen: WorkerSetupScreenId): number {
  return ORDER.indexOf(screen) + 1
}
