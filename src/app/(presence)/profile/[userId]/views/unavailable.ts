import type { PublicProfileStatusConfig } from './types'

/**
 * No public profile: private, suspended, banned, deleting, deleted or an
 * unknown id. The API answers the same for all of them on purpose.
 */
export const unavailable: PublicProfileStatusConfig = {
  layout: 'status',
  copy: 'unavailable',
  action: 'search',
}
