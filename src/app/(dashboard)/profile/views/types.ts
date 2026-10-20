import type { WorkerPublishState } from '@codegen/schema'

/** What /profile shows for the signed-in person (README.md). */
export type ProfileView =
  | 'customer'
  | 'customerHidden'
  | 'workerSetup'
  | 'workerHidden'
  | 'workerVerifyPhone'
  | 'workerReady'

export type ProfileViewInput = {
  /**
   * `me.worker.publishState` (DRAFT, HIDDEN or PUBLISHED, from the API);
   * null without a worker profile.
   */
  workerPublishState: WorkerPublishState | null
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
  /**
   * The hero's link to `/profile/{id}`: `view` ("View public profile") when
   * others can open it, `preview` ("See what others see") when it is hidden
   * and only you get the preview, null when there is nothing to open.
   */
  publicLink: 'view' | 'preview' | null
  /** The one thing to do next, or none. */
  nextStep: 'continueSetup' | 'verifyPhone' | null
  /** The worker card: an invitation, the saved draft, or the live profile. */
  workerCard: 'empty' | 'draft' | 'live'
}
