import type { ThreadPinViewConfig } from './types'

/** Job complete: the agreed price, then Review or Get receipt. */
export const pinDone: ThreadPinViewConfig = {
  ask: false,
  pill: 'task',
  headline: false,
  subline: false,
  facts: 'price',
  controls: 'mainCta',
}
