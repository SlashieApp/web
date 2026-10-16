import type { WorkerSetupScreenId } from '../views'
import type { WorkerSetupFormState } from './workerSetupFormState'
import { SKILLS_MIN } from './workerSetupSkills'
import {
  BIO_MIN_CHARS,
  HEADLINE_MIN_CHARS,
  textWeight,
} from './workerSetupValidation'

export type ProfileStrengthTier = 'starter' | 'good' | 'allStar'

export type ProfileStrengthItem = {
  /** Copy key in the setup bag's `review.items`. */
  key:
    | 'photo'
    | 'headline'
    | 'bio'
    | 'skills'
    | 'serviceArea'
    | 'phoneVerified'
    | 'portfolio'
  done: boolean
  /** Where the fix-it link goes. */
  screen: WorkerSetupScreenId
}

export type ProfileStrength = {
  tier: ProfileStrengthTier
  items: ProfileStrengthItem[]
  doneCount: number
  percent: number
}

/**
 * Profile strength on the review: each signal links back to its screen.
 * Tiers: up to 3 Starter, 4 to 5 Good, 6 to 7 All-star.
 */
export function computeProfileStrength(input: {
  form: WorkerSetupFormState
  avatarUrl: string | null | undefined
  phoneVerified: boolean
}): ProfileStrength {
  const { form } = input
  const items: ProfileStrengthItem[] = [
    { key: 'photo', done: Boolean(input.avatarUrl?.trim()), screen: 'about' },
    {
      key: 'headline',
      done: textWeight(form.tagline.trim()) >= HEADLINE_MIN_CHARS,
      screen: 'profile',
    },
    {
      key: 'bio',
      done: textWeight(form.bio.trim()) >= BIO_MIN_CHARS,
      screen: 'profile',
    },
    { key: 'skills', done: form.skills.length >= SKILLS_MIN, screen: 'work' },
    {
      key: 'serviceArea',
      done: Boolean(form.locationName.trim()),
      screen: 'area',
    },
    { key: 'phoneVerified', done: input.phoneVerified, screen: 'phone' },
    {
      key: 'portfolio',
      done: form.portfolioUrls.length > 0,
      screen: 'profile',
    },
  ]
  const doneCount = items.filter((item) => item.done).length
  return {
    tier: doneCount >= 6 ? 'allStar' : doneCount >= 4 ? 'good' : 'starter',
    items,
    doneCount,
    percent: Math.round((doneCount / items.length) * 100),
  }
}
