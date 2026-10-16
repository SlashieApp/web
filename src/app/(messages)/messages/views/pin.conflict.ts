import type { ThreadPinViewConfig } from './types'

/** Done on one side, Failed on the other: sort it out on task detail. */
export const pinConflict: ThreadPinViewConfig = {
  ask: true,
  pill: null,
  headline: true,
  subline: false,
  facts: null,
  controls: 'openTask',
}
