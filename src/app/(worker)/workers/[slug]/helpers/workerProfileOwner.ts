import { WorkerContactAction } from '@codegen/schema'

import { isJunkBio } from '@/app/(stepflow)/worker/setup/helpers/workerSetupValidation'

import type { WorkerPublicRecord } from './workerProfileHelpers'

/** Bio floor for a visitor-visible About card (legacy junk stays hidden). */
const MEANINGFUL_BIO_MIN_CHARS = 40

/**
 * The viewer is looking at their own profile. `contactAction: NONE` is the
 * API's own-profile signal (a signed-in non-owner always gets a contact
 * action; anonymous visitors get `viewer: null`).
 */
export function isOwnWorkerProfile(worker: WorkerPublicRecord): boolean {
  return worker.viewer?.contactAction === WorkerContactAction.None
}

/** True when the bio is worth showing to a visitor (no "o" About cards). */
export function workerHasMeaningfulBio(worker: WorkerPublicRecord): boolean {
  const bio = worker.bio?.trim() ?? ''
  if (bio.length < MEANINGFUL_BIO_MIN_CHARS) return false
  return !isJunkBio(bio)
}

export type WorkerProfileGap = {
  key: 'bio' | 'headline' | 'skills' | 'photo' | 'portfolio' | 'phone'
  /** Owner-facing "add this" label. */
  label: string
}

export type WorkerProfileCompleteness = {
  percent: number
  gaps: WorkerProfileGap[]
  /** The single next-best action for the strength banner, if any. */
  nextGap: WorkerProfileGap | null
}

/**
 * Owner-banner completeness from the PUBLIC record (the setup flow has its
 * own form-state calculator in `workerProfileStrength.ts`). Same signals,
 * minus service area (always set for a published profile).
 */
export function workerProfileCompleteness(
  worker: WorkerPublicRecord,
): WorkerProfileCompleteness {
  const checks: Array<{ gap: WorkerProfileGap; done: boolean }> = [
    {
      gap: { key: 'photo', label: 'add a profile photo' },
      done: Boolean(worker.profile?.avatarUrl?.trim()),
    },
    {
      gap: { key: 'headline', label: 'add a professional headline' },
      done: (worker.tagline?.trim().length ?? 0) >= 10,
    },
    {
      gap: { key: 'bio', label: 'write a short bio' },
      done: workerHasMeaningfulBio(worker),
    },
    {
      gap: { key: 'skills', label: 'add at least 3 skills' },
      done: worker.skills.filter((s) => s.trim()).length >= 3,
    },
    {
      gap: { key: 'phone', label: 'verify your phone number' },
      done: worker.phoneVerified,
    },
    {
      gap: { key: 'portfolio', label: 'add photos of your work' },
      done: worker.portfolioUrls.filter((u) => u.trim()).length > 0,
    },
  ]

  const gaps = checks.filter((c) => !c.done).map((c) => c.gap)
  const percent = Math.round(
    ((checks.length - gaps.length) / checks.length) * 100,
  )
  return { percent, gaps, nextGap: gaps[0] ?? null }
}
