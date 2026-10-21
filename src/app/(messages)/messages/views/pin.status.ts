import type { ThreadPinViewConfig } from './types'

/** An open task with no live quote to show: the status only. */
export const pinStatus: ThreadPinViewConfig = {
  pill: true,
  headline: true,
  facts: null,
}
