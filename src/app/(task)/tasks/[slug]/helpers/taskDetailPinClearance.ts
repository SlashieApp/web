import type { TaskDetailSectionId } from './taskDetailStickySections'

/**
 * Space so the last content line can scroll above the floating pin.
 * Tall marketing cards need more room than the thin confirm bar or
 * WorkerContactStickyBar-style owner pin.
 */
export const TASK_DETAIL_CTA_CLEARANCE =
  'calc(7.5rem + env(safe-area-inset-bottom, 0px))' as const

export const TASK_DETAIL_CONTACT_PIN_CLEARANCE =
  'calc(11rem + env(safe-area-inset-bottom, 0px))' as const

export const TASK_DETAIL_CARD_PIN_CLEARANCE =
  'calc(18rem + env(safe-area-inset-bottom, 0px))' as const

export function taskDetailPinClearance(
  pinnedId: TaskDetailSectionId | null,
): string {
  if (pinnedId === 'pricing' || pinnedId === 'share') {
    return TASK_DETAIL_CARD_PIN_CLEARANCE
  }
  if (pinnedId === 'owner') return TASK_DETAIL_CONTACT_PIN_CLEARANCE
  return TASK_DETAIL_CTA_CLEARANCE
}
