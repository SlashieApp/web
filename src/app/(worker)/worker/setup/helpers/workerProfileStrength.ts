import type { WorkerSetupFormState } from './workerSetupFormState'
import { SKILLS_MIN } from './workerSetupSkills'
import type { WorkerSetupSubStepId } from './workerSetupSteps.config'
import { BIO_MIN_CHARS, HEADLINE_MIN_CHARS } from './workerSetupValidation'

export type ProfileStrengthTier = 'starter' | 'good' | 'allStar'

export type ProfileStrengthItem = {
  key:
    | 'photo'
    | 'headline'
    | 'bio'
    | 'skills'
    | 'serviceArea'
    | 'phoneVerified'
    | 'portfolio'
  /** Shown as the "add this" link label when missing. */
  label: string
  done: boolean
  /** Step the fix-it link goes back to. */
  subStep: WorkerSetupSubStepId
}

export type ProfileStrength = {
  tier: ProfileStrengthTier
  tierLabel: string
  items: ProfileStrengthItem[]
  doneCount: number
  totalCount: number
  percent: number
}

const TIER_LABELS: Record<ProfileStrengthTier, string> = {
  starter: 'Starter',
  good: 'Good',
  allStar: 'All-star',
}

/**
 * Profile strength for the review step (ticket 1.8): each signal is a
 * one-click link back to its step. Tiers: ≤3 Starter, 4–5 Good, 6–7 All-star.
 */
export function computeProfileStrength(input: {
  form: WorkerSetupFormState
  avatarUrl: string | null | undefined
  phoneVerified: boolean
}): ProfileStrength {
  const { form } = input

  const items: ProfileStrengthItem[] = [
    {
      key: 'photo',
      label: 'Add a profile photo',
      done: Boolean(input.avatarUrl?.trim()),
      subStep: 'profile.photo',
    },
    {
      key: 'headline',
      label: 'Write a professional headline',
      done: form.tagline.trim().length >= HEADLINE_MIN_CHARS,
      subStep: 'profile.bio',
    },
    {
      key: 'bio',
      label: `Write a bio of at least ${BIO_MIN_CHARS} characters`,
      done: form.bio.trim().length >= BIO_MIN_CHARS,
      subStep: 'profile.bio',
    },
    {
      key: 'skills',
      label: `Add at least ${SKILLS_MIN} skills`,
      done: form.skills.length >= SKILLS_MIN,
      subStep: 'services.skills',
    },
    {
      key: 'serviceArea',
      label: 'Set your service area',
      done: Boolean(form.locationName.trim()),
      subStep: 'area.location',
    },
    {
      key: 'phoneVerified',
      label: 'Verify your phone number',
      done: input.phoneVerified,
      subStep: 'verify.phone',
    },
    {
      key: 'portfolio',
      label: 'Add photos of your work',
      done: form.portfolioUrls.length > 0,
      subStep: 'verify.portfolio',
    },
  ]

  const doneCount = items.filter((item) => item.done).length
  const tier: ProfileStrengthTier =
    doneCount >= 6 ? 'allStar' : doneCount >= 4 ? 'good' : 'starter'

  return {
    tier,
    tierLabel: TIER_LABELS[tier],
    items,
    doneCount,
    totalCount: items.length,
    percent: Math.round((doneCount / items.length) * 100),
  }
}
