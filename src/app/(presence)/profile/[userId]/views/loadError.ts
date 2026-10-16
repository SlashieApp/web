import type { PublicProfileStatusConfig } from './types'

/** The query failed and nothing is cached. */
export const loadError: PublicProfileStatusConfig = {
  layout: 'status',
  copy: 'error',
  action: 'retry',
}
