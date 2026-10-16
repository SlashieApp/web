import type { ThreadViewConfig } from './types'

/** A quote was accepted (or an order exists) and nobody is blocked. */
export const threadOpen: ThreadViewConfig = {
  layout: 'conversation',
  composer: 'open',
}
