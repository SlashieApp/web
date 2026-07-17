import { isPhoneVerified } from '@/app/(auth)/helpers/phoneVerification'
import type { MeSnapshot } from '@/app/(auth)/store/user'

export type ProfileStrengthItem = {
  key:
    | 'photo'
    | 'headline'
    | 'bio'
    | 'skills'
    | 'serviceArea'
    | 'phone'
    | 'portfolio'
  label: string
  done: boolean
  optional?: boolean
  href: string
}

export function getProfileStrengthItems(me: MeSnapshot): ProfileStrengthItem[] {
  const worker = me.worker
  const serviceArea =
    worker?.location?.name?.trim() ||
    worker?.location?.address?.trim() ||
    worker?.locationAddress?.trim()

  return [
    {
      key: 'photo',
      label: 'Add a profile photo',
      done: Boolean(me.profile?.avatarUrl?.trim()),
      href: '#personal-info',
    },
    {
      key: 'headline',
      label: 'Add a professional headline',
      done: Boolean(worker?.tagline?.trim()),
      href: '#worker-profile',
    },
    {
      key: 'bio',
      label: 'Write a bio (50+ characters)',
      done: (worker?.bio?.trim().length ?? 0) >= 50,
      href: '#worker-profile',
    },
    {
      key: 'skills',
      label: 'Add 3 or more skills',
      done: (worker?.skills?.length ?? 0) >= 3,
      href: '#worker-profile',
    },
    {
      key: 'serviceArea',
      label: 'Set your service area',
      done: Boolean(serviceArea),
      href: '#worker-profile',
    },
    {
      key: 'phone',
      label: 'Verify your phone',
      done: isPhoneVerified(me),
      href: '#contact-verification',
    },
    {
      key: 'portfolio',
      label: 'Add portfolio examples',
      done: (worker?.portfolioUrls?.length ?? 0) > 0,
      optional: true,
      href: '#worker-profile',
    },
  ]
}

export function profileStrengthPercent(items: ProfileStrengthItem[]): number {
  if (items.length === 0) return 0
  return Math.round(
    (items.filter((item) => item.done).length / items.length) * 100,
  )
}
