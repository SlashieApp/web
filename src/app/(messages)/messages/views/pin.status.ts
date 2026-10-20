import type { ThreadPinViewConfig } from './types'

/** Owner's open task with no live quotes: the status only. */
export const pinStatus: ThreadPinViewConfig = {
  pill: 'task',
  headline: true,
  subline: false,
  facts: null,
  controls: null,
}
