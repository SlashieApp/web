import type { ThreadViewConfig } from './types'

/** Slashie announcements: read-only, no pinned card. */
export const threadSystem: ThreadViewConfig = {
  layout: 'conversation',
  composer: 'systemNotice',
}
