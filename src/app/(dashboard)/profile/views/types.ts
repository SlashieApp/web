/** What /profile shows for the signed-in person (README.md). */
export type ProfileView =
  | 'customer'
  | 'customerHidden'
  | 'workerSetup'
  | 'workerHidden'
  | 'workerVerifyPhone'
  | 'workerReady'

export type ProfileViewInput = {
  hasWorker: boolean
  /** Worker setup submitted (`setupProgress.isComplete`). */
  setupComplete: boolean
  phoneVerified: boolean
  /** `settings.isProfilePrivate`: nobody else can open the profile. */
  isPrivate: boolean
}

export type ProfileBadge =
  | 'customer'
  | 'hidden'
  | 'setup'
  | 'actionRequired'
  | 'active'

export type ProfileViewConfig = {
  badge: {
    label: ProfileBadge
    tone: 'neutral' | 'warning' | 'danger' | 'success'
  }
  /** The hero's "View public profile": only when there's a page to open. */
  publicLink: boolean
  /** The one thing to do next, or none. */
  nextStep: 'continueSetup' | 'verifyPhone' | null
  /** The worker card: an invitation, the saved draft, or the live profile. */
  workerCard: 'empty' | 'draft' | 'live'
}
