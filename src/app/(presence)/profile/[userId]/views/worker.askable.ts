import { workerBody } from './shared'
import type { PublicProfilePageConfig } from './types'

/**
 * Signed in, no quote or job with this worker (`ACCEPT_QUOTE_FIRST`), and the
 * API says this viewer can ask them to quote (`canAskToQuote`, FE-507). Same
 * as `worker.visitor` but for the main action.
 */
export const workerAskable: PublicProfilePageConfig = {
  ...workerBody,
  ownerBar: null,
  heroActions: ['save', 'review'],
  report: true,
  contact: { action: 'askToQuote', helper: 'ask' },
  activity: false,
}
