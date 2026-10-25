import type { ThreadViewConfig } from './types'

/**
 * The viewer's quote is still pending after the booking ended and the task
 * isn't reopened yet (BE-116): no message says so, the notice and the top
 * pin do.
 */
export const threadOtherBookingEnded: ThreadViewConfig = {
  layout: 'conversation',
  composer: 'otherBookingEndedNotice',
  pins: true,
}
