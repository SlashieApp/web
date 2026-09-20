import type { TaskDetailSectionId } from './taskDetailStickySections'

/**
 * Space so the last content line can scroll above the compact 2-row pin.
 */
export const TASK_DETAIL_PIN_CLEARANCE =
  'calc(7.5rem + env(safe-area-inset-bottom, 0px))' as const

export function taskDetailPinClearance(
  _pinnedId: TaskDetailSectionId | null,
): string {
  return TASK_DETAIL_PIN_CLEARANCE
}
