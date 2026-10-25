import type { ThreadPinViewConfig } from './types'

/** Completed, cancelled, didn't go ahead, or booked by someone else: the status. */
export const pinClosed: ThreadPinViewConfig = {
  pill: true,
  headline: true,
  facts: null,
}
