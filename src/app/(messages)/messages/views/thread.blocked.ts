import type { ThreadViewConfig } from './types'

/** You blocked the other person: unblock from the menu to send. */
export const threadBlocked: ThreadViewConfig = {
  layout: 'conversation',
  composer: 'blockedNotice',
  pins: true,
}
