import type { ThreadViewConfig } from './types'

/**
 * Someone else is booked and the viewer's quote is still pending (BE-113):
 * no message says so, the notice and the top pin do.
 */
export const threadBookedByOther: ThreadViewConfig = {
  layout: 'conversation',
  composer: 'bookedByOtherNotice',
  pins: true,
}
