import type { ThreadViewConfig } from './types'

/** The task went to another worker. */
export const threadNotSelected: ThreadViewConfig = {
  layout: 'conversation',
  composer: 'notSelectedNotice',
  pins: true,
}
