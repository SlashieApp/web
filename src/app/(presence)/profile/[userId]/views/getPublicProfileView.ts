import { WorkerContactAction } from '@codegen/schema'

import type { PublicProfileViewInput, PublicProfileViewName } from './types'

const WORKER_VIEW_BY_CONTACT: Record<
  WorkerContactAction,
  PublicProfileViewName
> = {
  [WorkerContactAction.SignIn]: 'worker.guest',
  [WorkerContactAction.AcceptQuoteFirst]: 'worker.visitor',
  [WorkerContactAction.OpenQuote]: 'worker.quoted',
  [WorkerContactAction.OpenTask]: 'worker.booked',
  [WorkerContactAction.None]: 'worker.owner',
}

/**
 * The one place that decides what /profile/[userId] shows. Precedence:
 * query state, then no profile (the empty shell), then your own profile
 * (with a hidden notice when it is private), then customer, then the
 * worker's contact state for this viewer.
 */
export function getPublicProfileView({
  query,
  profile,
}: PublicProfileViewInput): PublicProfileViewName {
  if (query === 'loading') return 'loading'
  if (query === 'error') return 'loadError'
  if (!profile) return 'unavailable'
  if (profile.isSelf) {
    if (profile.isHidden) {
      return profile.isWorker ? 'worker.ownerHidden' : 'customer.ownerHidden'
    }
    return profile.isWorker ? 'worker.owner' : 'customer.owner'
  }
  if (!profile.isWorker) return 'customer.visitor'

  const contact = profile.contact
  if (!contact) return 'worker.guest'
  const name = WORKER_VIEW_BY_CONTACT[contact.action]
  const needsTask = name === 'worker.quoted' || name === 'worker.booked'
  return needsTask && !contact.relatedTaskId ? 'worker.visitor' : name
}
