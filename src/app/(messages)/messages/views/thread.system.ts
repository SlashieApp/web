import type { ThreadViewConfig } from './types'

/** Slashie announcements: read-only, no pins. */
export const threadSystem: ThreadViewConfig = {
  layout: 'conversation',
  composer: 'systemNotice',
  pins: false,
}
