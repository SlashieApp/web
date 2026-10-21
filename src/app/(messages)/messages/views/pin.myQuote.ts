import type { ThreadPinViewConfig } from './types'

/** A worker before booking: their own quote, its times and where it stands. */
export const pinMyQuote: ThreadPinViewConfig = {
  pill: false,
  headline: false,
  facts: 'myQuote',
}
