import type { ThreadPinViewConfig } from './types'

/** Worker with a pending quote: Quote sent, its price and Edit quote. */
export const pinQuoting: ThreadPinViewConfig = {
  pill: 'task',
  headline: true,
  subline: false,
  facts: 'quote',
  controls: 'mainCta',
}
