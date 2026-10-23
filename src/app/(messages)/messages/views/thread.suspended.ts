import type { ThreadViewConfig } from './types'

/** The task or the booking is frozen by a suspension (BE-108): messaging is paused. */
export const threadSuspended: ThreadViewConfig = {
  layout: 'conversation',
  composer: 'suspendedNotice',
  pins: true,
}
