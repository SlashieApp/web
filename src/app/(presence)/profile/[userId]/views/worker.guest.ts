import { workerBody } from './shared'
import type { PublicProfilePageConfig } from './types'

/** Signed out, worker profile. Save and the main button ask to sign in. */
export const workerGuest: PublicProfilePageConfig = {
  ...workerBody,
  ownerBar: false,
  heroActions: ['save'],
  report: true,
  contact: { action: 'signIn', helper: 'locked' },
  activity: false,
}
