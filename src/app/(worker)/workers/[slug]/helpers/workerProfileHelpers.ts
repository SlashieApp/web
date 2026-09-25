import type { WorkerPublicProfileQuery } from '@codegen/schema'

import { publicProfilePath } from '@/app/helpers/publicProfilePath'

import { categoryLabelFromEnum } from '@/app/(stepflow)/worker/setup/helpers/workerSetupCategories'
import { publicRatingAverage } from '@/content/reviews/reviewModel'

export type WorkerPublicRecord = NonNullable<WorkerPublicProfileQuery['worker']>

export function workerPublicDisplayName(worker: WorkerPublicRecord): string {
  const profileName = worker.profile?.name?.trim()
  if (profileName) return profileName
  const legal = worker.legalName?.trim()
  if (legal) return legal
  return 'Worker'
}

export function workerPublicAvatarLabel(worker: WorkerPublicRecord): string {
  const name = workerPublicDisplayName(worker)
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? '')
      .join('') || 'W'
  )
}

export function workerServiceAreaLabel(
  worker: WorkerPublicRecord,
): string | null {
  return (
    worker.serviceAreaLabel?.trim() ||
    worker.preferredLocation?.name?.trim() ||
    null
  )
}

/**
 * Hero service-area line, "Camden & Islington (~5 miles)" style. BE-34
 * computes `serviceAreaLabel`; the manual compose is a fallback for workers
 * created before the backfill. Never an exact address.
 */
export function workerServiceAreaDisplay(
  worker: WorkerPublicRecord,
): string | null {
  const computed = worker.serviceAreaLabel?.trim()
  if (computed) return computed
  const area = worker.preferredLocation?.name?.trim()
  if (!area) return null
  const radius = worker.serviceArea?.radiusMiles
  return radius != null && radius > 0
    ? `${area} (~${Math.round(radius)} miles)`
    : area
}

/** Hero headline: `Handyman • Furniture Assembly • 3 years experience`. */
export function workerHeadline(worker: WorkerPublicRecord): string | null {
  // Primary trade leads when set; skills fill the remaining slots (the BE
  // strips the legacy trade label from skills, so no duplication).
  const categoryLabel = categoryLabelFromEnum(worker.primaryCategory)
  const skillParts = worker.skills
    .map((skill) => skill.trim())
    .filter(Boolean)
    .slice(0, categoryLabel ? 1 : 2)
  const parts = categoryLabel ? [categoryLabel, ...skillParts] : skillParts
  const years = worker.yearsExperience
  if (years != null && years > 0) {
    parts.push(`${years} year${years === 1 ? '' : 's'} experience`)
  }
  return parts.length > 0 ? parts.join(' • ') : null
}

export function workerFirstName(worker: WorkerPublicRecord): string {
  return workerPublicDisplayName(worker).split(/\s+/)[0] ?? 'Worker'
}

/** Hero stats row: reviews · jobs completed · member since. */
export function workerHeroStats(worker: WorkerPublicRecord): string[] {
  const stats: string[] = []
  const count = worker.ratingSummary?.count ?? 0
  const average = publicRatingAverage(worker.ratingSummary)
  if (count <= 0) {
    stats.push('No reviews yet')
  } else if (average == null) {
    stats.push(`${count} review${count === 1 ? '' : 's'}`)
  } else {
    stats.push(
      `${average.toFixed(1)} (${count} review${count === 1 ? '' : 's'})`,
    )
  }
  const jobs = worker.completedJobs.length || (worker.tasksCompletedCount ?? 0)
  stats.push(`${jobs} job${jobs === 1 ? '' : 's'} completed`)
  const memberSince = formatMemberSince(
    worker.memberSince ?? worker.user.createdAt,
  )
  if (memberSince) stats.push(`Member since ${memberSince}`)
  return stats
}

/** "March 2026"-style display for a completed job. */
export function formatCompletedMonth(completedAt: unknown): string {
  const date = new Date(String(completedAt))
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

/** Public presence for a user id (`users._id`), not a worker document id. */
export function workerProfilePath(
  userId: string,
  fromTask?: string | null,
): string {
  return publicProfilePath(userId, { fromTask })
}

export function formatMemberSince(createdAt: unknown): string | null {
  if (!createdAt) return null
  const date = new Date(String(createdAt))
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}
