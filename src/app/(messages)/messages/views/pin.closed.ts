import type { ThreadPinViewConfig } from './types'

/** Cancelled or failed bookings and cancelled tasks: the headline only. */
export const pinClosed: ThreadPinViewConfig = {
  ask: false,
  pill: 'task',
  headline: true,
  subline: false,
  facts: null,
  controls: null,
}
