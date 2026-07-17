import { isPhoneVerified } from '@/app/(auth)/helpers/phoneVerification'
import type { MeSnapshot } from '@/app/(auth)/store/user'
import { isWorkerSetupComplete } from '@/app/(worker)/worker/setup/helpers/workerSetupEligibility'
import { workerSetupHref } from '@/app/(worker)/worker/setup/helpers/workerSetupHref'

export type ProfileLifecycleKind =
  | 'registered'
  | 'setupInProgress'
  | 'activeWorker'
  | 'actionRequired'

export type ProfileLifecycle = {
  kind: ProfileLifecycleKind
  badge: string
  title: string
  description: string
  ctaLabel: string
  ctaHref: string
  badgeVariant: 'neutral' | 'warning' | 'success' | 'danger'
  publicProfileHref?: string
}

/**
 * Authoritative profile lifecycle derived only from fields exposed by `Me`.
 * A completed worker still needs a verified phone before we call them active.
 */
export function getProfileLifecycle(me: MeSnapshot): ProfileLifecycle {
  if (!me.worker?.id) {
    return {
      kind: 'registered',
      badge: 'Customer account',
      title: 'Start earning with your skills',
      description:
        'Create a worker profile to appear in search and send quotes on nearby tasks.',
      ctaLabel: 'Become a worker',
      ctaHref: workerSetupHref('/profile'),
      badgeVariant: 'neutral',
    }
  }

  const publicProfileHref = `/workers/${me.worker.id}`
  if (!isWorkerSetupComplete(me)) {
    return {
      kind: 'setupInProgress',
      badge: 'Setup in progress',
      title: 'Finish your worker profile',
      description:
        'Your saved draft is private until setup is complete and your profile is publishable.',
      ctaLabel: 'Continue setup',
      ctaHref: workerSetupHref('/profile'),
      badgeVariant: 'warning',
      publicProfileHref,
    }
  }

  if (!isPhoneVerified(me)) {
    return {
      kind: 'actionRequired',
      badge: 'Action required',
      title: 'Verify your phone number',
      description:
        'A verified phone is required to send quotes. Your profile details remain saved.',
      ctaLabel: 'Verify phone',
      ctaHref: '#contact-verification',
      badgeVariant: 'danger',
      publicProfileHref,
    }
  }

  return {
    kind: 'activeWorker',
    badge: 'Worker active',
    title: 'Your profile is ready',
    description:
      'Customers can review your public profile and you can send quotes on matching tasks.',
    ctaLabel: 'View public profile',
    ctaHref: publicProfileHref,
    badgeVariant: 'success',
    publicProfileHref,
  }
}

export function profileIsPublished(lifecycle: ProfileLifecycle): boolean {
  return (
    lifecycle.kind === 'activeWorker' || lifecycle.kind === 'actionRequired'
  )
}
