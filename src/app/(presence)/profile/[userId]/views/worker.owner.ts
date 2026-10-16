import { workerBody } from './shared'
import type { PublicProfilePageConfig } from './types'

/** Your own worker profile: what visitors see, then Your activity. */
export const workerOwner: PublicProfilePageConfig = {
  ...workerBody,
  ownerBar: true,
  heroActions: [],
  report: false,
  contact: null,
  activity: true,
}
