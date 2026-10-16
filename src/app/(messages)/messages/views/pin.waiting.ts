import type { ThreadPinViewConfig } from './types'

/** Your own request, Done or Failed is waiting on the other person. */
export const pinWaiting: ThreadPinViewConfig = {
  ask: false,
  pill: 'task',
  headline: true,
  subline: true,
  facts: null,
  controls: null,
}
