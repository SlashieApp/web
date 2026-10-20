import { WorkerPublishState } from '@codegen/schema'

import type { ProfileView, ProfileViewInput } from './types'

/**
 * Picks the Profile view. A worker's state is the API's `publishState`:
 * a draft (unfinished setup) comes first, then hidden, then the phone they
 * still need to verify before quoting. Customers follow the private switch.
 */
export function getProfileView({
  workerPublishState,
  phoneVerified,
  isPrivate,
}: ProfileViewInput): ProfileView {
  if (!workerPublishState) return isPrivate ? 'customerHidden' : 'customer'
  if (workerPublishState === WorkerPublishState.Draft) return 'workerSetup'
  if (workerPublishState === WorkerPublishState.Hidden) return 'workerHidden'
  return phoneVerified ? 'workerReady' : 'workerVerifyPhone'
}
