import type { WorkersSearchQuery } from '@codegen/schema'

import { DEFAULT_BROWSE_SUBMITTED_RADIUS_MILES } from '@/app/(task)/helpers/taskBrowseHelpers'
import { browseNearPlaceLabel } from '@/app/(task)/search/helpers/searchResultsListTitle'

export type WorkerSearchItem = WorkersSearchQuery['workers'][number]

export function workerDisplayName(worker: WorkerSearchItem): string {
  return worker.user?.profile?.name?.trim() || 'Worker'
}

export function workerAvatarUrl(worker: WorkerSearchItem): string | null {
  return (
    worker.user?.profile?.avatarUrl?.trim() ||
    worker.profile?.avatarUrl?.trim() ||
    null
  )
}

/** Approximate service-area label (BE-34 `serviceAreaLabel`) — never an address. */
export function workerServiceAreaLabel(
  worker: WorkerSearchItem,
): string | null {
  const label = worker.serviceAreaLabel?.trim()
  if (label) return label
  const area = worker.preferredLocation?.name?.trim()
  if (!area) return null
  const radius = worker.serviceArea?.radiusMiles
  return radius != null && radius > 0
    ? `${area} (~${Math.round(radius)} miles)`
    : area
}

export function workerSubtitle(worker: WorkerSearchItem): string {
  const tagline = worker.tagline?.trim()
  if (tagline) return tagline
  const area = worker.preferredLocation?.name?.trim()
  return area || 'Local worker on Slashie'
}

export function workerRatingLabel(worker: WorkerSearchItem): string | null {
  const summary = worker.ratingSummary
  if (!summary || summary.count <= 0 || summary.average == null) return null
  return `${summary.average.toFixed(1)} (${summary.count})`
}

export function workerExperienceShortLabel(
  worker: WorkerSearchItem,
): string | null {
  const years = worker.yearsExperience
  if (years == null || years <= 0) return null
  return `${years} yr${years === 1 ? '' : 's'} exp`
}

export function workerRespondsLabel(worker: WorkerSearchItem): string | null {
  const avg = worker.averageResponseTime?.trim()
  return avg ? `Responds in ${avg}` : null
}

export function formatWorkersListTitle(
  count: number,
  areaLabel: string,
): string {
  const noun = count === 1 ? 'worker' : 'workers'
  return `${count} ${noun} near ${browseNearPlaceLabel(areaLabel)}`
}

export function milesToKmRounded(miles: number): number {
  return Math.round(miles * 1.60934)
}

export function kmToMilesRounded(km: number): number {
  return Math.max(1, Math.round(km / 1.60934))
}

export type WorkerFilterTag =
  | { kind: 'search'; label: string }
  | { kind: 'verified'; label: string }
  | { kind: 'radius'; label: string }

/** Submitted worker filters that differ from defaults (shown as result-title chips). */
export function buildWorkerActiveFilterTags(input: {
  submittedWorkerSearchText: string
  submittedVerifiedOnly: boolean
  submittedRadiusMiles: number
  verifiedLabel: string
  distanceLabel: string
}): WorkerFilterTag[] {
  const tags: WorkerFilterTag[] = []
  const search = input.submittedWorkerSearchText.trim()
  if (search) tags.push({ kind: 'search', label: search })
  if (input.submittedVerifiedOnly) {
    tags.push({ kind: 'verified', label: input.verifiedLabel })
  }
  if (input.submittedRadiusMiles !== DEFAULT_BROWSE_SUBMITTED_RADIUS_MILES) {
    tags.push({ kind: 'radius', label: input.distanceLabel })
  }
  return tags
}
