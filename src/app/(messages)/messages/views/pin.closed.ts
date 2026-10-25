import type { ThreadPinViewConfig } from './types'

/**
 * Completed, cancelled, didn't go ahead, booked by someone else, or the
 * booking ended and the task isn't reopened: the status.
 */
export const pinClosed: ThreadPinViewConfig = {
  pill: true,
  headline: true,
  facts: null,
}
