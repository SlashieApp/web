import { workerBody } from './shared'
import type { PublicProfilePageConfig } from './types'

/** Signed in, no quote or job with this worker (`ACCEPT_QUOTE_FIRST`). */
export const workerVisitor: PublicProfilePageConfig = {
  ...workerBody,
  ownerBar: false,
  heroActions: ['save', 'review'],
  report: true,
  contact: { action: 'postTask', helper: 'locked' },
  activity: false,
}
