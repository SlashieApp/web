import type { ThreadViewConfig } from './types'

/**
 * Someone else's booking is complete and the viewer's quote is still pending
 * (BE-113): the notice and the top pin say so, no message does.
 */
export const threadCompletedByOther: ThreadViewConfig = {
  layout: 'conversation',
  composer: 'completedNotice',
  pins: true,
}
