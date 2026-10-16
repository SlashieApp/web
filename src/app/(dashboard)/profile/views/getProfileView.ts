import type { ProfileView, ProfileViewInput } from './types'

/**
 * Picks the Profile view. A worker's unfinished setup comes first (the draft
 * is private anyway), then a private profile, then the phone they still need
 * to verify before quoting.
 */
export function getProfileView({
  hasWorker,
  setupComplete,
  phoneVerified,
  isPrivate,
}: ProfileViewInput): ProfileView {
  if (!hasWorker) return isPrivate ? 'customerHidden' : 'customer'
  if (!setupComplete) return 'workerSetup'
  if (isPrivate) return 'workerHidden'
  return phoneVerified ? 'workerReady' : 'workerVerifyPhone'
}
