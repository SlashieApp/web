import type { WorkersSearchQuery } from '@codegen/schema'

import { DEFAULT_BROWSE_SUBMITTED_RADIUS_MILES } from '@/app/(task)/helpers/taskBrowseHelpers'
import { browseNearPlaceLabel } from '@/app/(task)/search/helpers/searchResultsListTitle'
import { publicRatingAverage } from '@/content/reviews/reviewModel'
import { formatMessage } from '@/i18n/loadPageI11n'

export type WorkerSearchItem = WorkersSearchQuery['workers'][number]

/** Their name, else `fallback` ("Worker" / 工作者, FE-577). */
export function workerDisplayName(
  worker: WorkerSearchItem,
  fallback: string,
): string {
  return worker.user?.profile?.name?.trim() || fallback
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
  /** "{area} (~{miles} miles)" in the reader's language (FE-577). */
  areaWithRadius: string,
): string | null {
  const label = worker.serviceAreaLabel?.trim()
  if (label) return label
  const area = worker.preferredLocation?.name?.trim()
  if (!area) return null
  const radius = worker.serviceArea?.radiusMiles
  return radius != null && radius > 0
    ? formatMessage(areaWithRadius, { area, miles: Math.round(radius) })
    : area
}

/** Their headline, else their area, else `fallback` ("Local worker on Slashie", FE-577). */
export function workerSubtitle(
  worker: WorkerSearchItem,
  fallback: string,
): string {
  const tagline = worker.tagline?.trim()
  if (tagline) return tagline
  const area = worker.preferredLocation?.name?.trim()
  return area || fallback
}

export function workerRatingLabel(worker: WorkerSearchItem): string | null {
  const summary = worker.ratingSummary
  const average = publicRatingAverage(summary)
  if (!summary || average == null) return null
  return `${average.toFixed(1)} (${summary.count})`
}

/** "8 yrs exp" / 8 年經驗 (FE-577); none without years. */
export function workerExperienceShortLabel(
  worker: WorkerSearchItem,
  copy: { experienceOne: string; experienceMany: string },
): string | null {
  const years = worker.yearsExperience
  if (years == null || years <= 0) return null
  return formatMessage(years === 1 ? copy.experienceOne : copy.experienceMany, {
    count: years,
  })
}

/** "3 workers near Camden" / 「Camden附近有 3 位工作者」, the app's words (FE-577). */
export function formatWorkersListTitle(
  count: number,
  areaLabel: string,
  copy: {
    resultsTitle: string
    resultsTitleOne: string
    nearYou: string
    nearThisArea: string
  },
): string {
  return formatMessage(count === 1 ? copy.resultsTitleOne : copy.resultsTitle, {
    count,
    area: browseNearPlaceLabel(areaLabel, {
      you: copy.nearYou,
      thisArea: copy.nearThisArea,
    }),
  })
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
