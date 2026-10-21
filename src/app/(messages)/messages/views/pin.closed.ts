import type { ThreadPinViewConfig } from './types'

/** Completed, cancelled or didn't go ahead: the final status. */
export const pinClosed: ThreadPinViewConfig = {
  pill: true,
  headline: true,
  facts: null,
}
