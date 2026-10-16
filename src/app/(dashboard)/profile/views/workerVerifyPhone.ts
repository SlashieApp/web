import type { ProfileViewConfig } from './types'

/** Finished worker without a verified phone: published, but can't quote yet. */
export const workerVerifyPhone: ProfileViewConfig = {
  badge: { label: 'actionRequired', tone: 'danger' },
  publicLink: true,
  nextStep: 'verifyPhone',
  workerCard: 'live',
}
