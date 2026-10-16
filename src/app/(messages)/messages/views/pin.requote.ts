import type { ThreadPinViewConfig } from './types'

/** Worker without a live quote on an open task: why, and Send quote. */
export const pinRequote: ThreadPinViewConfig = {
  ask: false,
  pill: 'task',
  headline: true,
  subline: false,
  facts: null,
  controls: 'mainCta',
}
