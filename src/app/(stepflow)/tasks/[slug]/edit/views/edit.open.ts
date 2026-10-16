import type { EditTaskViewConfig } from './types'

/** Open (or draft) with no live quotes: every detail can change. */
export const editOpen: EditTaskViewConfig = {
  layout: 'form',
  quotesWarning: false,
}
