import { TaskContactMethod } from '@codegen/schema'

import type { MeSnapshot } from '@/app/(auth)/store/user'

export type CompletenessItem = {
  key: 'avatar' | 'dateOfBirth' | 'bio' | 'verifiedContact'
  label: string
  done: boolean
  /** Where the "fix this" CTA should send the user. */
  href: string
}

/**
 * Profile-completeness signals that gate worker eligibility, derived from the
 * `me` snapshot. The contact / avatar / DOB items mirror the API's
 * profile fields the API uses for `workerEligibility`; bio is an extra signal.
 */
export function getCompletenessItems(me: MeSnapshot): CompletenessItem[] {
  const profile = me.profile
  const hasVerifiedContact = Boolean(
    profile?.emailVerified || profile?.phoneVerified,
  )

  return [
    {
      key: 'avatar',
      label: 'Add a profile photo',
      done: Boolean(profile?.avatarUrl?.trim()),
      href: '#profile-photo',
    },
    {
      key: 'dateOfBirth',
      label: 'Set your date of birth',
      done: Boolean(profile?.dateOfBirth),
      href: '#profile-about',
    },
    {
      key: 'bio',
      label: 'Write a short bio',
      done: Boolean(me.worker?.bio?.trim()),
      href: '#profile-worker',
    },
    {
      key: 'verifiedContact',
      label: 'Verify a contact method',
      done: hasVerifiedContact,
      href: '/account',
    },
  ]
}

export function completenessPercent(items: CompletenessItem[]): number {
  if (items.length === 0) return 0
  const done = items.filter((item) => item.done).length
  return Math.round((done / items.length) * 100)
}

/**
 * Authoritative worker-eligibility gate. Prefers the API signal and falls back
 * to the local completeness items if the field is unavailable.
 */
export function isWorkerEligible(me: MeSnapshot): boolean {
  if (typeof me.workerEligibility === 'boolean') return me.workerEligibility
  return getCompletenessItems(me).every((item) => item.done)
}

export type ContactOption = {
  value: TaskContactMethod
  label: string
  enabled: boolean
  /** Helper shown when the option is disabled (not yet verified). */
  disabledHint?: string
}

/**
 * Default-contact dropdown options. In-app is always available; email and phone
 * unlock only once the matching contact method is verified.
 */
export function getContactOptions(me: MeSnapshot): ContactOption[] {
  const profile = me.profile
  return [
    {
      value: TaskContactMethod.InApp,
      label: 'In-app chat',
      enabled: true,
    },
    {
      value: TaskContactMethod.Email,
      label: 'Email',
      enabled: Boolean(profile?.emailVerified),
      disabledHint: 'Verify your email in Account to use this option.',
    },
    {
      value: TaskContactMethod.Phone,
      label: 'Phone',
      enabled: Boolean(profile?.phoneVerified),
      disabledHint: 'Add and verify a phone in Account to use this option.',
    },
  ]
}
