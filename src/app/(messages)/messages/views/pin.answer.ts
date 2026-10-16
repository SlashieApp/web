import type { ThreadPinViewConfig } from './types'

/** They asked to move or cancel: the answer buttons, right here. */
export const pinAnswer: ThreadPinViewConfig = {
  ask: true,
  pill: null,
  headline: true,
  subline: false,
  facts: null,
  controls: 'request',
}
