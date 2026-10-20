import type { ThreadPinViewConfig } from './types'

/** Owner with quotes waiting: compare them on task detail. */
export const pinQuotes: ThreadPinViewConfig = {
  pill: 'task',
  headline: true,
  subline: false,
  facts: null,
  controls: 'compareQuotes',
}
