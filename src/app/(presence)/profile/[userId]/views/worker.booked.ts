import { workerBody } from './shared'
import type { PublicProfilePageConfig } from './types'

/** You have a booked job with the worker (`OPEN_TASK`). */
export const workerBooked: PublicProfilePageConfig = {
  ...workerBody,
  ownerBar: false,
  heroActions: ['save', 'review'],
  report: true,
  contact: { action: 'openJob', helper: 'booked' },
  activity: false,
}
