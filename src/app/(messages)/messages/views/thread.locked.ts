import type { ThreadViewConfig } from './types'

/** Before a quote is accepted: the quotes show, messages wait. */
export const threadLocked: ThreadViewConfig = {
  layout: 'conversation',
  composer: 'lockedNotice',
}
