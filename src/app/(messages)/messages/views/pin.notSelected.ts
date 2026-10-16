import type { ThreadPinViewConfig } from './types'

/** The task went to another worker; the composer area says why. */
export const pinNotSelected: ThreadPinViewConfig = {
  ask: false,
  pill: 'notSelected',
  headline: false,
  subline: false,
  facts: null,
  controls: null,
}
