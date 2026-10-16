import { workerBody } from './shared'
import type { PublicProfilePageConfig } from './types'

/** The worker quoted on one of your open tasks (`OPEN_QUOTE`). */
export const workerQuoted: PublicProfilePageConfig = {
  ...workerBody,
  ownerBar: false,
  heroActions: ['save', 'review'],
  report: true,
  contact: { action: 'viewQuote', helper: 'quoted' },
  activity: false,
}
